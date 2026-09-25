/**
 * miss 2–10 long-tail residual：unwrapList / ime / plugin utils / media 早退。
 */
import { createEditor } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { unwrapList } from '../../plugins/lists/transformations/unwrapList';
import { clearCardAreaText, hasRange, isCardEmpty } from '../../plugins/utils';
import {
  isImeComposing,
  resetImeEnterCommitGuardForTests,
} from '../isImeComposing';
import { getRemoteMediaType } from '../media';

describe('miss2-10 longtail residual — unwrap / ime / utils / media', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    resetImeEnterCommitGuardForTests();
  });

  it('unwrapList：无 selection', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = null;
    expect(unwrapList(editor as any, {} as any)).toBe(false);
  });

  it('isImeComposing：keyCode 229', () => {
    expect(
      isImeComposing({
        key: 'Process',
        keyCode: 229,
        nativeEvent: {},
      } as any),
    ).toBe(true);
    expect(
      isImeComposing({
        key: 'a',
        keyCode: 65,
        nativeEvent: { isComposing: false },
      } as any),
    ).toBe(false);
  });

  it('hasRange / isCardEmpty / clearCardAreaText 边界', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: '' }] },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as any;
    expect(
      hasRange(editor as any, {
        anchor: { path: [0], offset: 0 },
        focus: { path: [0], offset: 0 },
      }),
    ).toBe(true);
    expect(
      hasRange(editor as any, {
        anchor: { path: [9], offset: 0 },
        focus: { path: [0], offset: 0 },
      }),
    ).toBe(false);
    expect(isCardEmpty(null)).toBe(false);
    expect(isCardEmpty({ type: 'paragraph' })).toBe(false);
    expect(isCardEmpty(editor.children[0])).toBe(true);
    expect(() => clearCardAreaText(editor as any, [0])).not.toThrow();
    expect(() => clearCardAreaText(editor as any, [9])).not.toThrow();
  });

  it('getRemoteMediaType：content-type 空串', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => '' },
      }),
    );
    const t = await getRemoteMediaType('https://ex.com/no-type');
    expect(t === 'other' || t === '' || t === null).toBe(true);
  });
});
