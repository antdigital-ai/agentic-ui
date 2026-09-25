/**
 * withSanitizeInvalidChildren deepen：非 normalizing；text leaf；缺 children；非法子节点。
 */
import { createEditor, Editor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withSanitizeInvalidChildren } from '../withSanitizeInvalidChildren';

describe('withSanitizeInvalidChildren deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非 normalizing 时 normalize 不跑 repair', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
    ] as any;
    expect(() => editor.normalize()).not.toThrow();
  });

  it('text leaf 带非法 children 可 normalize', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'x', children: [undefined] } as any],
      },
    ] as any;
    expect(() => {
      Editor.normalize(editor, { force: true });
    }).not.toThrow();
  });

  it('元素缺 children 数组时走补齐', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [{ type: 'paragraph' } as any];
    expect(() => {
      Editor.normalize(editor, { force: true });
    }).not.toThrow();
  });

  it('元素含 null 子节点时清理', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'a' }, null, { text: 'b' }],
      } as any,
    ];
    expect(() => {
      Editor.normalize(editor, { force: true });
    }).not.toThrow();
  });
});
