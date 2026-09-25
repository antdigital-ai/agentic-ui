import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { getCursorPosition } from '../getCursorPosition';

describe('getCursorPosition', () => {
  it('returns null for missing location', () => {
    const editor = createEditor();
    expect(getCursorPosition(editor, null)).toBeNull();
  });

  it('returns null for expanded ranges', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
    const range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    expect(getCursorPosition(editor, range)).toBeNull();
  });

  it('returns focus for collapsed ranges', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
    const point = { path: [0, 0], offset: 2 };
    const range = { anchor: point, focus: point };
    expect(getCursorPosition(editor, range)).toEqual(point);
  });

  it('returns null for spans covering different paths', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ];
    expect(
      getCursorPosition(editor, [
        [0, 0],
        [1, 0],
      ]),
    ).toBeNull();
  });

  it('resolves a path to the start point', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
    expect(getCursorPosition(editor, [0, 0])).toEqual({
      path: [0, 0],
      offset: 0,
    });
  });

  it('returns a point unchanged', () => {
    const editor = createEditor();
    const point = { path: [0, 0], offset: 3 };
    expect(getCursorPosition(editor, point)).toEqual(point);
  });
});
