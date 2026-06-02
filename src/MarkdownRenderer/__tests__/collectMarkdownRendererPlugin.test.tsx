import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BaseMarkdownEditor } from '../../MarkdownEditor/BaseMarkdownEditor';
import {
  collectRendererComponents,
  mergeMarkdownRendererPlugins,
} from '../collectMarkdownRendererPlugin';
import { createRendererCodeBlockPlugin } from '../createRendererCodeBlockPlugin';
import type { RendererBlockProps } from '../types';

describe('collectMarkdownRendererPlugin', () => {
  it('mergeMarkdownRendererPlugins 合并 rendererComponents 与 remark 插件', () => {
    const CardA = vi.fn((_props: RendererBlockProps) => (
      <div data-testid="card-a" />
    ));
    const CardB = vi.fn((_props: RendererBlockProps) => (
      <div data-testid="card-b" />
    ));
    const noopRemark = vi.fn();

    const merged = mergeMarkdownRendererPlugins(
      {
        renderer: {
          rendererComponents: { 'insight-card': CardA },
          remarkPlugins: [noopRemark],
        },
      },
      {
        renderer: {
          rendererComponents: { 'overview-card': CardB },
        },
      },
    );

    expect(collectRendererComponents([merged])).toEqual({
      'insight-card': CardA,
      'overview-card': CardB,
    });
    expect(merged.renderer?.remarkPlugins).toEqual([noopRemark]);
  });
});

describe('BaseMarkdownEditor custom renderer plugin', () => {
  it('renderMode=markdown 时渲染自定义 fence language', async () => {
    const plugin = createRendererCodeBlockPlugin({
      'demo-card': ({ code }) => (
        <div data-testid="demo-card">{code.trim()}</div>
      ),
    });

    const md = ['```demo-card', '{"title":"hello"}', '```'].join('\n');

    render(
      <BaseMarkdownEditor
        readonly
        renderMode="markdown"
        initValue={md}
        plugins={[plugin]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('demo-card')).toHaveTextContent(
        '{"title":"hello"}',
      );
    });
  });
});
