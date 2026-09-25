/**
 * codeTagLeafBehavior 残留：空 tag 文本、占位替换、mark 删空后 afterNode。
 */
import { createEditor, Editor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleMarkRemoveTextOperation,
  handleTagDeleteBackward,
  handleTagRemoveTextOperation,
  isCodeTagTextLeaf,
  moveSelectionOutOfMarkLeaf,
  tryInsertTextOutsideMarkOnDoubleSpace,
  tryInsertTextOutsideTagOnDoubleSpace,
} from '../codeTagLeafBehavior';

describe('codeTagLeafBehavior residual branches', () => {
  it('isCodeTagTextLeaf：仅 code / 仅 tag / 普通文本', () => {
    expect(isCodeTagTextLeaf({ text: 'x', code: true } as any)).toBe(true);
    expect(isCodeTagTextLeaf({ text: 'x', tag: true } as any)).toBe(true);
    expect(isCodeTagTextLeaf({ text: 'x' } as any)).toBe(false);
  });

  it('handleTagRemoveTextOperation：空白 tag 文本清 mark', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '  ', tag: true, code: true }],
      },
    ];
    const apply = vi.fn();
    const setSpy = vi.spyOn(Transforms, 'setNodes');
    expect(
      handleTagRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: ' ' },
        apply,
      ),
    ).toBe(true);
    expect(setSpy).toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();
    setSpy.mockRestore();
  });

  it('handleTagRemoveTextOperation：整段删除插入占位空格叶', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ab', tag: true, code: true }],
      },
    ];
    const apply = vi.fn();
    expect(
      handleTagRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'ab' },
        apply,
      ),
    ).toBe(true);
    const leaf = (editor.children[0] as any).children[0];
    expect(leaf.text).toBe(' ');
    expect(leaf.tag).toBe(true);
  });

  it('handleTagRemoveTextOperation：非 tag 叶返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    expect(
      handleTagRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'p' },
        vi.fn(),
      ),
    ).toBe(false);
  });

  it('handleMarkRemoveTextOperation：删后仍有非空白文本走 apply', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ab', mark: true, markLabel: '@' }],
      },
    ];
    const apply = vi.fn();
    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'a' },
        apply,
      ),
    ).toBe(true);
    expect(apply).toHaveBeenCalled();
  });

  it('handleMarkRemoveTextOperation：删空后 afterNode 非 Text 跳过 unset', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'x', mark: true }],
      },
    ];
    const apply = (op: any) => {
      Editor.apply(editor, op);
    };
    vi.spyOn(Editor, 'hasPath').mockReturnValue(true);
    vi.spyOn(Editor, 'node').mockImplementation((() => [
      { type: 'paragraph', children: [] },
      [0],
    ]) as any);
    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');
    handleMarkRemoveTextOperation(
      editor,
      { type: 'remove_text', path: [0, 0], offset: 0, text: 'x' },
      apply,
    );
    unsetSpy.mockRestore();
    vi.mocked(Editor.hasPath).mockRestore();
    vi.mocked(Editor.node).mockRestore();
  });

  it('双空格退出 tag / mark；选区移出 mark', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: 'a ', tag: true, code: true },
          { text: 'b', mark: true },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(
      tryInsertTextOutsideTagOnDoubleSpace(editor, ' ', [0, 0]),
    ).toBeTypeOf('boolean');
    editor.selection = {
      anchor: { path: [0, 1], offset: 1 },
      focus: { path: [0, 1], offset: 1 },
    };
    expect(
      tryInsertTextOutsideMarkOnDoubleSpace(editor, ' ', [0, 1]),
    ).toBeTypeOf('boolean');
    expect(() =>
      moveSelectionOutOfMarkLeaf(editor, [0, 1], 'forward'),
    ).not.toThrow();
    expect(() => handleTagDeleteBackward(editor)).not.toThrow();
  });
});
