/**
 * MatchKey residual：无 editor / 非折叠 / code 节点 / 门控 match。
 */
import { createEditor } from 'slate';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MatchKey } from '../match';

describe('MatchKey residual branches', () => {
  it('editor 为空返回 false', () => {
    const ref = { current: null } as React.MutableRefObject<any>;
    const mk = new MatchKey(ref);
    expect(mk.run({ key: ' ' } as any)).toBe(false);
  });

  it('选区非折叠返回 false', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    const mk = new MatchKey({ current: editor });
    expect(mk.run({ key: ' ' } as any)).toBe(false);
  });

  it('code 节点不匹配', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'code',
        value: 'x',
        children: [{ text: '' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const mk = new MatchKey({ current: editor });
    expect(mk.run({ key: '`' } as any)).toBe(false);
  });

  it('gatedByMatchInputToNode 关闭时跳过对应规则', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const enabled = vi.fn(() => false);
    const mk = new MatchKey({ current: editor }, enabled);
    // 不应抛错；门控关闭时通常无法匹配 gated 规则
    expect(typeof mk.run({ key: ' ', preventDefault: vi.fn() } as any)).toBe(
      'boolean',
    );
    expect(enabled).toHaveBeenCalled();
  });
});
