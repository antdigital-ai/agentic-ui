import { describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorPlugin } from '../../MarkdownEditor/plugin';
import {
  collectRendererComponents,
  collectRendererRehypePlugins,
  collectRendererRemarkPlugins,
  mergeMarkdownRendererPlugins,
} from '../collectMarkdownRendererPlugin';

describe('collectMarkdownRendererPlugin 分支覆盖', () => {
  it('plugins 缺省时返回空集合', () => {
    expect(collectRendererComponents()).toEqual({});
    expect(collectRendererRemarkPlugins()).toEqual([]);
    expect(collectRendererRehypePlugins()).toEqual([]);
  });

  it('跳过无 renderer / 空数组条目', () => {
    const plugins: MarkdownEditorPlugin[] = [
      {},
      { renderer: {} },
      { renderer: { remarkPlugins: [], rehypePlugins: [] } },
    ];
    expect(collectRendererComponents(plugins)).toEqual({});
    expect(collectRendererRemarkPlugins(plugins)).toEqual([]);
    expect(collectRendererRehypePlugins(plugins)).toEqual([]);
  });

  it('收集 components / remark / rehype', () => {
    const Comp = vi.fn();
    const remark = vi.fn();
    const rehype = vi.fn();
    const plugins: MarkdownEditorPlugin[] = [
      {
        renderer: {
          rendererComponents: { code: Comp as any },
          remarkPlugins: [remark as any],
          rehypePlugins: [rehype as any],
        },
      },
    ];
    expect(collectRendererComponents(plugins)).toEqual({ code: Comp });
    expect(collectRendererRemarkPlugins(plugins)).toEqual([remark]);
    expect(collectRendererRehypePlugins(plugins)).toEqual([rehype]);
  });

  it('mergeMarkdownRendererPlugins 合并与跳过空 renderer', () => {
    const A = vi.fn();
    const B = vi.fn();
    const remark = vi.fn();
    const rehype = vi.fn();
    const merged = mergeMarkdownRendererPlugins(
      {},
      {
        renderer: {
          rendererComponents: { a: A as any },
          remarkPlugins: [remark as any],
        },
      },
      {
        renderer: {
          rendererComponents: { b: B as any },
          rehypePlugins: [rehype as any],
        },
      },
    );
    expect(merged.renderer?.rendererComponents).toEqual({ a: A, b: B });
    expect(merged.renderer?.remarkPlugins).toEqual([remark]);
    expect(merged.renderer?.rehypePlugins).toEqual([rehype]);
  });

  it('merge 在无任何 renderer 字段时返回空 renderer 对象', () => {
    const merged = mergeMarkdownRendererPlugins({ renderer: {} }, {});
    expect(merged.renderer).toEqual({});
  });
});
