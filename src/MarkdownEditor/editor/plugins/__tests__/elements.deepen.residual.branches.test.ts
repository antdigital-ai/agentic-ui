/**
 * plugins/elements deepen residual：img 空 url、list checkAllow、removeLength 回退。
 */
import { createEditor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MdElements } from '../elements';

describe('plugins/elements deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('img：match[2] 缺省走空 url', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '![alt](x)' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    };
    const match = Object.assign(['![alt]()', 'alt', undefined], {
      index: 0,
      input: '![alt]()',
      groups: undefined,
    }) as unknown as RegExpMatchArray;
    expect(() =>
      MdElements.img.run({
        editor,
        match,
        sel: editor.selection!,
        startText: match[0],
        path: [0],
        el: editor.children[0] as any,
      }),
    ).not.toThrow();
  });

  it('list.checkAllow：list-item 内非首段允许', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'a' }] },
              { type: 'paragraph', children: [{ text: '- ' }] },
            ],
          },
        ],
      },
    ] as any;
    const node: any = [editor.children[0].children[0].children[1], [0, 0, 1]];
    const allow = MdElements.list.checkAllow!({
      editor,
      node,
      sel: {
        anchor: { path: [0, 0, 1, 0], offset: 2 },
        focus: { path: [0, 0, 1, 0], offset: 2 },
      },
    });
    expect(allow).toBe(true);
  });

  it('list.checkAllow：list-item 首段拒绝', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: '- x' }] }],
          },
        ],
      },
    ] as any;
    const node: any = [editor.children[0].children[0].children[0], [0, 0, 0]];
    const allow = MdElements.list.checkAllow!({
      editor,
      node,
      sel: {
        anchor: { path: [0, 0, 0, 0], offset: 3 },
        focus: { path: [0, 0, 0, 0], offset: 3 },
      },
    });
    expect(allow).toBe(false);
  });

  it('list.checkAllow：非 paragraph 拒绝', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'head', level: 1, children: [{ text: '- x' }] },
    ] as any;
    const allow = MdElements.list.checkAllow!({
      editor,
      node: [editor.children[0], [0]] as any,
      sel: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });
    expect(allow).toBe(false);
  });

  it('list.run：选区非末尾 cutText；match 异常时 removeLength 0', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '1. rest' }] },
    ];
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    const match = '1. '.match(MdElements.list.reg)!;
    // 破坏内层 match 以走 || 0
    const weird = Object.assign([...match], {
      index: 0,
      input: match.input,
      0: '@@@',
      1: '1.',
    }) as unknown as RegExpMatchArray;

    expect(() =>
      MdElements.list.run({
        editor,
        match: weird,
        sel: editor.selection!,
        path: [0],
        el: editor.children[0] as any,
        startText: '1. ',
      }),
    ).not.toThrow();
  });

  it('list.run：* / + 无序', () => {
    for (const prefix of ['* ', '+ ']) {
      const editor = createEditor();
      editor.children = [
        { type: 'paragraph', children: [{ text: `${prefix}item` }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: prefix.length },
        focus: { path: [0, 0], offset: prefix.length },
      };
      const match = `${prefix}`.match(MdElements.list.reg)!;
      MdElements.list.run({
        editor,
        match,
        sel: editor.selection!,
        path: [0],
        el: editor.children[0] as any,
        startText: prefix,
      });
      expect((editor.children[0] as any).type).toMatch(/list/);
    }
  });
});
