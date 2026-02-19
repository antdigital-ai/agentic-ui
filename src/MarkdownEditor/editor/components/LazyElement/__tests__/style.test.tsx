import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../style';

describe('LazyElement style', () => {
  it('useStyle 应返回 wrapSSR 与 hashId', () => {
    const { result } = renderHook(
      () => useStyle('ant-agentic-lazy-element'),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('wrapSSR');
    expect(result.current).toHaveProperty('hashId');
    expect(typeof result.current.wrapSSR).toBe('function');
  });
});
