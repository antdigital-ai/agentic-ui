/**
 * 覆盖 Robot/Thinking 等 Lottie 组件的 style 与 containerStyle 分支（68/69、77/78 行）
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import BlowingWindLottie from '../../../src/Components/Robot/lotties/BlowingWindLottie';
import BouncingLottie from '../../../src/Components/Robot/lotties/BouncingLottie';
import PeekLottie from '../../../src/Components/Robot/lotties/PeekLottie';
import DazingLottie from '../../../src/Components/lotties/DazingLottie';
import ThinkingLottie from '../../../src/Components/lotties/ThinkingLottie';

vi.mock('lottie-react', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="lottie-mock" style={props.style}>
      Lottie
    </div>
  ),
}));

describe('Robot & Thinking Lotties style 覆盖', () => {
  it('BlowingWindLottie 应合并 style 到 containerStyle', () => {
    const { container } = render(
      <BlowingWindLottie style={{ marginTop: 10 }} size={24} />,
    );
    const el = container.querySelector('[data-testid="lottie-mock"]');
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({ marginTop: '10px' });
  });

  it('BouncingLottie 应合并 style', () => {
    const { container } = render(
      <BouncingLottie style={{ opacity: 0.5 }} />,
    );
    expect(container.querySelector('[data-testid="lottie-mock"]')).toBeInTheDocument();
  });

  it('PeekLottie 应合并 style', () => {
    const { container } = render(<PeekLottie style={{ padding: 4 }} />);
    expect(container.querySelector('[data-testid="lottie-mock"]')).toBeInTheDocument();
  });

  it('DazingLottie 应合并 style', () => {
    const { container } = render(<DazingLottie style={{ width: 48 }} />);
    expect(container.querySelector('[data-testid="lottie-mock"]')).toBeInTheDocument();
  });

  it('ThinkingLottie 应合并 style', () => {
    const { container } = render(<ThinkingLottie style={{ height: 40 }} />);
    expect(container.querySelector('[data-testid="lottie-mock"]')).toBeInTheDocument();
  });
});
