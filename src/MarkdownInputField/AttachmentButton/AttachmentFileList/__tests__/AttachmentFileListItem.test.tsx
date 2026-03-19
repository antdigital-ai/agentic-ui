import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../types';
import { AttachmentFileListItem } from '../AttachmentFileListItem';

const createAttachmentFile = (
  status: AttachmentFile['status'],
  overrides?: Partial<AttachmentFile>,
): AttachmentFile => {
  const file = new File(['content'], 'demo.txt', {
    type: '',
  }) as AttachmentFile;
  file.status = status;
  file.uuid = 'file-1';
  Object.assign(file, overrides);
  return file;
};

describe('AttachmentFileListItem', () => {
  it('should not fallback to FileMetaPlaceholder when uploading', () => {
    const file = createAttachmentFile('uploading');
    render(
      <AttachmentFileListItem
        file={file}
        prefixCls="test-attachment-item"
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByTestId('file-item')).toBeInTheDocument();
  });

  it('should not fallback to FileMetaPlaceholder when pending', () => {
    const file = createAttachmentFile('pending');
    render(
      <AttachmentFileListItem
        file={file}
        prefixCls="test-attachment-item"
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByTestId('file-item')).toBeInTheDocument();
  });

  it('should fallback to FileMetaPlaceholder when error and no urls', () => {
    const file = createAttachmentFile('error');
    render(
      <AttachmentFileListItem
        file={file}
        prefixCls="test-attachment-item"
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('file-item')).not.toBeInTheDocument();
    expect(screen.getByText('TXT')).toBeInTheDocument();
  });
});
