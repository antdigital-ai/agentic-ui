/**
 * toolsConfig deepen：locale 缺失时标题回退中文默认值。
 */
import { renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../../../I18n';
import { isCodeNode, useToolsConfig } from '../toolsConfig';

describe('toolsConfig deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('locale 为空时 bold/italic 等使用默认 title', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        I18nContext.Provider,
        { value: { locale: undefined as any, language: 'zh-CN' } },
        children,
      );

    const { result } = renderHook(() => useToolsConfig(), { wrapper });
    const bold = result.current.find((t) => t.key === 'bold');
    const italic = result.current.find((t) => t.key === 'italic');
    expect(bold?.title).toBe('加粗');
    expect(italic?.title).toBe('斜体');
  });

  it('isCodeNode：无 editor 返回 false', () => {
    expect(isCodeNode(null)).toBe(false);
    expect(isCodeNode(undefined)).toBe(false);
  });
});
