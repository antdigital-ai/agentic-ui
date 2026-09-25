/**
 * normalizeListChildren deepen2：text 缺省 trim 空。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { normalizeListChildren } from '../normalizeListChildren';

describe('normalizeListChildren deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('list 下空白 text 子节点可规范化', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'bulleted-list',
        children: [{ text: '   ' }],
      },
    ] as any;
    const entry: any = [editor.children[0], [0]];
    expect(() =>
      normalizeListChildren(editor, agenticListsSchema, entry),
    ).not.toThrow();
  });
});
