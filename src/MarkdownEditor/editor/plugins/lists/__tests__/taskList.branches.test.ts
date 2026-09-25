/**
 * taskList：toolbar mode 匹配与 metadata 同步分支。
 */
import { createEditor, Transforms } from 'slate';
import { describe, expect, it } from 'vitest';
import { ListType } from '../types';
import {
  listMatchesToolbarMode,
  modeToListType,
  syncListMetadataForMode,
} from '../taskList';

describe('taskList branches', () => {
  it('listMatchesToolbarMode / modeToListType', () => {
    expect(
      listMatchesToolbarMode(
        { type: ListType.ORDERED, children: [] } as any,
        'ordered',
      ),
    ).toBe(true);
    expect(
      listMatchesToolbarMode(
        { type: ListType.UNORDERED, children: [] } as any,
        'ordered',
      ),
    ).toBe(false);
    expect(
      listMatchesToolbarMode(
        { type: ListType.UNORDERED, task: true, children: [] } as any,
        'task',
      ),
    ).toBe(true);
    expect(
      listMatchesToolbarMode(
        { type: ListType.UNORDERED, task: true, children: [] } as any,
        'unordered',
      ),
    ).toBe(false);
    expect(
      listMatchesToolbarMode(
        { type: ListType.UNORDERED, children: [] } as any,
        'unordered',
      ),
    ).toBe(true);

    expect(modeToListType('ordered')).toBe(ListType.ORDERED);
    expect(modeToListType('unordered')).toBe(ListType.UNORDERED);
    expect(modeToListType('task')).toBe(ListType.UNORDERED);
  });

  it('syncListMetadataForMode：跳过无效 path / 非 Element；ordered start；task checked；清 task', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: ListType.ORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
      {
        type: ListType.UNORDERED,
        task: true,
        children: [
          {
            type: 'list-item',
            checked: true,
            children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
          },
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
          },
        ],
      },
      { type: 'paragraph', children: [{ text: 'p' }] },
    ] as any;

    syncListMetadataForMode(editor, 'ordered', [[99], [0], [2]]);
    expect((editor.children[0] as any).start).toBe(1);

    Transforms.setNodes(editor, { start: 3 } as any, { at: [0] });
    syncListMetadataForMode(editor, 'ordered', [[0]]);
    expect((editor.children[0] as any).start).toBe(3);

    syncListMetadataForMode(editor, 'task', [[1]]);
    expect((editor.children[1] as any).task).toBe(true);
    expect((editor.children[1] as any).children[1].checked).toBe(false);
    expect((editor.children[1] as any).children[0].checked).toBe(true);

    syncListMetadataForMode(editor, 'unordered', [[1]]);
    expect((editor.children[1] as any).task).toBeUndefined();
  });
});
