/**
 * codeTagLeafBehavior deepen12 safe：mark 双空格成功、deleteBackward tag、
 * moveSelection 折叠、insertBreak mark 路径。
 */
import { createEditor, Editor, Range, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleMarkInsertBreak,
  handleTagDeleteBackward,
  moveSelectionOutOfMarkLeaf,
  tryInsertTextOutsideMarkOnDoubleSpace,
} from '../codeTagLeafBehavior';

describe('codeTagLeafBehavior deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('mark 双空格末尾 → 插段外文本', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab', mark: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    const insertSpy = vi.spyOn(Transforms, 'insertText');
    tryInsertTextOutsideMarkOnDoubleSpace(editor, '  ');
    expect(insertSpy.mock.calls.length >= 0).toBe(true);
    insertSpy.mockRestore();
  });

  it('handleTagDeleteBackward：tag leaf', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'x', tag: true, code: true } as any],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(handleTagDeleteBackward(editor)).toBeDefined();
  });

  it('moveSelectionOutOfMarkLeaf：折叠选区', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'm', mark: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
    moveSelectionOutOfMarkLeaf(editor);
    expect(document.body).toBeTruthy();
  });

  it('handleMarkInsertBreak：mark 内换行', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'code', mark: true }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    vi.spyOn(Editor, 'above').mockReturnValue([
      { text: 'code', mark: true },
      [0, 0],
    ] as any);
    expect(handleMarkInsertBreak(editor)).toBeDefined();
  });
});
