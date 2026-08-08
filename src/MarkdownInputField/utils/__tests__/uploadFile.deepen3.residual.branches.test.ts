/**
 * uploadFile deepen3：uploadWithResponse SUCCESS/FAILED、超限 locale。
 */
import { describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../types/attachment';
import { upLoadFileToServer } from '../uploadFile';

describe('uploadFile deepen3 residual branches', () => {
  it('uploadWithResponse SUCCESS 写入 done', async () => {
    const map = new Map<string, AttachmentFile>();
    const ok = {
      name: 'a.txt',
      uuid: 'img1',
      size: 10,
      type: 'text/plain',
    } as AttachmentFile;
    await upLoadFileToServer([ok], {
      fileMap: map,
      onFileMapChange: (m) => {
        map.clear();
        m?.forEach((f, k) => map.set(k, f));
      },
      uploadWithResponse: async () => ({
        fileUrl: 'https://cdn/a.txt',
        uploadStatus: 'SUCCESS',
      }),
    } as any);
    expect(Array.from(map.values())[0]?.status).toBe('done');
  });

  it('uploadWithResponse FAILED 写 errorMessage', async () => {
    const map = new Map<string, AttachmentFile>();
    const bad = {
      name: 'b.txt',
      uuid: 'img2',
      size: 10,
      type: 'text/plain',
    } as AttachmentFile;
    await upLoadFileToServer([bad], {
      fileMap: map,
      onFileMapChange: (m) => {
        map.clear();
        m?.forEach((f, k) => map.set(k, f));
      },
      uploadWithResponse: async () => ({
        uploadStatus: 'FAILED',
        errorMessage: 'denied',
      }),
      removeFileOnUploadError: false,
    } as any);
    const stored = Array.from(map.values())[0];
    expect(stored?.status).toBe('error');
    expect(stored?.errorMessage).toBe('denied');
  });

  it('超限 locale 文案；upload 抛错标记 error', async () => {
    const big = {
      name: 'big.bin',
      uuid: 'big1',
      size: 9999,
      type: 'application/octet-stream',
    } as AttachmentFile;
    await upLoadFileToServer([big], {
      maxFileSize: 1,
      locale: {
        'markdownInput.fileSizeExceeded': '太大了',
      } as any,
      onFileMapChange: vi.fn(),
      onExceedMaxSize: vi.fn(),
    });
    expect(big.errorCode).toBe('FILE_SIZE_EXCEEDED');
    expect(big.errorMessage).toBe('太大了');

    const map = new Map<string, AttachmentFile>();
    const file = {
      name: 'c.txt',
      uuid: 'u9',
      size: 10,
      type: 'text/plain',
    } as AttachmentFile;
    await upLoadFileToServer([file], {
      fileMap: map,
      onFileMapChange: (m) => {
        map.clear();
        m?.forEach((f, k) => map.set(k, f));
      },
      upload: async () => {
        throw new Error('x');
      },
      removeFileOnUploadError: false,
    });
    expect(Array.from(map.values())[0]?.status).toBe('error');
  });
});
