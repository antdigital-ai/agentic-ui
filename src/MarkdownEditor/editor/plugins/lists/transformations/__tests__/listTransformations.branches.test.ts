import { describe, expect, it } from 'vitest';
import { setListType } from '../setListType';
import { unwrapList } from '../unwrapList';

describe('list transformation residual branches', () => {
  it('returns false when no selection is available', () => {
    const editor = { selection: null } as any;
    expect(setListType(editor, {} as any, 'bulleted-list' as any)).toBe(false);
    expect(unwrapList(editor, {} as any)).toBe(false);
  });
});
