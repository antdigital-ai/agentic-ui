import { describe, expect, it, vi } from 'vitest';
import {
  collectRendererComponents,
  collectRendererRehypePlugins,
  collectRendererRemarkPlugins,
} from '../collectMarkdownRendererPlugin';

describe('collectMarkdownRendererPlugin 额外分支', () => {
  it('plugins 缺省 / 空数组', () => {
    expect(collectRendererComponents()).toEqual({});
    expect(collectRendererRemarkPlugins([])).toEqual([]);
    expect(collectRendererRehypePlugins(undefined)).toEqual([]);
  });

  it('合并 rendererComponents；后写覆盖先写', () => {
    const A = () => null;
    const B = () => null;
    const merged = collectRendererComponents([
      { renderer: { rendererComponents: { code: A } } } as any,
      { renderer: { rendererComponents: { code: B, pre: A } } } as any,
      { renderer: {} } as any,
      {} as any,
    ]);
    expect(merged.code).toBe(B);
    expect(merged.pre).toBe(A);
  });

  it('remark / rehype 数组合并并跳过空项', () => {
    const r1 = vi.fn();
    const r2 = vi.fn();
    const h1 = vi.fn();
    expect(
      collectRendererRemarkPlugins([
        { renderer: { remarkPlugins: [r1 as any] } } as any,
        { renderer: { remarkPlugins: [r2 as any] } } as any,
        { renderer: { remarkPlugins: undefined } } as any,
      ]),
    ).toEqual([r1, r2]);
    expect(
      collectRendererRehypePlugins([
        { renderer: { rehypePlugins: [h1 as any] } } as any,
        { renderer: {} } as any,
      ]),
    ).toEqual([h1]);
  });
});
