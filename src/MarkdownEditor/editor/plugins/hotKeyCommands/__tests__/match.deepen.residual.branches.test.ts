/**
 * MatchKey deepen：无 editor / 非 collapsed / code 节点早退。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchKey } from '../match';

describe('MatchKey deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('editorRef 为空返回 false', () => {
    const ref = { current: null };
    const mk = new MatchKey(ref);
    expect(mk.run({ key: ' ' } as any)).toBe(false);
  });

  it('非 collapsed selection 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    const mk = new MatchKey({ current: editor });
    expect(mk.run({ key: ' ' } as any)).toBe(false);
  });

  it('code 节点返回 false', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'code', children: [{ text: 'x' }], value: 'x', language: 'js' },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const mk = new MatchKey({ current: editor });
    expect(mk.run({ key: ' ' } as any)).toBe(false);
  });
});
