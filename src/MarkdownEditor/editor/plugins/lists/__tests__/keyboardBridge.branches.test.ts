import { createEditor } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleListsOnBackspace,
  handleListsOnEnter,
  handleTabWithLists,
  isCollapsedInBlock,
} from '../keyboardBridge';

vi.mock('../ListsEditor', () => ({
  ListsEditor: {
    isListsEnabled: vi.fn(() => true),
  },
}));

vi.mock('../onKeyDown', () => ({
  onKeyDown: vi.fn(() => true),
}));

describe('lists/keyboardBridge 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('isCollapsedInBlock：无 selection / 非 collapsed / 未命中', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    expect(isCollapsedInBlock(editor, 'paragraph')).toBe(false);

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(isCollapsedInBlock(editor, 'paragraph')).toBe(false);

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(isCollapsedInBlock(editor, 'paragraph')).toBe(true);
    expect(isCollapsedInBlock(editor, 'table-cell')).toBe(false);
  });

  it('handleTabWithLists：表格单元格 / lists 关闭 / 成功', async () => {
    const { ListsEditor } = await import('../ListsEditor');
    const { onKeyDown } = await import('../onKeyDown');
    const editor = createEditor();
    editor.children = [
      {
        type: 'table-cell',
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    };
    const event = {
      key: 'Tab',
      preventDefault: vi.fn(),
    } as any;

    expect(handleTabWithLists(editor, event)).toBe(false);

    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    (ListsEditor.isListsEnabled as any).mockReturnValue(false);
    expect(handleTabWithLists(editor, event)).toBe(false);

    (ListsEditor.isListsEnabled as any).mockReturnValue(true);
    expect(handleTabWithLists(editor, event)).toBe(true);
    expect(onKeyDown).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('handleListsOnEnter / Backspace 早退与命中', async () => {
    const { ListsEditor } = await import('../ListsEditor');
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    (ListsEditor.isListsEnabled as any).mockReturnValue(false);
    expect(
      handleListsOnEnter(editor, { key: 'Enter' } as any),
    ).toBe(false);

    (ListsEditor.isListsEnabled as any).mockReturnValue(true);
    expect(
      handleListsOnEnter(editor, { key: 'a' } as any),
    ).toBe(false);
    expect(
      handleListsOnEnter(editor, {
        key: 'Enter',
        shiftKey: true,
      } as any),
    ).toBe(false);
    expect(
      handleListsOnEnter(editor, { key: 'Enter', ctrlKey: true } as any),
    ).toBe(false);
    expect(
      handleListsOnEnter(editor, { key: 'Enter', metaKey: true } as any),
    ).toBe(false);
    expect(handleListsOnEnter(editor, { key: 'Enter' } as any)).toBe(true);

    expect(
      handleListsOnBackspace(editor, { key: 'Delete' } as any),
    ).toBe(false);
    editor.selection = null;
    expect(
      handleListsOnBackspace(editor, { key: 'Backspace' } as any),
    ).toBe(false);
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(
      handleListsOnBackspace(editor, { key: 'Backspace' } as any),
    ).toBe(false);
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(
      handleListsOnBackspace(editor, { key: 'Backspace' } as any),
    ).toBe(true);
  });
});
