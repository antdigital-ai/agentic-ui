/**
 * lists handlers more residual：有 schema 时 tab/enter/backspace 路径。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getListsSchema,
  getListItems,
  isAtEmptyListItem,
  isDeleteBackwardAllowed,
  decreaseDepth,
  increaseDepth,
  splitListItem,
} = vi.hoisted(() => ({
  getListsSchema: vi.fn(),
  getListItems: vi.fn(),
  isAtEmptyListItem: vi.fn(),
  isDeleteBackwardAllowed: vi.fn(),
  decreaseDepth: vi.fn(() => true),
  increaseDepth: vi.fn(() => true),
  splitListItem: vi.fn(() => true),
}));

vi.mock('../../ListsEditor', () => ({
  ListsEditor: { getListsSchema },
}));
vi.mock('../../lib', () => ({
  getListItems,
  isAtEmptyListItem,
  isDeleteBackwardAllowed,
}));
vi.mock('../../transformations', () => ({
  decreaseDepth,
  increaseDepth,
  splitListItem,
}));
vi.mock('is-hotkey', () => ({
  isHotkey: (combo: string, e: any) => {
    const key = (e.key || '').toLowerCase();
    if (combo === 'tab') return key === 'tab' && !e.shiftKey;
    if (combo === 'shift+tab') return key === 'tab' && !!e.shiftKey;
    if (combo === 'backspace') return key === 'backspace';
    if (combo === 'enter') return key === 'enter';
    return false;
  },
}));

import {
  onBackspaceDecreaseListDepth,
  onEnterEscapeFromEmptyList,
  onEnterSplitNonEmptyList,
  onShiftTabDecreaseListDepth,
  onTabIncreaseListDepth,
} from '../handlers';

const makeEvt = (key: string, shiftKey = false) => {
  const preventDefault = vi.fn();
  return {
    preventDefault,
    nativeEvent: { key, shiftKey },
  } as any;
};

describe('lists handlers more residual', () => {
  beforeEach(() => {
    getListsSchema.mockReturnValue({ list: true });
    getListItems.mockReturnValue([]);
    isAtEmptyListItem.mockReturnValue(false);
    isDeleteBackwardAllowed.mockReturnValue(true);
    decreaseDepth.mockClear();
    increaseDepth.mockClear();
    splitListItem.mockClear();
  });

  it('tab 增加深度；shift+tab 减少', () => {
    const editor = { selection: null } as any;
    expect(onTabIncreaseListDepth(editor, makeEvt('Tab'))).toBe(true);
    expect(increaseDepth).toHaveBeenCalled();
    expect(onShiftTabDecreaseListDepth(editor, makeEvt('Tab', true))).toBe(
      true,
    );
    expect(decreaseDepth).toHaveBeenCalled();
  });

  it('backspace 在不允许后退时 decrease', () => {
    isDeleteBackwardAllowed.mockReturnValue(false);
    const editor = {} as any;
    expect(onBackspaceDecreaseListDepth(editor, makeEvt('Backspace'))).toBe(
      true,
    );
    expect(decreaseDepth).toHaveBeenCalled();
  });

  it('enter 空项 escape；非空 split', () => {
    const editor = { selection: {} } as any;
    isAtEmptyListItem.mockReturnValue(true);
    expect(onEnterEscapeFromEmptyList(editor, makeEvt('Enter'))).toBe(true);
    expect(decreaseDepth).toHaveBeenCalled();

    isAtEmptyListItem.mockReturnValue(false);
    getListItems.mockReturnValue([{}]);
    expect(onEnterSplitNonEmptyList(editor, makeEvt('Enter'))).toBe(true);
    expect(splitListItem).toHaveBeenCalled();
  });

  it('非热键返回 false', () => {
    const editor = {} as any;
    expect(onTabIncreaseListDepth(editor, makeEvt('a'))).toBe(false);
  });
});
