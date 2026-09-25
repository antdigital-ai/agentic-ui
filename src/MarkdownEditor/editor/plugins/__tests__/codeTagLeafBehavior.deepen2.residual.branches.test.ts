/**
 * codeTagLeafBehavior deepen2 residual：mark remove 非 Text 早退、空 afterText
 * unset、双空格非空格/非末尾失败、triggerText 空串。
 */
import { createEditor, Editor, Node, Text, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleMarkRemoveTextOperation,
  moveSelectionOutOfMarkLeaf,
  tryInsertTextOutsideMarkOnDoubleSpace,
  tryInsertTextOutsideTagOnDoubleSpace,
  handleTagDeleteBackward,
} from '../codeTagLeafBehavior';

const tagNode = (text: string, extra: Record<string, unknown> = {}) => ({
  text,
  tag: true,
  code: true,
  ...extra,
});

describe('codeTagLeafBehavior deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('handleMarkRemoveTextOperation：删后非 Text 跳过 unset', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: ' ', mark: true }] },
    ];
    const apply = vi.fn((_op: any) => {
      // 模拟删空后 path 变成非 Text（元素）
      (editor.children[0] as any).children[0] = {
        type: 'inline',
        children: [{ text: '' }],
      };
    });
    vi.spyOn(Editor, 'hasPath').mockReturnValue(true);
    vi.spyOn(Node, 'get').mockImplementation((ed: any, path: any) => {
      if (path?.[1] === 0 && (ed.children[0] as any).children[0]?.type) {
        return (ed.children[0] as any).children[0];
      }
      try {
        return Text.isText
          ? (ed.children[0] as any).children[0]
          : Node.get(ed, path);
      } catch {
        return { text: ' ', mark: true };
      }
    });
    // 简化：第一次 get 返回 mark 叶，apply 后第二次返回非 Text
    let calls = 0;
    vi.spyOn(Node, 'get').mockImplementation(() => {
      calls += 1;
      if (calls === 1) return { text: ' ', mark: true };
      return { type: 'x', children: [] } as any;
    });
    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: ' ' },
        apply,
      ),
    ).toBe(true);
  });

  it('handleMarkRemoveTextOperation：删后空串走 unset', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: ' ', mark: true }] },
    ];
    const apply = vi.fn((op) => {
      Transforms.removeText?.(editor as any, op as any);
    });
    // 直接模拟 apply 清空文本
    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');
    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: ' ' },
        (op) => {
          apply(op);
          (editor.children[0] as any).children[0] = { text: '', mark: true };
        },
      ),
    ).toBe(true);
    expect(unsetSpy).toHaveBeenCalled();
    unsetSpy.mockRestore();
  });

  it('双空格：非空格 / 非末尾 offset 返回 false', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'hi ', mark: true, markLabel: '@' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, 'a')).toBe(false);
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, ' ')).toBe(false);

    editor.children = [
      { type: 'paragraph', children: [tagNode('a ')] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, ' ')).toBe(false);
  });

  it('moveSelectionOutOfMarkLeaf：空 text?? 与末尾无 next 时 insert', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '', mark: true }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    expect(moveSelectionOutOfMarkLeaf(editor)).toBe(true);
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('handleTagDeleteBackward：空 tag 无 triggerText', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [tagNode('')],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const setSpy = vi.spyOn(Transforms, 'setNodes');
    expect(handleTagDeleteBackward(editor, 'character', vi.fn())).toBe(true);
    expect(setSpy).toHaveBeenCalled();
    setSpy.mockRestore();
  });
});
