import { describe, expect, it, vi } from 'vitest';
import { upLoadFileToServer } from '../uploadFile';
import type { AttachmentFile } from '../../types/attachment';

const createFile = (
  name: string,
  sizeBytes: number,
  type = 'text/plain',
): AttachmentFile =>
  new File(['x'.repeat(sizeBytes)], name, { type }) as AttachmentFile;

describe('uploadFile 分支覆盖', () => {
  it('minFileCount 未满足时直接返回且不上传', async () => {
    const upload = vi.fn();
    const file = createFile('a.txt', 10);
    await upLoadFileToServer([file], { minFileCount: 3, upload });
    expect(upload).not.toHaveBeenCalled();
  });

  it('maxFileCount 超限：locale 模板与 onExceedMaxCount', async () => {
    const onExceedMaxCount = vi.fn();
    const file = createFile('a.txt', 10);
    await upLoadFileToServer([file], {
      maxFileCount: 0,
      onExceedMaxCount,
      locale: {
        'markdownInput.maxFileCountExceeded': 'max=${maxFileCount}',
      } as any,
    });
    expect(onExceedMaxCount).toHaveBeenCalled();
    expect(file.status).toBe('error');
    expect(file.errorMessage).toContain('0');
  });

  it('fileSizeExceeded locale 含 ${maxSize} 时替换', async () => {
    const file = createFile('big.txt', 5000);
    await upLoadFileToServer([file], {
      maxFileSize: 2048,
      locale: {
        'markdownInput.fileSizeExceeded': 'limit ${maxSize} KB',
      } as any,
    });
    expect(file.errorMessage).toBe('limit 2 KB');
  });

  it('uploadWithResponse SUCCESS / 失败路径', async () => {
    const ok = createFile('ok.txt', 10);
    const map = new Map<string, AttachmentFile>();
    await upLoadFileToServer([ok], {
      fileMap: map,
      onFileMapChange: (m) => {
        map.clear();
        m?.forEach((f, k) => map.set(k, f));
      },
      uploadWithResponse: async () => ({
        fileUrl: 'https://x/a',
        uploadStatus: 'SUCCESS',
      }),
    });
    expect(Array.from(map.values())[0]?.status).toBe('done');

    const bad = createFile('bad.txt', 10);
    const map2 = new Map<string, AttachmentFile>();
    await upLoadFileToServer([bad], {
      fileMap: map2,
      onFileMapChange: (m) => {
        map2.clear();
        m?.forEach((f, k) => map2.set(k, f));
      },
      uploadWithResponse: async () => ({
        fileUrl: '',
        uploadStatus: 'FAILED',
        errorMessage: 'nope',
      }),
    });
    expect(Array.from(map2.values())[0]?.status).toBe('error');
  });

  it('无 upload 时用 previewUrl；非 Error throw 走 locale uploadFailed', async () => {
    const img = createFile('a.png', 10, 'image/png');
    const map = new Map<string, AttachmentFile>();
    await upLoadFileToServer([img], {
      fileMap: map,
      onFileMapChange: (m) => {
        map.clear();
        m?.forEach((f, k) => map.set(k, f));
      },
    });
    const stored = Array.from(map.values())[0];
    expect(stored?.previewUrl).toBeTruthy();
    expect(stored?.status).toBe('done');

    const fail = createFile('f.txt', 10);
    const onUploadError = vi.fn();
    await upLoadFileToServer([fail], {
      upload: async () => {
        throw 'string-error';
      },
      onUploadError,
      locale: { uploadFailed: 'UF' } as any,
    });
    expect(onUploadError).toHaveBeenCalled();
  });
});
