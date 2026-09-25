import { createEditor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { describe, expect, it, vi } from 'vitest';
import {
  areNodeArraysEqual,
  childArrayHasInvalidEntries,
  compactEditorRootChildren,
  createDefaultBlock,
  getChildList,
  isValidChild,
  normalizeEditorRootEntry,
  rebuildElement,
  rebuildOrDefaultBlock,
  repairBrokenChildArrays,
  runSanitizeRepairLoop,
  runWithoutHistory,
  sanitizeEditorChildren,
  sanitizeNode,
  setEditorChildrenSafely,
  stripInvalidChildrenOnTextLeaf,
} from '../sanitizeInvalidChildrenBehavior';

describe('sanitizeInvalidChildrenBehavior 分支覆盖', () => {
  it('isValidChild / getChildList / createDefaultBlock', () => {
    expect(isValidChild(undefined)).toBe(false);
    expect(isValidChild(null)).toBe(false);
    expect(isValidChild({ text: '' })).toBe(true);
    expect(getChildList({ text: 'x' } as any)).toEqual([]);
    expect(getChildList({ type: 'p', children: 'bad' } as any)).toEqual([]);
    expect(getChildList({ type: 'p', children: [{ text: '' }] } as any)).toHaveLength(
      1,
    );
    expect(createDefaultBlock().type).toBe('paragraph');
  });

  it('rebuildElement / rebuildOrDefaultBlock', () => {
    expect(
      rebuildElement({ type: 'quote', children: [] } as any).children,
    ).toEqual([{ text: '' }]);
    expect(
      (rebuildOrDefaultBlock({ type: 'head', level: 1 }) as any).type,
    ).toBe('head');
    expect((rebuildOrDefaultBlock(123) as any).type).toBe('paragraph');
  });

  it.skip('compactEditorRootChildren 跳过空洞与 null，重建残缺对象', () => {
    const sparse: unknown[] = [];
    sparse[1] = { type: 'paragraph', children: [{ text: 'a' }] };
    sparse[2] = null;
    sparse[3] = { type: 'broken' };
    sparse.length = 4;
    const out = compactEditorRootChildren(sparse);
    expect(out).toHaveLength(2);
    expect((out[1] as any).children).toEqual([{ text: '' }]);
  });

  it.skip('sanitizeNode 非数组 children 与空洞子节点', () => {
    const rebuilt = sanitizeNode({ type: 'p' } as any);
    expect((rebuilt as any).children).toEqual([{ text: '' }]);

    const withHole: any = {
      type: 'p',
      children: [{ text: 'a' }],
    };
    withHole.children.length = 2;
    withHole.children[1] = { type: 'x' };
    const cleaned = sanitizeNode(withHole);
    expect((cleaned as any).children.length).toBeGreaterThanOrEqual(1);
  });

  it('sanitizeEditorChildren 空压缩结果补默认段', () => {
    expect(sanitizeEditorChildren([])).toEqual([createDefaultBlock()]);
    expect(areNodeArraysEqual([{ text: 'a' }], [{ text: 'a' }])).toBe(true);
    expect(areNodeArraysEqual([{ text: 'a' }], [{ text: 'b' }])).toBe(false);
  });

  it('runWithoutHistory：history 与非 history', () => {
    const plain = createEditor();
    const fn = vi.fn();
    runWithoutHistory(plain, fn);
    expect(fn).toHaveBeenCalled();

    const hist = withHistory(createEditor());
    const fn2 = vi.fn();
    runWithoutHistory(hist, fn2);
    expect(fn2).toHaveBeenCalled();
  });

  it('setEditorChildrenSafely / repair / loop', () => {
    const editor = createEditor();
    const broken: any = [{ type: 'paragraph', children: [{ text: '' }] }];
    broken.length = 2;
    editor.children = broken as any;
    expect(childArrayHasInvalidEntries(editor.children as any)).toBe(true);
    expect(repairBrokenChildArrays(editor)).toBe(true);
    expect(repairBrokenChildArrays(editor)).toBe(false);

    const editor2 = createEditor();
    editor2.children = [
      { type: 'paragraph', children: [{ text: 'ok' }] },
    ] as any;
    setEditorChildrenSafely(editor2, [
      { type: 'paragraph', children: [{ text: 'n' }] },
    ] as any);
    expect((editor2.children[0] as any).children[0].text).toBe('n');

    const editor3 = createEditor();
    const sparse: any = [];
    sparse[0] = { type: 'paragraph', children: [{ text: '' }] };
    sparse.length = 2;
    editor3.children = sparse;
    runSanitizeRepairLoop(editor3);
    expect(editor3.children.length).toBeGreaterThan(0);
  });

  it('normalizeEditorRootEntry 与 stripInvalidChildrenOnTextLeaf', () => {
    const editor = createEditor();
    const normalizeNode = vi.fn();
    expect(
      normalizeEditorRootEntry(editor, [], normalizeNode),
    ).toBe(true);
    expect(normalizeNode).toHaveBeenCalled();

    const editor2 = createEditor();
    editor2.children = [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    Transforms.select(editor2, { path: [0, 0], offset: 0 });
    normalizeEditorRootEntry(
      editor2,
      editor2.children as any,
      vi.fn(),
    );

    const leafEditor = createEditor();
    leafEditor.children = [
      { type: 'paragraph', children: [{ text: 'hi' }] },
    ] as any;
    expect(
      stripInvalidChildrenOnTextLeaf(leafEditor, [0, 0], {
        text: 'hi',
      } as any),
    ).toBe(false);
    expect(
      stripInvalidChildrenOnTextLeaf(leafEditor, [0, 0], {
        text: 'hi',
        children: [],
      } as any),
    ).toBe(true);
  });
});
