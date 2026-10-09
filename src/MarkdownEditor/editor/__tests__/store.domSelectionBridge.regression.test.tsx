import { act, render } from '@testing-library/react';
import React from 'react';
import { createEditor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { afterEach, describe, expect, it } from 'vitest';
import { EditorStore } from '../store';

function mountEditors() {
  const first = withReact(withHistory(createEditor()));
  const second = withReact(withHistory(createEditor()));
  const store = new EditorStore({ current: first });
  const view = render(
    <>
      <Slate
        editor={first}
        initialValue={[
          { type: 'paragraph', children: [{ text: 'first editor' }] },
        ]}
      >
        <Editable data-testid="first-editor" />
      </Slate>
      <Slate
        editor={second}
        initialValue={[
          { type: 'paragraph', children: [{ text: 'second editor' }] },
        ]}
      >
        <Editable data-testid="second-editor" />
      </Slate>
      <span data-testid="outside-text">outside text</span>
    </>,
  );
  return { first, second, store, ...view };
}

function selectDomText(text: Node, start = 0, end = 3) {
  const selection = document.getSelection()!;
  const range = document.createRange();
  range.setStart(text, start);
  range.setEnd(text, end);
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

afterEach(() => document.getSelection()?.removeAllRanges());

describe('content updates and DOM selection ownership', () => {
  it('preserves the active selection in a different editor when loading Markdown', async () => {
    const { first, second, store } = mountEditors();
    const range = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    };
    await act(async () => {
      Transforms.select(second, range);
      ReactEditor.focus(second);
    });
    const [text] = ReactEditor.toDOMPoint(second, range.anchor);
    const selection = selectDomText(text, 1, 4);
    expect(selection.toString()).toBe('eco');
    await act(async () => store.setMDContent('updated first editor'));
    expect(selection.rangeCount).toBe(1);
    expect(selection.toString()).toBe('eco');
    expect(second.selection).toEqual(range);
    expect(first.selection).toBeNull();
  });

  it('preserves a selection outside Slate when updating Markdown', async () => {
    const { store, getByTestId } = mountEditors();
    const outside = getByTestId('outside-text').firstChild!;
    const selection = selectDomText(outside, 0, 7);
    await act(async () => store.setMDContent('replacement'));
    expect(selection.toString()).toBe('outside');
    expect(selection.anchorNode).toBe(outside);
  });

  it('clears this editor selection when its selected content is replaced', async () => {
    const { first, store } = mountEditors();
    await act(async () => {
      Transforms.select(first, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      });
    });
    const [text] = ReactEditor.toDOMPoint(first, { path: [0, 0], offset: 0 });
    const selection = selectDomText(text, 0, 5);
    await act(async () => store.setMDContent('replacement'));
    expect(first.selection).toBeNull();
    expect(selection.toString()).toBe('');
  });
});
