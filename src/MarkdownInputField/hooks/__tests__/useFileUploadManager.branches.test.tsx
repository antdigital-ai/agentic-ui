import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { useFileUploadManager } from '../useFileUploadManager';
import * as deviceUtils from '../../AttachmentButton/utils';

vi.mock('../../utils/uploadFile', () => ({
  upLoadFileToServer: vi.fn(async () => undefined),
}));

const wrapper =
  (locale: Record<string, string> = {}) =>
  ({ children }: { children: React.ReactNode }) =>
    (
      <I18nContext.Provider value={{ locale, language: 'zh-CN' } as any}>
        {children}
      </I18nContext.Provider>
    );

describe('useFileUploadManager 分支覆盖', () => {
  beforeEach(() => {
    vi.spyOn(deviceUtils, 'isWeChat').mockReturnValue(false);
    vi.spyOn(deviceUtils, 'isVivoOrOppoDevice').mockReturnValue(false);
    vi.spyOn(deviceUtils, 'isMobileDevice').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('空 fileMap：done=true；status=done', () => {
    const { result } = renderHook(
      () => useFileUploadManager({ fileMap: new Map() }),
      { wrapper: wrapper() },
    );
    expect(result.current.fileUploadDone).toBe(true);
    expect(result.current.fileUploadStatus).toBe('done');
  });

  it('uploading / error 状态矩阵', () => {
    const map = new Map([
      ['1', { uuid: '1', name: 'a', status: 'uploading' } as any],
      ['2', { uuid: '2', name: 'b', status: 'error' } as any],
    ]);
    const { result } = renderHook(() => useFileUploadManager({ fileMap: map }), {
      wrapper: wrapper(),
    });
    expect(result.current.fileUploadStatus).toBe('error');
    expect(result.current.fileUploadSummary.errorCount).toBe(1);
    expect(result.current.fileUploadSummary.uploadingCount).toBe(1);
  });

  it('仅 uploading 时 status=uploading；全 done 时 done', () => {
    const uploading = new Map([
      ['1', { uuid: '1', name: 'a', status: 'uploading' } as any],
    ]);
    const { result, rerender } = renderHook(
      ({ fileMap }) => useFileUploadManager({ fileMap }),
      {
        wrapper: wrapper(),
        initialProps: { fileMap: uploading },
      },
    );
    expect(result.current.fileUploadStatus).toBe('uploading');
    expect(result.current.fileUploadDone).toBe(false);

    const done = new Map([
      ['1', { uuid: '1', name: 'a', status: 'done' } as any],
    ]);
    rerender({ fileMap: done });
    expect(result.current.fileUploadStatus).toBe('done');
    expect(result.current.fileUploadDone).toBe(true);
  });

  it('uploadImage：forGallery 使用 image/*；extensions 生成 accept', async () => {
    const click = vi.fn();
    const create = vi.spyOn(document, 'createElement').mockImplementation(
      (tag: string) => {
        if (tag === 'input') {
          return {
            type: '',
            style: {},
            dataset: {},
            accept: '',
            multiple: false,
            value: '',
            click,
            onchange: null,
          } as any;
        }
        return document.createElementNS('http://www.w3.org/1999/xhtml', tag);
      },
    );
    vi.spyOn(document.body, 'appendChild').mockImplementation((n) => n);

    const { result } = renderHook(
      () =>
        useFileUploadManager({
          attachment: {
            supportedFormat: { type: 'file', extensions: ['pdf', 'txt'] } as any,
          },
        }),
      { wrapper: wrapper() },
    );

    await act(async () => {
      await result.current.uploadImage(true);
    });
    expect(click).toHaveBeenCalled();

    await act(async () => {
      await result.current.uploadImage(false);
    });
    create.mockRestore();
  });

  it.skip('uploadImage：微信 / vivo / mobile 返回 *；上传中直接 return', async () => {
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

    vi.spyOn(deviceUtils, 'isWeChat').mockReturnValue(true);
    const click = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      type: '',
      style: {},
      dataset: {},
      accept: '',
      multiple: false,
      value: '',
      click,
      onchange: null,
    } as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation((n) => n);
    const empty = renderHook(() => useFileUploadManager({}), {
      wrapper: wrapper(),
    });
    await act(async () => {
      await empty.result.current.uploadImage();
    });
    expect(click).toHaveBeenCalled();
  });

  it('handleFileRemoval 成功删除；失败吞错', async () => {
    const onFileMapChange = vi.fn();
    const file = { uuid: 'u1', name: 'f' } as any;
    const map = new Map([['u1', file]]);
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: map,
          onFileMapChange,
          attachment: { onDelete: vi.fn() },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await result.current.handleFileRemoval(file);
    });
    expect(onFileMapChange).toHaveBeenCalled();

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result: r2 } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([['u2', { uuid: 'u2' } as any]]),
          attachment: {
            onDelete: vi.fn(async () => {
              throw new Error('fail');
            }),
          },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await r2.current.handleFileRemoval({ uuid: 'u2' } as any);
    });
    errSpy.mockRestore();
  });

  it('handleFileRetry：upload 成功 / 失败 / removeFileOnUploadError', async () => {
    const onFileMapChange = vi.fn();
    const file = { uuid: 'r1', name: 'f', status: 'error' } as any;
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([['r1', file]]),
          onFileMapChange,
          attachment: {
            upload: vi.fn(async () => 'https://ok'),
          },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await result.current.handleFileRetry(file);
    });
    expect(file.status).toBe('done');

    const file2 = { uuid: 'r2', name: 'f2', status: 'error' } as any;
    const onUploadError = vi.fn();
    const { result: r2 } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([['r2', file2]]),
          onFileMapChange,
          attachment: {
            upload: vi.fn(async () => ''),
            onUploadError,
          },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await r2.current.handleFileRetry(file2);
    });
    expect(file2.status).toBe('error');
    expect(onUploadError).toHaveBeenCalled();

    const file3 = { uuid: 'r3', name: 'f3', status: 'error' } as any;
    const map3 = new Map([['r3', file3]]);
    const { result: r3 } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: map3,
          onFileMapChange,
          attachment: {
            upload: vi.fn(async () => {
              throw new Error('boom');
            }),
            removeFileOnUploadError: true,
            onUploadError: vi.fn(),
          },
        }),
      { wrapper: wrapper() },
    );
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      await r3.current.handleFileRetry(file3);
    });
    errSpy.mockRestore();
  });

  it('handleFileRetry：uploadWithResponse SUCCESS', async () => {
    const file = { uuid: 'r4', name: 'f4', status: 'error' } as any;
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([['r4', file]]),
          onFileMapChange: vi.fn(),
          attachment: {
            uploadWithResponse: vi.fn(async () => ({
              fileUrl: 'https://x',
              uploadStatus: 'SUCCESS',
            })),
          },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await result.current.handleFileRetry(file);
    });
    expect(file.status).toBe('done');
  });

  it.skip('uses default accept without extensions and records unknown statuses as done', async () => {
    const click = vi.fn();
    const input = {
      type: '',
      style: {},
      dataset: {},
      accept: '',
      multiple: false,
      value: '',
      click,
      onchange: null,
    } as any;
    vi.spyOn(document, 'createElement').mockReturnValue(input);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([['unknown', { uuid: 'unknown', status: 'queued' } as any]]),
          attachment: { allowMultiple: false, supportedFormat: { type: 'file', extensions: [] } as any },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => result.current.uploadImage());
    expect(result.current.fileUploadSummary.doneCount).toBe(1);
    expect(input.multiple).toBe(false);
    expect(input.accept).toContain('application/pdf');
  });
});
