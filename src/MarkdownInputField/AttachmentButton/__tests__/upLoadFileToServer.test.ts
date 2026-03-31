import { describe, expect, it, vi } from 'vitest';
import { upLoadFileToServer } from '../index';
import type { AttachmentFile } from '../types';

const createFile = (name: string, sizeBytes: number): AttachmentFile => {
  const file = new File(['x'.repeat(sizeBytes)], name, {
    type: 'text/plain',
  }) as AttachmentFile;
  return file;
};

describe('upLoadFileToServer - onExceedMaxSize', () => {
  it('should call onExceedMaxSize when file exceeds maxFileSize', async () => {
    const onExceedMaxSize = vi.fn();
    const maxFileSize = 1024;
    const file = createFile('big.txt', maxFileSize + 1);

    await upLoadFileToServer([file], {
      maxFileSize,
      onExceedMaxSize,
    });

    expect(onExceedMaxSize).toHaveBeenCalledTimes(1);
    expect(onExceedMaxSize).toHaveBeenCalledWith(
      expect.objectContaining({
        maxSize: maxFileSize,
        file: expect.objectContaining({ errorCode: 'FILE_SIZE_EXCEEDED' }),
      }),
    );
  });

  it('should set file status to error with FILE_SIZE_EXCEEDED errorCode', async () => {
    const maxFileSize = 512;
    const file = createFile('large.txt', maxFileSize + 100);
    const fileMap = new Map<string, AttachmentFile>();
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      if (map) map.forEach((f, k) => fileMap.set(k, f));
    });

    await upLoadFileToServer([file], {
      maxFileSize,
      fileMap,
      onFileMapChange,
    });

    const uploadedFile = Array.from(fileMap.values())[0];
    expect(uploadedFile.status).toBe('error');
    expect(uploadedFile.errorCode).toBe('FILE_SIZE_EXCEEDED');
    expect(uploadedFile.errorMessage).toBeTruthy();
  });

  it('should NOT call onExceedMaxSize when file is within maxFileSize', async () => {
    const onExceedMaxSize = vi.fn();
    const maxFileSize = 1024;
    const file = createFile('small.txt', maxFileSize - 1);
    const upload = vi.fn().mockResolvedValue('http://example.com/file');

    await upLoadFileToServer([file], {
      maxFileSize,
      upload,
      onExceedMaxSize,
    });

    expect(onExceedMaxSize).not.toHaveBeenCalled();
  });

  it('should call onExceedMaxSize for each oversized file independently', async () => {
    const onExceedMaxSize = vi.fn();
    const maxFileSize = 100;
    const file1 = createFile('a.txt', 200);
    const file2 = createFile('b.txt', 300);

    await upLoadFileToServer([file1, file2], {
      maxFileSize,
      onExceedMaxSize,
    });

    expect(onExceedMaxSize).toHaveBeenCalledTimes(2);
  });
});
