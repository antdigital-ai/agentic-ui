/**
 * createLottieComponent：默认 dataTestId 分支。
 */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createLottieComponent } from '../createLottieComponent';

vi.mock('lottie-react', () => ({
  default: ({ 'data-testid': testId }: { 'data-testid'?: string }) => (
    <div data-testid={testId}>lottie</div>
  ),
}));

describe('createLottieComponent branches', () => {
  it('未覆盖 dataTestId 时使用 lottie-mock 默认值', async () => {
    const LottieComp = createLottieComponent({
      loadJson: () => Promise.resolve({ ok: true }),
    });
    render(<LottieComp />);
    await waitFor(() => {
      expect(screen.getByTestId('lottie-mock')).toBeInTheDocument();
    });
  });
});
