import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import type { FileNode } from '../../../types';
import { MediaPreview } from '../components/MediaPreview';

const file: FileNode = { id: 'f1', name: 'demo.png' };
const baseProps = {
  file,
  prefixCls: 'workspace-file-preview',
  hashId: 'hash',
};

describe('MediaPreview', () => {
  it('shows placeholder when previewUrl is missing', () => {
    render(
      <ConfigProvider>
        <MediaPreview {...baseProps} category="image" />
      </ConfigProvider>,
    );
    expect(screen.getByText('无法获取图片预览')).toBeInTheDocument();
  });

  it('uses locale error message when previewUrl is missing', () => {
    render(
      <ConfigProvider>
        <MediaPreview
          {...baseProps}
          category="video"
          locale={{ 'workspace.file.cannotGetVideoPreview': 'No video' }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('No video')).toBeInTheDocument();
  });

  it('renders image preview', () => {
    render(
      <ConfigProvider>
        <MediaPreview
          {...baseProps}
          category="image"
          previewUrl="https://example.com/a.png"
        />
      </ConfigProvider>,
    );
    expect(screen.getByAltText('demo.png')).toHaveAttribute(
      'src',
      'https://example.com/a.png',
    );
  });

  it('renders video with captions track', () => {
    const { container } = render(
      <ConfigProvider>
        <MediaPreview
          {...baseProps}
          category="video"
          previewUrl="https://example.com/a.mp4"
        />
      </ConfigProvider>,
    );
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://example.com/a.mp4');
    expect(
      container.querySelector('track[kind="captions"]'),
    ).toBeInTheDocument();
  });

  it('renders audio element', () => {
    const { container } = render(
      <ConfigProvider>
        <MediaPreview
          {...baseProps}
          category="audio"
          previewUrl="https://example.com/a.mp3"
        />
      </ConfigProvider>,
    );
    expect(container.querySelector('audio')).toHaveAttribute(
      'src',
      'https://example.com/a.mp3',
    );
  });

  it('renders pdf embed', () => {
    const { container } = render(
      <ConfigProvider>
        <MediaPreview
          {...baseProps}
          category="pdf"
          previewUrl="https://example.com/a.pdf"
        />
      </ConfigProvider>,
    );
    expect(container.querySelector('embed')).toHaveAttribute(
      'type',
      'application/pdf',
    );
  });
});
