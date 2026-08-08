/**
 * withSanitize deepen2：纯 text leaf 不 strip；Editor 根路径；
 * 非 Element 对象节点；合法 Element 直接 normalizeNode。
 */
import { createEditor, Editor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withSanitizeInvalidChildren } from '../withSanitizeInvalidChildren';

describe('withSanitizeInvalidChildren deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('纯 text leaf 走 normalizeNode 不早退 strip', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'plain' }] },
    ] as any;
    expect(() => Editor.normalize(editor, { force: true })).not.toThrow();
  });

  it('force normalize 覆盖 Editor 根入口', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ] as any;
    expect(() => Editor.normalize(editor, { force: true })).not.toThrow();
    expect(editor.children.length).toBeGreaterThan(0);
  });

  it('合法段落 Element 无非法子节点时落到最终 normalizeNode', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    const spy = vi.fn();
    const original = editor.normalizeNode;
    editor.normalizeNode = (entry) => {
      spy(entry);
      return original.call(editor, entry);
    };
    withSanitizeInvalidChildren(editor);
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ok' }] },
    ] as any;
    expect(() => Editor.normalize(editor, { force: true })).not.toThrow();
    expect(spy.mock.calls.length).toBeGreaterThan(0);
  });
});
