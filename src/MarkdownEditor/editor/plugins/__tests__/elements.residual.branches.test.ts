/**
 * plugins/elements 残留：insertAfter、dirt leaf、导出非空。
 */
import { createEditor, Transforms } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils } from '../../utils/editorUtils';
import {
  BlockMathNodes,
  insertAfter,
  MdElements,
  TextMatchNodes,
} from '../elements';

describe('plugins/elements residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('insertAfter 默认 / 自定义', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a' }] }];
    insertAfter(editor, [0]);
    expect(editor.children.length).toBeGreaterThan(1);
    insertAfter(editor, [1], {
      type: 'hr',
      children: [{ text: '' }],
    } as any);
    expect((editor.children as any[]).some((n) => n.type === 'hr')).toBe(true);
  });

  it('link.run：dirt leaf 时仍可调用不抛', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '[a](http://x.com)' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 18 },
      focus: { path: [0, 0], offset: 18 },
    };
    const dirty = vi.spyOn(EditorUtils, 'isDirtLeaf').mockReturnValue(true);
    const match = '[a](http://x.com)'.match(MdElements.link.reg)!;
    expect(() =>
      MdElements.link.run({
        editor,
        path: [0],
        sel: editor.selection,
        match,
        el: editor.children[0] as any,
        startText: match[0],
      } as any),
    ).not.toThrow();
    dirty.mockRestore();
  });

  it('hr.run 插入分割线', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '---' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    const insertSpy = vi
      .spyOn(Transforms, 'insertNodes')
      .mockImplementation(() => {});
    const deleteSpy = vi
      .spyOn(Transforms, 'delete')
      .mockImplementation(() => {});
    const match = '---'.match(MdElements.hr.reg)!;
    expect(
      MdElements.hr.run({
        editor,
        path: [0],
        match,
        sel: editor.selection!,
        el: editor.children[0] as any,
        startText: match[0],
      }),
    ).toBe(true);
    expect(insertSpy).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('导出非空', () => {
    expect(BlockMathNodes.length).toBeGreaterThan(0);
    expect(TextMatchNodes.length).toBeGreaterThan(0);
    expect(MdElements.bold).toBeTruthy();
  });
});
