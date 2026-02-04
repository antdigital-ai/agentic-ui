import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CreativeSparkLoading } from '../../src/Components/Loading/CreativeSparkLoading';

// Mock CreativeSparkLottie
vi.mock('../../src/Components/lotties/CreativeSparkLottie', () => ({
  CreativeSparkLottie: ({ size, style, autoplay, loop, className }: any) => (
    <div
      data-testid="creative-spark-lottie"
      data-size={size}
      data-autoplay={autoplay}
      data-loop={loop}
      className={className}
      style={style}
    />
  ),
}));

describe('CreativeSparkLoading Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render CreativeSparkLoading component', () => {
    render(<CreativeSparkLoading />);

    expect(screen.getByTestId('creative-spark-lottie')).toBeInTheDocument();
  });

  it('should use default size', () => {
    render(<CreativeSparkLoading />);

    const lottie = screen.getByTestId('creative-spark-lottie');
    expect(lottie).toHaveAttribute('data-size', '1em');
  });

  it('should pass custom props', () => {
    render(
      <CreativeSparkLoading
        size={64}
        autoplay={false}
        loop={false}
        className="custom-class"
      />,
    );

    const lottie = screen.getByTestId('creative-spark-lottie');
    expect(lottie).toHaveAttribute('data-size', '64');
    expect(lottie).toHaveAttribute('data-autoplay', 'false');
    expect(lottie).toHaveAttribute('data-loop', 'false');
    expect(lottie).toHaveClass('custom-class');
  });

  it('should merge custom style', () => {
    const customStyle = { margin: '20px' };
    render(<CreativeSparkLoading style={customStyle} />);

    const lottie = screen.getByTestId('creative-spark-lottie');
    expect(lottie).toHaveStyle({ margin: '20px' });
  });
});
