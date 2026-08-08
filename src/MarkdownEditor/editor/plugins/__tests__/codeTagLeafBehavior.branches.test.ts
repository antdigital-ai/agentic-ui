import { createEditor, Editor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleMarkInsertBreak,
  handleMarkRemoveTextOperation,
  handleTagDeleteBackward,
  handleTagRemoveTextOperation,
  isCodeTagTextLeaf,
  moveSelectionOutOfMarkLeaf,
  shouldExitMarkOnInsertBreak,
  tryInsertTextOutsideMarkOnDoubleSpace,
  tryInsertTextOutsideTagOnDoubleSpace,
} from '../codeTagLeafBehavior';

const tagNode = (text: string, extra: Record<string, unknown> = {}) => ({
  text,
  tag: true,
  code: true,
  ...extra,
});

describe('codeTagLeafBehavior 分支覆盖', () => {
  it('handleTagRemoveTextOperation 部分删除时走 apply 并返回 true', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [tagNode('hello')] }];
    const apply = vi.fn();

    expect(
      handleTagRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'he' },
        apply,
      ),
    ).toBe(true);
    expect(apply).toHaveBeenCalled();
  });

  it('handleMarkRemoveTextOperation 路径无效时 catch 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    const apply = vi.fn();

    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [9, 9], offset: 0, text: 'x' },
        apply,
      ),
    ).toBe(false);
    expect(apply).not.toHaveBeenCalled();
  });

  it('handleMarkRemoveTextOperation 删后仅剩空白时清除 mark', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '   ', mark: true, markLabel: '@' }],
      },
    ];
    const apply = editor.apply.bind(editor);
    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');

    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: ' ' },
        apply,
      ),
    ).toBe(true);
    expect(unsetSpy).toHaveBeenCalled();
    unsetSpy.mockRestore();
  });

  it('handleMarkRemoveTextOperation 非 mark 叶返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    const apply = vi.fn();

    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'p' },
        apply,
      ),
    ).toBe(false);
  });

  it('shouldExitMarkOnInsertBreak 仅换行符文本时允许退出', () => {
    expect(
      shouldExitMarkOnInsertBreak({ text: '\n', mark: true } as never, 1),
    ).toBe(true);
  });

  it('handleMarkInsertBreak 仅换行符 mark 叶走 breakOffset=0 分支', () => {
    const editor = createEditor();
    const insertBreak = vi.fn();
    editor.insertBreak = insertBreak;
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '\n', mark: true, markLabel: '@' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');
    expect(handleMarkInsertBreak(editor, insertBreak)).toBe(true);
    expect(unsetSpy).toHaveBeenCalled();
    expect(insertBreak).toHaveBeenCalled();
    unsetSpy.mockRestore();
  });

  it('handleMarkInsertBreak 无选区时返回 false', () => {
    const editor = createEditor();
    editor.selection = null;
    expect(handleMarkInsertBreak(editor, vi.fn())).toBe(false);
  });

  it('handleTagDeleteBackward 前一 tag 且当前单字符时插入段落', () => {
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

  it('tryInsertTextOutsideMarkOnDoubleSpace tag+code 叶返回 false', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'a ', mark: true, tag: true, code: true }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, ' ')).toBe(false);
  });

  it('tryInsertTextOutsideMarkOnDoubleSpace 路径异常时返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a ' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, ' ')).toBe(false);
  });

  it('tryInsertTextOutsideTagOnDoubleSpace 非 tag 叶返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a ' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, ' ')).toBe(false);
  });

  it('tryInsertTextOutsideTagOnDoubleSpace 非空格文本返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [tagNode('a ')] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, 'x')).toBe(false);
  });

  it('moveSelectionOutOfMarkLeaf 非空 mark 叶不清除 mark 属性', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: 'hi', mark: true, markLabel: '@' },
          { text: 'next' },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');
    expect(moveSelectionOutOfMarkLeaf(editor)).toBe(true);
    expect(unsetSpy).not.toHaveBeenCalled();
    unsetSpy.mockRestore();
  });

  it('handleTagDeleteBackward 异常路径 catch 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.spyOn(Editor, 'previous').mockImplementation(() => {
      throw new Error('boom');
    });
    expect(handleTagDeleteBackward(editor, 'character', vi.fn())).toBe(false);
    vi.restoreAllMocks();
  });
});

