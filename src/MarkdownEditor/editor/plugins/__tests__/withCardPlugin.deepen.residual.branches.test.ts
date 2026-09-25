/**
 * withCardPlugin deepen：insertText/insertFragment 未处理时走原实现。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withCardPlugin } from '../withCardPlugin';

vi.mock('../cardPluginBehavior', () => ({
  collectCardPathsForTextOperation: () => [],
  handleCardDeleteBackward: () => false,
  handleCardInsertNodeOperation: () => false,
  handleCardRemoveNodeOperation: () => false,
  pruneEmptyCardsAtPaths: vi.fn(),
  tryHandleCardInsertFragment: () => false,
  tryHandleCardInsertText: () => false,
}));

describe('withCardPlugin deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('未拦截时 insertText / insertFragment / deleteBackward 透传', () => {
    const base = createEditor();
    base.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    const insertText = vi.fn();
    const insertFragment = vi.fn();
    const deleteBackward = vi.fn();
    base.insertText = insertText;
    base.insertFragment = insertFragment;
    base.deleteBackward = deleteBackward;
    const editor = withCardPlugin(base);
    editor.insertText('a');
    editor.insertFragment([{ text: 'b' }] as any);
    editor.deleteBackward('character');
    expect(insertText).toHaveBeenCalledWith('a');
    expect(insertFragment).toHaveBeenCalled();
    expect(deleteBackward).toHaveBeenCalledWith('character');
  });
});
