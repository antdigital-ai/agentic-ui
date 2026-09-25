/**
 * editorCommands deepen residual：部分选区拆分标题、空选区、多段。
 */
import { createEditor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  convertToParagraph,
  setHeading,
} from '../editorCommands';

describe('editorCommands deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  const ed = (text = 'ABCDEFGH') => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text }] }];
    return editor;
  };

  it('setHeading level=4 转段落', () => {
    const editor = ed();
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    setHeading(editor, 1);
    setHeading(editor, 4);
    expect((editor.children[0] as any).type).toBe('paragraph');
  });

  it('折叠选区 setHeading 整段转标题', () => {
    const editor = ed('Hello');
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    setHeading(editor, 2);
    expect((editor.children[0] as any).type).toBe('head');
    expect((editor.children[0] as any).level).toBe(2);
  });

  it('非折叠：从开头选到中间拆分', () => {
    const editor = ed('ABCDEF');
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };
    setHeading(editor, 1);
    expect(editor.children.some((n: any) => n.type === 'head')).toBe(true);
  });

  it('非折叠：从中间选到末尾拆分', () => {
    const editor = ed('ABCDEF');
    editor.selection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 6 },
    };
    setHeading(editor, 2);
    expect(editor.children.some((n: any) => n.type === 'head')).toBe(true);
  });

  it('非折叠：中间选区拆成三段', () => {
    const editor = ed('ABCDEFGH');
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    };
    setHeading(editor, 3);
    expect(editor.children.some((n: any) => n.type === 'head')).toBe(true);
    expect(editor.children.length).toBeGreaterThanOrEqual(2);
  });

  it('跨多段非折叠选区', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'AAA' }] },
      { type: 'paragraph', children: [{ text: 'BBB' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    };
    expect(() => setHeading(editor, 1)).not.toThrow();
  });

  it('整段选中直接转 head', () => {
    const editor = ed('FULL');
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    };
    setHeading(editor, 1);
    expect((editor.children[0] as any).type).toBe('head');
  });

  it('无 selection 时 setHeading / convertToParagraph 容错', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = null;
    expect(() => setHeading(editor, 1)).not.toThrow();
    expect(() => convertToParagraph(editor)).not.toThrow();
  });

  it('选区落在非 paragraph/head 时 process 早退', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'code', language: 'js', children: [{ text: 'x' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(() => setHeading(editor, 1)).not.toThrow();
  });

  it('Transforms 后仍可重复 setHeading', () => {
    const editor = ed('repeat');
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    setHeading(editor, 1);
    setHeading(editor, 2);
    expect(editor.children.length).toBeGreaterThan(0);
  });
});
