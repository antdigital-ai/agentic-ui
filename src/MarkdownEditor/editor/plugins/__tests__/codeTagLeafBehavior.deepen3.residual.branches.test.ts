/**
 * codeTagLeafBehavior deepen3：text ?? ''、afterText ??、mark 非 Text、
 * 末尾非空格、triggerText 空。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleMarkRemoveTextOperation,
  handleTagDeleteBackward,
  moveSelectionOutOfMarkLeaf,
  tryInsertTextOutsideMarkOnDoubleSpace,
  tryInsertTextOutsideTagOnDoubleSpace,
} from '../codeTagLeafBehavior';

describe('codeTagLeafBehavior deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('moveSelectionOutOfMarkLeaf：text/afterText undefined → ??', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: undefined as any, mark: true }, { text: 'x' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(() => moveSelectionOutOfMarkLeaf(editor)).not.toThrow();
  });

  it('handleMarkRemove：非 Text/无 mark 早退', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab' }] },
    ] as any;
    const apply = vi.fn();
    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'a' },
        apply,
      ),
    ).toBe(false);
  });

  it('双空格：叶末非空格 → 不插入外逃', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab', mark: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, '  ')).toBe(false);
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, '  ')).toBe(false);
  });

  it('tag 删除：triggerText 空串替换', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          {
            text: 'hello',
            tag: true,
            code: true,
            triggerText: '',
          },
        ],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    };
    expect(() => handleTagDeleteBackward(editor)).not.toThrow();
  });
});
