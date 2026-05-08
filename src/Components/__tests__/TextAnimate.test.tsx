import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// TextAnimate 已完全去除 framer-motion，改为纯 CSS 实现：
// - 容器元素带 data-testid="ant-text-animate"，等价旧实现的 "animate-presence"
// - 每个 segment 是 <span class="ant-text-animate-item ...">，通过 className 查询
//   等价旧实现的 motion.span（旧 mock 用的 data-testid="motion-span"）
//
// 同时 mock 掉 useTextAnimateStyle 以稳定 className（不依赖 hashId 生成器）。
vi.mock('../TextAnimate/style', () => ({
  useTextAnimateStyle: () => ({
    wrapSSR: (node: any) => node,
    hashId: 'test-hash',
  }),
}));

import { resolveSegments, TextAnimate } from '../TextAnimate';

/** 查询渲染出的所有 segment span，等价旧实现中 `getAllByTestId('motion-span')` */
const getSegmentSpans = (root: HTMLElement = document.body): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>('.ant-text-animate-item'));

describe('resolveSegments', () => {
  it('按单词拆分文本，保留空白', () => {
    const result = resolveSegments('hello world', 'word');
    expect(result).toEqual(['hello', ' ', 'world']);
  });

  it('按字符拆分文本', () => {
    const result = resolveSegments('abc', 'character');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('按行拆分文本', () => {
    const result = resolveSegments('line1\nline2\nline3', 'line');
    expect(result).toEqual(['line1', 'line2', 'line3']);
  });

  it('text 模式保留完整文本', () => {
    const result = resolveSegments('hello world', 'text');
    expect(result).toEqual(['hello world']);
  });

  it('mix 模式走 default 分支，保留完整文本', () => {
    const result = resolveSegments('hello', 'mix');
    expect(result).toEqual(['hello']);
  });

  it('数字子节点转为字符串后再拆分', () => {
    const result = resolveSegments(12345 as any, 'character');
    expect(result).toEqual(['1', '2', '3', '4', '5']);
  });

  it('非文本子节点（React 元素）原样保留', () => {
    const el = <strong key="b">bold</strong>;
    const result = resolveSegments(el, 'word');
    expect(result).toHaveLength(1);
    expect(React.isValidElement(result[0])).toBe(true);
  });

  it('混合文本与元素子节点', () => {
    const children = (
      <>
        hello <em>world</em>
      </>
    );
    const result = resolveSegments(children, 'word');
    // "hello " 会被拆为 ["hello", " "]，<em> 保留
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

describe('TextAnimate 组件', () => {
  it('使用默认 props 渲染文本', () => {
    // startOnView=false 跳过 IntersectionObserver，确保 segment 立即渲染
    render(<TextAnimate startOnView={false}>hello world</TextAnimate>);
    expect(screen.getByTestId('ant-text-animate')).toBeInTheDocument();
    const spans = getSegmentSpans();
    expect(spans.length).toBeGreaterThan(0);
  });

  it('使用 by="character" 拆分并渲染', () => {
    render(
      <TextAnimate startOnView={false} by="character">
        abc
      </TextAnimate>,
    );
    const spans = getSegmentSpans();
    expect(spans).toHaveLength(3);
    expect(spans[0]).toHaveTextContent('a');
    expect(spans[1]).toHaveTextContent('b');
    expect(spans[2]).toHaveTextContent('c');
  });

  it('使用 by="line" 拆分并渲染', () => {
    render(
      <TextAnimate startOnView={false} by="line">
        {'line1\nline2'}
      </TextAnimate>,
    );
    const spans = getSegmentSpans();
    expect(spans).toHaveLength(2);
  });

  it('传入自定义 variants 时使用 data-animation="custom"', () => {
    const customVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      show: { opacity: 1, scale: 1 },
    };
    render(
      <TextAnimate startOnView={false} variants={customVariants}>
        custom
      </TextAnimate>,
    );
    expect(screen.getByTestId('ant-text-animate')).toBeInTheDocument();
    const spans = getSegmentSpans();
    expect(spans[0]).toHaveAttribute('data-animation', 'custom');
  });

  it('传入 animation="blurIn" 使用预设动画', () => {
    render(
      <TextAnimate startOnView={false} animation="blurIn">
        blur text
      </TextAnimate>,
    );
    expect(screen.getByTestId('ant-text-animate')).toBeInTheDocument();
    const spans = getSegmentSpans();
    expect(spans[0]).toHaveAttribute('data-animation', 'blurIn');
  });

  it('自定义 as 元素类型', () => {
    render(
      <TextAnimate startOnView={false} as="div">
        in a div
      </TextAnimate>,
    );
    const container = screen.getByTestId('ant-text-animate');
    expect(container).toBeInTheDocument();
    expect(container.tagName.toLowerCase()).toBe('div');
  });

  it('segmentClassName 应用到每个片段', () => {
    render(
      <TextAnimate
        startOnView={false}
        segmentClassName="seg-cls"
        by="character"
      >
        ab
      </TextAnimate>,
    );
    const spans = getSegmentSpans();
    spans.forEach((s) => expect(s.className).toContain('seg-cls'));
  });

  it('accessible 为 true 且 children 为字符串时设置 aria-label', () => {
    render(
      <TextAnimate startOnView={false} accessible>
        hello
      </TextAnimate>,
    );
    const container = screen.getByTestId('ant-text-animate');
    expect(container).toHaveAttribute('aria-label', 'hello');
  });

  it('空文本时 segments 为空，不渲染任何 segment span', () => {
    render(<TextAnimate startOnView={false}>{''}</TextAnimate>);
    expect(getSegmentSpans()).toHaveLength(0);
  });

  it('React 元素子节点在 map 中使用 element.key 生成 key', () => {
    render(
      <TextAnimate startOnView={false} by="text">
        <span key="custom-key">element child</span>
      </TextAnimate>,
    );
    const spans = getSegmentSpans();
    expect(spans).toHaveLength(1);
    expect(spans[0]).toHaveTextContent('element child');
  });

  it('animation 为 null 时回退到默认 fadeIn 预设', () => {
    render(
      <TextAnimate startOnView={false} animation={null as any}>
        plain
      </TextAnimate>,
    );
    expect(screen.getByTestId('ant-text-animate')).toBeInTheDocument();
    const spans = getSegmentSpans();
    expect(spans[0]).toHaveAttribute('data-animation', 'fadeIn');
  });

  it('accessible=false 时片段不设置 aria-hidden', () => {
    render(
      <TextAnimate startOnView={false} accessible={false} by="character">
        ab
      </TextAnimate>,
    );
    const spans = getSegmentSpans();
    expect(spans[0]).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('startOnView=false 时立即播放（data-in-view=true）', () => {
    render(
      <TextAnimate startOnView={false} by="word">
        hi
      </TextAnimate>,
    );
    const container = screen.getByTestId('ant-text-animate');
    expect(container).toHaveAttribute('data-in-view', 'true');
  });
});
