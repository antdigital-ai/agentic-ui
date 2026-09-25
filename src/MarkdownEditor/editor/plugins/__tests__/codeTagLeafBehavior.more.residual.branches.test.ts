/**
 * codeTagLeafBehavior more residual：moveSelection / shouldExit / double space。
 */
import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import {
  isCodeTagTextLeaf,
  moveSelectionOutOfCodeTagLeaf,
  moveSelectionOutOfMarkLeaf,
  shouldExitMarkOnInsertBreak,
  tryInsertTextOutsideMarkOnDoubleSpace,
  tryInsertTextOutsideTagOnDoubleSpace,
} from '../codeTagLeafBehavior';

describe('codeTagLeafBehavior more residual branches', () => {
  it('isCodeTagTextLeaf 假值矩阵', () => {
    expect(isCodeTagTextLeaf({ text: '' } as any)).toBe(false);
    expect(isCodeTagTextLeaf({ text: 'x', tag: true } as any)).toBe(true);
    expect(isCodeTagTextLeaf({ text: 'x', code: true } as any)).toBe(true);
  });

  it('无选区时 moveSelection / tryInsert 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = null;
    expect(moveSelectionOutOfMarkLeaf(editor)).toBe(false);
    expect(moveSelectionOutOfCodeTagLeaf(editor)).toBe(false);
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, '  ')).toBe(false);
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, '  ')).toBe(false);
  });

  it('shouldExitMarkOnInsertBreak 可调用', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(typeof shouldExitMarkOnInsertBreak(editor, 'a')).toBe('boolean');
    expect(typeof shouldExitMarkOnInsertBreak(editor, '\n')).toBe('boolean');
  });

  it('普通文本双空格不触发 outside insert', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, '  ')).toBe(false);
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, '  ')).toBe(false);
  });

  it('tag leaf 上 moveSelectionOutOfCodeTagLeaf 可调用', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: 'x', tag: true, code: true },
          { text: 'y' },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(() => moveSelectionOutOfCodeTagLeaf(editor)).not.toThrow();
  });
});
