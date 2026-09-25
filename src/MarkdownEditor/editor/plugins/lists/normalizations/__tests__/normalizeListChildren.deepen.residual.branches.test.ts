/**
 * normalizeListChildren deepen：空白文本子节点且 siblings>1 删除。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { normalizeListChildren } from '../normalizeListChildren';

describe('normalizeListChildren deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空白 text 子节点且不止一个 child 时 removeNodes', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          { text: '   ' },
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
    ] as any;
    const node = editor.children[0] as any;
    const changed = normalizeListChildren(editor, agenticListsSchema, [
      node,
      [0],
    ]);
    expect(changed).toBe(true);
  });

  it('非 list 节点返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }] as any;
    expect(
      normalizeListChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);
  });
});
