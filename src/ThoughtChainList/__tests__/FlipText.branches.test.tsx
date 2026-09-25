/**
 * FlipText 分支：test 环境早退、重复注入 style、自定义 framerProps（非 test 路径 stub）。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { FlipText } from '../FlipText';

describe('FlipText 分支覆盖', () => {
  afterEach(() => {
    document.getElementById('agentic-ui-flip-text-keyframes')?.remove();
  });

  it('NODE_ENV=test 时直接渲染纯文本', () => {
    render(<FlipText word="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('多次挂载只注入一次全局 style', () => {
    const { unmount } = render(<FlipText word="A" />);
    unmount();
    render(<FlipText word="B" />);
    const styles = document.querySelectorAll(
      '#agentic-ui-flip-text-keyframes',
    );
    // useEffect 在 test 环境仍会注入；幂等保证最多 1 个
    expect(styles.length).toBeLessThanOrEqual(1);
  });

  it('非 test 环境渲染字符级动画 span', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      const { container } = render(
        <FlipText
          word="Hi"
          duration={0.2}
          delayMultiple={0.05}
          className="extra"
          framerProps={{
            hidden: { rotateX: -45, opacity: 0.2 },
            visible: { rotateX: 10, opacity: 0.9 },
          }}
        />,
      );
      const chars = container.querySelectorAll('.agentic-flip-text-char');
      expect(chars.length).toBe(2);
      expect(chars[0]).toHaveClass('extra');
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it('framerProps 缺省走默认旋转/透明度', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { container } = render(<FlipText word="X" />);
      expect(container.querySelectorAll('.agentic-flip-text-char').length).toBe(
        1,
      );
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});
