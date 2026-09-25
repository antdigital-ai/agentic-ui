/**
 * editorUtils deepen3：normalizeUrl origin 空、createSelection 无 window、
 * checkText/isNodeSelectable 早退、findByPathAndText 空 variants / text ?? ''。
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

describe('EditorUtils deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('createMediaNode：相对路径；origin 空串', () => {
    const originDesc = Object.getOwnPropertyDescriptor(window.location, 'origin');
    try {
      Object.defineProperty(window.location, 'origin', {
        configurable: true,
        get: () => '',
      });
    } catch {
      // happy-dom 可能只读 origin，走相对路径仍覆盖 startsWith 分支
    }
    const node = EditorUtils.createMediaNode('/img/a.png', 'image');
    expect(node).toBeTruthy();
    const rel = EditorUtils.createMediaNode('img/b.png', 'image');
    expect(rel).toBeTruthy();
    if (originDesc) {
      Object.defineProperty(window.location, 'origin', originDesc);
    }
  });

  it('createSelectionFromNodes：缺节点；copyText/cutText text ?? 中间节点', () => {
    expect(
      createSelectionFromNodes(null, 0, document.createTextNode('a'), 0),
    ).toBeNull();

    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ab' }, { text: undefined as any }, { text: 'cd' }],
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
    const text = EditorUtils.copyText(editor, { path: [0, 0], offset: 0 });
    expect(typeof text).toBe('string');
    const cut = EditorUtils.cutText(editor, { path: [0, 0], offset: 0 });
    expect(cut.length).toBeGreaterThan(0);
    spy.mockRestore();
  });

  it('findByPathAndText：includeMarkdownVariants 空 trim；parent.type 缺省', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: undefined as any,
        children: [{ text: 'alpha alpha' }],
      },
    ];
    const hits = findByPathAndText(editor as any, [0], 'alpha', {
      includeMarkdownVariants: false,
      maxResults: 5,
    });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].nodeType).toMatch(/unknown|text|undefined/);

    expect(
      findByPathAndText(editor as any, [0], '\t  ', {
        includeMarkdownVariants: true,
      }),
    ).toEqual([]);
  });

  it('getSelectionFromDomSelection：无 selection；hasTarget 非 DOM', () => {
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
    expect(hasTarget(editor, null)).toBe(false);
    expect(isDOMNode(null)).toBe(false);
    expect(Text.isText({ text: 'a' })).toBe(true);
  });
});
