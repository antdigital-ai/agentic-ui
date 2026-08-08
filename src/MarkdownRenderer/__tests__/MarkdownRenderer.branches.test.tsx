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

describe('MarkdownRenderer 分支覆盖（无 fake timers）', () => {
  it('content 缺省与 ref API', async () => {
    const ref = createRef<MarkdownRendererRef>();
    render(<MarkdownRenderer ref={ref} content={undefined as any} />);
    await waitFor(() => {
      expect(screen.getByTestId('markdown-renderer')).toBeTruthy();
    });
    expect(ref.current?.getDisplayedContent()).toBe('');
    expect(ref.current?.nativeElement).toBeTruthy();
  });

  it('streaming + throttleOptions.enabled=false 直通；插件 remark 合并', async () => {
    const remarkFromPlugin = vi.fn(() => (tree: unknown) => tree);
    const remarkExtra = vi.fn(() => (tree: unknown) => tree);
    render(
      <MarkdownRenderer
        content="Hello **x**"
        streaming
        throttleOptions={{ enabled: false }}
        remarkPlugins={[remarkExtra as any]}
        plugins={[
          {
            renderer: {
              remarkPlugins: [remarkFromPlugin as any],
            },
          },
        ]}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('markdown-renderer').textContent).toContain(
        'Hello',
      );
    });
  });

  it('仅 plugins remark / 仅外部 remark', async () => {
    const pluginRemark = vi.fn(() => (tree: unknown) => tree);
    const { rerender } = render(
      <MarkdownRenderer
        content="a"
        plugins={[{ renderer: { remarkPlugins: [pluginRemark as any] } }]}
      />,
    );
    await waitFor(() => expect(screen.getByTestId('markdown-renderer')).toBeTruthy());

    const external = vi.fn(() => (tree: unknown) => tree);
    rerender(
      <MarkdownRenderer content="b" remarkPlugins={[external as any]} />,
    );
    await waitFor(() =>
      expect(screen.getByTestId('markdown-renderer').textContent).toContain('b'),
    );
  });

  it('fncProps.onFootnoteDefinitionChange：无脚注通知空数组；有定义时再通知', async () => {
    const onFootnoteDefinitionChange = vi.fn();
    const { rerender } = render(
      <MarkdownRenderer
        content="plain"
        fncProps={{ onFootnoteDefinitionChange }}
      />,
    );
    await waitFor(() => {
      expect(onFootnoteDefinitionChange).toHaveBeenCalledWith([]);
    });

    rerender(
      <MarkdownRenderer
        content={'See [^a]\n\n[^a]: note'}
        fncProps={{ onFootnoteDefinitionChange }}
      />,
    );
    await waitFor(() => {
      expect(onFootnoteDefinitionChange.mock.calls.length).toBeGreaterThan(1);
    });
  });

  it('apaasify.enable + render 注入', async () => {
    render(
      <MarkdownRenderer
        content="x"
        apaasify={{
          enable: true,
          render: () => <div data-testid="apaasify-slot" />,
        }}
      />,
    );
    await waitFor(() => expect(screen.getByTestId('markdown-renderer')).toBeTruthy());
  });
});
