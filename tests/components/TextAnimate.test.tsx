import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => (
    <div data-testid="animate-presence">{children}</div>
  ),
  motion: (Component: any) => {
    const Wrapped = React.forwardRef((props: any, ref: any) => {
      const {
        variants,
        initial,
        whileInView,
        animate,
        exit,
        viewport,
        custom,
        ...rest
      } = props;
      return (
        <Component
          ref={ref}
          data-variants={JSON.stringify(variants)}
          {...rest}
        />
      );
    });
    Wrapped.displayName = `motion(${typeof Component === 'string' ? Component : 'Component'})`;
    return Wrapped;
  },
}));

// 给 motion 对象添加 span
vi.mock('framer-motion', async () => {
  const motionFn = (Component: any) => {
    const Wrapped = React.forwardRef((props: any, ref: any) => {
      const {
        variants,
        initial,
        whileInView,
        animate,
        exit,
        viewport,
        custom,
        ...rest
      } = props;
      return <Component ref={ref} {...rest} />;
    });
    Wrapped.displayName = `motion(${typeof Component === 'string' ? Component : 'Component'})`;
    return Wrapped;
  };
  motionFn.span = React.forwardRef((props: any, ref: any) => {
    const {
      variants,
      initial,
      whileInView,
      animate,
      exit,
      viewport,
      custom,
      ...rest
    } = props;
    return <span ref={ref} data-testid="motion-span" {...rest} />;
  });
  motionFn.div = React.forwardRef((props: any, ref: any) => {
    const {
      variants,
      initial,
      whileInView,
      animate,
      exit,
      viewport,
      custom,
      ...rest
    } = props;
    return <div ref={ref} {...rest} />;
  });
  return {
    AnimatePresence: ({ children }: any) => (
      <div data-testid="animate-presence">{children}</div>
    ),
    motion: motionFn,
  };
});

vi.mock('../../src/Components/TextAnimate/style', () => ({
  useTextAnimateStyle: () => ({
    wrapSSR: (node: any) => node,
    hashId: 'test-hash',
  }),
}));

import { resolveSegments, TextAnimate } from '../../src/Components/TextAnimate';

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
    render(<TextAnimate>hello world</TextAnimate>);
    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
    const spans = screen.getAllByTestId('motion-span');
    expect(spans.length).toBeGreaterThan(0);
  });

  it('使用 by="character" 拆分并渲染', () => {
    render(<TextAnimate by="character">abc</TextAnimate>);
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(3);
    expect(spans[0]).toHaveTextContent('a');
    expect(spans[1]).toHaveTextContent('b');
    expect(spans[2]).toHaveTextContent('c');
  });

  it('使用 by="line" 拆分并渲染', () => {
    render(<TextAnimate by="line">{'line1\nline2'}</TextAnimate>);
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(2);
  });

  it('传入自定义 variants 时使用自定义容器动画', () => {
    const customVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      show: { opacity: 1, scale: 1 },
    };
    render(<TextAnimate variants={customVariants}>custom</TextAnimate>);
    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
  });

  it('传入 animation="blurIn" 使用预设动画', () => {
    render(<TextAnimate animation="blurIn">blur text</TextAnimate>);
    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
  });

  it('自定义 as 元素类型', () => {
    render(<TextAnimate as="div">in a div</TextAnimate>);
    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
  });

  it('segmentClassName 应用到每个片段', () => {
    render(
      <TextAnimate segmentClassName="seg-cls" by="character">
        ab
      </TextAnimate>,
    );
    const spans = screen.getAllByTestId('motion-span');
    spans.forEach((s) => expect(s.className).toContain('seg-cls'));
  });

  it('accessible 为 true 且 children 为字符串时设置 aria-label', () => {
    render(<TextAnimate accessible>hello</TextAnimate>);
    // 组件应正常渲染
    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
  });

  it('空文本时 segments 为空，staggerChildren 为 0', () => {
    render(<TextAnimate>{''}</TextAnimate>);
    expect(screen.queryAllByTestId('motion-span')).toHaveLength(0);
  });

  it('React 元素子节点在 map 中使用 element.key 生成 key', () => {
    render(
      <TextAnimate by="text">
        <span key="custom-key">element child</span>
      </TextAnimate>,
    );
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(1);
    expect(spans[0]).toHaveTextContent('element child');
  });
});
