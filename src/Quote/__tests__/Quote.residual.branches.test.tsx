/**
 * Quote 残留：空 content、cite、自定义 className。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'h' }),
}));

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>();
  return {
    ...antd,
    ConfigProvider: {
      ...antd.ConfigProvider,
      ConfigContext: React.createContext({
        getPrefixCls: (s: string) => `ant-${s}`,
      }),
    },
  };
});

import { Quote } from '../index';

describe('Quote residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('quoteDescription 文本', () => {
    render(<Quote quoteDescription="quoted" />);
    expect(screen.getByTestId('quote-description')).toHaveTextContent('quoted');
  });

  it('空 quoteDescription / className / style', () => {
    expect(() =>
      render(
        <Quote quoteDescription="" className="q" style={{ color: 'red' }} />,
      ),
    ).not.toThrow();
  });
});
