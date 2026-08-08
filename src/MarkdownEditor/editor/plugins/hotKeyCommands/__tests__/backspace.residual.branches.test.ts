/**
 * BackspaceKey residual：无选区、折叠 range、空 head→paragraph、media 删除。
 */
import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { BackspaceKey } from '../backspace';

describe('BackspaceKey residual branches', () => {
  it('无 selection：range/run 早退', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = null;
    const bs = new BackspaceKey(editor);
    expect(bs.range()).toBeUndefined();
    expect(bs.run()).toBeUndefined();
  });

  it('折叠选区 range 返回 false；全选删除返回 true', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hi' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    const bs = new BackspaceKey(editor);
    expect(bs.range()).toBe(false);

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(bs.range()).toBe(true);
  });

  it('空 head 转为 paragraph；media 节点删除后插入段落', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'head', level: 1, children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(new BackspaceKey(editor).run()).toBe(true);
    expect((editor.children[0] as any).type).toBe('paragraph');

    editor.children = [
      {
        type: 'media',
        url: 'https://x/a.png',
        children: [{ text: '' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(new BackspaceKey(editor).run()).toBe(true);
    expect((editor.children[0] as any).type).toBe('paragraph');
  });
});
