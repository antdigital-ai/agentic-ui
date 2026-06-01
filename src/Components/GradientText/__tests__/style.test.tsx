import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useGradientTextStyle } from '../style';

describe('GradientText style', () => {
  it('useGradientTextStyle 应返回 hashId', () => {
    const { result } = renderHook(
      () => useGradientTextStyle('ant-agentic-gradient-text'),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('hashId');
  });
});
