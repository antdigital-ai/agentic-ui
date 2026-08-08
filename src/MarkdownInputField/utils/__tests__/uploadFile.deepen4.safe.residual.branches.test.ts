/**
 * uploadFile deepen4 safe：size 缺省、removeFileOnUploadError、超限回调。
 */
import { describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../types/attachment';
import { upLoadFileToServer } from '../uploadFile';

describe('uploadFile deepen4 safe residual branches', () => {
  it('无 size 视为 0 通过校验；有 uuid 写入 map', async () => {
    const map = new Map<string, AttachmentFile>();
    const file = {
      name: 'nosize.txt',
      uuid: 'u-size',
      type: 'text/plain',
    } as AttachmentFile;

    await upLoadFileToServer([file], {
      maxFileSize: 100,
      fileMap: map,
      onFileMapChange: (m) => {
        map.clear();
        m?.forEach((f, k) => map.set(k, f));
      },
      uploadWithResponse: async () => ({
        fileUrl: 'https://cdn/nosize.txt',
        uploadStatus: 'SUCCESS',
      }),
    } as any);
    expect(Array.from(map.values())[0]?.status).toBe('done');
  });

  it('removeFileOnUploadError 删除 uuid', async () => {
    const map = new Map<string, AttachmentFile>();
    const file = {
      name: 'drop.txt',
      uuid: 'u-drop',
      size: 10,
      type: 'text/plain',
    } as AttachmentFile;

    await upLoadFileToServer([file], {
      fileMap: map,
      onFileMapChange: (m) => {
        map.clear();
        m?.forEach((f, k) => map.set(k, f));
      },
      uploadWithResponse: async () => ({
        uploadStatus: 'FAILED',
        errorMessage: 'fail',
      }),
      removeFileOnUploadError: true,
    } as any);
    expect(map.has('u-drop')).toBe(false);
  });

  it('超限 onExceedMaxSize；超 maxFileCount 带 uuid', async () => {
    const map = new Map<string, AttachmentFile>();
    map.set('existing', { name: 'e.txt', uuid: 'existing' } as AttachmentFile);
    const extra = {
      name: 'n.txt',
      uuid: 'new-u',
      size: 10,
      type: 'text/plain',
    } as AttachmentFile;
    const onExceed = vi.fn();
    const onExceedCount = vi.fn();

    const big = {
      name: 'big.bin',
      uuid: 'big-x',
      size: 9999,
      type: 'application/octet-stream',
    } as AttachmentFile;
    await upLoadFileToServer([big], {
      maxFileSize: 1,
      onFileMapChange: vi.fn(),
      onExceedMaxSize: onExceed,
    });
    expect(onExceed).toHaveBeenCalled();
    expect(big.errorCode).toBe('FILE_SIZE_EXCEEDED');

    await upLoadFileToServer([extra], {
      maxFileCount: 1,
      fileMap: map,
      onFileMapChange: (m) => {
        map.clear();
        m?.forEach((f, k) => map.set(k, f));
      },
      onExceedMaxCount: onExceedCount,
    });
    expect(extra.errorCode).toBe('FILE_COUNT_EXCEEDED');
    expect(onExceedCount).toHaveBeenCalled();
  });
});
