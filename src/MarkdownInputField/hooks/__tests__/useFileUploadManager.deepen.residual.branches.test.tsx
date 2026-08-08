/**
 * useFileUploadManager deepen residual：上传中阻断、onchange 空选、unmount 清理、accept 兜底。
 */
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import * as deviceUtils from '../../AttachmentButton/utils';
import { upLoadFileToServer } from '../../utils/uploadFile';
import { useFileUploadManager } from '../useFileUploadManager';

vi.mock('../../utils/uploadFile', () => ({
  upLoadFileToServer: vi.fn(async () => undefined),
}));

const wrapper =
  (locale: Record<string, string> = {}) =>
  ({ children }: { children: React.ReactNode }) => (
    <I18nContext.Provider value={{ locale, language: 'zh-CN' } as any}>
      {children}
    </I18nContext.Provider>
  );

function mockFileInput() {
  const click = vi.fn();
  let onchange: ((e: Event) => void) | null = null;
  const input = {
    type: '',
    style: {},
    dataset: {} as Record<string, string>,
    accept: '',
    multiple: false,
    value: '',
    click,
    set onchange(handler: ((e: Event) => void) | null) {
      onchange = handler;
    },
    get onchange() {
      return onchange;
    },
  } as any;

  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'input') return input;
    return document.createElementNS('http://www.w3.org/1999/xhtml', tag);
  });
  vi.spyOn(document.body, 'appendChild').mockImplementation((n) => n);

  return { input, click, getOnchange: () => onchange as ((e: Event) => void) | null };
}

describe('useFileUploadManager deepen residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(deviceUtils, 'isWeChat').mockReturnValue(false);
    vi.spyOn(deviceUtils, 'isVivoOrOppoDevice').mockReturnValue(false);
    vi.spyOn(deviceUtils, 'isMobileDevice').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uploadImage：上传中直接 return', async () => {
    const { click } = mockFileInput();
    const map = new Map([
      ['1', { uuid: '1', name: 'a', status: 'uploading' } as any],
    ]);
    const { result } = renderHook(
      () => useFileUploadManager({ fileMap: map }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await result.current.uploadImage();
    });
    expect(click).not.toHaveBeenCalled();
  });

  it('uploadImage onchange：空 files / readonly dataset / 成功上传', async () => {
    const { input, click, getOnchange } = mockFileInput();

    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map(),
          attachment: { enable: true, upload: vi.fn() },
        }),
      { wrapper: wrapper() },
    );

    await act(async () => {
      await result.current.uploadImage();
    });
    expect(click).toHaveBeenCalled();

    await act(async () => {
      await getOnchange()?.({ target: { files: null } } as any);
    });
    expect(upLoadFileToServer).not.toHaveBeenCalled();

    input.dataset.readonly = 'true';
    await act(async () => {
      await getOnchange()?.({
        target: { files: [new File(['x'], 'a.txt')] },
      } as any);
    });
    expect(upLoadFileToServer).not.toHaveBeenCalled();

    delete input.dataset.readonly;
    await act(async () => {
      await getOnchange()?.({
        target: { files: [new File(['x'], 'b.txt')] },
      } as any);
    });
    expect(upLoadFileToServer).toHaveBeenCalled();
    expect(input.dataset.readonly).toBeUndefined();
  });

  it('extensions 为空时使用 MOBILE_DEFAULT_ACCEPT；unknown status 计入 done', async () => {
    const { input, click } = mockFileInput();

    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([
            ['q', { uuid: 'q', name: 'q', status: 'queued' } as any],
          ]),
          attachment: {
            allowMultiple: false,
            supportedFormat: { type: 'file', extensions: [] } as any,
          },
        }),
      { wrapper: wrapper() },
    );

    await act(async () => {
      await result.current.uploadImage();
    });
    expect(input.accept).toContain('application/pdf');
    expect(result.current.fileUploadSummary.doneCount).toBe(1);
    expect(input.multiple).toBe(false);
    expect(click).toHaveBeenCalled();
  });

  it('handleFileRetry：uploadWithResponse 非 SUCCESS；catch 保留 error 态', async () => {
    const onUploadError = vi.fn();
    const file = { uuid: 'r5', name: 'f5', status: 'error' } as any;
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([['r5', file]]),
          onFileMapChange: vi.fn(),
          attachment: {
            uploadWithResponse: vi.fn(async () => ({
              fileUrl: '',
              uploadStatus: 'FAIL',
            })),
            onUploadError,
          },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await result.current.handleFileRetry(file);
    });
    expect(file.status).toBe('error');
    expect(onUploadError).toHaveBeenCalled();

    const file2 = { uuid: 'r6', name: 'f6', status: 'error' } as any;
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result: r2 } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([['r6', file2]]),
          onFileMapChange: vi.fn(),
          attachment: {
            upload: vi.fn(async () => {
              throw new Error('retry boom');
            }),
            onUploadError: vi.fn(),
          },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await r2.current.handleFileRetry(file2);
    });
    expect(file2.status).toBe('error');
    errSpy.mockRestore();
  });

  it('unmount 清理 hidden input', async () => {
    const { click } = mockFileInput();
    const { result, unmount } = renderHook(
      () => useFileUploadManager({ fileMap: new Map() }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await result.current.uploadImage();
    });
    expect(click).toHaveBeenCalled();
    unmount();
  });
});
