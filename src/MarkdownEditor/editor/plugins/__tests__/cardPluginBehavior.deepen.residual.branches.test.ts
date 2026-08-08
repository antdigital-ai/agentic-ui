/**
 * cardPluginBehavior deepen residual：非 collapsed 删、redirect 失败、
 * parent 缺失、contentIndex 边界。
 */
import { createEditor, Node, Range, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import * as cardPluginBehavior from '../cardPluginBehavior';
import {
  findCardForCardAfterInner,
  getCardSlotParent,
  handleCardDeleteBackward,
  handleCardInsertNodeOperation,
  redirectCardAfterFragment,
  redirectCardAfterNode,
  redirectCardAfterText,
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

describe('cardPluginBehavior deepen residual branches', () => {
  it('handleCardDeleteBackward：展开选区 / 无效 range 返回 false', () => {
    const editor = createEditor();
    editor.children = [cardWithContent()];
    editor.selection = {
      anchor: { path: [0, 2, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 1 },
    };
    expect(
      handleCardDeleteBackward(editor, 'character', vi.fn()),
    ).toBe(false);

    editor.selection = {
      anchor: { path: [0, 2, 0], offset: 0 },
      focus: { path: [0, 2, 0], offset: 0 },
    };
    vi.spyOn(Range, 'isCollapsed').mockReturnValue(false);
    expect(
      handleCardDeleteBackward(editor, 'character', vi.fn()),
    ).toBe(false);
    vi.restoreAllMocks();
  });

  it('getCardSlotParent：parentPath 存在但节点缺失返回 null', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    vi.spyOn(Node, 'get').mockImplementation(() => {
      throw new Error('missing');
    });
    expect(getCardSlotParent(editor, [0, 0])).toBeNull();
    vi.restoreAllMocks();
  });

  it('findCardForCardAfterInner：cardAfterPath 为空返回 null', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    expect(findCardForCardAfterInner(editor, [0])).toBeNull();
  });

  it('redirectCardAfter* 非 card-after 内路径均返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    expect(redirectCardAfterText(editor, [0, 0], 't')).toBe(false);
    expect(redirectCardAfterFragment(editor, [0, 0], [])).toBe(false);
    expect(
      redirectCardAfterNode(editor, [0, 0], {
        type: 'paragraph',
        children: [{ text: 'n' }],
      }),
    ).toBe(false);
  });

  it('tryHandleCardInsertText：card-after redirect 失败时仍走 insertText', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ type: 'card-after', children: [{ text: '' }] }],
      },
    ];
    Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
    const insertText = vi.fn();
    const redirectSpy = vi
      .spyOn(cardPluginBehavior, 'redirectCardAfterText')
      .mockReturnValue(false);
    expect(tryHandleCardInsertText(editor, 'x', insertText)).toBe(true);
    expect(insertText).toHaveBeenCalledWith('x');
    redirectSpy.mockRestore();
  });

  it('tryHandleCardInsertFragment：card-after redirect 失败时走 insertFragment', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ type: 'card-after', children: [{ text: '' }] }],
      },
    ];
    Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
    const insertFragment = vi.fn();
    const redirectSpy = vi
      .spyOn(cardPluginBehavior, 'redirectCardAfterFragment')
      .mockReturnValue(false);
    expect(
      tryHandleCardInsertFragment(
        editor,
        [{ type: 'paragraph', children: [{ text: 'f' }] }],
        insertFragment,
      ),
    ).toBe(true);
    expect(insertFragment).toHaveBeenCalled();
    redirectSpy.mockRestore();
  });

  it('handleCardInsertNodeOperation：card-after 无 parentPath 时返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    const redirectSpy = vi
      .spyOn(cardPluginBehavior, 'redirectCardAfterNode')
      .mockReturnValue(false);
    vi.spyOn(cardPluginBehavior, 'safeParentPath').mockReturnValue(null);
    const op = {
      type: 'insert_node' as const,
      path: [0, 0],
      node: { type: 'card-after', children: [{ text: '' }] },
    };
    expect(handleCardInsertNodeOperation(editor, op)).toBe(false);
    redirectSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('handleCardDeleteBackward：card-after 在 index 0 时 contentIndex<0 移除 card', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'card',
        children: [
          { type: 'card-after', children: [{ text: '' }] },
          { type: 'card-before', children: [{ text: '' }] },
        ],
      },
    ];
    Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
    const deleteBackward = vi.fn();
    expect(handleCardDeleteBackward(editor, 'character', deleteBackward)).toBe(
      true,
    );
    expect(editor.children.length).toBe(1);
    expect((editor.children[0] as { type: string }).type).toBe('paragraph');
    expect(deleteBackward).not.toHaveBeenCalled();
  });
});
