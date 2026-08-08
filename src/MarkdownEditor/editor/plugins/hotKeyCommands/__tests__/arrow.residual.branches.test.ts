/**
 * keyArrow residual：无 selection 早退；media 旁左右；表格上下插段。
 */
import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { keyArrow } from '../arrow';

function storeWith(editor: any) {
  return { editor } as any;
}

describe('keyArrow residual branches', () => {
  it('无 selection 直接返回', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab' }] },
    ] as any;
    editor.selection = null;
    expect(() =>
      keyArrow(storeWith(editor), {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
      } as any),
    ).not.toThrow();
  });

  it('非折叠选区不处理', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    keyArrow(storeWith(editor), {
      key: 'ArrowLeft',
      preventDefault: vi.fn(),
    } as any);
    expect(editor.selection?.anchor.offset).toBe(0);
  });

  it('media 节点左侧 ArrowLeft 可调用', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
      {
        type: 'media',
        url: 'https://x/a.png',
        children: [{ text: '' }],
      },
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    };
    const preventDefault = vi.fn();
    keyArrow(storeWith(editor), {
      key: 'ArrowLeft',
      preventDefault,
    } as any);
    expect(editor.selection).toBeTruthy();
  });

  it('表格首行上方 ArrowUp 安全', () => {
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
                children: [
                  { type: 'paragraph', children: [{ text: 'c' }] },
                ],
              },
            ],
          },
        ],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0, 0], offset: 0 },
    };
    expect(() =>
      keyArrow(storeWith(editor), {
        key: 'ArrowUp',
        preventDefault: vi.fn(),
      } as any),
    ).not.toThrow();
  });
});
