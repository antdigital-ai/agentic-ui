/**
 * sanitizeInvalidChildrenBehavior deepen2：非数组 children、稀疏洞、
 * text leaf 带 children、normalize 空根、HistoryEditor 路径。
 */
import { createEditor, Text } from 'slate';
import { withHistory } from 'slate-history';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  compactEditorRootChildren,
  getChildList,
  normalizeEditorRootEntry,
  rebuildElement,
  repairBrokenChildArrays,
  runWithoutHistory,
  sanitizeEditorChildren,
  sanitizeNode,
  setEditorChildrenSafely,
  stripInvalidChildrenOnTextLeaf,
} from '../sanitizeInvalidChildrenBehavior';

describe('sanitizeInvalidChildrenBehavior deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('getChildList 非数组；rebuild 空 children 补 text', () => {
    expect(getChildList({ type: 'p', children: 1 } as any)).toEqual([]);
    const rebuilt = rebuildElement({
      type: 'blockquote',
      children: [null, undefined],
    } as any);
    expect(rebuilt.children).toEqual([{ text: '' }]);
  });

  it('sanitizeNode：无数组 children；稀疏洞跳过；非法非空对象 rebuild', () => {
    const noKids = sanitizeNode({ type: 'blockquote' } as any);
    expect(Array.isArray((noKids as any).children)).toBe(true);

    const sparse: any[] = [];
    sparse[0] = { text: 'a' };
    sparse[2] = { type: 'weird' };
    const node = sanitizeNode({
      type: 'paragraph',
      children: sparse,
    } as any);
    expect((node as any).children.length).toBeGreaterThanOrEqual(1);
  });

  it('sanitizeEditorChildren：非数组 / 全空 compact', () => {
    expect(sanitizeEditorChildren(null as any)[0]).toMatchObject({
      type: 'paragraph',
    });
    expect(sanitizeEditorChildren([]).length).toBe(1);
    const sparse: unknown[] = [];
    sparse[1] = null;
    expect(compactEditorRootChildren(sparse)).toEqual([]);
  });

  it('stripInvalidChildrenOnTextLeaf：带 children 的 leaf；非 text 返回 false', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'x', children: [] } as any],
      },
    ];
    const leaf = editor.children[0].children[0];
    expect(stripInvalidChildrenOnTextLeaf(editor, [0, 0], leaf)).toBe(true);
    expect(Text.isText(editor.children[0].children[0])).toBe(true);
    expect(
      stripInvalidChildrenOnTextLeaf(editor, [0], editor.children[0] as any),
    ).toBe(false);
  });

  it('normalizeEditorRootEntry：空列表 / coalesce 空段', () => {
    const editor = createEditor();
    const normalizeNode = vi.fn();
    expect(normalizeEditorRootEntry(editor, [], normalizeNode)).toBe(true);
    expect(normalizeNode).toHaveBeenCalled();

    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ];
    expect(
      normalizeEditorRootEntry(
        editor,
        editor.children as unknown[],
        normalizeNode,
      ),
    ).toBe(true);
  });

  it('setEditorChildrenSafely：损坏根直接赋值；完好根 replace', () => {
    const editor = createEditor();
    const sparse: any = [];
    sparse[0] = { type: 'paragraph', children: [{ text: 'a' }] };
    sparse[2] = undefined;
    editor.children = sparse;
    setEditorChildrenSafely(editor, [
      { type: 'paragraph', children: [{ text: 'ok' }] },
    ]);
    expect(editor.children[0]).toMatchObject({
      children: [{ text: 'ok' }],
    });

    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    setEditorChildrenSafely(editor, [
      { type: 'paragraph', children: [{ text: 'y' }] },
    ]);
    expect((editor.children[0] as any).children[0].text).toBe('y');
  });

  it('repairBrokenChildArrays + HistoryEditor runWithoutHistory', () => {
    const editor = withHistory(createEditor());
    const sparseRoot: any = [];
    sparseRoot[0] = { type: 'paragraph', children: [{ text: 'z' }] };
    sparseRoot[2] = undefined;
    editor.children = sparseRoot;
    expect(repairBrokenChildArrays(editor)).toBe(true);
    expect(repairBrokenChildArrays(editor)).toBe(false);

    let ran = false;
    runWithoutHistory(editor, () => {
      ran = true;
    });
    expect(ran).toBe(true);
  });

  it('sanitizeNode 文本 leaf 去掉非法 children 字段', () => {
    const leaf = sanitizeNode({ text: 't', children: [] } as any);
    expect(Text.isText(leaf)).toBe(true);
    expect('children' in (leaf as object)).toBe(false);
  });
});
