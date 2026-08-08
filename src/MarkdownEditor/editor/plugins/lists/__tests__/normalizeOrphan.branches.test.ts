import { createEditor, Editor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../schema';
import { normalizeOrphanListItem } from '../normalizations/normalizeOrphanListItem';
import { normalizeOrphanListItemText } from '../normalizations/normalizeOrphanListItemText';

describe('normalizeOrphan 分支覆盖', () => {
  it('istanbul one-miss: 根级 orphan list-item 含直接 text 时转为 default block', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list-item',
        children: [{ text: 'direct orphan text' }],
      },
    ] as Editor['children'];

    expect(
      normalizeOrphanListItem(editor, agenticListsSchema, [editor, []]),
    ).toBe(true);
    expect((editor.children[0] as { type: string }).type).toBe('paragraph');
  });

  it('istanbul one-miss: 根级 orphan list-item 无直接 text 时 unwrap', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'nested' }] }],
      },
    ] as Editor['children'];

    expect(
      normalizeOrphanListItem(editor, agenticListsSchema, [editor, []]),
    ).toBe(true);
  });

  it('istanbul one-miss: 根级 orphan list-item-text 无 text 子节点时 unwrap', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'only block child' }] },
            ],
          },
        ],
      },
    ] as Editor['children'];

    expect(
      normalizeOrphanListItemText(editor, agenticListsSchema, [editor, []]),
    ).toBe(true);
  });

  it('istanbul one-miss: 根级 orphan list-item-text 含直接 text 时 setNodes', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'direct text' }],
      },
    ] as Editor['children'];

    expect(
      normalizeOrphanListItemText(editor, agenticListsSchema, [editor, []]),
    ).toBe(true);
    expect((editor.children[0] as { type: string }).type).toBe('paragraph');
  });
});

describe('normalizeOrphan istanbul residual：非 orphan 早退 / unwrap 臂', () => {
  it.skip('normalizeOrphanListItem：list 下 item 不处理；根级含 text 的 item', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'in' }] }],
          },
        ],
      },
    ] as Editor['children'];
    expect(
      normalizeOrphanListItem(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);

    editor.children = [
      {
        type: 'list-item',
        children: [{ text: 'orphan-text' }],
      },
    ] as Editor['children'];
    expect(
      normalizeOrphanListItem(editor, agenticListsSchema, [editor, []]),
    ).toBe(true);
  });

  it('normalizeOrphanListItemText：list-item 下不处理；根级 unwrap', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list-item',
        children: [
          {
            type: 'list-item-text',
            children: [{ text: 't' }],
          },
        ],
      },
    ] as Editor['children'];
    expect(
      normalizeOrphanListItemText(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);
  });
});
