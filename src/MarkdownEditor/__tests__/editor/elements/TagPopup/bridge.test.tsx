import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { createEditor, Transforms } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import { SuggestionContext } from '../../../../../MarkdownInputField/Suggestion/SuggestionContext';
import { TagPopup } from '../../../../editor/elements/TagPopup';

function renderTag() {
  const editor = withReact(createEditor());
  const onSelect = vi.fn((value: string, path?: number[]) => {
    if (!path) return;
    Transforms.insertText(editor, value, {
      at: { path, offset: 0 },
    });
  });
  const onSelectRef = {
    current: undefined as ((value: string) => void) | undefined,
  };
  render(
    <SuggestionContext.Provider value={{ isRender: true, onSelectRef }}>
      <Slate
        editor={editor}
        initialValue={[
          { type: 'paragraph', children: [{ text: '$tag', tag: true }] },
          { type: 'paragraph', children: [{ text: 'neighbor' }] },
        ]}
      >
        <Editable
          renderLeaf={(props) => (
            <span {...props.attributes}>
              {props.leaf.tag ? (
                <TagPopup text={props.leaf.text} onSelect={onSelect}>
                  {props.children}
                </TagPopup>
              ) : (
                props.children
              )}
            </span>
          )}
        />
      </Slate>
    </SuggestionContext.Provider>,
  );
  fireEvent.click(screen.getByText('$tag'));
  const select = onSelectRef.current;
  expect(select).toBeTypeOf('function');
  return { editor, onSelect, select: select! };
}

describe('TagPopup and Slate bridge', () => {
  it('resolves a moved text node before React has rerendered it', async () => {
    const { editor, select, onSelect } = renderTag();
    await act(async () => {
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: 'before' }] },
        { at: [0] },
      );
      select('selected');
    });
    expect(onSelect).toHaveBeenCalledWith('selected', [1, 0]);
    expect(editor.children[0].children[0]).toMatchObject({ text: 'before' });
    expect(editor.children[1].children[0]).toMatchObject({
      text: 'selected$tag',
    });
  });

  it('ignores a delayed shared suggestion after the tag was removed', async () => {
    const { editor, select, onSelect } = renderTag();
    await act(async () => {
      Transforms.removeNodes(editor, { at: [0] });
    });
    await act(async () => select('late'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(editor.children[0].children[0]).toMatchObject({ text: 'neighbor' });
  });

  it('ignores a removed tag even before React unmounts its DOM', async () => {
    const { editor, select, onSelect } = renderTag();
    await act(async () => {
      Transforms.removeNodes(editor, { at: [0] });
      select('late');
    });
    expect(onSelect).not.toHaveBeenCalled();
    expect(editor.children[0].children[0]).toMatchObject({ text: 'neighbor' });
  });
});
