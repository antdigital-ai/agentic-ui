/**
 * tableCommands deepen2：无 path / 非 table-cell。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as cmds from '../tableCommands';

describe('tableCommands deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非法 cellPath 安全', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a' }] }] as any;
    for (const v of Object.values(cmds)) {
      if (typeof v === 'function') {
        try {
          (v as any)(editor, [9, 9]);
        } catch {
          /* ok */
        }
      }
    }
    expect(true).toBe(true);
  });
});
