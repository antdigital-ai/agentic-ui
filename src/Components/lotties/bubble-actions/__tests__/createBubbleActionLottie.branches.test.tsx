/**
 * createBubbleActionLottie：animationData null 返回 null。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createBubbleActionLottie } from '../createBubbleActionLottie';

vi.mock('../../useAsyncLottieData', () => ({
  useAsyncLottieData: vi.fn(() => null),
}));

vi.mock('../Abstract', () => ({
  default: () => <div data-testid="abstract-lottie">x</div>,
}));

describe('createBubbleActionLottie branches', () => {
  it('animationData 为 null 时不渲染', () => {
    const Comp = createBubbleActionLottie({
      loadJson: () => Promise.resolve({}),
    });
    const { container } = render(<Comp />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('abstract-lottie')).not.toBeInTheDocument();
  });
});
