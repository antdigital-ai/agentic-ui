import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { CreativeSparkLottie } from '../lotties/CreativeSparkLottie';

async function getLoadedLottie() {
  const el = await screen.findByTestId('lottie-animation');
  await waitFor(() => {
    expect(el).toBeInTheDocument();
  });
  return el;
}

describe('CreativeSparkLottie Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render CreativeSparkLottie component', async () => {
    render(<CreativeSparkLottie />);

    expect(await getLoadedLottie()).toBeInTheDocument();
  });

  it('should handle autoplay=false', async () => {
    render(<CreativeSparkLottie autoplay={false} />);

    const lottie = await getLoadedLottie();
    expect(lottie).toBeInTheDocument();
  });

  it('should handle loop=false', async () => {
    render(<CreativeSparkLottie loop={false} />);

    const lottie = await getLoadedLottie();
    expect(lottie).toBeInTheDocument();
  });

  it('should apply custom className', async () => {
    render(<CreativeSparkLottie className="custom-class" />);

    const lottie = await getLoadedLottie();
    expect(lottie).toHaveClass('custom-class');
  });

  it('should apply custom style', async () => {
    const customStyle = { margin: '20px', padding: '10px' };
    render(<CreativeSparkLottie style={customStyle} />);

    const lottie = await getLoadedLottie();
    expect(lottie).toHaveStyle({ margin: '20px', padding: '10px' });
  });

  it('should use numeric size', async () => {
    render(<CreativeSparkLottie size={64} />);

    const lottie = await getLoadedLottie();
    expect(lottie).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('should use string size', async () => {
    render(<CreativeSparkLottie size="2em" />);

    const lottie = await getLoadedLottie();
    expect(lottie.getAttribute('style')).toContain('width: 2em');
    expect(lottie.getAttribute('style')).toContain('height: 2em');
  });

  it('should merge custom style and size', async () => {
    const customStyle = { margin: '20px' };
    render(<CreativeSparkLottie size={80} style={customStyle} />);

    const lottie = await getLoadedLottie();
    expect(lottie).toHaveStyle({
      width: '80px',
      height: '80px',
      margin: '20px',
    });
  });
});
