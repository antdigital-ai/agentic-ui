/**
 * TextAnimate 分支覆盖：IntersectionObserver、variants、accessible、动画预设。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../TextAnimate/style', () => ({
  useTextAnimateStyle: () => ({ hashId: 'hash' }),
}));

import { resolveSegments, TextAnimate } from '../TextAnimate';

const getSegments = () =>
  Array.from(document.querySelectorAll<HTMLElement>('.ant-text-animate-item'));

describe('TextAnimate branches', () => {
  describe('resolveSegments 边界', () => {
    it('空字符串子节点跳过', () => {
      expect(resolveSegments('', 'word')).toEqual([]);
    });

    it('mix 模式保留整段', () => {
      expect(resolveSegments('a b', 'mix')).toEqual(['a b']);
    });
  });

  describe('useInViewObserver 分支', () => {
    let observerCallback: IntersectionObserverCallback | null = null;

    beforeEach(() => {
      observerCallback = null;
      class MockIO {
        constructor(cb: IntersectionObserverCallback) {
          observerCallback = cb;
        }
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
      }
      vi.stubGlobal('IntersectionObserver', MockIO);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('startOnView=true 初始 data-in-view=false，进入视口后 true', () => {
      render(<TextAnimate startOnView>observe me</TextAnimate>);
      const container = screen.getByTestId('ant-text-animate');
      expect(container).toHaveAttribute('data-in-view', 'false');

      act(() => {
        observerCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      });
      expect(container).toHaveAttribute('data-in-view', 'true');
    });

    it('once=true 进入视口后 disconnect', () => {
      render(
        <TextAnimate startOnView once>
          once
        </TextAnimate>,
      );
      act(() => {
        observerCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          { disconnect: vi.fn() } as unknown as IntersectionObserver,
        );
      });
      expect(screen.getByTestId('ant-text-animate')).toHaveAttribute(
        'data-in-view',
        'true',
      );
    });

    it('once=false 离开视口回退 false', () => {
      render(
        <TextAnimate startOnView once={false} by="character">
          ab
        </TextAnimate>,
      );
      act(() => {
        observerCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      });
      act(() => {
        observerCallback?.(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      });
      const spans = getSegments();
      expect(spans[0]).toHaveAttribute('data-animation', 'none');
    });

    it('无 IntersectionObserver 时视为 inView', () => {
      vi.stubGlobal('IntersectionObserver', undefined);
      render(<TextAnimate startOnView>fallback</TextAnimate>);
      expect(screen.getByTestId('ant-text-animate')).toHaveAttribute(
        'data-in-view',
        'true',
      );
    });
  });

  describe('渲染分支', () => {
    it('variants 存在时使用 custom stagger', () => {
      render(
        <TextAnimate
          startOnView={false}
          variants={{ hidden: {}, show: {} }}
          by="character"
          delay={0.1}
        >
          ab
        </TextAnimate>,
      );
      const spans = getSegments();
      expect(spans[0]).toHaveAttribute('data-animation', 'custom');
      expect(spans[0].style.getPropertyValue('--text-animate-delay')).toBeTruthy();
    });

    it('accessible=false 且非字符串 children 不设 aria-label', () => {
      render(
        <TextAnimate startOnView={false} accessible={false}>
          <em>rich</em>
        </TextAnimate>,
      );
      expect(screen.getByTestId('ant-text-animate')).not.toHaveAttribute(
        'aria-label',
      );
    });

    it.each([
      'blurInUp',
      'blurInDown',
      'slideUp',
      'slideDown',
      'slideLeft',
      'slideRight',
      'scaleUp',
      'scaleDown',
    ] as const)('animation=%s 预设写入 data-animation', (animation) => {
      render(
        <TextAnimate startOnView={false} animation={animation} by="text">
          preset
        </TextAnimate>,
      );
      expect(getSegments()[0]).toHaveAttribute('data-animation', animation);
    });

    it('segments 为空时 duration 除零保护', () => {
      render(<TextAnimate startOnView={false}>{''}</TextAnimate>);
      expect(getSegments()).toHaveLength(0);
    });
  });
});
