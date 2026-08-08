/**
 * useOnchange deepen residual：setRefreshFloatBar 回退、无 node、catch、window 边界。
 */
import { cleanup, renderHook } from '@testing-library/react';
import { Editor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOnchange } from '../useOnchange';

const { storeState } = vi.hoisted(() => ({
  storeState: {
    setRefreshFloatBar: vi.fn((updater?: boolean | ((prev: boolean) => boolean)) => {
      if (typeof updater === 'function') updater(false);
    }),
    bumpFloatBarRevision: undefined as undefined | ReturnType<typeof vi.fn>,
    setDomRect: vi.fn(),
    readonly: false,
    markdownEditorRef: { current: null as any },
    selChange$: { next: vi.fn() },
  },
}));

vi.mock('../../store', () => ({
  useEditorStore: () => storeState,
}));

vi.mock('../../../../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: any) => ({ run: fn, cancel: vi.fn() }),
}));

vi.mock('../../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

vi.mock('../../utils', () => ({
  parserSlateNodeToMarkdown: () => 'md-out',
}));

describe('useOnchange deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    storeState.readonly = false;
    storeState.bumpFloatBarRevision = undefined;
    storeState.markdownEditorRef.current = {
      children: [{ type: 'paragraph', children: [{ text: 'A' }] }],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      },
    };
    Object.defineProperty(window, 'getSelection', {
      configurable: true,
      value: vi.fn(() => null),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('domRange 重复文本走 setRefreshFloatBar（无 bumpFloatBarRevision）', () => {
    const getRangeAt = vi.fn(() => ({
      toString: () => 'same-text',
      getBoundingClientRect: () => ({ top: 1, left: 2 }),
    }));
    Object.defineProperty(window, 'getSelection', {
      configurable: true,
      value: vi.fn(() => ({ getRangeAt })),
    });
    vi.spyOn(Editor, 'nodes').mockImplementation(() =>
      [[{ type: 'paragraph' }, [0, 0]]] as any,
    );
    const { result } = renderHook(() => useOnchange());
    result.current([], [{ type: 'set_selection' } as any]);
    result.current([], [{ type: 'set_selection' } as any]);
    expect(storeState.setRefreshFloatBar).toHaveBeenCalled();
  });

  it('Editor.nodes 无 node 时 setTimeout 后早退', () => {
    vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
      // empty iterator
    });
    const { result } = renderHook(() => useOnchange());
    result.current([], [{ type: 'insert_text' } as any]);
    vi.runAllTimers();
    expect(storeState.selChange$.next).toHaveBeenCalled();
    expect(storeState.setDomRect).not.toHaveBeenCalled();
  });

  it('collapsed selection / 不同 parent path 重置 domRect', () => {
    storeState.markdownEditorRef.current.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    vi.spyOn(Editor, 'nodes').mockImplementation(() =>
      [[{ type: 'paragraph' }, [0, 0]]] as any,
    );
    const { result } = renderHook(() => useOnchange());
    result.current([], [{ type: 'set_selection' } as any]);
    expect(storeState.setDomRect).toHaveBeenCalledWith(null);
  });

  it('code 节点忽略 floatBar；自定义 wait 仍触发 onChange', () => {
    vi.spyOn(Editor, 'nodes').mockImplementation(() =>
      [[{ type: 'code' }, [0, 0]]] as any,
    );
    const onChange = vi.fn();
    const { result } = renderHook(() => useOnchange(onChange, { wait: 50 }));
    result.current([], [{ type: 'insert_text', text: 'x' } as any]);
    expect(onChange).toHaveBeenCalledWith('md-out', expect.any(Array));
    result.current([], [{ type: 'set_selection' } as any]);
    expect(storeState.setDomRect).toHaveBeenCalledWith(null);
  });

  it('selection 跟踪异常时 dev 环境 console.error', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Editor, 'nodes').mockImplementation(() => {
      throw new Error('nodes fail');
    });
    const { result } = renderHook(() => useOnchange());
    result.current([], [{ type: 'insert_text' } as any]);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('不同 parent path 的选区重置 domRect', () => {
    storeState.markdownEditorRef.current.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    vi.spyOn(Editor, 'nodes').mockImplementation(() =>
      [[{ type: 'paragraph' }, [0, 0]]] as any,
    );
    const { result } = renderHook(() => useOnchange());
    result.current([], [{ type: 'set_selection' } as any]);
    expect(storeState.setDomRect).toHaveBeenCalledWith(null);
  });
});
