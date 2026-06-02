import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleTagRemoveTextOperation,
  moveSelectionOutOfCodeTagLeaf,
  tryInsertTextOutsideTagOnDoubleSpace,
} from '../codeTagLeafBehavior';

const tagNode = (text: string) => ({ text, tag: true, code: true });

describe('codeTagLeafBehavior', () => {
  it('handleTagRemoveTextOperation 空 tag 转为普通文本', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [tagNode('  ')] }];
    const apply = vi.fn();
    const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

    const handled = handleTagRemoveTextOperation(
      editor,
      { type: 'remove_text', path: [0, 0], offset: 0, text: ' ' },
      apply,
    );

    expect(handled).toBe(true);
    expect(setNodesSpy).toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();
    setNodesSpy.mockRestore();
  });

  it('moveSelectionOutOfCodeTagLeaf 在 code 叶子上移出选区', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'x', code: true }, { text: ' y' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    const selectSpy = vi.spyOn(Transforms, 'select');
    expect(moveSelectionOutOfCodeTagLeaf(editor)).toBe(true);
    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  it('tryInsertTextOutsideTagOnDoubleSpace 第二个空格插入到节点外', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [tagNode('a ')] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, ' ')).toBe(true);
    expect(insertSpy).toHaveBeenCalledWith(editor, [{ text: ' ' }]);
    insertSpy.mockRestore();
  });
});
