import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BorderBeamAnimation } from '../../src/MarkdownInputField/BorderBeamAnimation';

describe('BorderBeamAnimation', () => {
  let disconnectSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    disconnectSpy = vi.fn();
    (global as any).ResizeObserver = vi.fn(
      function (this: any, callback: (entries: ResizeObserverEntry[]) => void) {
        this.callback = callback;
        this.observe = (target: Element) => {
          callback([
            {
              contentRect: { width: 200, height: 100 },
              target,
            } as ResizeObserverEntry,
          ]);
        };
        this.disconnect = disconnectSpy;
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('不渲染动画当 isVisible 为 false', () => {
    const { container } = render(
      <BorderBeamAnimation isVisible={false} borderRadius={16} />,
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('test 环境下 effect 命中 NODE_ENV 分支提前 return', () => {
    expect(process.env.NODE_ENV).toBe('test');
    const { container } = render(
      <BorderBeamAnimation isVisible={true} borderRadius={16} />,
    );
    expect(container.querySelector('[style*="position: absolute"]')).toBeInTheDocument();
  });

  it('在非 test 环境下运行 ResizeObserver 并设置 dimensions', () => {
    const origNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const { unmount, container } = render(
      <BorderBeamAnimation isVisible={true} borderRadius={16} />,
    );

    expect((global as any).ResizeObserver).toHaveBeenCalled();
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();

    process.env.NODE_ENV = origNodeEnv;
  });

  it('isVisible 为 true 时渲染容器 div', () => {
    const { container } = render(
      <BorderBeamAnimation isVisible={true} borderRadius={16} />,
    );
    const wrapper = container.querySelector('[style*="position: absolute"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('支持自定义 gradientId、offsetX、offsetY 作为 props', () => {
    const { container } = render(
      <BorderBeamAnimation
        isVisible={true}
        borderRadius={16}
        gradientId="custom-id"
        offsetX={8}
        offsetY={4}
      />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
