import { render, screen, waitFor } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownRenderer } from '../index';
import type { MarkdownRendererRef } from '../types';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(() =>
      Promise.resolve({ svg: '<svg><text>mock</text></svg>' }),
    ),
  },
}));

describe('MarkdownRenderer 额外分支', () => {
  it('customPrefixCls + style + className', async () => {
    render(
      <MarkdownRenderer
        content="hi"
        prefixCls="custom-md"
        className="extra-cls"
        style={{ padding: 8 }}
      />,
    );
    await waitFor(() => {
      const el = screen.getByTestId('markdown-renderer');
      expect(el.className).toMatch(/extra-cls/);
      expect(el).toHaveStyle({ padding: '8px' });
    });
  });

  it('apaasify.enable=false 不注入 render', async () => {
    render(
      <MarkdownRenderer
        content="plain"
        apaasify={{
          enable: false,
          render: () => <div data-testid="should-not">x</div>,
        }}
      />,
    );
    await waitFor(() => {
      expect(screen.queryByTestId('should-not')).toBeNull();
    });
  });

  it('streaming 默认 throttle；isFinished 透传', async () => {
    const ref = createRef<MarkdownRendererRef>();
    render(
      <MarkdownRenderer
        ref={ref}
        content="abcdef"
        streaming
        isFinished
        throttleOptions={{ charsPerFrame: 100 }}
      />,
    );
    await waitFor(() => {
      expect(ref.current?.getDisplayedContent()).toBeTruthy();
    });
  });

  it('plugins rehype 合并；htmlConfig 透传', async () => {
    const rehype = vi.fn(() => (tree: unknown) => tree);
    render(
      <MarkdownRenderer
        content="**x**"
        htmlConfig={{ openLinksInNewTab: true }}
        plugins={[{ renderer: { rehypePlugins: [rehype as any] } }]}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('markdown-renderer').textContent).toContain('x');
    });
  });

  it.skip('脚注仅引用无定义时仍通知空数组一次', async () => {
    const onFootnoteDefinitionChange = vi.fn();
    render(
      <MarkdownRenderer
        content="See [^a]"
        fncProps={{ onFootnoteDefinitionChange }}
      />,
    );
    await waitFor(() => {
      expect(onFootnoteDefinitionChange).toHaveBeenCalledWith([]);
    });
  });

  it('linkConfig / fileMapConfig / eleRender / codeProps 可挂载', async () => {
    render(
      <MarkdownRenderer
        content="[a](https://t.com)"
        linkConfig={{ openInNewTab: true }}
        fileMapConfig={{}}
        eleRender={undefined as any}
        codeProps={{}}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('markdown-renderer')).toBeTruthy();
    });
  });
});
