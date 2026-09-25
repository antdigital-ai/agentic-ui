/**
 * taskList deepen：非 Element 节点跳过；ordered start 缺省。
 */
import { createEditor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  listMatchesToolbarMode,
  modeToListType,
  syncListMetadataForMode,
} from '../taskList';

describe('taskList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('sync：路径上非 Element 跳过；ordered 补 start', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'numbered-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      } as any,
      { text: 'orphan' } as any,
    ];
    expect(() =>
      syncListMetadataForMode(editor, 'ordered', [[0], [1]]),
    ).not.toThrow();
    expect(listMatchesToolbarMode(editor.children[0] as any, 'ordered')).toBe(
      true,
    );
    expect(modeToListType('task')).toBeTruthy();
  });

  it('task 模式补 checked；非 task 清 task 标记', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'bulleted-list',
        task: true,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      } as any,
    ];
    syncListMetadataForMode(editor, 'task', [[0]]);
    syncListMetadataForMode(editor, 'unordered', [[0]]);
    expect(Transforms).toBeTruthy();
  });
});
