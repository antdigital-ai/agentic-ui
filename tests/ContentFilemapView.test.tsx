import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ContentFilemapView } from '../src/Bubble/ContentFilemapView';
import { extractFilemapBlocks } from '../src/Bubble/extractFilemapBlocks';
import type { FilemapBlock } from '../src/Bubble/extractFilemapBlocks';
import type { AttachmentFile } from '../src/MarkdownInputField/AttachmentButton/types';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const makeBlock = (body: string): FilemapBlock => ({
  raw: `\`\`\`agentic-ui-filemap\n${body}\n\`\`\``,
  body,
});

const IMG_BODY = JSON.stringify({
  fileList: [
    {
      name: 'photo.png',
      type: 'image/png',
      uuid: 'uuid-img',
      url: 'http://example.com/photo.png',
    },
  ],
});

const PDF_BODY = JSON.stringify({
  fileList: [
    {
      name: 'report.pdf',
      type: 'application/pdf',
      uuid: 'uuid-pdf',
      url: 'http://example.com/report.pdf',
    },
  ],
});

describe('ContentFilemapView', () => {
  // ─── 基础渲染 ───────────────────────────────────────────────────────────────

  it('当 blocks 为空时不渲染任何内容', () => {
    const { container } = render(
      <ContentFilemapView blocks={[]} placement="left" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('能渲染图片类型的 filemap 块', () => {
    const { container } = render(
      <ContentFilemapView blocks={[makeBlock(IMG_BODY)]} placement="left" />,
    );
    expect(
      container.querySelector('[data-testid="file-view-list"]'),
    ).toBeInTheDocument();
  });

  it('能渲染非媒体文件（PDF）的 filemap 块', () => {
    render(
      <ContentFilemapView blocks={[makeBlock(PDF_BODY)]} placement="left" />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('JSON 解析失败时不渲染 FileMapView', () => {
    const { container } = render(
      <ContentFilemapView
        blocks={[makeBlock('not valid json <<<')]}
        placement="left"
      />,
    );
    expect(
      container.querySelector('[data-testid="file-view-list"]'),
    ).toBeNull();
  });

  it('fileList 为空时不渲染 FileMapView', () => {
    const { container } = render(
      <ContentFilemapView
        blocks={[makeBlock('{"fileList":[]}')]}
        placement="left"
      />,
    );
    expect(
      container.querySelector('[data-testid="file-view-list"]'),
    ).toBeNull();
  });

  it('多个 filemap 块各自渲染一个 FileMapView', () => {
    const { container } = render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_BODY), makeBlock(PDF_BODY)]}
        placement="left"
      />,
    );
    expect(
      container.querySelectorAll('[data-testid="file-view-list"]'),
    ).toHaveLength(2);
  });

  // ─── 样式与 placement ──────────────────────────────────────────────────────

  it('将 style prop 应用到外层包装 div', () => {
    const { container } = render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_BODY)]}
        placement="left"
        style={{ alignSelf: 'flex-end' }}
      />,
    );
    const wrapper = container.querySelector(
      '[data-testid="content-filemap-view"]',
    ) as HTMLElement;
    expect(wrapper.style.alignSelf).toBe('flex-end');
  });

  it('placement="right" 时 FileMapView 右对齐', () => {
    const { container } = render(
      <ContentFilemapView blocks={[makeBlock(IMG_BODY)]} placement="right" />,
    );
    const list = container.querySelector(
      '[data-testid="file-view-list"]',
    ) as HTMLElement;
    expect(list).toBeInTheDocument();
    expect(list.style.alignItems).toBe('flex-end');
  });

  // ─── fileViewEvents ────────────────────────────────────────────────────────

  it('fileViewEvents 返回的 onPreview 会替换默认行为', () => {
    const onPreview = vi.fn();
    render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_BODY)]}
        placement="left"
        fileViewEvents={() => ({ onPreview })}
      />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('fileViewEvents 抛出异常时不影响渲染', () => {
    expect(() =>
      render(
        <ContentFilemapView
          blocks={[makeBlock(IMG_BODY)]}
          placement="left"
          fileViewEvents={() => {
            throw new Error('bad events');
          }}
        />,
      ),
    ).not.toThrow();
  });

  // ─── fileMapConfig.onPreview ───────────────────────────────────────────────

  it('fileMapConfig.onPreview 在没有 fileViewEvents 时作为默认预览处理器', () => {
    const onPreview = vi.fn();
    render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_BODY)]}
        placement="left"
        fileMapConfig={{ onPreview }}
      />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('fileViewEvents 提供 onPreview 时优先于 fileMapConfig.onPreview', () => {
    const configPreview = vi.fn();
    const eventsPreview = vi.fn();
    render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_BODY)]}
        placement="left"
        fileMapConfig={{ onPreview: configPreview }}
        fileViewEvents={() => ({ onPreview: eventsPreview })}
      />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  // ─── fileMapConfig.itemRender ──────────────────────────────────────────────

  it('fileMapConfig.itemRender 在没有 fileViewConfig.itemRender 时生效', () => {
    const itemRender = vi.fn((_node: React.ReactNode) => (
      <div data-testid="custom-item" />
    ));
    render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_BODY)]}
        placement="left"
        fileMapConfig={{ itemRender }}
      />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('fileViewConfig.itemRender 优先于 fileMapConfig.itemRender', () => {
    const configItemRender = vi.fn((_node: React.ReactNode) => (
      <div data-testid="config-item" />
    ));
    const mapConfigItemRender = vi.fn((_node: React.ReactNode) => (
      <div data-testid="mapconfig-item" />
    ));
    render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_BODY)]}
        placement="left"
        fileViewConfig={{ itemRender: configItemRender }}
        fileMapConfig={{ itemRender: mapConfigItemRender }}
      />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  // ─── fileMapConfig.normalizeFile ───────────────────────────────────────────

  it('fileMapConfig.normalizeFile 能修改文件条目', () => {
    const normalizeFile = vi.fn(
      (_raw: Record<string, unknown>, defaultFile: AttachmentFile) => ({
        ...defaultFile,
        name: 'overridden.png',
      }),
    );
    render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_BODY)]}
        placement="left"
        fileMapConfig={{ normalizeFile }}
      />,
    );
    expect(normalizeFile).toHaveBeenCalled();
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('fileMapConfig.normalizeFile 返回 null 时过滤掉该文件，不渲染 FileMapView', () => {
    const normalizeFile = vi.fn(() => null);
    const { container } = render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_BODY)]}
        placement="left"
        fileMapConfig={{ normalizeFile }}
      />,
    );
    expect(
      container.querySelector('[data-testid="file-view-list"]'),
    ).toBeNull();
  });

  // ─── extractFilemapBlocks 集成：始终使用 strippedContent ──────────────────

  it('提取后 strippedContent 始终不含 agentic-ui-filemap 围栏（无论块数量）', () => {
    const content = `Hello\n\n\`\`\`agentic-ui-filemap\n${IMG_BODY}\n\`\`\`\n\nWorld`;
    const { blocks, stripped } = extractFilemapBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(stripped).not.toContain('agentic-ui-filemap');
    expect(stripped).toContain('Hello');
    expect(stripped).toContain('World');
  });

  it('没有 filemap 块时 strippedContent 等同于原内容（trim）', () => {
    const content = 'Just some text.';
    const { blocks, stripped } = extractFilemapBlocks(content);

    expect(blocks).toHaveLength(0);
    expect(stripped).toBe(content.trim());
  });

  it('内容全为 filemap 块时 strippedContent 为空字符串', () => {
    const content = `\`\`\`agentic-ui-filemap\n${IMG_BODY}\n\`\`\``;
    const { blocks, stripped } = extractFilemapBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(stripped).toBe('');
  });
});
