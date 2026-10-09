import { act, render } from '@testing-library/react';
import React from 'react';
import { createEditor, Transforms } from 'slate';
import type { RenderElementProps } from 'slate-react';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStubEditorStoreContextValue } from '../../editor/__tests__/helpers/editorStoreTestContext';
import { EditorStoreContext } from '../../editor/store';
import { useMEditor, useSelStatus } from '../../hooks/editor';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MarkdownEditor static element subscriptions', () => {
  it('only updates selection consumers whose selected status changes', async () => {
    const editor = withReact(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'first' }] },
      { type: 'paragraph', children: [{ text: 'second' }] },
    ];
    const context = createStubEditorStoreContextValue({
      markdownEditorRef: { current: editor },
    });
    const renders = vi.fn();
    const Probe = (props: RenderElementProps) => {
      const [selected, path] = useSelStatus(props.element);
      useMEditor(props.element);
      renders(props.element);
      return (
        <div
          {...props.attributes}
          data-testid={`element-${path.join('-')}`}
          data-selected={String(selected)}
        >
          {props.children}
        </div>
      );
    };
    const { getByTestId } = render(
      <EditorStoreContext.Provider value={context}>
        <Slate editor={editor} initialValue={editor.children}>
          <Editable renderElement={(props) => <Probe {...props} />} />
        </Slate>
      </EditorStoreContext.Provider>,
    );
    act(() => context.selChange$.next(null));
    renders.mockClear();
    const findPath = vi.spyOn(ReactEditor, 'findPath');
    const second = editor.children[1];

    await act(async () => {
      Transforms.insertText(editor, '!', { at: { path: [0, 0], offset: 0 } });
    });
    expect(
      renders.mock.calls.filter(([element]) => element === second),
    ).toHaveLength(0);

    renders.mockClear();
    findPath.mockClear();
    await act(async () => {
      Transforms.select(editor, { path: [0, 0], offset: 1 });
      context.selChange$.next(null);
    });
    expect(renders).not.toHaveBeenCalled();
    expect(findPath).not.toHaveBeenCalled();

    act(() => {
      context.selChange$.next({
        sel: editor.selection,
        node: [second, [1]],
      });
    });
    expect(getByTestId('element-1')).toHaveAttribute('data-selected', 'true');
    expect(renders).toHaveBeenCalledTimes(1);
    expect(findPath).not.toHaveBeenCalled();

    // An unchanged element can move when a sibling is inserted before it.
    await act(async () => {
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: 'new sibling' }] },
        { at: [0] },
      );
    });
    // No selection subject event is needed (FloatBar can be disabled).
    expect(getByTestId('element-2')).toHaveAttribute('data-selected', 'true');
    act(() => {
      context.selChange$.next({
        sel: editor.selection,
        node: [second, [2]],
      });
    });
    expect(getByTestId('element-2')).toHaveAttribute('data-selected', 'true');
    expect(findPath).toHaveBeenCalledWith(editor, second);
  });
});
