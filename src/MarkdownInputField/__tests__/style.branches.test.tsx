import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../style';

/** GENERATED_STYLE_BRANCHES */
describe('src/MarkdownInputField/style.ts branches', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider>{children}</ConfigProvider>
  );

  it('disableHoverAnimation=false 走 hover 样式臂', () => {
    const { result } = renderHook(() => useStyle('md-input-field', false), {
      wrapper,
    });
    expect(result.current).toBeDefined();
  });

  it('disableHoverAnimation=true 走空 hover 臂', () => {
    const { result } = renderHook(() => useStyle('md-input-field', true), {
      wrapper,
    });
    expect(result.current).toBeDefined();
  });
});
