/**
 * cardPluginBehavior deepen2：prune 非空跳过、remove card-before 非 card parent、
 * insert redirect 成功、slot 缺失早退、deleteBackward hasPath 失败。
 */
import { createEditor, Editor, Node, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleCardDeleteBackward,
  handleCardInsertNodeOperation,
  handleCardRemoveNodeOperation,
  pruneEmptyCardsAtPaths,
  tryHandleCardInsertFragment,
  tryHandleCardInsertText,
} from '../cardPluginBehavior';

const cardWithContent = (body = 'body') => ({
  type: 'card' as const,
  children: [
    { type: 'card-before' as const, children: [{ text: '' }] },
    { type: 'paragraph' as const, children: [{ text: body }] },
    { type: 'card-after' as const, children: [{ text: '' }] },
  ],
});

describe('cardPluginBehavior deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('pruneEmptyCardsAtPaths：非空 card 不删除', () => {
    const editor = createEditor();
    editor.children = [cardWithContent('keep')];
    pruneEmptyCardsAtPaths(editor, [[0]]);
    expect((editor.children[0] as { type: string }).type).toBe('card');
    expect(Node.string(editor.children[0])).toContain('keep');
  });

  it('handleCardRemoveNodeOperation：card-before 父非 card 时 apply 原 op', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ type: 'card-before', children: [{ text: '' }] }],
      },
    ];
    const apply = vi.fn();
    const op = {
      type: 'remove_node' as const,
      path: [0, 0],
      node: { type: 'card-before', children: [{ text: '' }] },
    };
    expect(handleCardRemoveNodeOperation(editor, op, apply)).toBe(true);
    expect(apply).toHaveBeenCalledWith(op);
  });

  it('handleCardRemoveNodeOperation：父 card 非空时返回 false', () => {
    const editor = createEditor();
    editor.children = [cardWithContent()];
    const apply = vi.fn();
    const op = {
      type: 'remove_node' as const,
      path: [0, 1, 0],
      node: { text: 'body' },
    };
    expect(handleCardRemoveNodeOperation(editor, op, apply)).toBe(false);
    expect(apply).not.toHaveBeenCalled();
  });

  it('handleCardInsertNodeOperation：card-after 真实 redirect 成功', () => {
    const editor = createEditor();
    editor.children = [cardWithContent(), { type: 'paragraph', children: [{ text: '' }] }];
    const op = {
      type: 'insert_node' as const,
      path: [0, 2, 0],
      node: { type: 'paragraph', children: [{ text: 'n' }] },
    };
    expect(handleCardInsertNodeOperation(editor, op)).toBe(true);
    expect(editor.children.length).toBeGreaterThanOrEqual(2);
  });

  it('handleCardInsertNodeOperation：redirect 失败且有 parentPath 则 insertNodes', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ type: 'card-after', children: [{ text: '' }] }],
      },
    ];
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    const op = {
      type: 'insert_node' as const,
      path: [0, 0, 0],
      node: { type: 'paragraph', children: [{ text: 'n' }] },
    };
    expect(handleCardInsertNodeOperation(editor, op)).toBe(true);
    expect(insertSpy).toHaveBeenCalled();
  });

  it('tryHandleCardInsert*：parent 不可达时返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = null;
    expect(tryHandleCardInsertText(editor, 'a', vi.fn())).toBe(false);
    expect(tryHandleCardInsertFragment(editor, [], vi.fn())).toBe(false);

    Transforms.select(editor, { path: [0, 0], offset: 0 });
    vi.spyOn(Editor, 'hasPath').mockReturnValue(false);
    expect(tryHandleCardInsertText(editor, 'a', vi.fn())).toBe(false);
    expect(tryHandleCardInsertFragment(editor, [], vi.fn())).toBe(false);
  });

  it('handleCardDeleteBackward：hasPath false 时移除 card；非 card 父走 deleteBackward', () => {
    const editor = createEditor();
    editor.children = [cardWithContent()];
    Transforms.select(editor, { path: [0, 2, 0], offset: 0 });
    const deleteBackward = vi.fn();
    vi.spyOn(Editor, 'hasPath').mockImplementation((ed, path) => {
      // content path [0, 1] 报告不存在，迫使走 remove card 分支
      if (Array.isArray(path) && path.length === 2 && path[1] === 1) {
        return false;
      }
      return true;
    });
    expect(handleCardDeleteBackward(editor, 'character', deleteBackward)).toBe(
      true,
    );
    vi.restoreAllMocks();

    editor.children = [
      {
        type: 'paragraph',
        children: [{ type: 'card-after', children: [{ text: '' }] }],
      },
    ];
    Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
    expect(handleCardDeleteBackward(editor, 'character', deleteBackward)).toBe(
      true,
    );
    expect(deleteBackward).toHaveBeenCalled();
  });

  it('tryHandleCardInsertText：card-before 吞掉输入', () => {
    const editor = createEditor();
    editor.children = [cardWithContent()];
    Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
    const insertText = vi.fn();
    expect(tryHandleCardInsertText(editor, 'x', insertText)).toBe(true);
    expect(insertText).not.toHaveBeenCalled();
  });
});
