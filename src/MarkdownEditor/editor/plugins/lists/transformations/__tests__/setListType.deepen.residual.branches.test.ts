/**
 * setListType deepen：null at / 无 lists / path 缺失。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { setListType } from '../setListType';

describe('setListType deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('at=null 返回 false', () => {
    const editor = createEditor();
    editor.selection = null;
    expect(setListType(editor, agenticListsSchema, ListType.ORDERED, null)).toBe(
      false,
    );
  });

  it('选区无 list 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(setListType(editor, agenticListsSchema, ListType.UNORDERED)).toBe(
      false,
    );
  });
});
