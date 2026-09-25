/**
 * lists on-key-down handlers residual：无 schema / 非热键早退。
 */
import { describe, expect, it, vi } from 'vitest';
import {
  onBackspaceDecreaseListDepth,
  onEnterEscapeFromEmptyList,
  onEnterSplitNonEmptyList,
  onShiftTabDecreaseListDepth,
  onTabIncreaseListDepth,
} from '../handlers';

vi.mock('../../ListsEditor', () => ({
  ListsEditor: {
    getListsSchema: vi.fn(() => null),
  },
}));

vi.mock('../../lib', () => ({
  getListItems: vi.fn(() => []),
  isAtEmptyListItem: vi.fn(() => false),
  isDeleteBackwardAllowed: vi.fn(() => true),
}));

vi.mock('../../transformations', () => ({
  decreaseDepth: vi.fn(() => true),
  increaseDepth: vi.fn(() => true),
  splitListItem: vi.fn(() => true),
}));

const evt = (key: string, native: Partial<KeyboardEvent> = {}) =>
  ({
    preventDefault: vi.fn(),
    nativeEvent: { key, ...native },
  }) as any;

describe('lists handlers residual branches', () => {
  it('无 schema 全部返回 false', () => {
    const editor = {} as any;
    expect(onTabIncreaseListDepth(editor, evt('Tab'))).toBe(false);
    expect(onShiftTabDecreaseListDepth(editor, evt('Tab', { shiftKey: true }))).toBe(
      false,
    );
    expect(onBackspaceDecreaseListDepth(editor, evt('Backspace'))).toBe(false);
    expect(onEnterEscapeFromEmptyList(editor, evt('Enter'))).toBe(false);
    expect(onEnterSplitNonEmptyList(editor, evt('Enter'))).toBe(false);
  });
});
