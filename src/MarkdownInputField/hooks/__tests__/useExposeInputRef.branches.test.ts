/**
 * useExposeInputRef：md === undefined 时不触发 setValue。
 */
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorInstance } from '../../../MarkdownEditor';
import { useExposeInputRef } from '../useExposeInputRef';
import { useInputFieldRefContainer } from '../useInputFieldRefContainer';

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

describe('useExposeInputRef branches', () => {
  it('setMDContent(undefined) 不同步 setValue', () => {
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
      inputRef.current!.store.setMDContent(undefined);
    });
    expect(setValue).not.toHaveBeenCalled();
  });
});
