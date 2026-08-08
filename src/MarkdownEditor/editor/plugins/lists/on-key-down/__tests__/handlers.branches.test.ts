import { describe, expect, it, vi } from 'vitest';
import {
  onBackspaceDecreaseListDepth,
  onEnterEscapeFromEmptyList,
  onEnterSplitNonEmptyList,
  onShiftTabDecreaseListDepth,
  onTabIncreaseListDepth,
} from '../handlers';

vi.mock('../../ListsEditor', () => ({ ListsEditor: { getListsSchema: vi.fn(() => undefined) } }));

describe('list key handlers early returns', () => {
  const event = { nativeEvent: new KeyboardEvent('keydown'), preventDefault: vi.fn(), shiftKey: false } as any;

  it('returns false for every key when no list schema is registered', () => {
    const editor = {} as any;
    expect(onTabIncreaseListDepth(editor, event)).toBe(false);
    expect(onShiftTabDecreaseListDepth(editor, event)).toBe(false);
    expect(onBackspaceDecreaseListDepth(editor, event)).toBe(false);
    expect(onEnterEscapeFromEmptyList(editor, event)).toBe(false);
    expect(onEnterSplitNonEmptyList(editor, event)).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
