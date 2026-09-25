/**
 * ContentFilemapView 分支覆盖：parseBody 回退链、defaultHandlers、events 优先级。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentFilemapView } from '../ContentFilemapView';
import type { FilemapBlock } from '../extractFilemapBlocks';

let lastFileMapViewProps: Record<string, unknown> = {};

vi.mock('../../MarkdownInputField/FileMapView', () => ({
  FileMapView: (props: Record<string, unknown>) => {
    lastFileMapViewProps = props;
    return <div data-testid="file-view-list" />;
  },
}));

const makeBlock = (body: string): FilemapBlock => ({
  raw: `\`\`\`agentic-ui-filemap\n${body}\n\`\`\``,
  body,
});

const validBody = JSON.stringify({
  fileList: [{ name: 'a.png', uuid: 'u1', url: 'https://example.com/a.png' }],
});

describe('ContentFilemapView 分支覆盖', () => {
  beforeEach(() => {
    lastFileMapViewProps = {};
    vi.restoreAllMocks();
  });

  it('json5 解析失败时 partialParse 成功仍渲染', () => {
    const body = "{fileList: [{name: 'a.png', uuid: 'u1', url: 'https://x.com/a.png'}]}";
    render(<ContentFilemapView blocks={[makeBlock(body)]} placement="left" />);
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('json5 与 partialParse 均失败时不渲染', () => {
    const { container } = render(
      <ContentFilemapView blocks={[makeBlock('<<<not-json>>>')]} placement="left" />,
    );
    expect(container.querySelector('[data-testid="file-view-list"]')).toBeNull();
  });

  it('defaultHandlers.onPreview 有 previewUrl 时 window.open', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<ContentFilemapView blocks={[makeBlock(validBody)]} placement="left" />);
    (lastFileMapViewProps.onPreview as (f: { previewUrl: string }) => void)({
      previewUrl: 'https://example.com/preview',
    });
    expect(openSpy).toHaveBeenCalledWith('https://example.com/preview', '_blank');
  });

  it('defaultHandlers.onPreview 无 url 时不调用 window.open', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<ContentFilemapView blocks={[makeBlock(validBody)]} placement="left" />);
    openSpy.mockClear();
    (lastFileMapViewProps.onPreview as (f: Record<string, unknown>) => void)({});
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('defaultHandlers.onDownload 有 url 时创建 a 标签下载', () => {
    render(<ContentFilemapView blocks={[makeBlock(validBody)]} placement="left" />);
    const click = vi.fn();
    const link = { href: '', download: '', click } as HTMLAnchorElement;
    const createSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValueOnce(link);
    const appendSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => link);
    const removeSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => link);

    (lastFileMapViewProps.onDownload as (f: { url: string; name: string }) => void)({
      url: 'https://example.com/file.pdf',
      name: 'file.pdf',
    });

    expect(createSpy).toHaveBeenCalledWith('a');
    expect(link.href).toBe('https://example.com/file.pdf');
    expect(link.download).toBe('file.pdf');
    expect(click).toHaveBeenCalled();
    createSpy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('defaultHandlers.onDownload 无 url 时不创建链接', () => {
    render(<ContentFilemapView blocks={[makeBlock(validBody)]} placement="left" />);
    const createSpy = vi.spyOn(document, 'createElement');
    createSpy.mockClear();
    (lastFileMapViewProps.onDownload as (f: Record<string, unknown>) => void)({});
    expect(createSpy).not.toHaveBeenCalled();
    createSpy.mockRestore();
  });

  it('fileViewEvents 返回 onDownload 时覆盖 defaultHandlers', () => {
    const customDownload = vi.fn();
    render(
      <ContentFilemapView
        blocks={[makeBlock(validBody)]}
        placement="left"
        fileViewEvents={() => ({ onDownload: customDownload })}
      />,
    );
    (lastFileMapViewProps.onDownload as (f: unknown) => void)({ url: 'x' });
    expect(customDownload).toHaveBeenCalled();
  });

  it('fileViewEvents 返回 undefined 字段时使用 defaultHandlers', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <ContentFilemapView
        blocks={[makeBlock(validBody)]}
        placement="left"
        fileViewEvents={() => ({})}
      />,
    );
    (lastFileMapViewProps.onPreview as (f: { url: string }) => void)({
      url: 'https://example.com/img',
    });
    expect(openSpy).toHaveBeenCalled();
  });

  it('无 uuid 时使用生成的 uuid 作为 fileMap 键', () => {
    const body = JSON.stringify({
      fileList: [{ name: 'only-name.png', url: 'https://example.com/n.png' }],
    });
    render(<ContentFilemapView blocks={[makeBlock(body)]} placement="left" />);
    expect(lastFileMapViewProps.fileMap).toBeInstanceOf(Map);
    expect((lastFileMapViewProps.fileMap as Map<string, unknown>).has('file-0')).toBe(
      true,
    );
  });

  it('parsed className 优先于 fileViewConfig.className', () => {
    const body = JSON.stringify({
      className: 'from-json',
      fileList: [{ name: 'a.png', uuid: 'u1', url: 'https://x.com/a.png' }],
    });
    render(
      <ContentFilemapView
        blocks={[makeBlock(body)]}
        placement="left"
        fileViewConfig={{ className: 'from-config' }}
      />,
    );
    expect(lastFileMapViewProps.className).toBe('from-json');
  });

  it('传递 fileViewConfig 的 onFileClick 与 disableDefaultFileClick', () => {
    const onFileClick = vi.fn();
    render(
      <ContentFilemapView
        blocks={[makeBlock(validBody)]}
        placement="left"
        fileViewConfig={{
          onFileClick,
          disableDefaultFileClick: true,
          maxDisplayCount: 3,
          showMoreButton: true,
        }}
      />,
    );
    expect(lastFileMapViewProps.onFileClick).toBe(onFileClick);
    expect(lastFileMapViewProps.disableDefaultFileClick).toBe(true);
    expect(lastFileMapViewProps.maxDisplayCount).toBe(3);
    expect(lastFileMapViewProps.showMoreButton).toBe(true);
  });

  it('fileViewEvents 抛错时 console.warn 且仍渲染', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <ContentFilemapView
        blocks={[makeBlock(validBody)]}
        placement="left"
        fileViewEvents={() => {
          throw new Error('events boom');
        }}
      />,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'fileViewEvents execution failed',
      expect.any(Error),
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
    warnSpy.mockRestore();
  });

  it('placement right；空 blocks 返回 null', () => {
    const { container, rerender } = render(
      <ContentFilemapView blocks={[]} placement="right" />,
    );
    expect(container).toBeEmptyDOMElement();
    rerender(
      <ContentFilemapView
        blocks={[makeBlock(validBody)]}
        placement="right"
      />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('uuid 缺省用 name；download name 默认；previewUrl/url 互换', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const body = JSON.stringify({
      fileList: [{ name: 'n.png', url: 'https://u/n.png' }],
    });
    render(<ContentFilemapView blocks={[makeBlock(body)]} placement="left" />);
    (lastFileMapViewProps.onPreview as any)?.({ url: 'https://u/n.png' });
    (lastFileMapViewProps.onDownload as any)?.({
      previewUrl: 'https://p/n.png',
    });
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });
});
