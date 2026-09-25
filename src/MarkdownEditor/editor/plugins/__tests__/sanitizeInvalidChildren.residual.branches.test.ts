/**
 * sanitizeInvalidChildrenBehavior residual：空洞数组、rebuild、compact。
 */
import { createEditor, Text } from 'slate';
import { describe, expect, it } from 'vitest';
import {
  childArrayHasInvalidEntries,
  compactEditorRootChildren,
  createDefaultBlock,
  getChildList,
  isValidChild,
  rebuildElement,
  rebuildOrDefaultBlock,
  runWithoutHistory,
} from '../sanitizeInvalidChildrenBehavior';

describe('sanitizeInvalidChildrenBehavior residual branches', () => {
  it('isValidChild / childArrayHasInvalidEntries', () => {
    expect(isValidChild(undefined)).toBe(false);
    expect(isValidChild(null)).toBe(false);
    expect(isValidChild({ text: '' })).toBe(true);
    expect(isValidChild({ type: 'paragraph', children: [{ text: '' }] })).toBe(
      true,
    );

    expect(childArrayHasInvalidEntries([{ text: 'a' }])).toBe(false);
    const sparse: unknown[] = [];
    sparse[1] = { text: 'b' };
    expect(childArrayHasInvalidEntries(sparse)).toBe(true);
    expect(childArrayHasInvalidEntries([undefined as any])).toBe(true);
  });

  it('getChildList / rebuildElement / rebuildOrDefaultBlock', () => {
    expect(getChildList({ text: 't' } as any)).toEqual([]);
    expect(getChildList({ type: 'p', children: 'bad' } as any)).toEqual([]);
    expect(
      getChildList({ type: 'p', children: [{ text: 'x' }] } as any),
    ).toHaveLength(1);

    const rebuilt = rebuildElement({
      type: 'paragraph',
      children: [null, { text: 'ok' }],
    } as any);
    expect(rebuilt.children).toEqual([{ text: 'ok' }]);

    const emptyKids = rebuildElement({
      type: 'head',
      children: [],
    } as any);
    expect(emptyKids.children).toEqual([{ text: '' }]);

    expect(Text.isText(rebuildOrDefaultBlock({ text: 'x' }) as any)).toBe(
      false,
    );
    expect((rebuildOrDefaultBlock('bad') as any).type).toBe('paragraph');
    expect(
      (rebuildOrDefaultBlock({ type: 'code', children: [] }) as any).type,
    ).toBe('code');
    expect(createDefaultBlock().type).toBe('paragraph');
  });

  it('compactEditorRootChildren / runWithoutHistory', () => {
    const sparse: unknown[] = [];
    sparse[0] = { type: 'paragraph', children: [{ text: 'a' }] };
    sparse[2] = null;
    const compacted = compactEditorRootChildren(sparse);
    expect(compacted.length).toBeGreaterThanOrEqual(1);

    const editor = createEditor();
    let ran = false;
    runWithoutHistory(editor, () => {
      ran = true;
    });
    expect(ran).toBe(true);
  });
});
