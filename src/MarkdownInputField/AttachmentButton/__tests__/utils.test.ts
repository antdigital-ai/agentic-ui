import { describe, expect, it } from 'vitest';
import { isAttachmentFileLoading, isFileMetaPlaceholderState } from '../utils';

describe('AttachmentButton utils', () => {
  it('should mark uploading and pending as loading status', () => {
    expect(isAttachmentFileLoading('uploading')).toBe(true);
    expect(isAttachmentFileLoading('pending')).toBe(true);
    expect(isAttachmentFileLoading('done')).toBe(false);
  });

  it('should not treat loading files as FileMetaPlaceholder', () => {
    expect(
      isFileMetaPlaceholderState({
        status: 'uploading',
        url: undefined,
        previewUrl: undefined,
      } as File),
    ).toBe(false);

    expect(
      isFileMetaPlaceholderState({
        status: 'pending',
        url: undefined,
        previewUrl: undefined,
      } as File),
    ).toBe(false);
  });

  it('should treat error files without urls as FileMetaPlaceholder (FileMapView uses this)', () => {
    expect(
      isFileMetaPlaceholderState({
        status: 'error',
        url: undefined,
        previewUrl: undefined,
      } as File),
    ).toBe(true);
  });

  it('should treat done files without urls as FileMetaPlaceholder', () => {
    expect(
      isFileMetaPlaceholderState({
        status: 'done',
        url: undefined,
        previewUrl: undefined,
      } as File),
    ).toBe(true);
  });
});
