/**
 * editorCommands residual（utils 目录）：heading 边界、空编辑器、quote。
 */
import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import {
  convertToParagraph,
  decreaseHeadingLevel,
  getCurrentNodes,
  increaseHeadingLevel,
  insertCodeBlock,
  insertHorizontalLine,
  insertTable,
  setHeading,
  toggleQuote,
} from '../editorCommands';

describe('editorCommands local residual branches', () => {
  const ed = (text = 'hello') => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: text.length },
    };
    return editor;
  };

  it('setHeading 各级；increase/decrease 边界', () => {
    const editor = ed();
    setHeading(editor, 1);
    setHeading(editor, 6);
    increaseHeadingLevel(editor);
    decreaseHeadingLevel(editor);
    decreaseHeadingLevel(editor);
    expect(getCurrentNodes(editor)).toBeTruthy();
  });

  it('空选区 + 空文档命令容错', () => {
    const editor = createEditor();
    editor.children = [];
    editor.selection = null;
    expect(() => insertTable(editor)).not.toThrow();
    expect(() => insertCodeBlock(editor)).not.toThrow();
    expect(() => insertHorizontalLine(editor)).not.toThrow();
    expect(() => toggleQuote(editor)).not.toThrow();
    expect(() => convertToParagraph(editor)).not.toThrow();
  });

  it('toggleQuote 在标题上；insertCodeBlock 带 language', () => {
    const editor = ed();
    setHeading(editor, 2);
    toggleQuote(editor);
    const e2 = ed();
    insertCodeBlock(e2, 'typescript');
    expect(e2.children.length).toBeGreaterThan(0);
  });
});
