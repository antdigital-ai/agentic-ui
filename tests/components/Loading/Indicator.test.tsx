import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Indicator from '../../../src/Components/Loading/Indicator';

describe('Indicator', () => {
  it('应在传入有效 React 元素作为 indicator 时使用 cloneElement 渲染', () => {
    const CustomIndicator = () => <span data-testid="custom-ind">自定义</span>;
    const { container } = render(
      <Indicator indicator={<CustomIndicator />} />,
    );
    expect(screen.getByTestId('custom-ind')).toBeInTheDocument();
  });

  it('indicator 为 React 元素时应走 cloneElement 分支', () => {
    const { container } = render(
      <Indicator indicator={<span data-testid="spinner">Loading</span>} />,
    );
    expect(screen.getByTestId('spinner')).toHaveTextContent('Loading');
  });
});
