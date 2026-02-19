import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { BaseEditor, createEditor } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, Slate, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMEditor, useSelStatus } from '../../../src/MarkdownEditor/hooks/editor';
import { EditorStore, EditorStoreContext } from '../../../src/MarkdownEditor/editor/store';
import { selChange$ } from '../../../src/MarkdownEditor/editor/plugins/useOnchange';
import { Transforms } from 'slate';
import { ReactEditor as SlateReactEditor } from 'slate-react';

describe('MarkdownEditor hooks/editor', () => {
  let editor: BaseEditor & ReactEditor & HistoryEditor;
  let editorRef: React.MutableRefObject<BaseEditor & ReactEditor & HistoryEditor>;
  let store: EditorStore;

  beforeEach(() => {
    editor = withHistory(withReact(createEditor())) as BaseEditor &
      ReactEditor &
      HistoryEditor;
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ];
    editorRef = { current: editor };
    store = new EditorStore(editorRef);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useMEditor', () => {
    it('update(props, current) 应使用 current 的 path', () => {
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');
      const findPathSpy = vi.spyOn(SlateReactEditor, 'findPath').mockImplementation((ed, node) => {
        // 传入 current 时返回 [1]，否则返回 [0]（el 的 path）
        if (node && (node as any).currentPath) return (node as any).currentPath;
        return [0];
      });

      const el0 = editor.children[0];
      const currentEl = { type: 'paragraph', children: [{ text: 'b' }], currentPath: [1] };

      const TestComp = () => {
        const [, update] = useMEditor(el0 as any);
        return (
          <button
            type="button"
            data-testid="update-current"
            onClick={() => update({ align: 'center' }, currentEl as any)}
          >
            update
          </button>
        );
      };

      const contextValue = {
        store,
        markdownEditorRef: editorRef,
        markdownContainerRef: { current: null },
      };

      const { getByTestId } = render(
        <EditorStoreContext.Provider value={contextValue as any}>
          <Slate editor={editor} initialValue={editor.children} onChange={() => {}}>
            <TestComp />
          </Slate>
        </EditorStoreContext.Provider>,
      );

      getByTestId('update-current').click();

      expect(findPathSpy).toHaveBeenCalledWith(editor, currentEl);
      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { align: 'center' },
        expect.objectContaining({ at: [1] }),
      );

      setNodesSpy.mockRestore();
      findPathSpy.mockRestore();
    });
  });

  describe('useSelStatus', () => {
    it('selChange$ 收到 null 时应设 selected: false', async () => {
      const element = { type: 'paragraph', children: [{ text: 'a' }] };

      const TestComp = () => {
        const [sel] = useSelStatus(element as any);
        return <div data-testid="status">{sel ? 'selected' : 'not-selected'}</div>;
      };

      const contextValue = {
        store,
        markdownEditorRef: editorRef,
        markdownContainerRef: { current: null },
      };

      const { getByTestId } = render(
        <EditorStoreContext.Provider value={contextValue as any}>
          <Slate editor={editor} initialValue={editor.children} onChange={() => {}}>
            <TestComp />
          </Slate>
        </EditorStoreContext.Provider>,
      );

      expect(getByTestId('status')).toHaveTextContent('selected');

      selChange$.next(null);

      await waitFor(() => {
        expect(getByTestId('status')).toHaveTextContent('not-selected');
      });
    });
  });
});
