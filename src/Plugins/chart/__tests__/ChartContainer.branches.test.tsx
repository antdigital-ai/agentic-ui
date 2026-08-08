/**
 * ChartContainer：省略 autoDetectTheme 使用默认 true。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ChartContainer from '../components/ChartContainer/ChartContainer';

vi.mock('../hooks', () => ({
  useDetectTheme: vi.fn(() => 'light'),
}));

describe('ChartContainer branches', () => {
  it('省略 autoDetectTheme 时仍渲染容器', () => {
    const { container } = render(
      <ConfigProvider prefixCls="ant">
        <ChartContainer baseClassName="chart-box">
          <span>chart</span>
        </ChartContainer>
      </ConfigProvider>,
    );
    expect(container.textContent).toContain('chart');
  });
});
