import { act, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { createEditor, Node, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorInstance } from '../../../MarkdownEditor';
import { EditorStore } from '../../../MarkdownEditor/editor/store';
import { scheduleClearInputComposition } from '../../../MarkdownEditor/editor/utils/isImeComposing';
import { useEditorValueSync } from '../useEditorValueSync';

function makeEditorInstance() {
  const editor = createEditor();
  editor.children = [{ type: 'paragraph', children: [{ text: 'initial' }] }];
  const store = {
    inputComposition: false,
    setMDContent: vi.fn((value: string) => {
      editor.children = [{ type: 'paragraph', children: [{ text: value }] }];
      editor.selection = null;
    }),
  };
  return {
    store,
    markdownEditorRef: { current: editor },
  } as unknown as MarkdownEditorInstance;
}

function useHarness(
  value: string | undefined,
  instance?: MarkdownEditorInstance,
) {
  const markdownEditorRef = useRef(instance);
  return {
    ...useEditorValueSync({ value, markdownEditorRef }),
    markdownEditorRef,
  };
}

afterEach(() => vi.restoreAllMocks());

describe('useEditorValueSync', () => {
  it('applies external replacements while focused and restores a valid collapsed selection', () => {
    vi.spyOn(ReactEditor, 'isFocused').mockReturnValue(true);
    const instance = makeEditorInstance();
    const { rerender } = renderHook(
      ({ value }) => useHarness(value, instance),
      { initialProps: { value: 'initial' } },
    );
    vi.mocked(instance.store.setMDContent).mockClear();
    rerender({ value: 'next draft' });
    expect(instance.store.setMDContent).toHaveBeenCalledWith('next draft');
    expect(instance.markdownEditorRef.current.selection).toEqual({
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 10 },
    });
    rerender({ value: '' });
    expect(instance.store.setMDContent).toHaveBeenLastCalledWith('');
  });

  it('skips only an echo of the current emitted document', () => {
    const instance = makeEditorInstance();
    const { result, rerender } = renderHook(
      ({ value }) => useHarness(value, instance),
      { initialProps: { value: 'initial' } },
    );
    vi.mocked(instance.store.setMDContent).mockClear();
    act(() => {
      result.current.onEditorChange('emitted');
    });
    rerender({ value: 'emitted' });
    expect(instance.store.setMDContent).not.toHaveBeenCalled();

    instance.markdownEditorRef.current.children = [
      { type: 'paragraph', children: [{ text: 'unreported edit' }] },
    ];
    rerender({ value: 'another draft' });
    rerender({ value: 'emitted' });
    expect(instance.store.setMDContent).toHaveBeenLastCalledWith('emitted');
  });

  it('allows the parent to restore an older emitted draft', () => {
    const instance = makeEditorInstance();
    const { result, rerender } = renderHook(
      ({ value }) => useHarness(value, instance),
      { initialProps: { value: 'initial' } },
    );
    act(() => {
      result.current.onEditorChange('old draft');
    });
    rerender({ value: 'old draft' });
    act(() => {
      result.current.onEditorChange('new draft');
    });
    rerender({ value: 'new draft' });
    vi.mocked(instance.store.setMDContent).mockClear();
    rerender({ value: 'old draft' });
    expect(instance.store.setMDContent).toHaveBeenCalledWith('old draft');
  });

  it('keeps content when the parent releases control with undefined', () => {
    const instance = makeEditorInstance();
    const { rerender } = renderHook(
      ({ value }) => useHarness(value, instance),
      { initialProps: { value: 'initial' as string | undefined } },
    );
    vi.mocked(instance.store.setMDContent).mockClear();
    rerender({ value: undefined });
    expect(instance.store.setMDContent).not.toHaveBeenCalled();
  });

  it('applies the latest value when the editor becomes ready after props change', () => {
    const { result, rerender } = renderHook(({ value }) => useHarness(value), {
      initialProps: { value: 'first' },
    });
    rerender({ value: 'latest' });
    const instance = makeEditorInstance();
    act(() => {
      result.current.onEditorReady(instance);
    });
    expect(instance.store.setMDContent).toHaveBeenCalledWith('latest');
  });

  it('defers IME replacements and blocks late composition output until the latest external value is applied', () => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(
      (callback) => {
        callback(0);
        return 0;
      },
    );
    const instance = makeEditorInstance();
    const { result, rerender } = renderHook(
      ({ value }) => useHarness(value, instance),
      { initialProps: { value: 'initial' } },
    );
    vi.mocked(instance.store.setMDContent).mockClear();
    instance.store.inputComposition = true;
    rerender({ value: 'draft 1' });
    rerender({ value: 'draft 2' });
    expect(instance.store.setMDContent).not.toHaveBeenCalled();
    expect(result.current.onEditorChange('old IME text')).toBe(false);
    instance.store.inputComposition = false;
    act(() => {
      result.current.flushPendingValue();
    });
    expect(instance.store.setMDContent).toHaveBeenCalledExactlyOnceWith(
      'draft 2',
    );
    expect(result.current.onEditorChange('draft 2')).toBe(true);
  });

  it('does not repeat a pending IME replacement after new typing between animation frames', () => {
    let nextFrame: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(
      (callback) => {
        nextFrame.push(callback);
        return nextFrame.length;
      },
    );
    const frame = () => {
      const callbacks = nextFrame;
      nextFrame = [];
      act(() => callbacks.forEach((callback) => callback(0)));
    };
    const editor = withReact(withHistory(createEditor()));
    editor.children = [{ type: 'paragraph', children: [{ text: 'initial' }] }];
    const markdownEditorRef = { current: editor };
    const store = new EditorStore(markdownEditorRef);
    const instance = { store, markdownEditorRef } as MarkdownEditorInstance;
    const { result, rerender } = renderHook(
      ({ value }) => useHarness(value, instance),
      { initialProps: { value: 'initial' } },
    );
    store.inputComposition = true;
    rerender({ value: 'requested draft' });
    act(() => {
      scheduleClearInputComposition(() => {
        store.inputComposition = false;
        result.current.flushPendingValue();
      });
      result.current.flushPendingValue();
    });
    frame();
    frame();
    expect(Node.string(editor)).toBe('requested draft');
    act(() =>
      Transforms.insertText(editor, '! ', { at: { path: [0, 0], offset: 0 } }),
    );
    frame();
    frame();
    expect(Node.string(editor)).toBe('! requested draft');
  });
});
