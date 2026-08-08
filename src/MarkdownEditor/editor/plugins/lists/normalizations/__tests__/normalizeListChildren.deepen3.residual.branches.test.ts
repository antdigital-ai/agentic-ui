/**
 * normalizeListChildren deepen3：text 字段缺失走 ?? ''。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeListChildren } from '../normalizeListChildren';

const schema = {
  isListNode: (n) => n?.type === 'list',
  isListItemNode: (n) => n?.type === 'list-item',
  isListItemTextNode: (n) => n?.type === 'list-item-text',
  createListItemNode: (p = {}) => ({
    type: 'list-item',
    children: p.children || [
      { type: 'list-item-text', children: [{ text: '' }] },
    ],
  }),
  createListItemTextNode: (p = {}) => ({
    type: 'list-item-text',
    children: p.children || [{ text: '' }],
  }),
};

describe('normalizeListChildren deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空白 text 子节点被移除', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list',
        children: [
          { text: '   ' },
          {
            type: 'list-item',
            children: [
              { type: 'list-item-text', children: [{ text: 'a' }] },
            ],
          },
        ],
      },
    ];
    const changed = normalizeListChildren(editor, schema, [
      editor.children[0],
      [0],
    ]);
    expect(changed).toBe(true);
  });
});
