import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { TextSwap } from '..';

describe('TextSwap', () => {
  it('应渲染子节点并注册样式', () => {
    render(
      <ConfigProvider>
        <TextSwap swapKey="a">Hello</TextSwap>
      </ConfigProvider>,
    );

    expect(screen.getByTestId('text-swap')).toHaveTextContent('Hello');
  });

  it('应支持自定义 data-testid', () => {
    render(
      <ConfigProvider>
        <TextSwap swapKey="x" data-testid="custom-swap">
          X
        </TextSwap>
      </ConfigProvider>,
    );

    expect(screen.getByTestId('custom-swap')).toBeInTheDocument();
  });

  it('应在 swapKey 不变时同步更新同 key 下的 children', () => {
    const { rerender } = render(
      <ConfigProvider>
        <TextSwap swapKey="same">First</TextSwap>
      </ConfigProvider>,
    );

    expect(screen.getByText('First')).toBeInTheDocument();

    rerender(
      <ConfigProvider>
        <TextSwap swapKey="same">Second</TextSwap>
      </ConfigProvider>,
    );

    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
