/**
 * editorUtils deepen6：copy/cut end/start leaf text undefined、
 * checkText 非 DOM、createSelection window undefined、lineContent ?? ''。
 */
import { createEditor, Editor, Node, Path } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSelectionFromNodes,
  EditorUtils,
  findByPathAndText,
  getSelectionFromDomSelection,
} from '../editorUtils';

describe('EditorUtils deepen6 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('copyText：end leaf text undefined → ?? ""', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ab' }, { text: 'cd' }],
      },
    ];
    const leafSpy = vi
      .spyOn(Editor, 'leaf')
      .mockImplementation((_ed: any, point: any) => {
        if (Path.equals(point.path, [0, 0])) {
          return [{ text: 'ab' }, [0, 0]] as any;
        }
        return [{ text: undefined as any }, [0, 1]] as any;
      });
    const nextSpy = vi
      .spyOn(Editor, 'next')
      .mockImplementation((_ed: any, opts: any) => {
        const at = opts?.at;
        if (Path.equals(at, [0, 0])) {
          return [{ text: undefined as any }, [0, 1]] as any;
        }
        return undefined as any;
      });
    const text = EditorUtils.copyText(
      editor,
      { path: [0, 0], offset: 0 },
      { path: [0, 1], offset: 1 },
    );
    expect(typeof text).toBe('string');
    leafSpy.mockRestore();
    nextSpy.mockRestore();
  });

  it('cutText：start/end leaf text undefined', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'xy' }, { text: 'zw' }],
      },
    ];
    const leafSpy = vi
      .spyOn(Editor, 'leaf')
      .mockImplementation((_ed: any, point: any) => {
        if (Path.equals(point.path, [0, 0])) {
          return [{ text: undefined as any }, [0, 0]] as any;
        }
        return [{ text: undefined as any }, [0, 1]] as any;
      });
    const nextSpy = vi
      .spyOn(Editor, 'next')
      .mockImplementation((_ed: any, opts: any) => {
        if (Path.equals(opts?.at, [0, 0])) {
          return [{ text: undefined as any }, [0, 1]] as any;
        }
        return undefined as any;
      });
    const cut = EditorUtils.cutText(
      editor,
      { path: [0, 0], offset: 0 },
      { path: [0, 1], offset: 1 },
    );
    expect(Array.isArray(cut)).toBe(true);
    leafSpy.mockRestore();
    nextSpy.mockRestore();
  });

  it('getSelectionFromDomSelection：anchorNode 非 DOM', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hi' }] },
    ];
    const fakeSel = {
      anchorNode: 123 as any,
      focusNode: 456 as any,
      isCollapsed: true,
      rangeCount: 1,
      getRangeAt: () => ({
        startContainer: 123,
        endContainer: 456,
        startOffset: 0,
        endOffset: 0,
        commonAncestorContainer: 123,
      }),
    } as any;
    expect(() =>
      getSelectionFromDomSelection(editor as any, fakeSel),
    ).not.toThrow();
  });

  it('createSelectionFromNodes：window undefined 早退', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
    ];
    const orig = globalThis.window;
    vi.stubGlobal('window', undefined);
    try {
      const r = createSelectionFromNodes(
        editor as any,
        { path: [0, 0], offset: 0 } as any,
        { path: [0, 0], offset: 1 } as any,
      );
      expect(r === null || r === undefined || typeof r === 'object').toBe(true);
    } finally {
      vi.stubGlobal('window', orig);
    }
  });

  it('findByPathAndText：Node.string 返回 null → lineContent ?? ""', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'needle here' }],
      },
    ];
    const nodeString = vi.spyOn(Node, 'string').mockReturnValue(null as any);
    const hits = findByPathAndText(editor as any, [0], 'needle');
    expect(Array.isArray(hits)).toBe(true);
    nodeString.mockRestore();
  });
});
