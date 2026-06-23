import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { describe, expect, it } from 'vitest';
import { canUseSlateNativePlaceholder } from '../canUseSlateNativePlaceholder';

describe('canUseSlateNativePlaceholder', () => {
  const editor = withReact(createEditor());

  it('单空段落纯文本时返回 true', () => {
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    expect(canUseSlateNativePlaceholder(editor)).toBe(true);
  });

  it('单空标题时返回 true', () => {
    editor.children = [{ type: 'head', level: 1, children: [{ text: '' }] }];
    expect(canUseSlateNativePlaceholder(editor)).toBe(true);
  });

  it('空标题含 tag 子节点时返回 false', () => {
    editor.children = [
      {
        type: 'head',
        level: 1,
        children: [{ text: '', tag: true } as { text: string; tag: boolean }],
      },
    ];
    expect(canUseSlateNativePlaceholder(editor)).toBe(false);
  });

  it('多 block 时返回 false', () => {
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'x' }] },
    ];
    expect(canUseSlateNativePlaceholder(editor)).toBe(false);
  });

  it('含 tag 子节点时返回 false', () => {
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '', tag: true } as { text: string; tag: boolean }],
      },
    ];
    expect(canUseSlateNativePlaceholder(editor)).toBe(false);
  });

  it('含 code 行内节点时返回 false', () => {
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '', code: true } as { text: string; code: boolean }],
      },
    ];
    expect(canUseSlateNativePlaceholder(editor)).toBe(false);
  });

  it('段落有文本时返回 false', () => {
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello' }] },
    ];
    expect(canUseSlateNativePlaceholder(editor)).toBe(false);
  });

  it('仅空白字符时 trim 后视为空，返回 true', () => {
    editor.children = [
      { type: 'paragraph', children: [{ text: '   ' }] },
    ];
    expect(canUseSlateNativePlaceholder(editor)).toBe(true);
  });

  it('非 paragraph/head 单 block 时返回 false', () => {
    editor.children = [
      {
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      },
    ];
    expect(canUseSlateNativePlaceholder(editor)).toBe(false);
  });

  it('段落含嵌套块级子节点时返回 false', () => {
    editor.children = [
      {
        type: 'paragraph',
        children: [{ type: 'link', url: 'x', children: [{ text: '' }] } as any],
      },
    ];
    expect(canUseSlateNativePlaceholder(editor)).toBe(false);
  });
});
