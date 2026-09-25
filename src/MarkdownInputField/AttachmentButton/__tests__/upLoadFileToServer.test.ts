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

describe('upLoadFileToServer - onUploadError', () => {
  it('should call onUploadError when upload throws', async () => {
    const onUploadError = vi.fn();
    const uploadError = new Error('network error');
    const upload = vi.fn().mockRejectedValue(uploadError);
    const file = createFile('fail.txt', 100);

    await upLoadFileToServer([file], { upload, onUploadError });

    expect(onUploadError).toHaveBeenCalledTimes(1);
    expect(onUploadError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: uploadError,
        file: expect.objectContaining({ name: 'fail.txt' }),
      }),
    );
  });

  it('should call onUploadError when upload returns falsy URL', async () => {
    const onUploadError = vi.fn();
    const upload = vi.fn().mockResolvedValue('');
    const file = createFile('empty-url.txt', 100);

    await upLoadFileToServer([file], { upload, onUploadError });

    expect(onUploadError).toHaveBeenCalledTimes(1);
  });

  it('should keep file in map with error status by default on upload failure', async () => {
    const upload = vi.fn().mockRejectedValue(new Error('fail'));
    const file = createFile('fail.txt', 100);
    const fileMap = new Map<string, AttachmentFile>();
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      if (map) map.forEach((f, k) => fileMap.set(k, f));
    });

    await upLoadFileToServer([file], { upload, fileMap, onFileMapChange });

    const stored = Array.from(fileMap.values()).find(
      (f) => f.name === 'fail.txt',
    );
    expect(stored?.status).toBe('error');
  });
});

describe('upLoadFileToServer - removeFileOnUploadError', () => {
  it('should remove file from map when removeFileOnUploadError is true and upload throws', async () => {
    const upload = vi.fn().mockRejectedValue(new Error('fail'));
    const file = createFile('remove-me.txt', 100);
    const fileMap = new Map<string, AttachmentFile>();
    const latestMap = { current: fileMap };
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      latestMap.current = new Map(map);
    });

    await upLoadFileToServer([file], {
      upload,
      fileMap,
      onFileMapChange,
      removeFileOnUploadError: true,
    });

    expect(latestMap.current.size).toBe(0);
  });

  it('should remove file from map when removeFileOnUploadError is true and upload returns falsy URL', async () => {
    const upload = vi.fn().mockResolvedValue('');
    const file = createFile('remove-me.txt', 100);
    const fileMap = new Map<string, AttachmentFile>();
    const latestMap = { current: fileMap };
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      latestMap.current = new Map(map);
    });

    await upLoadFileToServer([file], {
      upload,
      fileMap,
      onFileMapChange,
      removeFileOnUploadError: true,
    });

    expect(latestMap.current.size).toBe(0);
  });

  it('should still call onUploadError even when removeFileOnUploadError is true', async () => {
    const onUploadError = vi.fn();
    const upload = vi.fn().mockRejectedValue(new Error('fail'));
    const file = createFile('fail.txt', 100);

    await upLoadFileToServer([file], {
      upload,
      onUploadError,
      removeFileOnUploadError: true,
    });

    expect(onUploadError).toHaveBeenCalledTimes(1);
  });
});

describe('upLoadFileToServer - uploadWithResponse', () => {
  it('should mark file done and store uploadResponse on SUCCESS', async () => {
    const file = createFile('ok.txt', 100);
    const fileMap = new Map<string, AttachmentFile>();
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      if (map) {
        fileMap.clear();
        map.forEach((f, k) => fileMap.set(k, f));
      }
    });
    const uploadResponse = {
      fileUrl: 'https://example.com/ok.txt',
      uploadStatus: 'SUCCESS' as const,
      errorMessage: null,
    };
    const uploadWithResponse = vi.fn().mockResolvedValue(uploadResponse);

    await upLoadFileToServer([file], {
      uploadWithResponse,
      fileMap,
      onFileMapChange,
    });

    const stored = Array.from(fileMap.values())[0];
    expect(uploadWithResponse).toHaveBeenCalledTimes(1);
    expect(stored.status).toBe('done');
    expect(stored.url).toBe('https://example.com/ok.txt');
    expect(stored.uploadResponse).toEqual(uploadResponse);
  });

  it('should surface response errorMessage when uploadStatus is not SUCCESS', async () => {
    const onUploadError = vi.fn();
    const file = createFile('fail.txt', 100);
    const fileMap = new Map<string, AttachmentFile>();
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      if (map) {
        fileMap.clear();
        map.forEach((f, k) => fileMap.set(k, f));
      }
    });
    const uploadWithResponse = vi.fn().mockResolvedValue({
      fileUrl: '',
      uploadStatus: 'FAILED',
      errorMessage: 'virus detected',
    });

    await upLoadFileToServer([file], {
      uploadWithResponse,
      fileMap,
      onFileMapChange,
      onUploadError,
    });

    const stored = Array.from(fileMap.values())[0];
    expect(stored.status).toBe('error');
    expect(stored.errorMessage).toBe('virus detected');
    expect(onUploadError).toHaveBeenCalledTimes(1);
    expect(onUploadError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'virus detected',
        file: expect.objectContaining({ name: 'fail.txt' }),
      }),
    );
  });

  it('should remove file when uploadWithResponse fails and removeFileOnUploadError is true', async () => {
    const file = createFile('remove-me.txt', 100);
    const fileMap = new Map<string, AttachmentFile>();
    const latestMap = { current: fileMap };
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      latestMap.current = new Map(map);
    });
    const uploadWithResponse = vi.fn().mockResolvedValue({
      fileUrl: '',
      uploadStatus: 'FAILED',
      errorMessage: 'rejected',
    });

    await upLoadFileToServer([file], {
      uploadWithResponse,
      fileMap,
      onFileMapChange,
      removeFileOnUploadError: true,
    });

    expect(latestMap.current.size).toBe(0);
  });

  it('should prefer uploadWithResponse over upload', async () => {
    const file = createFile('prefer.txt', 100);
    const upload = vi.fn().mockResolvedValue('https://example.com/ignored');
    const uploadWithResponse = vi.fn().mockResolvedValue({
      fileUrl: 'https://example.com/prefer.txt',
      uploadStatus: 'SUCCESS',
      errorMessage: null,
    });

    await upLoadFileToServer([file], { upload, uploadWithResponse });

    expect(uploadWithResponse).toHaveBeenCalledTimes(1);
    expect(upload).not.toHaveBeenCalled();
  });
});

