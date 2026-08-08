/**
 * editorCommands deepen4：level=4 转段落、isAtStart/isAtEnd、
 * text ?? ''、splitPoint 缺失回退 end、非 head convert 无操作。
 */
import { createEditor, Editor, Text, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { convertToParagraph, setHeading } from '../editorCommands';

describe('editorCommands deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('level=4：走 convertToParagraph', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'head', level: 1, children: [{ text: 'H' }] },
    ] as any;
    Transforms.select(editor, Editor.range(editor, [0]));
    setHeading(editor, 4);
    expect((editor.children[0] as any).type).toBe('paragraph');
  });

  it('convertToParagraph：非 head 无操作', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'p' }] },
    ] as any;
    Transforms.select(editor, Editor.range(editor, [0]));
    convertToParagraph(editor);
    expect((editor.children[0] as any).type).toBe('paragraph');
  });

  it('选区贴节点开头：isAtStart 拆分', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ABCDEF' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };
    setHeading(editor, 2);
    expect(editor.children.some((n: any) => n.type === 'head')).toBe(true);
  });

  it('选区贴节点末尾：isAtEnd 拆分', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ABCDEF' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 6 },
    };
    setHeading(editor, 1);
    expect(editor.children.some((n: any) => n.type === 'head')).toBe(true);
  });

  it('中间选区：text ?? \'\' 与 splitPoint 缺失回退', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ABCDEFGH' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 6 },
    };

    const origNodes = Editor.nodes.bind(Editor);
    let injected = false;
    vi.spyOn(Editor, 'nodes').mockImplementation((ed, opts: any) => {
      const iter = origNodes(ed, opts);
      return (function* () {
        for (const entry of iter) {
          const [n, p] = entry as [any, any];
          if (!injected && Text.isText(n) && opts?.at) {
            injected = true;
            yield [{ text: undefined }, p] as any;
            continue;
          }
          yield entry;
        }
      })() as any;
    });

    expect(() => setHeading(editor, 2)).not.toThrow();
  });

  it('折叠选区：整节点设标题（无非折叠分支）', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'solo' }] },
    ] as any;
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    setHeading(editor, 3);
    expect((editor.children[0] as any).type).toBe('head');
    expect((editor.children[0] as any).level).toBe(3);
  });

  it('中间拆分后 middlePath 失效：continue 不抛', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ABCDEF' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    };
    const origHasPath = Editor.hasPath.bind(Editor);
    let calls = 0;
    vi.spyOn(Editor, 'hasPath').mockImplementation((ed, path) => {
      calls += 1;
      // 第二次对 Path.next 返回 false，触发 middlePath continue
      if (calls === 2) return false;
      return origHasPath(ed, path);
    });
    expect(() => setHeading(editor, 1)).not.toThrow();
  });
});
