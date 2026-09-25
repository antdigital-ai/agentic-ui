/**
 * plugins/utils deepen：clearCardAreaText 外层失败；isCardEmpty trim 空。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCardAreaText, isCardEmpty } from '../utils';

describe('plugins/utils deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('clearCardAreaText：无效 path 吞掉错误', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hi' }] },
    ] as any;
    expect(() => clearCardAreaText(editor, [99, 0] as any)).not.toThrow();
    expect(() => clearCardAreaText(editor, [0])).not.toThrow();
  });

  it('isCardEmpty：无 children 字段 / 空 trim 文本', () => {
    expect(isCardEmpty({ type: 'card', children: null } as any)).toBe(false);
    expect(
      isCardEmpty({
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: '  ' }, { text: '' }] },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      }),
    ).toBe(true);
  });
});
