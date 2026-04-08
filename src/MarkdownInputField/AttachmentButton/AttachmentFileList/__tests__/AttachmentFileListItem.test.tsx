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

  it('should render file-item with error icon when error and no urls', () => {
    const file = createAttachmentFile('error');
    render(
      <AttachmentFileListItem
        file={file}
        prefixCls="test-attachment-item"
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByTestId('file-item')).toBeInTheDocument();
    expect(screen.queryByTestId('file-meta-placeholder')).not.toBeInTheDocument();
  });

  it('should fallback to FileMetaPlaceholder when done and no urls', () => {
    const file = createAttachmentFile('done');
    render(
      <AttachmentFileListItem
        file={file}
        prefixCls="test-attachment-item"
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('file-item')).not.toBeInTheDocument();
    const placeholder = screen.getByTestId('file-meta-placeholder');
    expect(placeholder).toHaveStyle({ flex: '0 0 auto' });
  });
});
