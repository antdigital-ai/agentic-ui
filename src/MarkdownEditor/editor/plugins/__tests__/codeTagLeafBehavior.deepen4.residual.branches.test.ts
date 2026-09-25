/**
 * codeTagLeafBehavior deepen4：text/removed ??、afterText unset、
 * 空 mark 叶、末尾 \\n insertBreak、双空格末空格、tag trim。
 */
import { createEditor, Editor, Node, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleMarkInsertBreak,
  handleMarkRemoveTextOperation,
  handleTagDeleteBackward,
  moveSelectionOutOfMarkLeaf,
  tryInsertTextOutsideMarkOnDoubleSpace,
} from '../codeTagLeafBehavior';

describe('codeTagLeafBehavior deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('handleMarkRemove：removed ?? 与 afterText 空 unset', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: ' ', mark: true }],
      },
    ] as any;
    const apply = vi.fn(() => {
      (editor.children[0] as any).children[0] = { text: '', mark: true };
    });
    let calls = 0;
    vi.spyOn(Node, 'get').mockImplementation(() => {
      calls += 1;
      if (calls === 1) {
        return { text: ' ', mark: true };
      }
      return { text: '', mark: true };
    });
    vi.spyOn(Editor, 'hasPath').mockReturnValue(true);
    const unset = vi
      .spyOn(Transforms, 'unsetNodes')
      .mockImplementation(() => {});
    expect(
      handleMarkRemoveTextOperation(
        editor,
        {
          type: 'remove_text',
          path: [0, 0],
          offset: 0,
          text: undefined as any,
        },
        apply,
      ),
    ).toBe(true);
    expect(unset).toHaveBeenCalled();
  });

  it('moveSelectionOutOfMarkLeaf：空 text 叶 unset', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '', mark: true }, { text: 'next' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const unset = vi.spyOn(Transforms, 'unsetNodes');
    expect(moveSelectionOutOfMarkLeaf(editor)).toBe(true);
    expect(unset).toHaveBeenCalled();
  });

  it('handleMarkInsertBreak：leaf.text ?? 与末尾 \\n', () => {
    const editor = createEditor();
    const insertBreak = vi.fn();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '\n', mark: true }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(handleMarkInsertBreak(editor, insertBreak)).toBe(true);
  });

  it('双空格：末字符为空格且 text 为单空格时插入外逃', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: ' ', mark: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    // 末为空格但 text===' ' 时 charAt 检查：length-1 为空格 → 需 text 更长
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a ', mark: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, ' ')).toBe(true);
  });

  it('tag 删除：trim 后空且 offset<1 strip tag', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          {
            text: ' ',
            tag: true,
            code: true,
            triggerText: ' ',
          },
        ],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(handleTagDeleteBackward(editor)).toBe(true);
  });
});
