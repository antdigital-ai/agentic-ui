/**
 * cardPluginBehavior residual：ensureNonEmpty、getCardSlotParent、findCard。
 */
import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import {
  ensureNonEmptyEditor,
  findCardForCardAfterInner,
  getCardSlotParent,
  isCardSlotElement,
  safeGetNode,
  safeParentPath,
} from '../cardPluginBehavior';

describe('cardPluginBehavior residual branches', () => {
  it('ensureNonEmptyEditor：空 children 插入段落；已有内容不改', () => {
    const empty = createEditor();
    empty.children = [];
    ensureNonEmptyEditor(empty);
    expect(empty.children.length).toBe(1);
    expect((empty.children[0] as any).type).toBe('paragraph');

    const filled = createEditor();
    filled.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    ensureNonEmptyEditor(filled);
    expect(filled.children).toHaveLength(1);
  });

  it('isCardSlotElement：card-before / card-after / 其它', () => {
    expect(
      isCardSlotElement({ type: 'card-before', children: [{ text: '' }] }),
    ).toBe(true);
    expect(
      isCardSlotElement({ type: 'card-after', children: [{ text: '' }] }),
    ).toBe(true);
    expect(
      isCardSlotElement({ type: 'paragraph', children: [{ text: '' }] }),
    ).toBe(false);
  });

  it('getCardSlotParent / findCardForCardAfterInner 边界', () => {
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

    expect(getCardSlotParent(editor, [])).toBeNull();
    expect(getCardSlotParent(editor, [0, 0, 0])).toBeTruthy();

    expect(findCardForCardAfterInner(editor, [])).toBeNull();
    expect(findCardForCardAfterInner(editor, [0, 2, 0])).toMatchObject({
      cardPath: [0],
      cardAfterPath: [0, 2],
    });
    expect(findCardForCardAfterInner(editor, [0, 1, 0])).toBeTruthy();

    expect(safeParentPath(null as any)).toBeNull();
    expect(safeGetNode(editor, null)).toBeNull();
  });

});
