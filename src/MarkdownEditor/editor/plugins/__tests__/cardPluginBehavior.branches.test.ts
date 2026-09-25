/**
 * cardPluginBehavior 分支补洞：Operation 管线、fragment、deleteBackward 等路径。
 */
import { createEditor, Node, Operation, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import * as cardPluginBehavior from '../cardPluginBehavior';
import {
  collectCardPathsForTextOperation,
  ensureNonEmptyEditor,
  findCardForCardAfterInner,
  getCardSlotParent,
  handleCardDeleteBackward,
  handleCardInsertNodeOperation,
  handleCardRemoveNodeOperation,
  isCardSlotElement,
  pruneEmptyCardsAtPaths,
  redirectCardAfterFragment,
  redirectCardAfterNode,
  redirectCardAfterText,
  safeGetNode,
  safeParentPath,
  tryHandleCardInsertFragment,
  tryHandleCardInsertText,
} from '../cardPluginBehavior';

const emptyCard = () => ({
  type: 'card' as const,
  children: [
    { type: 'card-before' as const, children: [{ text: '' }] },
    { type: 'paragraph' as const, children: [{ text: '' }] },
    { type: 'card-after' as const, children: [{ text: '' }] },
  ],
});

const cardWithContent = (body = 'body') => ({
  type: 'card' as const,
  children: [
    { type: 'card-before' as const, children: [{ text: '' }] },
    { type: 'paragraph' as const, children: [{ text: body }] },
    { type: 'card-after' as const, children: [{ text: '' }] },
  ],
});

describe('cardPluginBehavior 分支覆盖', () => {
  describe('ensureNonEmptyEditor / isCardSlotElement / getCardSlotParent', () => {
    it('ensureNonEmptyEditor 在已有内容时不插入', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: 'keep' }] }];
      ensureNonEmptyEditor(editor);
      expect(editor.children.length).toBe(1);
      expect((editor.children[0] as { type: string }).type).toBe('paragraph');
    });

    it('isCardSlotElement 识别 card-before / card-after', () => {
      expect(
        isCardSlotElement({ type: 'card-before', children: [{ text: '' }] }),
      ).toBe(true);
      expect(
        isCardSlotElement({ type: 'card-after', children: [{ text: '' }] }),
      ).toBe(true);
      expect(
        isCardSlotElement({ type: 'paragraph', children: [{ text: '' }] }),
      ).toBe(false);
      expect(isCardSlotElement(null)).toBe(false);
    });

    it('getCardSlotParent 在 card slot 内返回 parent', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      const slot = getCardSlotParent(editor, [0, 0, 0]);
      expect(slot?.parentNode.type).toBe('card-before');
    });

    it('getCardSlotParent 在无效 path 时返回 null', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      expect(getCardSlotParent(editor, [])).toBeNull();
    });
  });

  describe('safeParentPath / safeGetNode', () => {
    it('空 path 返回 null', () => {
      expect(safeParentPath([])).toBeNull();
    });

    it('无效 path safeGetNode 返回 null', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      expect(safeGetNode(editor, [9, 9])).toBeNull();
    });

    it('safeGetNode 在 Node.get 抛错时返回 null', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      vi.spyOn(Node, 'get').mockImplementation(() => {
        throw new Error('missing');
      });
      expect(safeGetNode(editor, [0])).toBeNull();
      vi.restoreAllMocks();
    });
  });

  describe('findCardForCardAfterInner / redirectCardAfter*', () => {
    it('非 card-after 内路径返回 null', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
      expect(findCardForCardAfterInner(editor, [0, 0])).toBeNull();
    });

    it('redirectCardAfterText 非 card-after 返回 false', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      expect(redirectCardAfterText(editor, [0, 0], 'hi')).toBe(false);
    });

    it('redirectCardAfterText 在 card-after 插入段落并选中', () => {
      const editor = createEditor();
      editor.children = [cardWithContent()];
      expect(redirectCardAfterText(editor, [0, 2, 0], 'typed')).toBe(true);
      expect(editor.children.length).toBe(2);
      expect(
        (editor.children[1] as { children: { text: string }[] }).children[0]
          .text,
      ).toBe('typed');
    });

    it('findCardForCardAfterInner 在父节点非 card 时返回 null', () => {
      const editor = createEditor();
      editor.children = [
        {
          type: 'paragraph',
          children: [
            { type: 'card-after', children: [{ text: '' }] },
          ],
        },
      ];
      expect(findCardForCardAfterInner(editor, [0, 0, 0])).toBeNull();
    });

    it('redirectCardAfterFragment 在 card-after 插入 fragment', () => {
      const editor = createEditor();
      editor.children = [cardWithContent()];
      expect(
        redirectCardAfterFragment(editor, [0, 2, 0], [
          { type: 'paragraph', children: [{ text: 'frag' }] },
        ]),
      ).toBe(true);
      expect(editor.children.length).toBe(2);
    });

    it('redirectCardAfterNode 在 card-after 插入节点', () => {
      const editor = createEditor();
      editor.children = [cardWithContent()];
      expect(
        redirectCardAfterNode(editor, [0, 2, 0], {
          type: 'paragraph',
          children: [{ text: 'node' }],
        }),
      ).toBe(true);
      expect(editor.children.length).toBe(2);
    });
  });

  describe('collectCardPathsForTextOperation / pruneEmptyCardsAtPaths', () => {
    it('收集 card 祖先 path', () => {
      const editor = createEditor();
      editor.children = [cardWithContent('x')];
      expect(collectCardPathsForTextOperation(editor, [0, 1, 0])).toEqual([[0]]);
    });

    it('collectCardPathsForTextOperation 在 Node.get 抛错时停止遍历', () => {
      const editor = createEditor();
      editor.children = [cardWithContent('x')];
      vi.spyOn(Node, 'get').mockImplementation(() => {
        throw new Error('broken');
      });
      expect(collectCardPathsForTextOperation(editor, [0, 1, 0])).toEqual([]);
      vi.restoreAllMocks();
    });

    it('pruneEmptyCardsAtPaths 删除空 card 并补段落', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      pruneEmptyCardsAtPaths(editor, [[0]]);
      expect(editor.children.length).toBe(1);
      expect((editor.children[0] as { type: string }).type).toBe('paragraph');
    });
  });

  describe('handleCardRemoveNodeOperation', () => {
    it('删除 card 节点后 ensureNonEmptyEditor', () => {
      const editor = createEditor();
      editor.children = [cardWithContent()];
      const apply = vi.fn();
      const op: Operation = {
        type: 'remove_node',
        path: [0],
        node: editor.children[0],
      };
      expect(handleCardRemoveNodeOperation(editor, op as any, apply)).toBe(true);
      expect(apply).toHaveBeenCalledWith(op);
    });

    it('删除 card-after 时移除整个 card', () => {
      const editor = createEditor();
      editor.children = [cardWithContent()];
      const apply = vi.fn();
      const cardAfter = (editor.children[0] as { children: Node[] }).children[2];
      const op: Operation = {
        type: 'remove_node',
        path: [0, 2],
        node: cardAfter,
      };
      expect(handleCardRemoveNodeOperation(editor, op as any, apply)).toBe(true);
      expect(apply).toHaveBeenCalledWith(
        expect.objectContaining({ path: [0] }),
      );
    });

    it('删除 card-before 时移除整个 card', () => {
      const editor = createEditor();
      editor.children = [cardWithContent()];
      const apply = vi.fn();
      const cardBefore = (editor.children[0] as { children: Node[] }).children[0];
      const op: Operation = {
        type: 'remove_node',
        path: [0, 0],
        node: cardBefore,
      };
      expect(handleCardRemoveNodeOperation(editor, op as any, apply)).toBe(true);
    });

    it('删除 card-after 但父级非 card 时仅 apply 原操作', () => {
      const editor = createEditor();
      editor.children = [
        {
          type: 'paragraph',
          children: [{ type: 'card-after', children: [{ text: '' }] }],
        },
      ];
      const apply = vi.fn();
      const cardAfter = (editor.children[0] as { children: Node[] }).children[0];
      const op: Operation = {
        type: 'remove_node',
        path: [0, 0],
        node: cardAfter,
      };
      expect(handleCardRemoveNodeOperation(editor, op as any, apply)).toBe(true);
      expect(apply).toHaveBeenCalledWith(op);
    });

    it('删除 card 内子节点导致 card 为空时移除 card', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      const apply = vi.fn();
      const op: Operation = {
        type: 'remove_node',
        path: [0, 1],
        node: (editor.children[0] as { children: Node[] }).children[1],
      };
      expect(handleCardRemoveNodeOperation(editor, op as any, apply)).toBe(true);
    });

    it('非 card 相关 remove 返回 false', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
      const apply = vi.fn();
      const op: Operation = {
        type: 'remove_node',
        path: [0],
        node: editor.children[0],
      };
      expect(handleCardRemoveNodeOperation(editor, op as any, apply)).toBe(false);
    });
  });

  describe('handleCardInsertNodeOperation', () => {
    it('card-before 内 insert 被拦截', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      const op: Operation = {
        type: 'insert_node',
        path: [0, 0, 0],
        node: { text: 'x' },
      };
      expect(handleCardInsertNodeOperation(editor, op as any)).toBe(true);
    });

    it('card-after 内 insert 重定向到 card 后', () => {
      const editor = createEditor();
      editor.children = [cardWithContent()];
      const op: Operation = {
        type: 'insert_node',
        path: [0, 2, 0],
        node: { type: 'paragraph', children: [{ text: 'after' }] },
      };
      expect(handleCardInsertNodeOperation(editor, op as any)).toBe(true);
      expect(editor.children.length).toBe(2);
    });

    it('card-after 内 insert 重定向失败时在 parentPath 插入', () => {
      const editor = createEditor();
      editor.children = [cardWithContent()];
      const op: Operation = {
        type: 'insert_node',
        path: [0, 2, 0],
        node: { type: 'paragraph', children: [{ text: 'fallback' }] },
      };
      const redirectSpy = vi
        .spyOn(cardPluginBehavior, 'redirectCardAfterNode')
        .mockReturnValue(false);
      expect(handleCardInsertNodeOperation(editor, op as any)).toBe(true);
      expect(editor.children[0].children?.length).toBeGreaterThan(2);
      redirectSpy.mockRestore();
    });

    it('非 card slot insert 返回 false', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      const op: Operation = {
        type: 'insert_node',
        path: [0, 0],
        node: { text: 'x' },
      };
      expect(handleCardInsertNodeOperation(editor, op as any)).toBe(false);
    });
  });

  describe('tryHandleCardInsertText / tryHandleCardInsertFragment', () => {
    it('无 selection insertText 返回 false', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      editor.selection = null;
      expect(tryHandleCardInsertText(editor, 'x', vi.fn())).toBe(false);
    });

    it('card-before insertText 拦截且不调用 insertText', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
      const insertText = vi.fn();
      expect(tryHandleCardInsertText(editor, 'x', insertText)).toBe(true);
      expect(insertText).not.toHaveBeenCalled();
    });

    it('card-after insertText 重定向到 card 后', () => {
      const editor = createEditor();
      editor.children = [cardWithContent()];
      Transforms.select(editor, { path: [0, 2, 0], offset: 0 });
      const insertText = vi.fn();
      expect(tryHandleCardInsertText(editor, 'hello', insertText)).toBe(true);
      expect(insertText).not.toHaveBeenCalled();
      expect(editor.children.length).toBe(2);
    });

    it('展开选区 insertText 返回 false', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      editor.selection = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 1 },
      };
      expect(tryHandleCardInsertText(editor, 'x', vi.fn())).toBe(false);
    });

    it('非 card slot insertText 走默认', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      Transforms.select(editor, { path: [0, 0], offset: 0 });
      const insertText = vi.fn();
      expect(tryHandleCardInsertText(editor, 'x', insertText)).toBe(true);
      expect(insertText).toHaveBeenCalledWith('x');
    });

    it('card-after insertFragment 重定向', () => {
      const editor = createEditor();
      editor.children = [cardWithContent()];
      Transforms.select(editor, { path: [0, 2, 0], offset: 0 });
      const insertFragment = vi.fn();
      expect(
        tryHandleCardInsertFragment(
          editor,
          [{ type: 'paragraph', children: [{ text: 'f' }] }],
          insertFragment,
        ),
      ).toBe(true);
      expect(insertFragment).not.toHaveBeenCalled();
    });

    it('card-before insertFragment 拦截', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
      const insertFragment = vi.fn();
      expect(
        tryHandleCardInsertFragment(
          editor,
          [{ type: 'paragraph', children: [{ text: 'f' }] }],
          insertFragment,
        ),
      ).toBe(true);
      expect(insertFragment).not.toHaveBeenCalled();
    });

    it('card-after insertFragment 重定向失败时走 insertFragment', () => {
      const editor = createEditor();
      editor.children = [
        {
          type: 'paragraph',
          children: [{ type: 'card-after', children: [{ text: '' }] }],
        },
      ];
      Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
      const insertFragment = vi.fn();
      expect(
        tryHandleCardInsertFragment(
          editor,
          [{ type: 'paragraph', children: [{ text: 'f' }] }],
          insertFragment,
        ),
      ).toBe(true);
      expect(insertFragment).toHaveBeenCalled();
    });
  });

  describe('handleCardDeleteBackward', () => {
    it('无 selection 时返回 false', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      editor.selection = null;
      expect(
        handleCardDeleteBackward(editor, 'character', vi.fn()),
      ).toBe(false);
    });

    it('card-after 无有效 contentPath 时移除 card', () => {
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

    it('card-before 内 deleteBackward 被拦截', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
      const deleteBackward = vi.fn();
      expect(handleCardDeleteBackward(editor, 'character', deleteBackward)).toBe(
        true,
      );
      expect(deleteBackward).not.toHaveBeenCalled();
    });

    it('card-after 内 deleteBackward 选中 card 内容', () => {
      const editor = createEditor();
      editor.children = [cardWithContent('content')];
      Transforms.select(editor, { path: [0, 2, 0], offset: 0 });
      const deleteBackward = vi.fn();
      expect(handleCardDeleteBackward(editor, 'character', deleteBackward)).toBe(
        true,
      );
      expect(editor.selection?.anchor.path).toEqual([0, 1, 0]);
    });

    it('card-after 空 card deleteBackward 选中 card 正文末尾', () => {
      const editor = createEditor();
      editor.children = [emptyCard()];
      Transforms.select(editor, { path: [0, 2, 0], offset: 0 });
      const deleteBackward = vi.fn();
      expect(handleCardDeleteBackward(editor, 'character', deleteBackward)).toBe(
        true,
      );
      expect(editor.selection?.anchor.path).toEqual([0, 1, 0]);
      expect(deleteBackward).not.toHaveBeenCalled();
    });

    it('非 card slot deleteBackward 走默认', () => {
      const editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] }];
      Transforms.select(editor, { path: [0, 0], offset: 1 });
      const deleteBackward = vi.fn();
      expect(handleCardDeleteBackward(editor, 'character', deleteBackward)).toBe(
        true,
      );
      expect(deleteBackward).toHaveBeenCalledWith('character');
    });
  });
});
