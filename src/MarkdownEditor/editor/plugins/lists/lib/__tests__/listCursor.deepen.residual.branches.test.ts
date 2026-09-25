/**
 * isAtEmptyListItem / isAtStartOfListItem deepen：无光标 / 多项选区。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isAtEmptyListItem } from '../isAtEmptyListItem';
import { isAtStartOfListItem } from '../isAtStartOfListItem';

describe('list lib cursor deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 selection 时 isAtStartOfListItem 为 false', () => {
    const editor = createEditor();
    editor.selection = null;
    const schema = {
      isListItemNode: () => true,
      isListItemTextNode: () => true,
    } as any;
    expect(isAtStartOfListItem(editor, schema, null)).toBe(false);
  });

  it('选中多个 list-item 时 isAtEmptyListItem 为 false', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'list-item-text', children: [{ text: '' }] }],
          },
          {
            type: 'list-item',
            children: [{ type: 'list-item-text', children: [{ text: '' }] }],
          },
        ],
      } as any,
    ];
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0], offset: 0 },
    };
    const schema = {
      isListItemNode: (n: any) => n?.type === 'list-item',
      isListItemTextNode: (n: any) => n?.type === 'list-item-text',
      isListNode: (n: any) => n?.type === 'list',
    } as any;
    expect(isAtEmptyListItem(editor, schema)).toBe(false);
  });
});
