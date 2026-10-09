import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { createEditor, Descendant, Operation, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { describe, expect, it } from 'vitest';
import { EditorStoreTestProvider } from '../../../__tests__/helpers/editorStoreTestContext';
import { withCodeBlockPlugin } from '../../../plugins/withCodeBlockPlugin';
import { Code } from '../index';

function renderCode(value = '', readonly = false) {
  const initialValue: Descendant[] = [
    {
      type: 'code',
      language: 'ts',
      value,
      children: [{ text: '' }],
    },
    { type: 'paragraph', children: [{ text: 'after' }] },
  ];
  const editor = withCodeBlockPlugin(withReact(withHistory(createEditor())));
  const operations: Operation[] = [];
  const apply = editor.apply;
  editor.apply = (operation) => {
    operations.push(operation);
    apply(operation);
  };
  const view = render(
    <EditorStoreTestProvider value={{ readonly }}>
      <Slate editor={editor} initialValue={initialValue}>
        <Editable
          readOnly={readonly}
          renderElement={(props) =>
            props.element.type === 'code' ? (
              <Code {...props} />
            ) : (
              <p {...props.attributes}>{props.children}</p>
            )
          }
        />
      </Slate>
    </EditorStoreTestProvider>,
  );
  return {
    ...view,
    editor,
    operations,
    textarea: screen.getByRole('textbox', { name: 'Code: ts' }),
  };
}

describe('native code textarea and Slate bridge', () => {
  it('does not remove an empty readonly code block on Backspace or insert a paragraph on Mod+Enter', () => {
    const { editor, textarea, operations } = renderCode('', true);
    fireEvent.keyDown(textarea, { key: 'Backspace' });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    expect(editor.children.map((node) => node.type)).toEqual([
      'code',
      'paragraph',
    ]);
    expect(operations).toEqual([]);
  });

  it('lets IME own Backspace and Enter until composition finishes', () => {
    const { editor, textarea, operations } = renderCode();
    fireEvent.compositionStart(textarea);
    fireEvent.keyDown(textarea, { key: 'Backspace', isComposing: true });
    fireEvent.keyDown(textarea, {
      key: 'Enter',
      ctrlKey: true,
      isComposing: true,
    });
    expect(editor.children.map((node) => node.type)).toEqual([
      'code',
      'paragraph',
    ]);
    expect(operations).toEqual([]);
  });

  it('keeps intermediate IME text local and commits the completed text once', async () => {
    const { editor, textarea, operations } = renderCode();
    fireEvent.compositionStart(textarea);
    fireEvent.change(textarea, { target: { value: 'n' } });
    fireEvent.change(textarea, { target: { value: 'ni' } });
    expect(textarea).toHaveValue('ni');
    expect(editor.children[0]).toMatchObject({ value: '' });
    expect(operations).toHaveLength(0);

    fireEvent.change(textarea, { target: { value: '你' } });
    fireEvent.compositionEnd(textarea);
    await act(async () => {});
    expect(editor.children[0]).toMatchObject({ value: '你' });
    const committedOperations = operations.length;
    fireEvent.change(textarea, { target: { value: '你' } });
    expect(operations).toHaveLength(committedOperations);
    expect(
      operations.filter((operation) => operation.type === 'set_node'),
    ).toHaveLength(1);
  });

  it('resolves the live code path for an input before the next React render', async () => {
    const { editor, textarea } = renderCode('initial');
    await act(async () => {
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: 'before' }] },
        { at: [0] },
      );
      fireEvent.change(textarea, { target: { value: 'edited' } });
    });
    expect(editor.children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ text: 'before' }],
    });
    expect(editor.children[1]).toMatchObject({ type: 'code', value: 'edited' });
  });

  it('uses one Slate operation per edit and preserves the void text point through undo', async () => {
    const { editor, textarea, operations } = renderCode('initial');
    const [textNode, offset] = ReactEditor.toDOMPoint(editor, {
      path: [0, 0],
      offset: 0,
    });
    expect(offset).toBe(0);
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'edited' } });
    });
    expect(operations.map((operation) => operation.type)).toEqual(['set_node']);
    expect(ReactEditor.toDOMPoint(editor, { path: [0, 0], offset: 0 })[0]).toBe(
      textNode,
    );
    expect(textNode.isConnected).toBe(true);
    await act(async () => editor.undo());
    expect(editor.children[0]).toMatchObject({ value: 'initial' });
    expect(textarea).toHaveValue('initial');
    await act(async () => editor.redo());
    expect(editor.children[0]).toMatchObject({ value: 'edited' });
    expect(textarea).toHaveValue('edited');
  });

  it('does not write a final IME value into a replacement node after the code was deleted', async () => {
    const { editor, textarea } = renderCode('initial');
    fireEvent.compositionStart(textarea);
    fireEvent.change(textarea, { target: { value: '你' } });
    await act(async () => {
      Transforms.removeNodes(editor, { at: [0] });
      fireEvent.compositionEnd(textarea);
    });
    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: 'after' }] },
    ]);
  });
});
