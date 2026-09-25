/**
 * normalizeOrphanNestedList deepen2：无 previous nested list。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { normalizeOrphanNestedList } from '../normalizeOrphanNestedList';

describe('normalizeOrphanNestedList deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('孤立嵌套 list 入口可调用', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
              },
            ],
          },
        ],
      },
    ] as any;
    const entry: any = [editor.children[0].children[1], [0, 1]];
    expect(() =>
      normalizeOrphanNestedList(editor, agenticListsSchema, entry),
    ).not.toThrow();
  });
});
