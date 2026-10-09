import { act, render } from '@testing-library/react';
import React from 'react';
import { createEditor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import type { RenderElementProps } from 'slate-react';
import { Editable, Slate, withReact } from 'slate-react';
import { describe, expect, it } from 'vitest';
import { createStubEditorStoreContextValue } from '../../../../MarkdownEditor/editor/__tests__/helpers/editorStoreTestContext';
import {
  EditorStore,
  EditorStoreContext,
} from '../../../../MarkdownEditor/editor/store';
import type { CodeNode } from '../../../../MarkdownEditor/el';
import { useCodeEditorState } from '../../hooks/useCodeEditorState';

const code = (value: string): CodeNode => ({
  type: 'code',
  language: 'javascript',
  value,
  children: [{ text: '' }],
});

function mountCodeState() {
  const editor = withHistory(withReact(createEditor()));
  editor.children = [code('target'), code('sibling')];
  const context = createStubEditorStoreContextValue({
    markdownEditorRef: { current: editor },
    store: new EditorStore({ current: editor }),
  });
  let update: ReturnType<typeof useCodeEditorState>['update'];
  const Probe = (props: RenderElementProps) => {
    const state = useCodeEditorState(props.element as CodeNode);
    if (props.element.value === 'target') update = state.update;
    return <div {...props.attributes}>{props.children}</div>;
  };
  const view = (readonly = false) => (
    <EditorStoreContext.Provider value={{ ...context, readonly }}>
      <Slate editor={editor} initialValue={editor.children}>
        <Editable renderElement={(props) => <Probe {...props} />} />
      </Slate>
    </EditorStoreContext.Provider>
  );
  const rendered = render(view());
  return { ...rendered, editor, view, update: update! };
}

describe('code editor state path bridge', () => {
  it('updates a moved block before React commits without overwriting its sibling', async () => {
    const { editor, update } = mountCodeState();
    await act(async () => {
      Transforms.moveNodes(editor, { at: [0], to: [1] });
      update({ value: 'edited target' });
      update({ language: 'typescript' });
    });
    expect(editor.children[0]).toEqual(code('sibling'));
    expect(editor.children[1]).toMatchObject({
      value: 'edited target',
      language: 'typescript',
    });
  });

  it('ignores a delayed code update after the target is removed', async () => {
    const { editor, update } = mountCodeState();
    await act(async () => Transforms.removeNodes(editor, { at: [0] }));
    await act(async () => update({ value: 'late response' }));
    expect(editor.children).toEqual([code('sibling')]);
  });

  it('ignores a pending edit after the editor becomes readonly', async () => {
    const { editor, view, rerender, update } = mountCodeState();
    rerender(view(true));
    await act(async () => update({ value: 'pending edit' }));
    expect(editor.children).toEqual([code('target'), code('sibling')]);
  });

  it('ignores a delayed edit after the same logical node becomes a paragraph', async () => {
    const { editor, update } = mountCodeState();
    await act(async () =>
      Transforms.setNodes(editor, { type: 'paragraph' }, { at: [0] }),
    );
    const currentDocument = editor.children;
    await act(async () => update({ value: 'late code edit' }));
    expect(editor.children).toBe(currentDocument);
  });
});
