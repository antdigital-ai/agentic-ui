import { createEditor, Editor } from 'slate';
import { describe, expect, it } from 'vitest';
import { withAgenticLists } from '../withAgenticLists';
import { createListFromToolbar } from '../createListFromToolbar';
import { ListType } from '../types';

describe('createListFromToolbar 分支覆盖', () => {
  it('istanbul one-miss: selection 为 null 时早退', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as Editor['children'];
    editor.selection = null;

    createListFromToolbar(editor, 'unordered');

    expect((editor.children[0] as { type: string }).type).toBe('paragraph');
  });

  it('istanbul one-miss: lists 未启用时早退', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as Editor['children'];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    createListFromToolbar(editor, 'unordered');

    expect((editor.children[0] as { type: string }).type).toBe('paragraph');
  });

  it('istanbul one-miss: 选区无 wrappable block 时不改动', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      { type: 'code', language: 'js', children: [{ text: 'const x = 1' }] },
    ] as Editor['children'];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    createListFromToolbar(editor, 'ordered');

    expect((editor.children[0] as { type: string }).type).toBe('code');
  });

  it('已有列表时再次点击同模式会 unwrap', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'item' }] },
            ],
          },
        ],
      },
    ] as Editor['children'];
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };

    createListFromToolbar(editor, 'unordered');

    expect((editor.children[0] as { type: string }).type).toBe('paragraph');
  });
});

describe('createListFromToolbar istanbul residual：无 selection 早退', () => {
  it('selection null 时不改动', () => {
    // if (!editor.selection) return;
    const editor = withAgenticLists(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as Editor['children'];
    editor.selection = null;
    createListFromToolbar(editor, 'unordered');
    expect((editor.children[0] as { type: string }).type).toBe('paragraph');
  });
});
