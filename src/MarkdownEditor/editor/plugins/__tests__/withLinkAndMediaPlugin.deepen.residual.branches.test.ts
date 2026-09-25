/**
 * withLinkAndMediaPlugin deepen：无 url 叶；offset 回退；split media。
 */
import { createEditor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withLinkAndMediaPlugin } from '../withLinkAndMediaPlugin';

describe('withLinkAndMediaPlugin deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('空白插入到无 url 文本叶不跳出', () => {
    const editor = withLinkAndMediaPlugin(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'plain' }] },
    ] as any;
    const insert = vi.spyOn(Transforms, 'insertNodes');
    editor.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 5,
      text: '  ',
    } as any);
    expect(insert).not.toHaveBeenCalled();
    insert.mockRestore();
  });

  it('缺 offset 时回退 selection.anchor.offset', () => {
    const editor = withLinkAndMediaPlugin(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'url ', url: 'https://x' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };
    const insert = vi
      .spyOn(Transforms, 'insertNodes')
      .mockImplementation(() => undefined as any);
    editor.apply({
      type: 'insert_text',
      path: [0, 0],
      text: ' ',
    } as any);
    expect(insert).toHaveBeenCalled();
    insert.mockRestore();
  });

  it('split_node media 属性触发处理', () => {
    const editor = withLinkAndMediaPlugin(createEditor());
    editor.children = [
      {
        type: 'media',
        url: 'https://x',
        children: [{ text: '' }],
      },
    ] as any;
    expect(() =>
      editor.apply({
        type: 'split_node',
        path: [0],
        position: 0,
        properties: { type: 'media' },
      } as any),
    ).not.toThrow();
  });
});
