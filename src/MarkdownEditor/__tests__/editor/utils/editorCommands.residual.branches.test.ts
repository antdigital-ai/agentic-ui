/**
 * editorCommands 残留：heading/quote/table/code 空选区与边界。
 */
import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import {
  convertToParagraph,
  createList,
  decreaseHeadingLevel,
  getCurrentNodes,
  increaseHeadingLevel,
  insertCodeBlock,
  insertHorizontalLine,
  insertTable,
  setHeading,
  toggleQuote,
} from '../../../editor/utils/editorCommands';

describe('editorCommands residual branches', () => {
  const ed = () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    return editor;
  };

  it('无选区时命令不抛', () => {
    const editor = ed();
    editor.selection = null;
    expect(() => setHeading(editor, 2)).not.toThrow();
    expect(() => toggleQuote(editor)).not.toThrow();
    expect(() => insertTable(editor)).not.toThrow();
    expect(() => insertCodeBlock(editor)).not.toThrow();
    expect(() => insertHorizontalLine(editor)).not.toThrow();
    expect(() => createList(editor, 'unordered')).not.toThrow();
    expect(() => convertToParagraph(editor)).not.toThrow();
  });

  it('setHeading / increase / decrease', () => {
    const editor = ed();
    setHeading(editor, 1);
    increaseHeadingLevel(editor);
    decreaseHeadingLevel(editor);
    expect(editor.children[0]).toBeTruthy();
  });

  it('toggleQuote 开关；insertTable/code/hr/list', () => {
    const editor = ed();
    toggleQuote(editor);
    toggleQuote(editor);
    insertTable(editor);
    const e2 = ed();
    insertCodeBlock(e2, 'js');
    const e3 = ed();
    insertHorizontalLine(e3);
    const e4 = ed();
    createList(e4, 'ordered');
    convertToParagraph(e4);
    expect(getCurrentNodes(e4)).toBeTruthy();
  });
});
