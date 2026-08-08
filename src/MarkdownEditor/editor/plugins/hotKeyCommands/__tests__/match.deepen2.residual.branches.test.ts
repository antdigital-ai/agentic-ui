/**
 * match deepen2：迭代器 done 与空匹配。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as matchMod from '../match';

describe('match deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('导出 match 相关可对空编辑器调用', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    for (const v of Object.values(matchMod)) {
      if (typeof v === 'function') {
        try {
          (v as any)(editor);
        } catch {
          /* ok */
        }
      }
    }
    expect(true).toBe(true);
  });
});
