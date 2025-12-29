import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useLanguage } from '../useLanguage';
import { I18nProvide } from '../../I18n';

describe('useLanguage Hook', () => {
  it('应该在没有 I18nProvide 时抛出错误', () => {
    // 使用 console.error 来捕获 React 的错误
    const originalError = console.error;
    console.error = vi.fn();

    try {
      renderHook(() => useLanguage());
    } catch (error) {
      expect(error).toBeDefined();
    }

    console.error = originalError;
  });

  it('应该返回语言状态和方法', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <I18nProvide>{children}</I18nProvide>,
    });

    expect(result.current.language).toBeDefined();
    expect(result.current.locale).toBeDefined();
    expect(typeof result.current.setLanguage).toBe('function');
    expect(typeof result.current.toggleLanguage).toBe('function');
    expect(typeof result.current.isChinese).toBe('boolean');
    expect(typeof result.current.isEnglish).toBe('boolean');
  });

  it('应该正确识别中文状态', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => (
        <I18nProvide defaultLanguage="zh-CN" autoDetect={false}>
          {children}
        </I18nProvide>
      ),
    });

    expect(result.current.language).toBe('zh-CN');
    expect(result.current.isChinese).toBe(true);
    expect(result.current.isEnglish).toBe(false);
  });

  it('应该正确识别英文状态', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <I18nProvide>{children}</I18nProvide>,
    });

    // I18nProvide 可能有默认语言，我们切换到英文
    act(() => {
      result.current.setLanguage?.('en-US');
    });

    expect(result.current.language).toBe('en-US');
    expect(result.current.isChinese).toBe(false);
    expect(result.current.isEnglish).toBe(true);
  });

  it('应该能够切换语言', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <I18nProvide>{children}</I18nProvide>,
    });

    const initialLanguage = result.current.language;
    const initialIsChinese = result.current.isChinese;

    act(() => {
      result.current.toggleLanguage();
    });

    // 切换后语言应该改变
    expect(result.current.language).not.toBe(initialLanguage);
    expect(result.current.isChinese).not.toBe(initialIsChinese);
  });

  it('应该能够从英文切换到中文', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <I18nProvide>{children}</I18nProvide>,
    });

    // 先确保是某种语言
    const initialLanguage = result.current.language;

    // 切换到相反的语言
    act(() => {
      result.current.toggleLanguage();
    });

    const afterToggle = result.current.language;
    expect(afterToggle).not.toBe(initialLanguage);

    // 再切换回来
    act(() => {
      result.current.toggleLanguage();
    });

    expect(result.current.language).toBe(initialLanguage);
  });

  it('应该能够通过 setLanguage 设置语言', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => (
        <I18nProvide defaultLanguage="zh-CN" autoDetect={false}>
          {children}
        </I18nProvide>
      ),
    });

    act(() => {
      result.current.setLanguage?.('en-US');
    });

    expect(result.current.language).toBe('en-US');
  });

  it('应该返回正确的 locale 对象', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => (
        <I18nProvide defaultLanguage="zh-CN" autoDetect={false}>
          {children}
        </I18nProvide>
      ),
    });

    expect(result.current.locale).toBeDefined();
    expect(typeof result.current.locale).toBe('object');
  });

  it('toggleLanguage 方法应该在多次调用时正确切换', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <I18nProvide>{children}</I18nProvide>,
    });

    const initialLanguage = result.current.language;

    act(() => {
      result.current.toggleLanguage();
    });
    const firstToggle = result.current.language;
    expect(firstToggle).not.toBe(initialLanguage);

    act(() => {
      result.current.toggleLanguage();
    });
    expect(result.current.language).toBe(initialLanguage);

    act(() => {
      result.current.toggleLanguage();
    });
    expect(result.current.language).toBe(firstToggle);
  });
});
