/**
 * editorUtils 残留：DOM/path/selection 辅助函数边角。
 */
import { createEditor } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calcPath,
  createDomRangeFromNodes,
  createSelectionFromNodes,
  EditorUtils,
  findLeafPath,
  getDefaultView,
  getPointStrOffset,
  getRelativePath,
  getSelectionFromDomSelection,
  hasEditableTarget,
  hasTarget,
  isDOMNode,
  isEventHandled,
  isPath,
  isTargetInsideVoid,
} from '../editorUtils';

vi.mock('slate-react', () => ({
  ReactEditor: {
    hasDOMNode: vi.fn(() => false),
    toSlateNode: vi.fn(),
    toSlateRange: vi.fn(() => null),
    findPath: vi.fn(() => [0, 0]),
    isFocused: vi.fn(() => false),
  },
}));

const makeEvent = (overrides: Partial<{
  defaultPrevented: boolean;
  propagationStopped: boolean;
}> = {}) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  isDefaultPrevented: () => overrides.defaultPrevented ?? false,
  isPropagationStopped: () => overrides.propagationStopped ?? false,
});

describe('editorUtils residual helper branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getDefaultView / isDOMNode / isPath', () => {
    expect(getDefaultView(document.createElement('div'))).toBe(window);
    expect(getDefaultView(null)).toBeNull();
    expect(isDOMNode(document.createElement('span'))).toBe(true);
    expect(isDOMNode(null)).toBe(false);
    expect(isPath([0, 1])).toBe(true);
    expect(isPath('0.1')).toBe(false);
    expect(isPath([])).toBe(true);
  });

  it('getRelativePath / calcPath 边界', () => {
    expect(getRelativePath([0, 1], [0])).toEqual([0, 1]);
    expect(getRelativePath([0], [0, 1])).toEqual([0, 0]);
    expect(calcPath([0, 1], [0, 0])).toEqual([0, 1]);
    expect(calcPath('a' as any, [0])).toBeTruthy();
  });

  it('isEventHandled：handler 返回 true/false/undefined', () => {
    const prevented = makeEvent({ defaultPrevented: true }) as any;
    expect(isEventHandled(prevented, undefined)).toBe(false);
    expect(
      isEventHandled(prevented, () => {
        prevented.preventDefault();
      }),
    ).toBe(true);

    const notPrevented = makeEvent() as any;
    expect(isEventHandled(notPrevented, () => false)).toBe(false);
    expect(isEventHandled(notPrevented, () => undefined as any)).toBe(false);
  });

  it('hasTarget / hasEditableTarget / isTargetInsideVoid', () => {
    const editor = createEditor() as any;
    const el = document.createElement('div');
    expect(hasTarget(editor, null)).toBe(false);
    expect(hasTarget(editor, el)).toBe(false);
    expect(hasEditableTarget(editor, el)).toBe(false);
    expect(isTargetInsideVoid(editor, el)).toBe(false);
  });

  it('createSelectionFromNodes / createDomRangeFromNodes 空节点', () => {
    expect(createSelectionFromNodes(null as any, null as any)).toBeNull();
    expect(createDomRangeFromNodes(null as any, null as any)).toBeNull();
  });

  it('getSelectionFromDomSelection 无 range 返回 null', () => {
    const editor = createEditor() as any;
    const sel = {
      rangeCount: 0,
      getRangeAt: vi.fn(),
    } as any;
    expect(getSelectionFromDomSelection(editor, sel)).toBeNull();
  });

  it('getPointStrOffset / findLeafPath', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'abc' }] },
    ];
    expect(
      getPointStrOffset(editor, { path: [0, 0], offset: 2 }),
    ).toBeGreaterThanOrEqual(0);
    expect(findLeafPath(editor, [0])).toEqual([0, 0]);
  });

  it('EditorUtils.isFormatActive 无选区', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = null;
    expect(EditorUtils.isFormatActive(editor, 'bold')).toBe(false);
  });
});
