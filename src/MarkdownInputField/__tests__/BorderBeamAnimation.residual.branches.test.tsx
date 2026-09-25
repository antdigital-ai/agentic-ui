/**
 * BorderBeamAnimation residual：path 尺寸、onAnimationComplete、style 幂等注入。
 */
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BorderBeamAnimation } from '../BorderBeamAnimation';

describe('BorderBeamAnimation residual branches', () => {
  beforeEach(() => {
    document.getElementById('agentic-ui-border-beam-keyframes')?.remove();
    (global as any).ResizeObserver = vi.fn(function (this: any, cb: any) {
      this.observe = (el: Element) => {
        Object.defineProperty(el, 'clientWidth', {
          value: 120,
          configurable: true,
        });
        Object.defineProperty(el, 'clientHeight', {
          value: 40,
          configurable: true,
        });
        cb([{ contentRect: { width: 120, height: 40 }, target: el }]);
      };
      this.disconnect = vi.fn();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.getElementById('agentic-ui-border-beam-keyframes')?.remove();
  });

  it('非 test 环境有尺寸时渲染 path；onAnimationEnd 触发 complete', () => {
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const onAnimationComplete = vi.fn();
    const { container } = render(
      <BorderBeamAnimation
        isVisible
        borderRadius={8}
        offsetX={2}
        offsetY={3}
        onAnimationComplete={onAnimationComplete}
      />,
    );
    const core = container.querySelector('.agentic-border-beam-core');
    expect(core).toBeTruthy();
    fireEvent.animationEnd(core!);
    expect(onAnimationComplete).toHaveBeenCalled();
    render(<BorderBeamAnimation isVisible={false} borderRadius={4} />);
    expect(
      document.querySelectorAll('#agentic-ui-border-beam-keyframes'),
    ).toHaveLength(1);
    process.env.NODE_ENV = orig;
  });

  it('零尺寸时不渲染 svg path（pathData 空）', () => {
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    (global as any).ResizeObserver = vi.fn(function (this: any, cb: any) {
      this.observe = (el: Element) => {
        cb([{ contentRect: { width: 0, height: 0 }, target: el }]);
      };
      this.disconnect = vi.fn();
    });
    const { container } = render(
      <BorderBeamAnimation isVisible borderRadius={8} />,
    );
    expect(container.querySelector('svg')).toBeNull();
    process.env.NODE_ENV = orig;
  });

  it('onAnimationEnd 冒泡非子目标不触发 complete', () => {
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const onAnimationComplete = vi.fn();
    const { container } = render(
      <BorderBeamAnimation
        isVisible
        borderRadius={8}
        onAnimationComplete={onAnimationComplete}
      />,
    );
    const core = container.querySelector('.agentic-border-beam-core')!;
    const child = document.createElement('span');
    core.appendChild(child);
    fireEvent.animationEnd(child);
    expect(onAnimationComplete).not.toHaveBeenCalled();
    process.env.NODE_ENV = orig;
  });

  it('gradientId 自定义；isVisible false 仍挂载容器', () => {
    const { container } = render(
      <BorderBeamAnimation
        isVisible={false}
        borderRadius={4}
        gradientId="custom-grad"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
