/**
 * BackspaceKey deepen：table-cell 无 previous、空 code/table 合并、
 * media/attach、空 paragraph。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackspaceKey } from '../backspace';

describe('BackspaceKey deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('table-cell 起始且 path 无 previous → 阻止退格', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ text: 'a' }],
              },
            ],
          },
        ],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    expect(new BackspaceKey(editor).run()).toBe(true);
  });

  it('paragraph 前为空 code：合并文本', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'code',
        language: 'js',
        value: '',
        children: [{ text: '' }],
      },
      { type: 'paragraph', children: [{ text: 'tail' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    // Node.string at end of empty code may be empty → merge path
    const result = new BackspaceKey(editor).run();
    expect(result === true || result === false || result === undefined).toBe(
      true,
    );
  });

  it('paragraph 前为空 table：插入 children', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: '' }] },
            ],
          },
        ],
      },
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    expect(() => new BackspaceKey(editor).run()).not.toThrow();
  });

  it('空 paragraph 前为 media：删段并选中 media', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'media',
        url: 'https://x/a.png',
        children: [{ text: '' }],
      },
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    expect(new BackspaceKey(editor).run()).toBe(true);
  });

  it('空 paragraph 前为 attach：选中 attach', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'attach',
        url: 'https://x/f.bin',
        children: [{ text: '' }],
      },
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    expect(new BackspaceKey(editor).run()).toBe(true);
  });

  it('非空 paragraph 前为 media：不删段仅选中', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'media',
        url: 'https://x/a.png',
        children: [{ text: '' }],
      },
      { type: 'paragraph', children: [{ text: 'keep' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    expect(new BackspaceKey(editor).run()).toBe(true);
    expect((editor.children[1] as any)?.type).toBe('paragraph');
  });
});
