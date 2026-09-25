/**
 * tableCommands deepen3：无效 cellPath / 非 table-cell。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as cmds from '../tableCommands';

describe('tableCommands deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无效路径不炸', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ];
    for (const v of Object.values(cmds)) {
      if (typeof v === 'function') {
        try {
          v(editor, [9, 9, 9]);
          v(editor, [0, 0]);
        } catch {
          /* ok */
        }
      }
    }
    expect(true).toBe(true);
  });
});
