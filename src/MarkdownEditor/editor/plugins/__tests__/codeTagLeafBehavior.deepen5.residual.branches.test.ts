/**
 * codeTagLeafBehavior deepen5：双空格非 mark、deleteBackward 非 tag、
 * moveSelection 非折叠、insertBreak 非 mark。
 */
import { createEditor, Editor, Range } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleMarkInsertBreak,
  handleTagDeleteBackward,
  moveSelectionOutOfMarkLeaf,
  tryInsertTextOutsideMarkOnDoubleSpace,
} from '../codeTagLeafBehavior';

describe('codeTagLeafBehavior deepen5 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('双空格：非 mark / 非折叠 / 非末尾 返回 false', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, '  ')).toBe(false);

    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab', mark: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, '  ')).toBe(false);

    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, '  ')).toBe(false);
  });

  it('双空格：mark 末尾尝试插入外部空格', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab', mark: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(() =>
      tryInsertTextOutsideMarkOnDoubleSpace(editor, '  '),
    ).not.toThrow();
  });

  it('tag deleteBackward：非 tag / 非折叠返回 false；tag 处理', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(handleTagDeleteBackward(editor)).toBe(false);

    editor.children = [
      { type: 'paragraph', children: [{ text: 'tag', tag: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };
    expect(handleTagDeleteBackward(editor)).toBe(false);

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(() => handleTagDeleteBackward(editor)).not.toThrow();
  });

  it('moveSelectionOutOfMarkLeaf：无选区 / 非折叠', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'm', mark: true }] },
    ] as any;
    editor.selection = null;
    expect(() => moveSelectionOutOfMarkLeaf(editor)).not.toThrow();

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(Range.isCollapsed(editor.selection)).toBe(false);
    expect(() => moveSelectionOutOfMarkLeaf(editor)).not.toThrow();
  });

  it('handleMarkInsertBreak：非 mark 返回 false；mark 插入', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(handleMarkInsertBreak(editor)).toBe(false);

    editor.children = [
      { type: 'paragraph', children: [{ text: 'm', mark: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    vi.spyOn(Editor, 'leaf').mockReturnValue([
      { text: 'm', mark: true },
      [0, 0],
    ] as any);
    expect(() => handleMarkInsertBreak(editor)).not.toThrow();
  });
});
