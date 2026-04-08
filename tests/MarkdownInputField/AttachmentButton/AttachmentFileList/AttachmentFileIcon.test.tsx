/**
 * AttachmentFileIcon 组件测试 - 覆盖 uploading/error/image/video/其他类型
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentFileIcon } from '../../../../src/MarkdownInputField/AttachmentButton/AttachmentFileList/AttachmentFileIcon';

vi.mock('antd', async (importOriginal) => {
  const mod = await importOriginal() as Record<string, unknown>;
  return {
    ...mod,
    Image: ({ alt, src }: any) => (
      <img data-testid="image-preview" alt={alt} src={src} />
    ),
  };
});

const mockGetFileTypeIcon = vi.fn(() => <span data-testid="file-type-icon" />);
vi.mock('../../../../src/Workspace/File/utils', () => ({
  getFileTypeIcon: (...args: unknown[]) => mockGetFileTypeIcon(...args),
}));

describe('AttachmentFileIcon', () => {
  it('应渲染 FileUploadingSpin 当 file.status 为 uploading', () => {
    const file = {
      name: 'test.png',
      type: 'image/png',
      status: 'uploading' as const,
      uuid: '1',
      url: '',
    };
    const { container } = render(
      <AttachmentFileIcon file={file as any} className="test-class" />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('应渲染 FileFailed 当 file.status 为 error', () => {
    const file = {
      name: 'test.png',
      type: 'image/png',
      status: 'error' as const,
      uuid: '1',
      url: '',
    };
    render(<AttachmentFileIcon file={file as any} className="test-class" />);
    expect(document.body.firstChild).toBeInTheDocument();
  });

  it('应渲染图片预览当 isImageFile 且 status 为 done', () => {
    const file = {
      name: 'photo.png',
      type: 'image/png',
      status: 'done' as const,
      uuid: '1',
      url: 'https://example.com/photo.png',
    };
    render(
      <AttachmentFileIcon file={file as any} className="test-class" />,
    );
    const img = screen.getByTestId('image-preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.png');
  });

  it('应渲染 VideoThumbnail 当 isVideoFile 且有 previewUrl 或 url', () => {
    const file = {
      name: 'video.mp4',
      type: 'video/mp4',
      status: 'done' as const,
      uuid: '1',
      url: 'https://example.com/video.mp4',
    };
    const { container } = render(
      <AttachmentFileIcon file={file as any} className="test-class" />,
    );
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
  });

  it('应渲染 VideoThumbnailFromBlob 当 isVideoFile 且无 url 但有 file.size', () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });

    const file = new File(['x'], 'video.mp4', { type: 'video/mp4' });
    (file as any).status = 'done';
    (file as any).uuid = '1';
    (file as any).url = '';
    (file as any).previewUrl = '';

    const { container, unmount } = render(
      <AttachmentFileIcon file={file as any} className="test-class" />,
    );

    expect(createObjectURL).toHaveBeenCalledWith(file);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    vi.unstubAllGlobals();
  });

  it('应调用 getFileTypeIcon 当非图片非视频文件', () => {
    mockGetFileTypeIcon.mockClear();
    const file = {
      name: 'doc.pdf',
      type: 'application/pdf',
      status: 'done' as const,
      uuid: '1',
      url: 'https://example.com/doc.pdf',
    };
    render(
      <AttachmentFileIcon file={file as any} className="test-class" />,
    );
    expect(mockGetFileTypeIcon).toHaveBeenCalled();
    expect(screen.getByTestId('file-type-icon')).toBeInTheDocument();
  });
});
