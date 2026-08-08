/**
 * uploadFile deepen2：无 onExceedMaxSize；upload 抛错；空文件列表。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../types/attachment';
import { upLoadFileToServer } from '../uploadFile';

describe('uploadFile deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空列表早退', async () => {
    const onFileMapChange = vi.fn();
    await upLoadFileToServer([], { onFileMapChange } as any);
    expect(onFileMapChange).not.toHaveBeenCalled();
  });

  it('超限无 onExceedMaxSize 仍写 error', async () => {
    const file = {
      name: 'z.txt',
      uuid: 'u1',
      size: 5000,
      type: 'text/plain',
    } as AttachmentFile;
    await upLoadFileToServer([file], {
      maxFileSize: 1,
      onFileMapChange: vi.fn(),
    });
    expect(file.errorCode).toBe('FILE_SIZE_EXCEEDED');
  });

  it('upload 抛错写入 error 状态', async () => {
    const map = new Map<string, AttachmentFile>();
    const file = {
      name: 'ok.txt',
      uuid: 'u3',
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
        throw new Error('fail');
      },
    });
    const stored = Array.from(map.values())[0];
    expect(stored?.status === 'error' || stored?.errorMessage).toBeTruthy();
  });
});
