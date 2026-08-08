/**
 * uploadFile 残留：removeFileOnUploadError、upload 空 url、onExceedMaxSize。
 */
import { describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../types/attachment';
import { upLoadFileToServer } from '../uploadFile';

const createFile = (
  name: string,
  sizeBytes: number,
  type = 'text/plain',
): AttachmentFile =>
  new File(['x'.repeat(Math.max(1, sizeBytes))], name, {
    type,
  }) as AttachmentFile;

describe('uploadFile residual branches', () => {
  it('removeFileOnUploadError 从 map 删除并回调', async () => {
    const map = new Map<string, AttachmentFile>();
    const onUploadError = vi.fn();
    const onFileMapChange = vi.fn();
    const file = createFile('a.txt', 10);
    await upLoadFileToServer([file], {
      fileMap: map,
      onFileMapChange,
      onUploadError,
      removeFileOnUploadError: true,
      upload: async () => '',
    });
    expect(onUploadError).toHaveBeenCalled();
    expect(map.size).toBe(0);
  });

  it('upload 抛 Error / 非 Error；onExceedMaxSize', async () => {
    const map = new Map<string, AttachmentFile>();
    await upLoadFileToServer([createFile('e.txt', 10)], {
      fileMap: map,
      onFileMapChange: (m) => {
        map.clear();
        m?.forEach((f, k) => map.set(k, f));
      },
      upload: async () => {
        throw new Error('boom');
      },
    });
    expect(Array.from(map.values())[0]?.status).toBe('error');

    const map2 = new Map<string, AttachmentFile>();
    await upLoadFileToServer([createFile('e2.txt', 10)], {
      fileMap: map2,
      onFileMapChange: (m) => {
        map2.clear();
        m?.forEach((f, k) => map2.set(k, f));
      },
      upload: async () => {
        throw 'raw';
      },
    });
    expect(Array.from(map2.values())[0]?.status).toBe('error');

    const onExceedMaxSize = vi.fn();
    const big = createFile('big.txt', 5000);
    await upLoadFileToServer([big], {
      maxFileSize: 100,
      onExceedMaxSize,
      onFileMapChange: vi.fn(),
    });
    expect(onExceedMaxSize).toHaveBeenCalled();
    expect(big.errorCode).toBe('FILE_SIZE_EXCEEDED');
  });

  it('upload 返回 url 成功；无 uuid 时 update 跳过', async () => {
    const map = new Map<string, AttachmentFile>();
    await upLoadFileToServer([createFile('ok.txt', 10)], {
      fileMap: map,
      onFileMapChange: (m) => {
        map.clear();
        m?.forEach((f, k) => map.set(k, f));
      },
      upload: async () => 'https://ok',
    });
    expect(Array.from(map.values())[0]?.status).toBe('done');
  });
});
