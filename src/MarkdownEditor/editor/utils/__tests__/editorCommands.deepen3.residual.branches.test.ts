/**
 * editorCommands deepen3：无 selection、path 失效 continue、
 * 非 Element 跳过、中间拆分无 splitPoint、text ?? ''。
 */
import { createEditor, Editor, Element, Node, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { convertToParagraph, setHeading } from '../editorCommands';

describe('editorCommands deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('selection=null：findBlockNodes 空数组早退', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = null;
    expect(() => setHeading(editor, 2)).not.toThrow();
  });

  it('hasPath false：循环 continue 跳过失效 path', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'AAAA' }] },
      { type: 'paragraph', children: [{ text: 'BBBB' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 4 },
    };
    const orig = Editor.hasPath.bind(Editor);
    let calls = 0;
    vi.spyOn(Editor, 'hasPath').mockImplementation((ed, path) => {
      calls += 1;
      // 第一次对某 path 返回 false，触发 continue
      if (calls === 1) return false;
      return orig(ed, path);
    });
    expect(() => setHeading(editor, 1)).not.toThrow();
  });

  it('originalNode 非 Element：continue', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ABCDEF' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    };
    vi.spyOn(Node, 'get').mockReturnValue({ text: 'ghost' } as any);
    vi.spyOn(Element, 'isElement').mockReturnValue(false);
    expect(() => setHeading(editor, 2)).not.toThrow();
  });

  it('中间选区多文本节点：偏移累计拆分', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'AB' }, { text: 'CD' }, { text: 'EFGH' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 2], offset: 2 },
    };
    expect(() => setHeading(editor, 1)).not.toThrow();
  });

  it('整段转段落：head → paragraph', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'head', level: 1, children: [{ text: 'T' }] },
    ] as any;
    Transforms.select(editor, Editor.range(editor, [0]));
    convertToParagraph(editor);
    expect((editor.children[0] as any).type).toBe('paragraph');
  });
});
