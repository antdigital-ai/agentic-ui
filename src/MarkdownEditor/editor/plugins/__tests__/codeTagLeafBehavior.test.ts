import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleMarkInsertBreak,
  handleMarkRemoveTextOperation,
  handleTagRemoveTextOperation,
  moveSelectionOutOfCodeTagLeaf,
  moveSelectionOutOfMarkLeaf,
  shouldExitMarkOnInsertBreak,
  tryInsertTextOutsideTagOnDoubleSpace,
  tryInsertTextOutsideMarkOnDoubleSpace,
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
});
