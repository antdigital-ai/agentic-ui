import { describe, expect, it } from 'vitest';
import type { AttachmentFile } from '../types';
import { isAttachmentFileLoading, isFileMetaPlaceholderState } from '../utils';

const makeFile = (
  status: AttachmentFile['status'],
  overrides?: Partial<AttachmentFile>,
): AttachmentFile => {
  const file = new File([], 'test') as AttachmentFile;
  file.status = status;
  return Object.assign(file, overrides);
};

describe('AttachmentButton utils', () => {
  it('should mark uploading and pending as loading status', () => {
    expect(isAttachmentFileLoading('uploading')).toBe(true);
    expect(isAttachmentFileLoading('pending')).toBe(true);
    expect(isAttachmentFileLoading('done')).toBe(false);
  });

  it('should not treat loading files as FileMetaPlaceholder', () => {
    expect(isFileMetaPlaceholderState(makeFile('uploading'))).toBe(false);
    expect(isFileMetaPlaceholderState(makeFile('pending'))).toBe(false);
  });

  it('should treat error files without urls as FileMetaPlaceholder (FileMapView uses this)', () => {
    expect(isFileMetaPlaceholderState(makeFile('error'))).toBe(true);
  });

  it('should treat done files without urls as FileMetaPlaceholder', () => {
    expect(isFileMetaPlaceholderState(makeFile('done'))).toBe(true);
  });

  it('should not treat done files with url as FileMetaPlaceholder', () => {
    expect(
      isFileMetaPlaceholderState(makeFile('done', { url: 'https://example.com/file' })),
    ).toBe(false);
  });
});
