/**
 * editorUtils deepen7 safe：静态方法轻量矩阵。
 * editorUtils.more.residual hang-quarantined；勿复活。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils } from '../editorUtils';

describe('EditorUtils deepen7 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('isFormatActive / toggleFormat 无选区', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'abc' }] }];
    editor.selection = null;
    expect(EditorUtils.isFormatActive(editor, 'bold')).toBe(false);
    expect(() => EditorUtils.toggleFormat(editor, 'bold')).not.toThrow();
  });

  it('有选区 toggle bold/italic/code', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'abc' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };
    expect(() => EditorUtils.toggleFormat(editor, 'bold')).not.toThrow();
    expect(() => EditorUtils.toggleFormat(editor, 'italic')).not.toThrow();
    expect(() => EditorUtils.toggleFormat(editor, 'code')).not.toThrow();
  });

  it('isPrevious / isNextPath / isDirtLeaf / isTop', () => {
    expect(EditorUtils.isPrevious([0, 0], [0, 1])).toBe(true);
    expect(EditorUtils.isPrevious([0, 1], [0, 0])).toBe(false);
    expect(EditorUtils.isNextPath([0, 1], [0, 0])).toBe(true);
    expect(EditorUtils.isNextPath([0, 0], [0, 1])).toBe(false);
    expect(EditorUtils.isDirtLeaf({ text: 'a', bold: true } as any)).toBe(true);
    expect(EditorUtils.isDirtLeaf({ text: 'a' } as any)).toBeFalsy();

    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      {
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
      },
    ];
    expect(EditorUtils.isTop(editor, [0])).toBe(true);
    expect(EditorUtils.isTop(editor, [1, 0])).toBe(false);
  });

  it('createMediaNode / copy / hasPath / coalesceRoot', () => {
    expect(EditorUtils.createMediaNode('https://x/a.png', 'image')).toBeTruthy();
    expect(EditorUtils.createMediaNode('https://x/a.mp4', 'video')).toBeTruthy();
    expect(EditorUtils.copy({ a: 1 })).toEqual({ a: 1 });

    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    expect(EditorUtils.hasPath(editor, [0])).toBe(true);
    expect(EditorUtils.hasPath(editor, [9])).toBe(false);
    expect(
      EditorUtils.coalesceRootAllEmptyParagraphs([
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ] as any),
    ).toHaveLength(1);
  });

  it('safeDeselect / checkEnd（blur 需 DOM，跳过）', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ];
    editor.selection = null;
    expect(() => EditorUtils.safeDeselect(editor)).not.toThrow();
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(EditorUtils.checkEnd(editor)).toBeTypeOf('boolean');
    expect(EditorUtils.checkSelEnd(editor, [1])).toBeTypeOf('boolean');
  });
});

