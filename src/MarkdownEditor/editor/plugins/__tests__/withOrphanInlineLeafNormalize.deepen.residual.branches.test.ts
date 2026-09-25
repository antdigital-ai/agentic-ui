/**
 * withOrphanInlineLeafNormalize deepen：孤儿 mark / tag 装饰清理。
 */
import { createEditor, Editor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withOrphanInlineLeafNormalize } from '../withOrphanInlineLeafNormalize';

describe('withOrphanInlineLeafNormalize deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空文本带 mark 时 unset mark 装饰', () => {
    const editor = withOrphanInlineLeafNormalize(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '', mark: true, markColor: '#f00' }],
      },
    ] as any;
    Editor.normalize(editor, { force: true });
    const leaf = (editor.children[0] as any).children[0];
    expect(leaf.mark).toBeUndefined();
  });

  it('空文本带 tag+code 时 unset 并插入空格', () => {
    const editor = withOrphanInlineLeafNormalize(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '', tag: true, code: true }],
      },
    ] as any;
    Editor.normalize(editor, { force: true });
    const leaf = (editor.children[0] as any).children[0];
    expect(leaf.tag).toBeUndefined();
    expect(leaf.text.length).toBeGreaterThan(0);
  });
});