describe('istanbul residual：codeTagLeafBehavior 假值 / 早退', () => {
  it('shouldExitMarkOnInsertBreak：text?? 空 / offset 非末尾 / 末尾换行', () => {
    expect(
      shouldExitMarkOnInsertBreak({ text: undefined as any, mark: true }, 0),
    ).toBe(true);
    expect(
      shouldExitMarkOnInsertBreak({ text: 'ab', mark: true }, 1),
    ).toBe(false);
    expect(
      shouldExitMarkOnInsertBreak({ text: 'ab\n', mark: true }, 3),
    ).toBe(true);
    expect(
      shouldExitMarkOnInsertBreak({ text: '\n', mark: true }, 1),
    ).toBe(true);
  });

  it('handleMarkRemoveTextOperation：text/removed ?? 与删后非空返回 false', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ab', mark: true, markLabel: '@' }],
      },
    ];
    expect(
      handleMarkRemoveTextOperation(
        editor,
        {
          type: 'remove_text',
          path: [0, 0],
          offset: 0,
          text: undefined as any,
        },
        vi.fn(),
      ),
    ).toBe(false);
  });

  it('handleMarkInsertBreak：非 collapsed / 非 mark / 不满足 exit 返回 false', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ab', mark: true }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(handleMarkInsertBreak(editor, vi.fn())).toBe(false);

    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(handleMarkInsertBreak(editor, vi.fn())).toBe(false);

    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    };
    expect(handleMarkInsertBreak(editor, vi.fn())).toBe(false);
  });

  it('handleMarkInsertBreak：空 mark 叶 exit 后 insertBreak', () => {
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
    const insertBreak = vi.fn();
    expect(handleMarkInsertBreak(editor, insertBreak)).toBe(true);
    expect(insertBreak).toHaveBeenCalled();
  });

  it('handleMarkInsertBreak：末尾单换行 breakOffset=0 清 mark', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '\n', mark: true, markLabel: '@' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    const insertBreak = vi.fn();
    expect(handleMarkInsertBreak(editor, insertBreak)).toBe(true);
    expect(insertBreak).toHaveBeenCalled();
  });

  it('moveSelectionOutOfMarkLeaf：空选区 / 非 collapsed 返回 false', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'm', mark: true }] },
    ];
    editor.selection = null;
    expect(moveSelectionOutOfMarkLeaf(editor)).toBe(false);
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(moveSelectionOutOfMarkLeaf(editor)).toBe(false);
  });

  it('handleTagRemoveTextOperation：空 trim 文本清 tag；全文删除占位', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [tagNode('  ')] },
    ];
    expect(
      handleTagRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: ' ' },
        vi.fn(),
      ),
    ).toBe(true);

    editor.children = [
      { type: 'paragraph', children: [tagNode('xy')] },
    ];
    expect(
      handleTagRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'xy' },
        vi.fn(),
      ),
    ).toBe(true);
  });
});

describe('codeTagLeafBehavior istanbul residual：非 tag / apply / mark 假值', () => {
  it('非 code/tag 叶返回 false；部分删除走 apply', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'plain' }] },
    ];
    const apply = vi.fn();
    expect(
      handleTagRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'p' },
        apply,
      ),
    ).toBe(false);

    editor.children = [
      { type: 'paragraph', children: [tagNode('hello')] },
    ];
    expect(
      handleTagRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'he' },
        apply,
      ),
    ).toBe(true);
    expect(apply).toHaveBeenCalled();
  });

  it('isCodeTagTextLeaf：仅 code / 仅 tag / 普通文本', () => {
    expect(isCodeTagTextLeaf({ text: 'a', code: true } as any)).toBe(true);
    expect(isCodeTagTextLeaf({ text: 'a', tag: true } as any)).toBe(true);
    expect(isCodeTagTextLeaf({ text: 'a' } as any)).toBe(false);
  });
});
