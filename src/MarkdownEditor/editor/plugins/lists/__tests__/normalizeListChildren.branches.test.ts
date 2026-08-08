import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../schema';
import { ListType } from '../types';
import { normalizeListChildren } from '../normalizations/normalizeListChildren';

describe('normalizeListChildren 分支覆盖', () => {
  it('非 list 节点返回 false', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    expect(
      normalizeListChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);
  });

  it('空白 text 子节点：多子时 remove 子；单子时 remove list', () => {
    const multi = createEditor();
    multi.children = [
      {
        type: ListType.UNORDERED,
        children: [
          { text: '   ' },
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'keep' }] },
            ],
          },
        ],
      },
    ] as any;
    expect(
      normalizeListChildren(multi, agenticListsSchema, [
        multi.children[0],
        [0],
      ]),
    ).toBe(true);

    const only = createEditor();
    only.children = [
      {
        type: ListType.UNORDERED,
        children: [{ text: '  ' }],
      },
    ] as any;
    expect(
      normalizeListChildren(only, agenticListsSchema, [only.children[0], [0]]),
    ).toBe(true);
  });

  it('istanbul one-miss: 非空 text 子节点触发 wrapNodes', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: ListType.ORDERED,
        children: [{ text: 'pasted item' }],
      },
    ] as any;
    expect(
      normalizeListChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(true);
  });

  it('非空 text / paragraph / nested list / 其它节点包装', () => {
    const text = createEditor();
    text.children = [
      {
        type: ListType.ORDERED,
        children: [{ text: 'item' }],
      },
    ] as any;
    expect(
      normalizeListChildren(text, agenticListsSchema, [text.children[0], [0]]),
    ).toBe(true);

    const para = createEditor();
    para.children = [
      {
        type: ListType.UNORDERED,
        children: [{ type: 'paragraph', children: [{ text: 'p' }] }],
      },
    ] as any;
    expect(
      normalizeListChildren(para, agenticListsSchema, [para.children[0], [0]]),
    ).toBe(true);

    const nested = createEditor();
    nested.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: ListType.ORDERED,
            children: [
              {
                type: 'list-item',
                children: [
                  { type: 'paragraph', children: [{ text: 'n' }] },
                ],
              },
            ],
          },
        ],
      },
    ] as any;
    expect(
      normalizeListChildren(nested, agenticListsSchema, [
        nested.children[0],
        [0],
      ]),
    ).toBe(true);

    const other = createEditor();
    other.children = [
      {
        type: ListType.UNORDERED,
        children: [{ type: 'head', level: 1, children: [{ text: 'h' }] }],
      },
    ] as any;
    expect(
      normalizeListChildren(other, agenticListsSchema, [
        other.children[0],
        [0],
      ]),
    ).toBe(true);
  });

  it('已是 list-item 子节点时返回 false', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'ok' }] },
            ],
          },
        ],
      },
    ] as any;
    expect(
      normalizeListChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);
  });
});

describe('normalizeListChildren istanbul residual：text 子节点 / 非 list', () => {
  it('非 list 节点返回 false；空白 text 多子节点删除', () => {
    // if (!schema.isListNode(node)) return false;
    // if (Text.isText(childNode))
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'p' }] },
    ] as any;
    expect(
      normalizeListChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);

    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          { text: '   ' },
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'x' }] }],
          },
        ],
      },
    ] as any;
    expect(
      normalizeListChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(true);
  });
});
