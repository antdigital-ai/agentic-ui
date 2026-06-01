/**
 * useEnlargeAndContainerHandler Hook 单元测试
 * 由原 useMarkdownInputFieldHandlers.test.ts 中 activeInput 段拆分而来。
 * handleEnlargeClick / handleContainerClick 在原测试中未覆盖，本文件保持等价。
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEnlargeAndContainerHandler } from '../useEnlargeAndContainerHandler';

vi.mock('../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

function createDefaultParams(overrides: Record<string, any> = {}) {
  const inputRef = { current: document.createElement('div') };
  const markdownEditorRef = {
    current: {
      store: {} as any,
      markdownEditorRef: { current: null },
    },
  } as any;
  return {
    props: {
      disabled: false,
      typing: false,
    },
    markdownEditorRef,
    inputRef,
    isEnlarged: false,
    setIsEnlarged: vi.fn(),
    ...overrides,
  };
}

describe('useEnlargeAndContainerHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleEnlargeClick', () => {
    it('调用时翻转 isEnlarged 状态', () => {
      const params = createDefaultParams({ isEnlarged: false });
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      result.current.handleEnlargeClick();
      expect(params.setIsEnlarged).toHaveBeenCalledWith(true);
    });

    it('当前已放大时切回非放大', () => {
      const params = createDefaultParams({ isEnlarged: true });
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      result.current.handleEnlargeClick();
      expect(params.setIsEnlarged).toHaveBeenCalledWith(false);
    });
  });

  describe('activeInput', () => {
    it('active 为 true 时设置 tabIndex=1 并加 active 类', () => {
      const params = createDefaultParams();
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      result.current.activeInput(true);
      expect(params.inputRef.current?.tabIndex).toBe(1);
      expect(params.inputRef.current?.classList.contains('active')).toBe(true);
    });

    it('active 为 false 时设置 tabIndex=-1 并移除 active 类', () => {
      const params = createDefaultParams();
      params.inputRef.current?.classList.add('active');
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      result.current.activeInput(false);
      expect(params.inputRef.current?.tabIndex).toBe(-1);
      expect(params.inputRef.current?.classList.contains('active')).toBe(false);
    });
  });

  describe('handleContainerClick', () => {
    it('disabled 时直接 return，不影响 inputRef', () => {
      const params = createDefaultParams({
        props: { disabled: true, typing: false },
      });
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      const e = { target: document.createElement('div') } as any;
      // 不应抛错
      expect(() => result.current.handleContainerClick(e)).not.toThrow();
    });

    it('typing 时直接 return', () => {
      const params = createDefaultParams({
        props: { disabled: false, typing: true },
      });
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      const e = { target: document.createElement('div') } as any;
      expect(() => result.current.handleContainerClick(e)).not.toThrow();
    });
  });
});