describe('upLoadFileToServer - Map identity and count guards', () => {
  it('should notify onFileMapChange with a new Map reference each time', async () => {
    const file = createFile('map.txt', 100);
    const fileMap = new Map<string, AttachmentFile>();
    const seenMaps: Array<Map<string, AttachmentFile> | undefined> = [];
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      seenMaps.push(map);
    });
    const upload = vi.fn().mockResolvedValue('https://example.com/map.txt');

    await upLoadFileToServer([file], {
      upload,
      fileMap,
      onFileMapChange,
    });

    expect(seenMaps.length).toBeGreaterThan(0);
    for (const map of seenMaps) {
      expect(map).toBeInstanceOf(Map);
      expect(map).not.toBe(fileMap);
    }
  });

  it('should abort without mutating fileMap when minFileCount is not met', async () => {
    const upload = vi.fn().mockResolvedValue('https://example.com/x.txt');
    const file = createFile('only-one.txt', 100);
    const fileMap = new Map<string, AttachmentFile>();
    const onFileMapChange = vi.fn();

    await upLoadFileToServer([file], {
      upload,
      fileMap,
      onFileMapChange,
      minFileCount: 2,
    });

    expect(upload).not.toHaveBeenCalled();
    expect(fileMap.size).toBe(0);
    expect(onFileMapChange).not.toHaveBeenCalled();
  });

  it('should interpolate ${maxFileCount} in locale message when count is exceeded', async () => {
    const file = createFile('extra.txt', 100);
    const fileMap = new Map<string, AttachmentFile>();
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      if (map) {
        fileMap.clear();
        map.forEach((f, k) => fileMap.set(k, f));
      }
    });
    const onExceedMaxCount = vi.fn();

    await upLoadFileToServer([file], {
      fileMap,
      onFileMapChange,
      maxFileCount: 0,
      onExceedMaxCount,
      locale: {
        'markdownInput.maxFileCountExceeded': 'limit is ${maxFileCount} files',
      } as any,
    });

    const stored = Array.from(fileMap.values())[0];
    expect(stored.status).toBe('error');
    expect(stored.errorCode).toBe('FILE_COUNT_EXCEEDED');
    expect(stored.errorMessage).toBe('limit is 0 files');
    expect(onExceedMaxCount).toHaveBeenCalledWith({
      maxCount: 0,
      currentCount: 0,
      selectedCount: 1,
    });
  });

  it('should interpolate ${maxSize} in locale message when file is oversized', async () => {
    const maxFileSize = 2048;
    const file = createFile('big.txt', maxFileSize + 1);
    const fileMap = new Map<string, AttachmentFile>();
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      if (map) {
        fileMap.clear();
        map.forEach((f, k) => fileMap.set(k, f));
      }
    });

    await upLoadFileToServer([file], {
      maxFileSize,
      fileMap,
      onFileMapChange,
      locale: {
        'markdownInput.fileSizeExceeded': 'too large: ${maxSize} KB',
      } as any,
    });

    const stored = Array.from(fileMap.values())[0];
    expect(stored.errorCode).toBe('FILE_SIZE_EXCEEDED');
    expect(stored.errorMessage).toBe('too large: 2 KB');
  });

  it('should use locale uploadFailed when upload rejects a non-Error value', async () => {
    const onUploadError = vi.fn();
    const file = createFile('fail.txt', 100);
    const fileMap = new Map<string, AttachmentFile>();
    const onFileMapChange = vi.fn((map?: Map<string, AttachmentFile>) => {
      if (map) {
        fileMap.clear();
        map.forEach((f, k) => fileMap.set(k, f));
      }
    });
    const upload = vi.fn().mockRejectedValue('network down');

    await upLoadFileToServer([file], {
      upload,
      fileMap,
      onFileMapChange,
      onUploadError,
      locale: {
        uploadFailed: 'custom upload failed',
      } as any,
    });

    const stored = Array.from(fileMap.values())[0];
    expect(stored.status).toBe('error');
    expect(stored.errorMessage).toBe('custom upload failed');
    expect(onUploadError).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'network down' }),
    );
  });
});
