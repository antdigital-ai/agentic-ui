import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useBrowserStyle } from '../style';

/** GENERATED_STYLE_BRANCHES */
describe('src/Workspace/Browser/style.ts branches', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider>{children}</ConfigProvider>
  );

  it('自定义 prefixCls', () => {
    const { result } = renderHook(() => useBrowserStyle('custom-style-prefix'), {
      wrapper,
    });
    expect(result.current).toBeDefined();
    expect(result.current.hashId).toBeDefined();
  });

  it('无参数调用走默认 prefixCls', () => {
    const { result } = renderHook(() => useBrowserStyle(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
