/**
 * useExposeInputRef Hook 单元测试
 * 验证 inputRef 透出的单一职责：
 *  - editor 未就绪时仍提供最小可用 store.setMDContent
 *  - editor 就绪后通过 Proxy 透传完整 store 表面（getMDContent / clearContent / focus 等）
 *  - 经由外部 ref 调用 setMDContent 时同步触发 setValue（保证发送按钮等派生状态正确）
 */

import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorInstance } from '../../../MarkdownEditor';
import { useExposeInputRef } from '../useExposeInputRef';
import { useInputFieldRefContainer } from '../useInputFieldRefContainer';

function createMockEditorInstance(): MarkdownEditorInstance {
  const store = {
    getMDContent: vi.fn().mockReturnValue(''),
    clearContent: vi.fn(),
    setMDContent: vi.fn(),
    focus: vi.fn(),
  };
  return {
    store: store as any,
    markdownEditorRef: { current: null } as React.MutableRefObject<any>,
    markdownContainerRef: { current: null },
    exportHtml: vi.fn(),
  };
}

/** 组合 hook：模拟主组件接线方式（容器 + 透出）。 */
const useHarness = (params: {
  inputRef: React.MutableRefObject<MarkdownEditorInstance | undefined>;
  setValue: (v: string) => void;
}) => {
  const { markdownEditorRef } = useInputFieldRefContainer();
  useExposeInputRef({
    inputRef: params.inputRef,
    markdownEditorRef,
    setValue: params.setValue,
  });
  return { markdownEditorRef };
};

describe('useExposeInputRef', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('editor 未就绪时，inputRef.current 仅暴露最小可用的 store.setMDContent', () => {
    const inputRef = React.createRef<MarkdownEditorInstance | undefined>();
    const setValue = vi.fn();
    renderHook(() =>
      useHarness({
        inputRef: inputRef as React.MutableRefObject<
          MarkdownEditorInstance | undefined
        >,
        setValue,
      }),
    );

    expect(inputRef.current).toBeDefined();
    expect(inputRef.current!.store).toBeDefined();
    expect(typeof inputRef.current!.store.setMDContent).toBe('function');
  });

  it('editor 未就绪时调用 store.setMDContent，仍能同步 setValue', () => {
    const inputRef = React.createRef<MarkdownEditorInstance | undefined>();
    const setValue = vi.fn();
    renderHook(() =>
      useHarness({
        inputRef: inputRef as React.MutableRefObject<
          MarkdownEditorInstance | undefined
        >,
        setValue,
      }),
    );

    act(() => {
      inputRef.current!.store.setMDContent('bootstrap');
    });

    expect(setValue).toHaveBeenCalledWith('bootstrap');
  });

  it('editor 就绪后，Proxy 透传 getMDContent / clearContent / focus 等方法', () => {
    const inputRef = React.createRef<MarkdownEditorInstance | undefined>();
    const setValue = vi.fn();
    const mockEditor = createMockEditorInstance();
    (mockEditor.store as any).getMDContent.mockReturnValue('hello');

    const { result, rerender } = renderHook(
      (props) =>
        useHarness({
          inputRef: props.inputRef,
          setValue: props.setValue,
        }),
      {
        initialProps: {
          inputRef: inputRef as React.MutableRefObject<
            MarkdownEditorInstance | undefined
          >,
          setValue,
        },
      },
    );

    act(() => {
      result.current.markdownEditorRef.current = mockEditor;
    });
    // 触发 useImperativeHandle 重算
    rerender({
      inputRef: inputRef as React.MutableRefObject<
        MarkdownEditorInstance | undefined
      >,
      setValue: vi.fn(),
    });

    expect(inputRef.current).toBeDefined();
    expect(typeof inputRef.current!.store.getMDContent).toBe('function');
    expect(typeof inputRef.current!.store.clearContent).toBe('function');
    expect(typeof inputRef.current!.store.focus).toBe('function');

    expect(inputRef.current!.store.getMDContent()).toBe('hello');
    inputRef.current!.store.clearContent();
    expect((mockEditor.store as any).clearContent).toHaveBeenCalled();
  });

  it('inputRef.current.store.setMDContent 调用时同步触发 setValue', () => {
    const inputRef = React.createRef<MarkdownEditorInstance | undefined>();
    const setValueCalls: string[] = [];
    const setValue = (v: string) => setValueCalls.push(v);
    const mockEditor = createMockEditorInstance();

    const { result, rerender } = renderHook(
      (props) =>
        useHarness({
          inputRef: props.inputRef,
          setValue: props.setValue,
        }),
      {
        initialProps: {
          inputRef: inputRef as React.MutableRefObject<
            MarkdownEditorInstance | undefined
          >,
          setValue,
        },
      },
    );

    act(() => {
      result.current.markdownEditorRef.current = mockEditor;
    });
    rerender({
      inputRef: inputRef as React.MutableRefObject<
        MarkdownEditorInstance | undefined
      >,
      setValue: (v: string) => setValueCalls.push(v),
    });

    act(() => {
      inputRef.current!.store.setMDContent('new content');
    });

    expect(setValueCalls).toContain('new content');
    expect((mockEditor.store as any).setMDContent).toHaveBeenCalledWith(
      'new content',
      undefined,
      undefined,
    );
  });
});
