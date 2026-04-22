import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as markdownReactShared from '../markdownReactShared';
import { useStreamingMarkdownReact } from '../streaming/useStreamingMarkdownReact';

interface HarnessProps {
  content: string;
  remarkPlugins?: unknown[];
  fncProps?: Record<string, unknown>;
}

/**
 * 必须真实挂载：MarkdownBlockPiece 在子组件 useMemo 中才调用 renderMarkdownBlock，
 * renderHook 不挂载子树会导致 spy 统计为 0。
 */
function StreamingHarness(props: HarnessProps) {
  const { content, remarkPlugins, fncProps } = props;
  const node = useStreamingMarkdownReact(content, {
    streaming: true,
    contentRevisionSource: content,
    ...(remarkPlugins !== undefined ? { remarkPlugins } : {}),
    ...(fncProps !== undefined ? { fncProps: fncProps as any } : {}),
  });
  return <div data-testid="streaming-harness-out">{node}</div>;
}

/**
 * 密封块缓存与 Bubble 侧稳定 fncProps 配套：
 * - 末块增长 / fncProps 仅换引用：密封块不应重复 renderMarkdownBlock
 * - remarkPlugins 变引用导致 processor 重建：应清空缓存并重新 parse
 */
describe('useStreamingMarkdownReact sealed subtree cache', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not call renderMarkdownBlock again for sealed blocks when only the tail block grows', () => {
    const spy = vi.spyOn(markdownReactShared, 'renderMarkdownBlock');

    const md1 = 'sealed\n\ntail';
    // 新增内容超过 LAST_BLOCK_THROTTLE_CHARS (20) 以触发 reparse
    const md2 = 'sealed\n\ntail grows with enough extra content here';

    const { rerender } = render(<StreamingHarness content={md1} />);

    const countAfterFirst = spy.mock.calls.length;
    expect(countAfterFirst).toBeGreaterThan(0);

    rerender(<StreamingHarness content={md2} />);

    // 仅 tail 块重新 parse，sealed 块命中缓存
    expect(spy.mock.calls.length - countAfterFirst).toBe(1);
  });

  it('fncProps 仅换引用时密封块不应再次 renderMarkdownBlock', () => {
    const spy = vi.spyOn(markdownReactShared, 'renderMarkdownBlock');

    const md1 = 'sealed\n\ntail';
    const md2 = 'sealed\n\ntail grows with enough extra content here';

    const { rerender } = render(
      <StreamingHarness content={md1} fncProps={{ tag: 'a' }} />,
    );

    const afterFirst = spy.mock.calls.length;
    expect(afterFirst).toBeGreaterThan(0);

    rerender(<StreamingHarness content={md2} fncProps={{ tag: 'b' }} />);

    expect(spy.mock.calls.length - afterFirst).toBe(1);
  });

  it('remarkPlugins 引用变化导致 processor 重建时，密封块会再次 renderMarkdownBlock', () => {
    const spy = vi.spyOn(markdownReactShared, 'renderMarkdownBlock');
    const noop = () => {};
    const fixedMd = 'sealed\n\ntail';

    const { rerender } = render(
      <StreamingHarness content={fixedMd} remarkPlugins={[noop]} />,
    );

    expect(spy.mock.calls.length).toBeGreaterThan(0);
    spy.mockClear();

    rerender(<StreamingHarness content={fixedMd} remarkPlugins={[noop]} />);

    expect(spy.mock.calls.length).toBeGreaterThan(0);
  });
});
