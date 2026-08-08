/**
 * unwrapList deepen2：空 selection 早退。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { unwrapList } from '../unwrapList';

describe('unwrapList deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 selection 安全返回', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = null;
    expect(() => unwrapList(editor, agenticListsSchema)).not.toThrow();
  });
});
