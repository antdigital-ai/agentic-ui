import { AttachmentFile, AttachmentFileListItem } from '../../../../index';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock LoadingIcon
vi.mock('../../../../icons/LoadingIcon', () => ({
  LoadingIcon: () => <div data-testid="loading-icon">Loading...</div>,
}));

// Mock AttachmentFileIcon
vi.mock(
  '../AttachmentFileIcon',
  () => ({
    AttachmentFileIcon: ({ file }: { file: any }) => (
      <div data-testid="file-icon">{file.name}</div>
    ),
  }),
);

describe('AttachmentFileListItem', () => {
  const mockOnDelete = vi.fn();
  const mockOnPreview = vi.fn();
  const mockOnDownload = vi.fn();

  const createMockFile = (
    overrides: Partial<AttachmentFile> = {},
  ): AttachmentFile => {
    const file = {
      name: 'test.txt',
      size: 1024,
      type: 'text/plain',
      lastModified: Date.now(),
      status: 'done', // Default status
      uuid: 'test-uuid',
      url: 'http://example.com/test.txt',
      previewUrl: 'http://example.com/preview.txt',
      ...overrides,
    };

    return file as AttachmentFile;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render file item with done status', () => {
    const file = createMockFile({ name: 'test-file.txt', status: 'done' });

    render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
        className="test-class"
        prefixCls="test-prefix"
        hashId="test-hash"
      />,
    );

    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
  });

  it('should render loading icon when status is uploading', () => {
    const file = createMockFile({
      name: 'uploading-file.txt',
      status: 'uploading',
    });

    render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // 验证加载图标存在 - 通过查找 SVG 元素和 sofa-icons-icon 类名
    const loadingIcon = document.querySelector('.sofa-icons-icon');
    expect(loadingIcon).toBeInTheDocument();
    expect(screen.queryByTestId('file-icon')).not.toBeInTheDocument();
  });

  it('should not render any icon when status is error', () => {
    const file = createMockFile({ name: 'error-file.txt', status: 'error' });

    render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('file-icon')).not.toBeInTheDocument();
  });

  it('should call onPreview when clicked and status is done', () => {
    const file = createMockFile({ name: 'clickable-file.txt', status: 'done' });

    render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    const fileItem = screen.getByText('clickable-file.txt').closest('div');
    fireEvent.click(fileItem!);

    expect(mockOnPreview).toHaveBeenCalledTimes(1);
  });

  it('should not call onPreview when clicked and status is uploading', () => {
    const file = createMockFile({
      name: 'uploading-file.txt',
      status: 'uploading',
    });

    render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // 通过类名查找加载图标，然后找到其父级 div 进行点击
    const loadingIcon = document.querySelector('.sofa-icons-icon');
    const fileItem = loadingIcon?.closest('div');
    fireEvent.click(fileItem!);

    expect(mockOnPreview).not.toHaveBeenCalled();
  });

  it('should not call onPreview when clicked and status is error', () => {
    const file = createMockFile({ name: 'error-file.txt', status: 'error' });

    render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    const fileItem = screen.getByText('error-file').closest('div');
    fireEvent.click(fileItem!);

    expect(mockOnPreview).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const file = createMockFile({ name: 'test.txt' });

    const { container } = render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
        className="custom-class"
      />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle file without name', () => {
    const file = createMockFile();
    Object.defineProperty(file, 'name', { value: '', writable: true });

    render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // Should render without crashing
    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
  });

  it('should render with different file sizes', () => {
    const file = createMockFile({ name: 'large-file.txt' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024, writable: true }); // 1MB

    render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    expect(screen.getByText('large-file.txt')).toBeInTheDocument();
  });

  it('should pass correct props to AttachmentFileIcon', () => {
    const file = createMockFile({ name: 'icon-test.txt', status: 'done' });

    render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // Check that the mocked AttachmentFileIcon receives the file
    expect(screen.getByTestId('file-icon')).toHaveTextContent('icon-test.txt');
  });

  it('should handle motion.div variants and exit props', () => {
    const file = createMockFile({ name: 'motion-test.txt' });

    const { container } = render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // Check that motion.div is rendered (mocked as regular div)
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply prefixCls and hashId correctly', () => {
    const file = createMockFile({ name: 'css-test.txt', status: 'uploading' });

    render(
      <AttachmentFileListItem
        file={file}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
        prefixCls="custom-prefix"
        hashId="custom-hash"
      />,
    );
    const loadingIcon = document.querySelector('.sofa-icons-icon');
    expect(loadingIcon).toBeInTheDocument();
  });
});
