/**
 * collectMarkdownRendererPlugin deepen residual：merge 跳过无 renderer、
 * 空 remark/rehype、仅 components / 仅 rehype。
 */
import { describe, expect, it } from 'vitest';
import type { MarkdownEditorPlugin } from '../../MarkdownEditor/plugin';
import {
  collectRendererComponents,
  collectRendererRehypePlugins,
  collectRendererRemarkPlugins,
  mergeMarkdownRendererPlugins,
} from '../collectMarkdownRendererPlugin';

const Dummy = () => null;

describe('collectMarkdownRendererPlugin deepen residual branches', () => {
  it('collect* 无 plugins / 空 renderer 返回空', () => {
    expect(collectRendererComponents()).toEqual({});
    expect(collectRendererRemarkPlugins()).toEqual([]);
    expect(collectRendererRehypePlugins()).toEqual([]);
    expect(collectRendererComponents([{ renderer: {} } as MarkdownEditorPlugin])).toEqual(
      {},
    );
  });

  it('merge：跳过无 renderer；空 remark/rehype 不写入；仅 components', () => {
    const merged = mergeMarkdownRendererPlugins(
      {} as MarkdownEditorPlugin,
      {
        renderer: {
          rendererComponents: { code: Dummy as any },
          remarkPlugins: [],
          rehypePlugins: [],
        },
      } as MarkdownEditorPlugin,
      {
        renderer: {
          rehypePlugins: [(() => {}) as any],
        },
      } as MarkdownEditorPlugin,
    );
    expect(merged.renderer?.rendererComponents?.code).toBe(Dummy);
    expect(merged.renderer?.remarkPlugins).toBeUndefined();
    expect(merged.renderer?.rehypePlugins?.length).toBe(1);
  });

  it('merge：仅 remark 写入；无任何内容时 renderer 为空对象字段全缺', () => {
    const withRemark = mergeMarkdownRendererPlugins({
      renderer: {
        remarkPlugins: [(() => {}) as any],
      },
    } as MarkdownEditorPlugin);
    expect(withRemark.renderer?.remarkPlugins?.length).toBe(1);
    expect(withRemark.renderer?.rendererComponents).toBeUndefined();

    const empty = mergeMarkdownRendererPlugins(
      { renderer: {} } as MarkdownEditorPlugin,
      {} as MarkdownEditorPlugin,
    );
    expect(empty.renderer?.rendererComponents).toBeUndefined();
    expect(empty.renderer?.remarkPlugins).toBeUndefined();
    expect(empty.renderer?.rehypePlugins).toBeUndefined();
  });

  it('collect rehype/remark 有 length 才收集', () => {
    const plugins = [
      {
        renderer: {
          remarkPlugins: [(() => {}) as any],
          rehypePlugins: [(() => {}) as any],
          rendererComponents: { img: Dummy as any },
        },
      },
    ] as MarkdownEditorPlugin[];
    expect(collectRendererRemarkPlugins(plugins).length).toBe(1);
    expect(collectRendererRehypePlugins(plugins).length).toBe(1);
    expect(collectRendererComponents(plugins).img).toBe(Dummy);
  });
});
