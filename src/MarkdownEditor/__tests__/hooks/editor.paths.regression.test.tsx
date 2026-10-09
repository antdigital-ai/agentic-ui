import { act, render } from '@testing-library/react';
import React from 'react';
import { createEditor, Node, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import type { RenderElementProps } from 'slate-react';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStubEditorStoreContextValue } from '../../editor/__tests__/helpers/editorStoreTestContext';
import { useSlateElementPath } from '../../editor/elements/Table/utils/useSlateElementPath';
import { EditorStoreContext } from '../../editor/store';
import { useMEditor, useSelStatus } from '../../hooks/editor';

afterEach(() => vi.restoreAllMocks());

const paragraph = (text: string) => ({
  type: 'paragraph' as const,
  children: [{ text }],
});

function mountUpdates() {
  const editor = withReact(createEditor());
  editor.children = [paragraph('target'), paragraph('sibling')];
  const target = editor.children[0];
  let update: ReturnType<typeof useMEditor>[1];
  const Probe = (props: RenderElementProps) => {
    const [, setNode] = useMEditor(props.element);
    if (Node.string(props.element) === 'target') update = setNode;
    return <p {...props.attributes}>{props.children}</p>;
  };
  const view = render(
    <Slate editor={editor} initialValue={editor.children}>
      <Editable renderElement={(props) => <Probe {...props} />} />
    </Slate>,
  );
  // Retain the callback and original node as an asynchronous task would.
  const originalUpdate = update!;
  return { ...view, editor, target, update: originalUpdate };
}

describe('Slate node path bridges', () => {
  it('keeps two synchronous updates on the same immutable Slate node', async () => {
    const { editor, update } = mountUpdates();
    await act(async () => {
      update({ align: 'center' });
      update({ checked: true });
    });
    expect(editor.children[0]).toMatchObject({
      align: 'center',
      checked: true,
    });
    expect(editor.children[1]).not.toHaveProperty('align');
  });

  it('does not update the successor when an async target has been removed', async () => {
    const { editor, target, update } = mountUpdates();
    await act(async () => Transforms.removeNodes(editor, { at: [0] }));
    // Slate retains this map even after the target's React component unmounts.
    expect(ReactEditor.findPath(editor, target)).toEqual([0]);
    await act(async () => update({ align: 'center' }));
    expect(editor.children).toEqual([paragraph('sibling')]);
  });

  it('does not update a new document that replaced the target at the same path', async () => {
    const { editor, update } = mountUpdates();
    await act(async () => {
      Transforms.removeNodes(editor, { at: [0] });
      Transforms.insertNodes(editor, paragraph('replacement'), { at: [0] });
    });
    await act(async () => update({ checked: true }));
    expect(editor.children[0]).toEqual(paragraph('replacement'));
    expect(editor.children[1]).toEqual(paragraph('sibling'));
  });

  it('updates the original target when it moves before React can refresh maps', async () => {
    const { editor, update } = mountUpdates();
    await act(async () => {
      Transforms.moveNodes(editor, { at: [0], to: [1] });
      update({ align: 'right' });
      update({ checked: true });
    });
    expect(editor.children[0]).toEqual(paragraph('sibling'));
    expect(editor.children[1]).toMatchObject({
      align: 'right',
      checked: true,
      children: [{ text: 'target' }],
    });
  });

  it('rejects a removed selection target instead of selecting the successor', async () => {
    const editor = withHistory(withReact(createEditor()));
    editor.children = [paragraph('removed'), paragraph('successor')];
    const target = editor.children[0];
    const context = createStubEditorStoreContextValue({
      markdownEditorRef: { current: editor },
    });
    const Probe = () => {
      const [selected, path] = useSelStatus(target);
      return (
        <div data-testid="status" data-selected={selected}>
          {path?.join('-') ?? 'detached'}
        </div>
      );
    };
    const { getByTestId } = render(
      <EditorStoreContext.Provider value={context}>
        <Slate editor={editor} initialValue={editor.children}>
          <Probe />
          <Editable />
        </Slate>
      </EditorStoreContext.Provider>,
    );
    act(() => {
      context.selChange$.next({ node: [target, [0]], sel: null });
    });
    expect(getByTestId('status')).toHaveAttribute('data-selected', 'true');
    await act(async () => Transforms.removeNodes(editor, { at: [0] }));
    act(() => {
      context.selChange$.next({ node: [editor.children[0], [0]], sel: null });
    });
    expect(getByTestId('status')).toHaveTextContent('detached');
    expect(getByTestId('status')).toHaveAttribute('data-selected', 'false');
  });

  it('refreshes paths after sibling insertion without selection renders or lookups', async () => {
    const editor = withReact(createEditor());
    editor.children = Array.from({ length: 50 }, (_, i) =>
      paragraph(`row ${i}`),
    );
    const renders = vi.fn();
    const Probe = (props: RenderElementProps) => {
      const path = useSlateElementPath(props.element);
      renders(props.element);
      return (
        <p {...props.attributes} data-path={path?.join('-')}>
          {props.children}
        </p>
      );
    };
    const { container } = render(
      <Slate editor={editor} initialValue={editor.children}>
        <Editable renderElement={(props) => <Probe {...props} />} />
      </Slate>,
    );
    const findPath = vi.spyOn(ReactEditor, 'findPath');
    renders.mockClear();
    await act(async () =>
      Transforms.select(editor, { path: [0, 0], offset: 0 }),
    );
    expect(renders).not.toHaveBeenCalled();
    expect(findPath).not.toHaveBeenCalled();
    await act(async () =>
      Transforms.insertNodes(editor, paragraph('prefix'), { at: [0] }),
    );
    expect(container.querySelectorAll('p')[1]).toHaveAttribute(
      'data-path',
      '1',
    );
    expect(container.querySelectorAll('p')[50]).toHaveAttribute(
      'data-path',
      '50',
    );
  });
});
