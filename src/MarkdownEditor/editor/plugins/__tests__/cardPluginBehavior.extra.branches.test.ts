import { describe, expect, it } from 'vitest';
import {
  handleCardDeleteBackward,
  isCardSlotElement,
  safeGetNode,
  safeParentPath,
} from '../cardPluginBehavior';
import { createEditor } from 'slate';

describe('cardPluginBehavior 额外分支', () => {
  it('isCardSlotElement 非元素 / 无 type', () => {
    expect(isCardSlotElement(undefined)).toBe(false);
    expect(isCardSlotElement({ children: [] } as any)).toBe(false);
  });

  it('safeGetNode / safeParentPath 无效 path', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    expect(safeGetNode(editor, [9, 9])).toBeNull();
    expect(safeParentPath([])).toBeNull();
    expect(safeParentPath([0])).toEqual([]);
  });

  it.skip('handleCardDeleteBackward 非 card 选区返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(handleCardDeleteBackward(editor)).toBe(false);
  });
});
