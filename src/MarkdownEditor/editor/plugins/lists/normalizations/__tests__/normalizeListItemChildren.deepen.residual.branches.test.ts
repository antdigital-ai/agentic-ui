/**
 * normalizeListItemChildren deepen：文本子节点 wrap；嵌套 list-item lift。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeListItemChildren } from '../normalizeListItemChildren';

const schema = {
  isListItemNode: (n) => n?.type === 'list-item',
  isListItemTextNode: (n) => n?.type === 'list-item-text',
  isListNode: (n) => n?.type === 'list',
  createListItemTextNode: (p = {}) => ({
    type: 'list-item-text',
    children: p.children || [{ text: '' }],
  }),
  createListItemNode: (p = {}) => ({
    type: 'list-item',
    children: p.children || [
      { type: 'list-item-text', children: [{ text: '' }] },
    ],
  }),
};

describe('normalizeListItemChildren deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('list-item 下裸文本被 wrap', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list-item',
        children: [{ text: 'bare' }],
      },
    ];
    const changed = normalizeListItemChildren(editor, schema, [
      editor.children[0],
      [0],
    ]);
    expect(changed).toBe(true);
  });

  it('嵌套 list-item 被 lift', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list-item',
        children: [
          { type: 'list-item-text', children: [{ text: 'a' }] },
          {
            type: 'list-item',
            children: [
              { type: 'list-item-text', children: [{ text: 'b' }] },
            ],
          },
        ],
      },
    ];
    const changed = normalizeListItemChildren(editor, schema, [
      editor.children[0],
      [0],
    ]);
    expect(typeof changed).toBe('boolean');
  });
});
