import { describe, expect, it, vi } from 'vitest';
import { unwrapList } from '../unwrapList';
import { decreaseListItemDepth } from '../decreaseListItemDepth';

vi.mock('../../lib', () => ({
  getListItems: vi.fn(() => []),
  getParentList: vi.fn(() => undefined),
  getParentListItem: vi.fn(),
  getListType: vi.fn(),
}));

describe('list unwrap and depth residual early paths', () => {
  it('returns false without a selection', () => {
    expect(unwrapList({ selection: null } as any, {} as any)).toBe(false);
  });

  it('returns false when a list item has no parent list', () => {
    expect(decreaseListItemDepth({} as any, {} as any, [0, 0])).toBe(false);
  });

  it('unwrapList：显式 at=null 早退', () => {
    expect(
      unwrapList(
        { selection: { anchor: {}, focus: {} } } as any,
        {} as any,
        null,
      ),
    ).toBe(false);
  });
});
