/**
 * useFileUploadManager deepen2：fileMap 空、uuid 缺省、upload 成功、removeFileOnUploadError。
 */
import { act, cleanup, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import * as deviceUtils from '../../AttachmentButton/utils';
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

  return {
    input,
    click,
    getOnchange: () => onchange as ((e: Event) => void) | null,
  };
}

describe('useFileUploadManager deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    vi.spyOn(deviceUtils, 'isWeChat').mockReturnValue(false);
    vi.spyOn(deviceUtils, 'isVivoOrOppoDevice').mockReturnValue(false);
    vi.spyOn(deviceUtils, 'isMobileDevice').mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('uploadImage：fileMap undefined 不抛；可打开选择器', async () => {
    const { click } = mockFileInput();
    const { result } = renderHook(
      () => useFileUploadManager({ fileMap: undefined }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await result.current.uploadImage();
    });
    expect(click).toHaveBeenCalled();
  });

  it('handleFileRetry：upload 成功无 uuid；失败无 uuid', async () => {
    const onChange = vi.fn();
    const file = { name: 'a.png', status: 'error' } as any;
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([['', file]]),
          onFileMapChange: onChange,
          attachment: {
            upload: vi.fn(async () => 'https://cdn/a.png'),
          },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await result.current.handleFileRetry(file);
    });
    expect(file.status).toBe('done');
    expect(file.url).toBe('https://cdn/a.png');

    const file2 = { name: 'b.png', status: 'error' } as any;
    const onUploadError = vi.fn();
    const { result: r2 } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([['', file2]]),
          onFileMapChange: vi.fn(),
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
  });

  it('handleFileRetry：removeFileOnUploadError 删除条目', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onChange = vi.fn();
    const file = { uuid: 'rm1', name: 'c.png', status: 'error' } as any;
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map([['rm1', file]]),
          onFileMapChange: onChange,
          attachment: {
            removeFileOnUploadError: true,
            upload: vi.fn(async () => {
              throw new Error('boom');
            }),
          },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await result.current.handleFileRetry(file);
    });
    expect(onChange).toHaveBeenCalled();
    const lastMap = onChange.mock.calls.at(-1)?.[0] as Map<string, unknown>;
    expect(lastMap?.has('rm1')).toBe(false);
    errSpy.mockRestore();
  });
});
