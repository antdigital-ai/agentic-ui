import React from 'react';
import { vi } from 'vitest';

// Mock lottie-react 组件
export const mockLottie: (...args: any[]) => any = vi
  .fn()
  .mockImplementation(({ animationData, loop, autoplay, ...props }) => {
    return React.createElement('div', {
      'data-testid': 'lottie-animation',
      'data-loop': loop,
      'data-autoplay': autoplay,
      style: { width: '100%', height: '100%' },
      ...props,
    });
  });

// 设置 lottie-react 的 mock
export const setupLottieMock = () => {
  vi.mock('lottie-react', () => ({
    default: mockLottie,
  }));
};
