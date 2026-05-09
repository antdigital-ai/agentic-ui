import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThreeThinkingLottie } from '../ThreeThinkingLottie';

// Mock lottie-react
vi.mock('lottie-react', () => ({
  default: ({
    animationData,
    loop,
    autoplay,
    style,
    className,
    ...props
  }: any) => (
    <div
      data-testid="lottie-mock"
      data-loop={String(loop)}
      data-autoplay={String(autoplay)}
      data-has-animation={animationData ? 'yes' : 'no'}
      style={style}
      className={className}
      {...props}
    />
  ),
}));

describe('ThreeThinkingLottie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初始渲染显示占位符', () => {
    render(<ThreeThinkingLottie />);
    // 初始时应该显示占位符（三个点）
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('支持自定义 fallback', () => {
    render(
      <ThreeThinkingLottie
        fallback={<div data-testid="custom-fallback">Loading...</div>}
      />,
    );
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('动态加载动画数据后渲染 Lottie', async () => {
    render(<ThreeThinkingLottie />);

    // 等待动态 import 完成
    await waitFor(() => {
      expect(screen.getByTestId('lottie-mock')).toBeInTheDocument();
    });

    const el = screen.getByTestId('lottie-mock');
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('data-has-animation', 'yes');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('支持自定义 props', async () => {
    render(
      <ThreeThinkingLottie
        autoplay={false}
        loop={false}
        size={48}
        className="custom-class"
        style={{ opacity: 0.8 }}
      />,
    );

    // 等待动态 import 完成
    await waitFor(() => {
      expect(screen.getByTestId('lottie-mock')).toBeInTheDocument();
    });

    const el = screen.getByTestId('lottie-mock');
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('data-loop', 'false');
    expect(el).toHaveClass('custom-class');
    expect(el).toHaveStyle({ width: '48px', height: '48px', opacity: 0.8 });
  });

  it('默认尺寸为 32', async () => {
    render(<ThreeThinkingLottie />);

    await waitFor(() => {
      expect(screen.getByTestId('lottie-mock')).toBeInTheDocument();
    });

    const el = screen.getByTestId('lottie-mock');
    expect(el).toHaveStyle({ width: '32px', height: '32px' });
  });
});
