import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { createEditor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorPlugin } from '../../../plugin';
import {
  EditorStore,
  EditorStoreContext,
  type EditorStoreContextType,
} from '../../store';
import { useOnchange } from '../useOnchange';

const createPlugin = (language: string): MarkdownEditorPlugin => ({
  toMarkdown: [
    {
      match: (node) => node.type === 'paragraph',
      convert: (node) => ({
        type: 'code',
        lang: language,
        value: JSON.stringify(
          node.type === 'paragraph' ? node.contextProps : undefined,
        ),
      }),
    },
  ],
});

function setup(plugins: MarkdownEditorPlugin[]) {
  const editor = withReact(withHistory(createEditor()));
  editor.children = [
    {
      type: 'paragraph',
      contextProps: { business: 'old' },
      children: [{ text: 'display only' }],
    },
  ];
  const markdownEditorRef = { current: editor };
  const store = new EditorStore(markdownEditorRef, plugins);
  const onChange = vi.fn();
  const context = {
    store,
    markdownEditorRef,
    readonly: false,
  } as EditorStoreContextType;
  const { result } = renderHook(
    () => useOnchange(onChange, { wait: 10, selectionTrackingEnabled: false }),
    {
      wrapper: ({ children }) => (
        <EditorStoreContext.Provider value={context}>
          {children}
        </EditorStoreContext.Provider>
      ),
    },
  );

  const edit = () => {
    Transforms.setNodes(
      editor,
      { contextProps: { business: 'updated' } },
      { at: [0] },
    );
    result.current(editor.children, [...editor.operations]);
  };
  return { editor, store, onChange, edit };
}

describe('useOnchange plugin serialization', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('preserves custom node data through the store serializer', async () => {
    const { editor, onChange, edit } = setup([createPlugin('business-card')]);

    act(edit);
    expect(onChange).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(10));

    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      '```business-card\n{"business":"updated"}\n```',
      editor.children,
    );
  });

  it('uses plugins updated while a debounced change is pending', async () => {
    const { editor, store, onChange, edit } = setup([createPlugin('old-card')]);

    act(edit);
    store.setRuntimeConfig({ plugins: [createPlugin('new-card')] });
    await act(() => vi.advanceTimersByTimeAsync(10));

    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      '```new-card\n{"business":"updated"}\n```',
      editor.children,
    );
  });

  it('stops using plugins removed while a debounced change is pending', async () => {
    const { editor, store, onChange, edit } = setup([createPlugin('old-card')]);

    act(edit);
    store.setRuntimeConfig({ plugins: undefined });
    await act(() => vi.advanceTimersByTimeAsync(10));

    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      'display only',
      editor.children,
    );
  });
});
