import { renderHook } from '@testing-library/react';
import { ConfigProvider, theme } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../style';

/** GENERATED_STYLE_BRANCHES */
describe('src/AILabel/style.ts branches', () => {
  it('无参数调用走默认 prefixCls', () => {
    const { result } = renderHook(() => useStyle(), {
      wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
    });
    expect(result.current.hashId).toBeDefined();
  });

  it('自定义 prefixCls', () => {
    const { result } = renderHook(() => useStyle('custom-ai-label'), {
      wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
    });
    expect(result.current.hashId).toBeDefined();
  });

  it('borderRadiusSM 为空时走 ?? 4 回退臂', () => {
    const { result } = renderHook(() => useStyle('ai-label-fallback'), {
      wrapper: ({ children }) => (
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: { borderRadiusSM: undefined as unknown as number },
          }}
        >
          {children}
        </ConfigProvider>
      ),
    });
    expect(result.current.hashId).toBeDefined();
  });
});
