/**
 * editorCommands deepen2：无 selection、跨节点 actualStart/End 钳位、
 * 中间拆分找不到 splitPoint、path 失效跳过。
 */
import { createEditor, Editor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { convertToParagraph, setHeading } from '../editorCommands';

describe('editorCommands deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('selection=null：findBlockNodes 早退', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = null;
    expect(() => setHeading(editor, 2)).not.toThrow();
    expect(() => convertToParagraph(editor)).not.toThrow();
  });

  it('跨段选区：actualStart/End 钳到节点边界', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'AAAA' }] },
      { type: 'paragraph', children: [{ text: 'BBBB' }] },
      { type: 'paragraph', children: [{ text: 'CCCC' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [2, 0], offset: 3 },
    };
    expect(() => setHeading(editor, 1)).not.toThrow();
    expect(editor.children.some((n: any) => n.type === 'head')).toBe(true);
  });

  it('中间选区拆分后仍可再设标题（path 变化容错）', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ABCDEFGH' }] },
    ];
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 6 },
    });
    setHeading(editor, 1);
    const mid = editor.children.find((n: any) => n.type === 'head');
    expect(mid).toBeTruthy();
    editor.selection = {
      anchor: Editor.start(editor, [0]),
      focus: Editor.end(editor, [editor.children.length - 1]),
    };
    expect(() => setHeading(editor, 2)).not.toThrow();
  });

  it('多文本节点段落：中间选区拆分走偏移累计', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'AB' }, { text: 'CD' }, { text: 'EF' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 2], offset: 1 },
    };
    expect(() => setHeading(editor, 3)).not.toThrow();
  });

  it('选区起点在节点后 / 终点在节点前（钳位 cond）', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'LEFT' }] },
      { type: 'paragraph', children: [{ text: 'MID' }] },
      { type: 'paragraph', children: [{ text: 'RIGHT' }] },
    ];
    // 反向选区：从 RIGHT 到 LEFT
    editor.selection = {
      anchor: { path: [2, 0], offset: 2 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(() => setHeading(editor, 1)).not.toThrow();
  });
});
