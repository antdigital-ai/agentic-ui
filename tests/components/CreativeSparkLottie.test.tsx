import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { CreativeSparkLottie } from '../../src/Components/lotties/CreativeSparkLottie';

describe('CreativeSparkLottie Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render CreativeSparkLottie component', () => {
    render(<CreativeSparkLottie />);

    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
  });

  it('should handle autoplay=false', () => {
    render(<CreativeSparkLottie autoplay={false} />);

    const lottie = screen.getByTestId('lottie-animation');
    expect(lottie).toBeInTheDocument();
  });

  it('should handle loop=false', () => {
    render(<CreativeSparkLottie loop={false} />);

    const lottie = screen.getByTestId('lottie-animation');
    expect(lottie).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CreativeSparkLottie className="custom-class" />);

    const lottie = screen.getByTestId('lottie-animation');
    expect(lottie).toHaveClass('custom-class');
  });

  it('should apply custom style', () => {
    const customStyle = { margin: '20px', padding: '10px' };
    render(<CreativeSparkLottie style={customStyle} />);

    const lottie = screen.getByTestId('lottie-animation');
    expect(lottie).toHaveStyle({ margin: '20px', padding: '10px' });
  });

  it('should use numeric size', () => {
    render(<CreativeSparkLottie size={64} />);

    const lottie = screen.getByTestId('lottie-animation');
    expect(lottie).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('should use string size', () => {
    render(<CreativeSparkLottie size="2em" />);

    const lottie = screen.getByTestId('lottie-animation');
    expect(lottie).toHaveStyle({ width: '2em', height: '2em' });
  });

  it('should merge custom style and size', () => {
    const customStyle = { margin: '20px' };
    render(<CreativeSparkLottie size={80} style={customStyle} />);

    const lottie = screen.getByTestId('lottie-animation');
    expect(lottie).toHaveStyle({
      width: '80px',
      height: '80px',
      margin: '20px',
    });
  });
});
