/**
 * plugins/utils：hasRange / isCardEmpty / clearCardAreaText 分支。
 */
import { createEditor } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearCardAreaText, hasRange, isCardEmpty } from '../utils';

describe('plugins/utils branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hasRange：双 path 均存在才为 true', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a' }] }] as any;
    expect(
      hasRange(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      }),
    ).toBe(true);
    expect(
      hasRange(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [9, 0], offset: 0 },
      }),
    ).toBe(false);
  });

  it('isCardEmpty：非 card / 无内容 / atomic / 空文本 / trim 空', () => {
    expect(isCardEmpty(null)).toBe(false);
    expect(isCardEmpty({ type: 'paragraph' })).toBe(false);
    expect(isCardEmpty({ type: 'card' })).toBe(false);

    expect(
      isCardEmpty({
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      }),
    ).toBe(true);

    expect(
      isCardEmpty({
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          { type: 'image', children: [{ text: '' }] },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      }),
    ).toBe(false);

    expect(
      isCardEmpty({
        type: 'card',
        children: [{ type: 'paragraph', children: [] }],
      }),
    ).toBe(true);

    expect(
      isCardEmpty({
        type: 'card',
        children: [
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      }),
    ).toBe(true);

    expect(
      isCardEmpty({
        type: 'card',
        children: [
          { type: 'paragraph', children: [{ text: '  ' }] },
        ],
      }),
    ).toBe(true);

    expect(
      isCardEmpty({
        type: 'card',
        children: [
          { type: 'paragraph', children: [{ text: 'x' }] },
        ],
      }),
    ).toBe(false);

    expect(
      isCardEmpty({
        type: 'card',
        children: [{ type: 'code', children: [{ text: '' }] }],
      }),
    ).toBe(false);
  });

  it('clearCardAreaText：无效 path / DOM 失败均不抛', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    expect(() => clearCardAreaText(editor, [99])).not.toThrow();
    expect(() => clearCardAreaText(editor, [0])).not.toThrow();
  });
});
