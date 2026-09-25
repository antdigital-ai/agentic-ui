/**
 * editorUtils deepen4：copyText/cutText 有 end 截断、checkText 非 DOM、
 * isNodeSelectable 空、findByPathAndText 空 variants、text ?? ''。
 */
import { createEditor, Editor, Path, Text } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSelectionFromNodes,
  EditorUtils,
  findByPathAndText,
  getSelectionFromDomSelection,
  hasTarget,
  isDOMNode,
} from '../editorUtils';

describe('EditorUtils deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('copyText/cutText：跨 leaf 在 end 截断', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ab' }, { text: 'cdef' }],
      },
    ];
    const start = { path: [0, 0], offset: 1 };
    const end = { path: [0, 1], offset: 2 };
    const copied = EditorUtils.copyText(editor, start, end);
    // start leaf 'b' + end leaf slice(0,2)='cd'
    expect(copied).toBe('bcd');

    const cut = EditorUtils.cutText(editor, start, end);
    expect(cut.map((t) => t.text).join('')).toBe('bcd');
  });

  it('copyText：跨 leaf 到 end；中间节点 text undefined', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: 'ab' },
          { text: undefined as any },
          { text: 'cd' },
        ],
      },
    ];
    const spy = vi.spyOn(Editor, 'next').mockImplementation((ed: any, opts: any) => {
      const at = opts?.at;
      if (Path.equals(at, [0, 0])) {
        return [{ text: undefined as any }, [0, 1]] as any;
      }
      if (Path.equals(at, [0, 1])) {
        return [{ text: 'cd' }, [0, 2]] as any;
      }
      return undefined as any;
    });
    const leafSpy = vi
      .spyOn(Editor, 'leaf')
      .mockImplementation((_ed: any, point: any) => {
        if (Path.equals(point.path, [0, 0])) {
          return [{ text: 'ab' }, [0, 0]] as any;
        }
        return [{ text: 'cd' }, [0, 2]] as any;
      });
    const text = EditorUtils.copyText(
      editor,
      { path: [0, 0], offset: 0 },
      { path: [0, 2], offset: 1 },
    );
    expect(typeof text).toBe('string');
    const cut = EditorUtils.cutText(
      editor,
      { path: [0, 0], offset: 0 },
      { path: [0, 2], offset: 1 },
    );
    expect(cut.length).toBeGreaterThan(0);
    spy.mockRestore();
    leafSpy.mockRestore();
  });

  it('findByPathAndText：includeMarkdownVariants 空；parent 无 type', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: undefined as any,
        children: [{ text: 'hello world' }],
      },
    ];
    expect(
      findByPathAndText(editor as any, [0], '   ', {
        includeMarkdownVariants: true,
      }),
    ).toEqual([]);

    const hits = findByPathAndText(editor as any, [0], 'hello', {
      includeMarkdownVariants: false,
      caseSensitive: true,
      wholeWord: false,
    });
    expect(hits.length).toBeGreaterThan(0);
  });

  it('createSelectionFromNodes / hasTarget 边界', () => {
    expect(
      createSelectionFromNodes(null, 0, document.createTextNode('a'), 0),
    ).toBeNull();
    expect(hasTarget(createEditor() as any, null)).toBe(false);
    expect(isDOMNode(null)).toBe(false);
    expect(Text.isText({ text: 'z' })).toBe(true);

    const editor = createEditor() as any;
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    const sel = {
      anchorNode: null,
      focusNode: null,
      rangeCount: 0,
      getRangeAt: () => {
        throw new Error('no');
      },
    } as any;
    expect(getSelectionFromDomSelection(editor, sel)).toBeFalsy();
  });
});
