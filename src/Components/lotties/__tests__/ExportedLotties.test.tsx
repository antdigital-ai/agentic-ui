import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CreativeSparkLottie } from '../CreativeSparkLottie';
import { DazingLottie } from '../DazingLottie';
import { LoadingLottie } from '../LoadingLottie';
import { ThinkingLottie } from '../ThinkingLottie';

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

vi.mock('../useAsyncLottieData', () => ({
  useAsyncLottieData: () => ({ v: '5.5.7', layers: [] }),
}));

describe('Components/lotties 导出（与 Robot/lotties 独立入口）', () => {
  it('DazingLottie 默认 autoplay/loop 并传入动画数据', async () => {
    render(<DazingLottie />);
    const el = await screen.findByTestId('lottie-mock');
    await waitFor(() => {
      expect(el).toHaveAttribute('data-has-animation', 'yes');
    });
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('DazingLottie 可关闭播放并设置尺寸与样式', async () => {
    render(
      <DazingLottie
        autoplay={false}
        loop={false}
        size={40}
        className="dazing-x"
        style={{ opacity: 0.5 }}
      />,
    );
    const el = await screen.findByTestId('lottie-mock');
    await waitFor(() => {
      expect(el).toHaveAttribute('data-has-animation', 'yes');
    });
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('data-loop', 'false');
    expect(el).toHaveClass('dazing-x');
    expect(el).toHaveStyle({ width: '40px', height: '40px', opacity: 0.5 });
  });

  it('ThinkingLottie 默认行为与自定义 props', async () => {
    const { rerender } = render(<ThinkingLottie />);
    let el = await screen.findByTestId('lottie-mock');
    await waitFor(() => {
      expect(el).toHaveAttribute('data-has-animation', 'yes');
    });

    rerender(
      <ThinkingLottie
        autoplay={false}
        loop={false}
        size={24}
        className="think-x"
      />,
    );
    el = screen.getByTestId('lottie-mock');
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveClass('think-x');
    expect(el).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('LoadingLottie 支持 string 尺寸（覆盖 data-testid）', async () => {
    render(<LoadingLottie size="2rem" className="load-x" />);
    const el = await screen.findByTestId('lottie-animation');
    await waitFor(() => {
      expect(el).toHaveAttribute('data-has-animation', 'yes');
    });
    expect(el).toHaveClass('load-x');
    expect(el.getAttribute('style')).toContain('width: 2rem');
    expect(el.getAttribute('style')).toContain('height: 2rem');
  });

  it('CreativeSparkLottie 基础渲染', async () => {
    render(<CreativeSparkLottie size={32} autoplay={false} />);
    const el = await screen.findByTestId('lottie-animation');
    await waitFor(() => {
      expect(el).toHaveAttribute('data-has-animation', 'yes');
    });
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveStyle({ width: '32px', height: '32px' });
  });
});
