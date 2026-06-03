import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  ensureNonEmptyEditor,
  redirectCardAfterText,
  tryHandleCardInsertText,
} from '../cardPluginBehavior';

describe('cardPluginBehavior', () => {
  it('ensureNonEmptyEditor 在空文档插入空段落', () => {
    const editor = createEditor();
    editor.children = [];
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    ensureNonEmptyEditor(editor);
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('redirectCardAfterText 在 card 后插入段落', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: 'body' }] },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
    ];
    expect(redirectCardAfterText(editor, [0, 2, 0], 'hi')).toBe(true);
    expect(editor.children.length).toBe(2);
    expect((editor.children[1] as { type: string }).type).toBe('paragraph');
  });

  it('tryHandleCardInsertText 在 card-before 不调用默认 insertText', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: '' }] },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
    ];
    Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
    const insertText = vi.fn();
    expect(tryHandleCardInsertText(editor, 'x', insertText)).toBe(true);
    expect(insertText).not.toHaveBeenCalled();
  });
});
