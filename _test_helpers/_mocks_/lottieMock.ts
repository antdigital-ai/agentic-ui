import React from 'react';
import { vi } from 'vitest';

// Mock lottie-react 组件
export const mockLottie = vi
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

vi.mock('lottie-react', () => ({
  default: mockLottie,
}));

// 与旧调用兼容，保留空函数
export const setupLottieMock = () => {};
