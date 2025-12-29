import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { BaseEditor, createEditor, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withMarkdown } from '../plugins/withMarkdown';

// Mock ReactEditor DOM methods
vi.mock('slate-react', () => ({
  ReactEditor: {
    toDOMNode: vi.fn(() => ({
      querySelector: vi.fn(() => ({
        textContent: '',
      })),
    })),
  },
  withReact: (editor: any) => editor,
}));

describe('Debug Trim Length Condition', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  let editor: BaseEditor & ReactEditor & HistoryEditor;

  const createTestEditor = () => {
    const baseEditor = withMarkdown(withHistory(withReact(createEditor())));
    baseEditor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    return baseEditor;
  };

  beforeEach(() => {
    editor = createTestEditor();
  });

  it('should debug empty tag behavior', () => {
    const emptyTagNode = {
      text: '',
      tag: true,
      code: true,
      triggerText: '`',
    };

    editor.children = [
      {
        type: 'paragraph',
        children: [emptyTagNode],
      },
    ];

    // 选中空标签节点的开始位置 (offset < 1)
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    // 执行删除操作
    editor.deleteBackward('character');

    // 让测试通过，主要是为了观察日志
    expect(true).toBe(true);
  });

  it('should debug whitespace tag behavior', () => {
    const whitespaceTagNode = {
      text: '   ',
      tag: true,
      code: true,
      triggerText: '`',
    };

    editor.children = [
      {
        type: 'paragraph',
        children: [whitespaceTagNode],
      },
    ];

    // 选中标签节点的开始位置 (offset < 1)
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    // 执行删除操作
    editor.deleteBackward('character');

    expect(true).toBe(true);
  });

  it('should debug tag with content behavior', () => {
    const contentTagNode = {
      text: ' hello ',
      tag: true,
      code: true,
      triggerText: '`',
    };

    editor.children = [
      {
        type: 'paragraph',
        children: [contentTagNode],
      },
    ];

    // 选中标签节点的开始位置 (offset < 1)
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    // 执行删除操作
    editor.deleteBackward('character');

    expect(true).toBe(true);
  });

  it('should debug offset >= 1 behavior', () => {
    const emptyTagNode = {
      text: '  ',
      tag: true,
      code: true,
      triggerText: '`',
    };

    editor.children = [
      {
        type: 'paragraph',
        children: [emptyTagNode],
      },
    ];

    // 选中标签节点的中间位置 (offset >= 1)
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    // 执行删除操作
    editor.deleteBackward('character');

    expect(true).toBe(true);
  });
});
