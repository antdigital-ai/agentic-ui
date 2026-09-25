import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleMarkInsertBreak,
  handleMarkRemoveTextOperation,
  handleTagDeleteBackward,
  handleTagRemoveTextOperation,
  isCodeTagTextLeaf,
  moveSelectionOutOfCodeTagLeaf,
  moveSelectionOutOfMarkLeaf,
  shouldExitMarkOnInsertBreak,
  tryInsertTextOutsideMarkOnDoubleSpace,
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

  it('handleMarkRemoveTextOperation 删空 mark 正文后清除 mark 属性', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          {
            text: '@助理',
            mark: true,
            markLabel: '@',
            markColor: 'blue',
          },
        ],
      },
    ];
    const apply = editor.apply.bind(editor);
    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');

    const handled = handleMarkRemoveTextOperation(
      editor,
      {
        type: 'remove_text',
        path: [0, 0],
        offset: 0,
        text: '@助理',
      },
      apply,
    );

    expect(handled).toBe(true);
    expect(unsetSpy).toHaveBeenCalledWith(
      editor,
      ['mark', 'markColor', 'markBg', 'markLabel'],
      expect.objectContaining({ at: [0, 0] }),
    );
    const leaf = editor.children[0].children[0] as {
      mark?: boolean;
      markLabel?: string;
      text: string;
    };
    expect(leaf.mark).toBeUndefined();
    expect(leaf.markLabel).toBeUndefined();
    unsetSpy.mockRestore();
  });

  it('handleMarkRemoveTextOperation 忽略缺失 text 的异常 remove_text 操作', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '@助理', mark: true, markLabel: '@' }],
      },
    ];
    const apply = vi.fn();

    const handled = handleMarkRemoveTextOperation(
      editor,
      {
        type: 'remove_text',
        path: [0, 0],
        offset: 0,
      } as unknown as Parameters<typeof handleMarkRemoveTextOperation>[1],
      apply,
    );

    expect(handled).toBe(false);
    expect(apply).not.toHaveBeenCalled();
  });

  it('shouldExitMarkOnInsertBreak：正文末尾第一次 Enter 不退出，空 mark 叶第二次退出', () => {
    expect(
      shouldExitMarkOnInsertBreak(
        { text: '@助理', mark: true } as never,
        '@助理'.length,
      ),
    ).toBe(false);
    expect(
      shouldExitMarkOnInsertBreak({ text: '', mark: true } as never, 0),
    ).toBe(true);
  });

  it('handleMarkInsertBreak 在空 mark 叶上第二次 Enter 移出并换行', () => {
    const base = createEditor();
    const originalInsertBreak = vi.fn();
    base.insertBreak = originalInsertBreak;
    const editor = base;
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: '@助理', mark: true, markLabel: '@' },
          { text: '', mark: true, markLabel: '@' },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    };

    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');
    const handled = handleMarkInsertBreak(editor, originalInsertBreak);

    expect(handled).toBe(true);
    expect(unsetSpy).toHaveBeenCalled();
    expect(originalInsertBreak).toHaveBeenCalledTimes(1);
    unsetSpy.mockRestore();
  });

  it('moveSelectionOutOfMarkLeaf 在空 mark 叶子上清除 mark 并移出选区', () => {
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
    const selectSpy = vi.spyOn(Transforms, 'select');
    const handled = moveSelectionOutOfMarkLeaf(editor);

    expect(handled).toBe(true);
    expect(unsetSpy).toHaveBeenCalledWith(
      editor,
      ['mark', 'markColor', 'markBg', 'markLabel'],
      expect.objectContaining({ at: [0, 0] }),
    );
    expect(selectSpy).toHaveBeenCalledWith(editor, { path: [0, 1], offset: 0 });
    const leaf = editor.children[0].children[0] as {
      mark?: boolean;
      markLabel?: string;
      text: string;
    };
    expect(leaf.mark).toBeUndefined();
    expect(leaf.markLabel).toBeUndefined();
    unsetSpy.mockRestore();
    selectSpy.mockRestore();
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

  it('tryInsertTextOutsideMarkOnDoubleSpace 第二个空格插入到 mark 外', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '@助理 ', mark: true, markLabel: '@' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };

    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, ' ')).toBe(true);
    expect(insertSpy).toHaveBeenCalledWith(editor, [{ text: ' ' }]);
    insertSpy.mockRestore();
  });

  it('handleTagRemoveTextOperation 删除整段 tag 文本时替换为占位符', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [tagNode('tag')] }];
    const apply = vi.fn();
    const removeSpy = vi.spyOn(Transforms, 'removeNodes');
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');

    const handled = handleTagRemoveTextOperation(
      editor,
      { type: 'remove_text', path: [0, 0], offset: 0, text: 'tag' },
      apply,
    );

    expect(handled).toBe(true);
    expect(removeSpy).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();
    removeSpy.mockRestore();
    insertSpy.mockRestore();
  });

  it('handleTagRemoveTextOperation 非 tag 叶节点时返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    const apply = vi.fn();

    expect(
      handleTagRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'p' },
        apply,
      ),
    ).toBe(false);
    expect(apply).not.toHaveBeenCalled();
  });

  it('handleMarkRemoveTextOperation 删后仍有非空正文时不处理', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '@助理 hello', mark: true, markLabel: '@' }],
      },
    ];
    const apply = vi.fn();

    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: '@' },
        apply,
      ),
    ).toBe(false);
    expect(apply).not.toHaveBeenCalled();
  });

  it('shouldExitMarkOnInsertBreak 在 mark 末尾换行符时允许退出', () => {
    expect(
      shouldExitMarkOnInsertBreak({ text: 'line\n', mark: true } as never, 5),
    ).toBe(true);
    expect(
      shouldExitMarkOnInsertBreak({ text: 'mid', mark: true } as never, 1),
    ).toBe(false);
  });

  it('handleMarkInsertBreak 在 mark 末尾已有换行时 split 并换行', () => {
    const editor = createEditor();
    const insertBreak = vi.fn();
    editor.insertBreak = insertBreak;
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'line\n', mark: true, markLabel: '@' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    };

    const splitSpy = vi.spyOn(Transforms, 'splitNodes');
    expect(handleMarkInsertBreak(editor, insertBreak)).toBe(true);
    expect(splitSpy).toHaveBeenCalled();
    expect(insertBreak).toHaveBeenCalled();
    splitSpy.mockRestore();
  });

  it('moveSelectionOutOfMarkLeaf 无后续节点时插入空文本叶', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '', mark: true, markLabel: '@' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    expect(moveSelectionOutOfMarkLeaf(editor)).toBe(true);
    expect(insertSpy).toHaveBeenCalledWith(
      editor,
      { text: '' },
      expect.objectContaining({ at: [0, 1], select: true }),
    );
    insertSpy.mockRestore();
  });

  it('moveSelectionOutOfCodeTagLeaf 无后续节点时插入空文本叶', () => {
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

  it('isCodeTagTextLeaf 识别 code 或 tag 叶节点', () => {
    expect(isCodeTagTextLeaf({ text: 'a', code: true })).toBe(true);
    expect(isCodeTagTextLeaf({ text: 'a', tag: true })).toBe(true);
    expect(isCodeTagTextLeaf({ text: 'a' })).toBe(false);
  });

  it('handleTagDeleteBackward 删除 tag 前单字符文本时插入段落', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [tagNode('x'), { text: 'y' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 1], offset: 1 },
      focus: { path: [0, 1], offset: 1 },
    };

    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    expect(handleTagDeleteBackward(editor, 'character', vi.fn())).toBe(true);
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('handleTagDeleteBackward 多子节点时 remove tag 节点', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [tagNode(' '), { text: '' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    };

    const removeSpy = vi.spyOn(Transforms, 'removeNodes');
    expect(handleTagDeleteBackward(editor, 'character', vi.fn())).toBe(true);
    expect(removeSpy).toHaveBeenCalled();
    removeSpy.mockRestore();
  });

  it('handleTagDeleteBackward 空 tag 叶上退格清除 tag 属性', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: ' ', tag: true, code: true, triggerText: '@' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const setNodesSpy = vi.spyOn(Transforms, 'setNodes');
    expect(handleTagDeleteBackward(editor, 'character', vi.fn())).toBe(true);
    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      { tag: false, code: false },
      { at: [0, 0] },
    );
    setNodesSpy.mockRestore();
  });

  it('handleTagDeleteBackward 非 tag 场景返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    expect(handleTagDeleteBackward(editor, 'character', vi.fn())).toBe(false);
  });

  it('tryInsertTextOutsideTagOnDoubleSpace 条件不满足时返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [tagNode('a')] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, ' ')).toBe(false);
  });

  it('moveSelectionOutOfMarkLeaf 非 mark 或扩展选区时返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(moveSelectionOutOfMarkLeaf(editor)).toBe(false);
  });
});
