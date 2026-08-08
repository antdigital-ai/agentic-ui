/**
 * MediaPreview 分支覆盖：无 previewUrl 占位、四类媒体与 locale 回退。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import type { FileNode } from '../../types';
import { MediaPreview } from '../preview/components/MediaPreview';

const PREFIX = 'ant-workspace-preview';
const HASH = 'hash-id';

const baseFile = (name = 'demo.bin'): FileNode => ({
  id: 'f1',
  name,
  url: 'https://example.com/demo.bin',
  size: 1024,
  lastModified: '2024-01-01T00:00:00.000Z',
});

const renderMedia = (
  category: 'image' | 'video' | 'audio' | 'pdf',
  previewUrl?: string,
  locale?: Record<string, string>,
) =>
  render(
    <ConfigProvider>
      <MediaPreview
        category={category}
        file={baseFile(`demo.${category === 'pdf' ? 'pdf' : category}`)}
        previewUrl={previewUrl}
        prefixCls={PREFIX}
        hashId={HASH}
        locale={locale}
      />
    </ConfigProvider>,
  );

describe('MediaPreview 分支覆盖', () => {
  it.each([
    ['image', '无法获取图片预览'],
    ['video', '无法获取视频预览'],
    ['audio', '无法获取音频预览'],
    ['pdf', '无法获取PDF预览'],
  ] as const)('无 previewUrl 时 %s 展示默认错误文案', (category, message) => {
    renderMedia(category);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('无 previewUrl 时使用 locale 自定义错误文案', () => {
    renderMedia('image', undefined, {
      'workspace.file.cannotGetImagePreview': 'Image preview unavailable',
    });
    expect(screen.getByText('Image preview unavailable')).toBeInTheDocument();
  });

  it('image 类别渲染 ant Image', () => {
    const { container } = renderMedia('image', 'https://example.com/a.png');
    expect(container.querySelector(`.${PREFIX}-image`)).toBeTruthy();
    expect(screen.getByAltText('demo.image')).toHaveAttribute(
      'src',
      'https://example.com/a.png',
    );
  });

  it('video 类别渲染 video 控件与 captions track', () => {
    const { container } = renderMedia('video', 'https://example.com/a.mp4');
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://example.com/a.mp4');
    expect(video).toHaveAttribute('controlsList', 'nodownload');
    expect(video?.querySelector('track[kind="captions"]')).toBeTruthy();
  });

  it('video 无 locale 时使用默认不支持文案', () => {
    renderMedia('video', 'https://example.com/a.mp4');
    expect(
      screen.getByText('您的浏览器不支持视频播放'),
    ).toBeInTheDocument();
  });

  it('video 有 locale 时使用自定义不支持文案', () => {
    renderMedia('video', 'https://example.com/a.mp4', {
      'workspace.file.videoNotSupported': 'Video unsupported',
    });
    expect(screen.getByText('Video unsupported')).toBeInTheDocument();
  });

  it('audio 类别渲染 audio 控件', () => {
    const { container } = renderMedia('audio', 'https://example.com/a.mp3', {
      'workspace.file.audioNotSupported': 'Audio unsupported',
    });
    const audio = container.querySelector('audio');
    expect(audio).toHaveAttribute('src', 'https://example.com/a.mp3');
    expect(audio).toHaveAttribute('controlsList', 'nodownload');
    expect(screen.getByText('Audio unsupported')).toBeInTheDocument();
  });

  it('pdf 类别渲染 embed', () => {
    const { container } = renderMedia('pdf', 'https://example.com/a.pdf');
    const embed = container.querySelector('embed');
    expect(embed).toHaveAttribute('src', 'https://example.com/a.pdf');
    expect(embed).toHaveAttribute('type', 'application/pdf');
  });
});
