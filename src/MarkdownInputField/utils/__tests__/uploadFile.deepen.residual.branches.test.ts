/**
 * uploadFile deepen：locale ${maxSize} 替换；无 maxFileSize 放行。
 */
import { describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../types/attachment';
import { upLoadFileToServer } from '../uploadFile';

describe('uploadFile deepen residual branches', () => {
  it('超限时 locale 模板替换 ${maxSize}', async () => {
    const onExceedMaxSize = vi.fn();
    const file = {
      name: 'z.txt',
      uuid: 'u1',
      size: 5000,
      type: 'text/plain',
    } as AttachmentFile;

    await upLoadFileToServer([file], {
      maxFileSize: 100,
      onExceedMaxSize,
      locale: {
        'markdownInput.fileSizeExceeded': 'max=${maxSize}kb',
      } as any,
      onFileMapChange: vi.fn(),
    });

    expect(onExceedMaxSize).toHaveBeenCalled();
    expect(file.errorMessage).toBe('max=0kb');
    expect(file.errorCode).toBe('FILE_SIZE_EXCEEDED');
  });

  it('未配置 maxFileSize 时直接上传成功', async () => {
    const map = new Map<string, AttachmentFile>();
    const file = {
      name: 'ok.txt',
      uuid: 'u2',
      size: 99999,
      type: 'text/plain',
    } as AttachmentFile;
    await upLoadFileToServer([file], {
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
