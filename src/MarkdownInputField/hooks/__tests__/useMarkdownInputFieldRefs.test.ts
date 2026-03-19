/**
 * useMarkdownInputFieldRefs Hook 单元测试
 * 覆盖 inputRef 暴露的 store 完整性（Proxy 保留 getMDContent、clearContent 等）、setMDContent 同步 setValue
 */

import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorInstance } from '../../../MarkdownEditor';
import { useMarkdownInputFieldRefs } from '../useMarkdownInputFieldRefs';

function createMockEditorInstance(): MarkdownEditorInstance {
  const store = {
    getMDContent: vi.fn().mockReturnValue(''),
    clearContent: vi.fn(),
    setMDContent: vi.fn(),
    focus: vi.fn(),
  };
  return {
    store: store as any,
    markdownEditorRef: { current: null },
    markdownContainerRef: { current: null },
    exportHtml: vi.fn(),
  };
}

describe('useMarkdownInputFieldRefs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应返回 markdownEditorRef、quickActionsRef、actionsRef、isSendingRef', () => {
    const inputRef = React.createRef<MarkdownEditorInstance | undefined>();
    const setValue = vi.fn();
    const { result } = renderHook(() =>
      useMarkdownInputFieldRefs({
        inputRef: inputRef as React.MutableRefObject<
          MarkdownEditorInstance | undefined
        >,
        value: '',
        setValue,
      }),
    );

    expect(result.current.markdownEditorRef).toBeDefined();
    expect(result.current.quickActionsRef).toBeDefined();
    expect(result.current.actionsRef).toBeDefined();
    expect(result.current.isSendingRef).toBeDefined();
    expect(result.current.markdownEditorRef.current).toBeUndefined();
  });

  it('editor 未就绪时 inputRef.current 仅暴露 store.setMDContent', () => {
    const inputRef = React.createRef<MarkdownEditorInstance | undefined>();
    const setValue = vi.fn();
    renderHook(() =>
      useMarkdownInputFieldRefs({
        inputRef: inputRef as React.MutableRefObject<
          MarkdownEditorInstance | undefined
        >,
        value: '',
        setValue,
      }),
    );

    expect(inputRef.current).toBeDefined();
    expect(inputRef.current!.store).toBeDefined();
    expect(typeof inputRef.current!.store.setMDContent).toBe('function');
  });

  it('editor 就绪后 inputRef.current.store 通过 Proxy 保留 getMDContent、clearContent 等方法', () => {
    const inputRef = React.createRef<MarkdownEditorInstance | undefined>();
    const setValue = vi.fn();
    const mockEditor = createMockEditorInstance();
    (mockEditor.store as any).getMDContent.mockReturnValue('hello');
    (mockEditor.store as any).clearContent.mockImplementation(() => {});

    const { result, rerender } = renderHook(
      (props) =>
        useMarkdownInputFieldRefs({
          inputRef: props.inputRef,
          value: '',
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
      setValue: vi.fn(),
    });

    expect(inputRef.current).toBeDefined();
    expect(inputRef.current!.store.getMDContent).toBeDefined();
    expect(typeof inputRef.current!.store.getMDContent).toBe('function');
    expect(inputRef.current!.store.clearContent).toBeDefined();
    expect(typeof inputRef.current!.store.clearContent).toBe('function');
    expect(inputRef.current!.store.focus).toBeDefined();

    expect(inputRef.current!.store.getMDContent()).toBe('hello');
    inputRef.current!.store.clearContent();
    expect((mockEditor.store as any).clearContent).toHaveBeenCalled();
  });

  it('inputRef.current.store.setMDContent 调用时会同步调用 setValue', () => {
    const inputRef = React.createRef<MarkdownEditorInstance | undefined>();
    const setValueCalls: string[] = [];
    const setValue = (v: string) => setValueCalls.push(v);
    const mockEditor = createMockEditorInstance();

    const { result, rerender } = renderHook(
      (props) =>
        useMarkdownInputFieldRefs({
          inputRef: props.inputRef,
          value: '',
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
  });
});
