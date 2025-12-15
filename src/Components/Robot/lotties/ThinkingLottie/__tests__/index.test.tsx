import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThinkingLottie } from '../index';

// Mock Lottie组件
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
      data-testid="lottie-animation"
      data-loop={loop}
      data-autoplay={autoplay}
      data-animation={animationData ? 'loaded' : 'empty'}
      style={style}
      className={className}
      {...props}
    >
      Lottie Animation
    </div>
  ),
}));

describe('ThinkingLottie Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<ThinkingLottie />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toBeInTheDocument();
    expect(lottieAnimation).toHaveAttribute('data-loop', 'true');
    expect(lottieAnimation).toHaveAttribute('data-autoplay', 'true');
    expect(lottieAnimation).toHaveAttribute('data-animation', 'loaded');
    expect(lottieAnimation).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render with custom autoplay prop', () => {
    render(<ThinkingLottie autoplay={false} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toHaveAttribute('data-autoplay', 'false');
  });

  it('should render with custom loop prop', () => {
    render(<ThinkingLottie loop={false} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toHaveAttribute('data-loop', 'false');
  });

  it('should render with custom className', () => {
    const customClassName = 'custom-thinking-lottie';
    render(<ThinkingLottie className={customClassName} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toHaveClass(customClassName);
  });

  it('should render with custom size', () => {
    const customSize = 64;
    render(<ThinkingLottie size={customSize} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toHaveStyle({
      width: `${customSize}px`,
      height: `${customSize}px`,
      display: 'flex',
    });
  });

  it('should render with custom style', () => {
    const customStyle = { border: '1px solid red', margin: '10px' };
    render(<ThinkingLottie style={customStyle} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toHaveStyle({
      border: '1px solid red',
      margin: '10px',
      display: 'flex',
    });
  });

  it('should merge custom style with default container style', () => {
    const customSize = 48;
    const customStyle = { backgroundColor: 'blue' };
    render(<ThinkingLottie size={customSize} style={customStyle} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    // 检查关键样式属性
    expect(lottieAnimation).toHaveStyle({
      width: `${customSize}px`,
      height: `${customSize}px`,
      display: 'flex',
    });
    // 检查自定义样式是否在 style 对象中
    const styleAttr = lottieAnimation.getAttribute('style');
    expect(styleAttr).toContain('background-color: blue');
  });

  it('should render with all props combined', () => {
    const customSize = 80;
    const customClassName = 'test-class';
    const customStyle = { padding: '5px' };
    render(
      <ThinkingLottie
        autoplay={false}
        loop={false}
        size={customSize}
        className={customClassName}
        style={customStyle}
      />,
    );

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toHaveAttribute('data-autoplay', 'false');
    expect(lottieAnimation).toHaveAttribute('data-loop', 'false');
    expect(lottieAnimation).toHaveClass(customClassName);
    expect(lottieAnimation).toHaveStyle({
      width: `${customSize}px`,
      height: `${customSize}px`,
      padding: '5px',
    });
  });

  it('should render without size prop', () => {
    render(<ThinkingLottie autoplay={true} loop={true} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toBeInTheDocument();
    // 当没有 size 时，width 和 height 应该是 undefined，但会被 style 对象包含
    const style = lottieAnimation.getAttribute('style');
    expect(style).toBeTruthy();
  });

  it('should render with size 0', () => {
    render(<ThinkingLottie size={0} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toHaveStyle({
      width: '0px',
      height: '0px',
      display: 'flex',
    });
  });

  it('should render without className prop', () => {
    render(<ThinkingLottie size={32} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toBeInTheDocument();
    expect(lottieAnimation.className).toBe('');
  });

  it('should render without style prop', () => {
    render(<ThinkingLottie size={32} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation).toBeInTheDocument();
    expect(lottieAnimation).toHaveStyle({
      width: '32px',
      height: '32px',
      display: 'flex',
    });
  });

  it('should handle style override with size', () => {
    const customStyle = { width: '100px', height: '100px' };
    render(<ThinkingLottie size={50} style={customStyle} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    // style 会覆盖 size 设置的 width 和 height
    expect(lottieAnimation).toHaveStyle({
      width: '100px',
      height: '100px',
    });
  });

  it('should render with empty string className', () => {
    render(<ThinkingLottie className="" />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    expect(lottieAnimation.className).toBe('');
  });

  it('should handle undefined autoplay and loop', () => {
    render(<ThinkingLottie autoplay={undefined} loop={undefined} />);

    const lottieAnimation = screen.getByTestId('lottie-animation');
    // 默认值应该是 true
    expect(lottieAnimation).toHaveAttribute('data-autoplay', 'true');
    expect(lottieAnimation).toHaveAttribute('data-loop', 'true');
  });
});
