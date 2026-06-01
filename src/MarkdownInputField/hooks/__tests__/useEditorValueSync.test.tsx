/**
 * useEditorValueSync Hook 单元测试
 * 验证「外部 value → 编辑器」单向同步及两道防御守卫：
 *  - Guard 1：来自编辑器自身回流的 value 不回写
 *  - Guard 2：编辑器聚焦时跳过 stale 写回（防 InvalidStateError 白屏）
 */

import { act, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorInstance } from '../../../MarkdownEditor';
import { useEditorValueSync } from '../useEditorValueSync';

// ReactEditor.isFocused 读自 Slate 内部状态，mock 以便控制聚焦态。
vi.mock('slate-react', async () => {
  const actual =
    await vi.importActual<typeof import('slate-react')>('slate-react');
  return {
    ...actual,
    ReactEditor: {
      ...actual.ReactEditor,
      isFocused: vi.fn().mockReturnValue(false),
    },
  };
});

/** 构造一个最小可用的 MarkdownEditorInstance，带可监听的 setMDContent。 */
const makeMockEditorInstance = () => {
  const setMDContent = vi.fn();
  return {
    store: { setMDContent },
    markdownEditorRef: {
      current: {
        // 占位即可，ReactEditor.isFocused 已被 mock
      },
    },
  } as unknown as MarkdownEditorInstance;
};

/** 组合 hook：用一个 ref 容器配合 useEditorValueSync，模拟主组件接线方式。 */
const useHarness = (value: string | undefined) => {
  const markdownEditorRef = useRef<MarkdownEditorInstance>();
  const { onEditorChange } = useEditorValueSync({ value, markdownEditorRef });
  return { markdownEditorRef, onEditorChange };
};

describe('useEditorValueSync', () => {
  it('外部 value 变化（非编辑器自身回流）时，调用 setMDContent 写回', async () => {
    const { result, rerender } = renderHook(({ value }) => useHarness(value), {
      initialProps: { value: '' as string | undefined },
    });

    const mockEditor = makeMockEditorInstance();
    act(() => {
      result.current.markdownEditorRef.current = mockEditor;
    });

    rerender({ value: 'external update' });
    await act(async () => {});

    expect(mockEditor.store.setMDContent).toHaveBeenCalledWith(
      'external update',
    );
  });

  it('Guard 1：当 props.value 等于编辑器最近一次 emit 的 value 时跳过写回', async () => {
    const { result, rerender } = renderHook(({ value }) => useHarness(value), {
      initialProps: { value: '' as string | undefined },
    });

    const mockEditor = makeMockEditorInstance();
    act(() => {
      result.current.markdownEditorRef.current = mockEditor;
    });

    // 模拟编辑器刚刚 emit 'hello'
    act(() => {
      result.current.onEditorChange('hello');
    });

    // 父组件受控回流相同值
    rerender({ value: 'hello' });
    await act(async () => {});

    expect(mockEditor.store.setMDContent).not.toHaveBeenCalled();
  });

  it('Guard 2：编辑器聚焦时跳过 stale 写回，避免 InvalidStateError', async () => {
    const { ReactEditor } = await import('slate-react');
    vi.mocked(ReactEditor.isFocused).mockReturnValue(true);

    const { result, rerender } = renderHook(({ value }) => useHarness(value), {
      initialProps: { value: 'a' as string | undefined },
    });

    const mockEditor = makeMockEditorInstance();
    act(() => {
      result.current.markdownEditorRef.current = mockEditor;
    });

    rerender({ value: 'ab' });
    await act(async () => {});

    expect(mockEditor.store.setMDContent).not.toHaveBeenCalled();

    // restore
    vi.mocked(ReactEditor.isFocused).mockReturnValue(false);
  });

  it('props.value 为 undefined 且未聚焦时，写入空字符串', async () => {
    const { result, rerender } = renderHook(({ value }) => useHarness(value), {
      initialProps: { value: '' as string | undefined },
    });

    const mockEditor = makeMockEditorInstance();
    act(() => {
      result.current.markdownEditorRef.current = mockEditor;
      result.current.onEditorChange('');
    });

    // 模拟父组件先 set 'hello' 再 reset 为 undefined
    act(() => {
      result.current.onEditorChange('hello');
    });
    rerender({ value: 'hello' });

    rerender({ value: undefined });
    await act(async () => {});

    expect(mockEditor.store.setMDContent).toHaveBeenCalledWith('');
  });

  it('编辑器实例尚未就绪时，不抛错也不调用 setMDContent', async () => {
    const { rerender } = renderHook(({ value }) => useHarness(value), {
      initialProps: { value: '' as string | undefined },
    });

    // 不挂载 mockEditor，直接触发 value 变化
    expect(() => {
      rerender({ value: 'no editor yet' });
    }).not.toThrow();
  });
});
