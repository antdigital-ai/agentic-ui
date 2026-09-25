/**
 * taskList deepen2：路径上非 Element 早退。
 */
import { createEditor, Node } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { syncListMetadataForMode } from '../taskList';

describe('taskList deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('路径指向 text 节点时跳过', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ];
    expect(() =>
      syncListMetadataForMode(editor, 'ordered', [[0, 0]]),
    ).not.toThrow();
    const n = Node.get(editor, [0, 0]);
    expect(n).toBeTruthy();
  });
});
