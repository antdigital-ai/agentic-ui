/**
 * useFileUploadManager 残留：微信 accept、移动端、删除/重试、上传拒绝。
 */
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import * as deviceUtils from '../../AttachmentButton/utils';
import { useFileUploadManager } from '../useFileUploadManager';

const uploadMock = vi.fn(async () => undefined);

vi.mock('../../utils/uploadFile', () => ({
  upLoadFileToServer: (...args: any[]) => uploadMock(...args),
}));

const wrapper =
  (locale: Record<string, string> = {}) =>
  ({ children }: { children: React.ReactNode }) => (
    <I18nContext.Provider value={{ locale, language: 'zh-CN' } as any}>
      {children}
    </I18nContext.Provider>
  );

describe('useFileUploadManager residual branches', () => {
  beforeEach(() => {
    uploadMock.mockReset();
    uploadMock.mockResolvedValue(undefined);
    vi.spyOn(deviceUtils, 'isWeChat').mockReturnValue(false);
    vi.spyOn(deviceUtils, 'isVivoOrOppoDevice').mockReturnValue(false);
    vi.spyOn(deviceUtils, 'isMobileDevice').mockReturnValue(false);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('微信环境 supportedFormat accept 分支', () => {
    vi.spyOn(deviceUtils, 'isWeChat').mockReturnValue(true);
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map(),
          attachment: { enable: true },
        }),
      { wrapper: wrapper() },
    );
    expect(result.current.supportedFormat).toBeTruthy();
  });

  it('移动端默认 accept；vivo/oppo', () => {
    vi.spyOn(deviceUtils, 'isMobileDevice').mockReturnValue(true);
    vi.spyOn(deviceUtils, 'isVivoOrOppoDevice').mockReturnValue(true);
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map(),
          attachment: { enable: true },
        }),
      { wrapper: wrapper() },
    );
    expect(result.current.supportedFormat).toBeTruthy();
  });

  it('handleFileRemoval 调用 onDelete；upload 拒绝 catch', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onFileMapChange = vi.fn();
    uploadMock.mockRejectedValueOnce(new Error('fail'));
    const map = new Map([
      ['1', { uuid: '1', name: 'a.txt', status: 'done' } as any],
    ]);
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: map,
          onFileMapChange,
          attachment: {
            enable: true,
            upload: vi.fn(),
            onDelete,
          },
        }),
      { wrapper: wrapper() },
    );
    await act(async () => {
      await result.current.handleFileRemoval(map.get('1')!);
    });
    expect(onDelete).toHaveBeenCalled();

    await act(async () => {
      await expect(
        result.current.handleFileRetry({
          uuid: '1',
          name: 'a.txt',
          status: 'error',
        } as any),
      ).resolves.toBeUndefined();
    });
  });

  it('updateAttachmentFiles 空 map', () => {
    const onFileMapChange = vi.fn();
    const { result } = renderHook(
      () =>
        useFileUploadManager({
          fileMap: new Map(),
          onFileMapChange,
        }),
      { wrapper: wrapper() },
    );
    act(() => {
      result.current.updateAttachmentFiles(new Map());
    });
    expect(onFileMapChange).toHaveBeenCalled();
  });

  it('fileUploadStatus：error / uploading / done；supportedFormat 默认', () => {
    const errMap = new Map([
      ['a', { status: 'error', name: 'a.png' } as any],
    ]);
    const { result, rerender } = renderHook(
      ({ fileMap }) =>
        useFileUploadManager({
          fileMap,
          attachment: { enable: true },
        }),
      { initialProps: { fileMap: errMap }, wrapper: wrapper() },
    );
    expect(result.current.fileUploadStatus).toBe('error');

    rerender({
      fileMap: new Map([
        ['b', { status: 'uploading', name: 'b.png' } as any],
      ]),
    });
    expect(result.current.fileUploadStatus).toBe('uploading');

    rerender({
      fileMap: new Map([['c', { status: 'done', name: 'c.png' } as any]]),
    });
    expect(result.current.fileUploadStatus).toBe('done');
  });
});
