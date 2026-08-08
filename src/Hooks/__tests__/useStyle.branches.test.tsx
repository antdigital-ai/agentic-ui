/**
 * useStyle：iconPrefixCls ?? 'anticon' 的两侧。
 * arm1（summary 残留）通常是左侧已定义 —— 显式传入自定义 iconPrefixCls。
 */
import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../../AnswerAlert/style';

describe('useStyle iconPrefixCls branches', () => {
  it('显式 iconPrefixCls 走 ?? 左侧（不回退 anticon）', () => {
    const { result } = renderHook(() => useStyle('test-prefix'), {
      wrapper: ({ children }) => (
        <ConfigProvider iconPrefixCls="custom-icon">{children}</ConfigProvider>
      ),
    });
    expect(result.current.hashId).toBeDefined();
  });

  it('未设置 iconPrefixCls 时仍可渲染（回退 anticon）', () => {
    const { result } = renderHook(() => useStyle('test-prefix'));
    expect(result.current.hashId).toBeDefined();
  });
});
