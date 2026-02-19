import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: (Component: any) => {
    return React.forwardRef((props: any, ref: any) => {
      const {
        forwardMotionProps,
        initial,
        animate,
        exit,
        transition,
        variants,
        whileHover,
        whileTap,
        whileFocus,
        whileInView,
        onAnimationStart,
        onAnimationComplete,
        ...rest
      } = props;
      return <Component ref={ref} {...rest} />;
    });
  },
  useInView: () => true,
}));

// Mock style
vi.mock('../../../src/Components/TypingAnimation/style', () => ({
  useTypingAnimationStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'mock-hash',
  }),
}));

// Mock resolveSegments
vi.mock('../../../src/Components/TextAnimate', () => ({
  resolveSegments: (_children: any, _by: any) => ['H', 'i'],
}));

import { TypingAnimation } from '../../../src/Components/TypingAnimation/index';

describe('TypingAnimation 分支覆盖', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * 提供 words 数组，用 fake timer 逐步推进 typing
   */
  it('typing phase：逐字符显示文本', () => {
    const { container } = render(
      <TypingAnimation
        words={['Hi']}
        startOnView={false}
        delay={0}
        duration={50}
        loop={false}
        showCursor={false}
      />,
    );

    // 初始状态：displayedText 为空
    expect(container.textContent).toBe('');

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(container.textContent).toContain('H');

    // 第二个 tick: typing 'i'
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(container.textContent).toContain('Hi');
  });

  /**
   * 测试 typing 完成 → pause → deleting 完整流程
   */
  it('多词 loop：typing → pause → deleting → next word 完整循环', () => {
    const { container } = render(
      <TypingAnimation
        words={['ab', 'cd']}
        startOnView={false}
        delay={0}
        duration={50}
        pauseDelay={100}
        loop={true}
        showCursor={false}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(container.textContent).toContain('a');

    // typing 'b'
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(container.textContent).toContain('ab');
    act(() => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      vi.advanceTimersByTime(25);
    });
    expect(container.textContent).toContain('a');

    // deleting 'a'
    act(() => {
      vi.advanceTimersByTime(25);
    });

    act(() => {
      vi.advanceTimersByTime(25);
    });

    // 开始 typing 'cd' 的 'c'
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(container.textContent).toContain('c');
  });

  /**
   * isLastWord = false → 进入 pause
   */
  it('多词无 loop：非最后一个词触发 pause', () => {
    const { container } = render(
      <TypingAnimation
        words={['a', 'b']}
        startOnView={false}
        delay={0}
        duration={30}
        pauseDelay={50}
        loop={false}
        showCursor={false}
      />,
    );

    // typing 'a'
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(container.textContent).toContain('a');

    act(() => {
      vi.advanceTimersByTime(30);
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      vi.advanceTimersByTime(15);
    });

    act(() => {
      vi.advanceTimersByTime(15);
    });

    // typing 'b'
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(container.textContent).toContain('b');
  });

  /**
   * 最后一个词也应进入 pause
   */
  it('loop 模式下最后一个词也进入 pause', () => {
    const { container } = render(
      <TypingAnimation
        words={['x']}
        startOnView={false}
        delay={0}
        duration={30}
        pauseDelay={50}
        loop={true}
        showCursor={false}
      />,
    );

    // typing 'x'
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(container.textContent).toContain('x');

    act(() => {
      vi.advanceTimersByTime(30);
    });

    // pause → deleting
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // deleting 'x'
    act(() => {
      vi.advanceTimersByTime(15);
    });

    // delete 完成 → next word index = 0（循环回第一个）
    act(() => {
      vi.advanceTimersByTime(15);
    });

    // 重新 typing 'x'
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(container.textContent).toContain('x');
  });

  it('cursorStyle="block" 显示 ▌', () => {
    const { container } = render(
      <TypingAnimation
        words={['ab']}
        startOnView={false}
        delay={0}
        duration={30}
        loop={true}
        showCursor={true}
        cursorStyle="block"
      />,
    );

    // 第一个 tick 触发 typing，此时 shouldShowCursor 为 true
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(container.textContent).toContain('▌');
  });

  it('cursorStyle="underscore" 显示 _', () => {
    const { container } = render(
      <TypingAnimation
        words={['ab']}
        startOnView={false}
        delay={0}
        duration={30}
        loop={true}
        showCursor={true}
        cursorStyle="underscore"
      />,
    );

    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(container.textContent).toContain('_');
  });

  it('cursorStyle="line" 显示 |', () => {
    const { container } = render(
      <TypingAnimation
        words={['ab']}
        startOnView={false}
        delay={0}
        duration={30}
        loop={true}
        showCursor={true}
        cursorStyle="line"
      />,
    );

    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(container.textContent).toContain('|');
  });

  /**
   * 测试 children 作为 words 来源（通过 resolveSegments mock）
   */
  it('无 words 时使用 children 通过 resolveSegments', () => {
    const { container } = render(
      <TypingAnimation
        startOnView={false}
        delay={0}
        duration={30}
        loop={false}
        showCursor={false}
      >
        Hi
      </TypingAnimation>,
    );

    // resolveSegments mock 返回 ['H', 'i']
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(container.textContent).toContain('H');

    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(container.textContent).toContain('Hi');
  });
});
