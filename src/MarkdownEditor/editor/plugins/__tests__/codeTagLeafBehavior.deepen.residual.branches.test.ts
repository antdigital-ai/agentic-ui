/**
 * codeTagLeafBehavior deepen residual：mark split、双空格成功、
 * tag 空叶 strip、codeTag 选区外移。
 */
import { createEditor, Editor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleMarkInsertBreak,
  handleMarkRemoveTextOperation,
  handleTagDeleteBackward,
  moveSelectionOutOfCodeTagLeaf,
  moveSelectionOutOfMarkLeaf,
  tryInsertTextOutsideMarkOnDoubleSpace,
  tryInsertTextOutsideTagOnDoubleSpace,
} from '../codeTagLeafBehavior';

const tagNode = (text: string, extra: Record<string, unknown> = {}) => ({
  text,
  tag: true,
  code: true,
  ...extra,
});

describe('codeTagLeafBehavior deepen residual branches', () => {
  it('handleMarkInsertBreak：多行 mark 叶 splitNodes 后 insertBreak', () => {
    const editor = createEditor();
    const insertBreak = vi.fn();
    editor.insertBreak = insertBreak;
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ab\n', mark: true, markLabel: '@' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    const splitSpy = vi.spyOn(Transforms, 'splitNodes');
    expect(handleMarkInsertBreak(editor, insertBreak)).toBe(true);
    expect(splitSpy).toHaveBeenCalled();
    expect(insertBreak).toHaveBeenCalled();
    splitSpy.mockRestore();
  });

  it('handleMarkRemoveTextOperation：删后 path 消失则跳过 unset', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: ' ', mark: true }],
      },
    ];
    const apply = vi.fn();
    vi.spyOn(Editor, 'hasPath').mockReturnValue(false);
    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: ' ' },
        apply,
      ),
    ).toBe(true);
    vi.restoreAllMocks();
  });

  it('tryInsertTextOutsideTagOnDoubleSpace：末尾双空格成功插入', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [tagNode('a ')] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, ' ')).toBe(true);
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('tryInsertTextOutsideMarkOnDoubleSpace：mark 叶双空格成功插入', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'hi ', mark: true, markLabel: '@' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, ' ')).toBe(true);
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('handleTagDeleteBackward：空 tag 叶 strip triggerText', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [tagNode('', { triggerText: '@' })],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const setSpy = vi.spyOn(Transforms, 'setNodes');
    expect(handleTagDeleteBackward(editor, 'character', vi.fn())).toBe(true);
    expect(setSpy).toHaveBeenCalled();
    setSpy.mockRestore();
  });

  it('handleTagDeleteBackward：前一 tag + 当前有文本走 deleteBackward', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [tagNode(' '), { text: 'xy' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 1], offset: 1 },
      focus: { path: [0, 1], offset: 1 },
    };
    const deleteBackward = vi.fn();
    expect(handleTagDeleteBackward(editor, 'character', deleteBackward)).toBe(
      true,
    );
    expect(deleteBackward).toHaveBeenCalledWith('character');
  });

  it('moveSelectionOutOfCodeTagLeaf：无后续 path 时插入空文本叶', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'x', tag: true, code: true }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    expect(moveSelectionOutOfCodeTagLeaf(editor)).toBe(true);
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('moveSelectionOutOfMarkLeaf：空 mark 叶 unset 后移到下一段', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: '', mark: true, markLabel: '@' },
          { text: 'next' },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');
    expect(moveSelectionOutOfMarkLeaf(editor)).toBe(true);
    expect(unsetSpy).toHaveBeenCalled();
    unsetSpy.mockRestore();
  });
});
