import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useTextAnimateStyle } from '../style';

describe('TextAnimate style', () => {
  it('useTextAnimateStyle 应返回 hashId', () => {
    const { result } = renderHook(
      () => useTextAnimateStyle('ant-agentic-text-animate'),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('hashId');
  });
});
