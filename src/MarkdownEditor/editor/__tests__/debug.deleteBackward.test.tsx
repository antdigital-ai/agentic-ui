import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { BaseEditor, createEditor, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withMarkdown } from '../plugins/withMarkdown';
import {
  ReactEditor,
  withReact,
} from 'slate-react';

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

describe('Debug deleteBackward behavior', () => {
  let editor: BaseEditor & ReactEditor & HistoryEditor;

  const createTestEditor = () => {
    const baseEditor = withMarkdown(withHistory(withReact(createEditor())));
    baseEditor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    return baseEditor;
  };

  beforeEach(() => {
    editor = createTestEditor();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should debug the actual behavior', () => {
    const tagNode = {
      text: 'code',
      tag: true,
      code: true,
    };
    const emptyTextNode = { text: '' };

    editor.children = [
      {
        type: 'paragraph',
        children: [tagNode, emptyTextNode],
      },
    ];

    // 选中空文本节点的开始位置
    Transforms.select(editor, {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    });

    // 执行删除操作
    editor.deleteBackward('character');

    // 基本验证测试运行成功
    expect(editor.children).toBeDefined();
  });

  it('should debug tag deletion when it is the only node', () => {
    const tagNode = {
      text: 'code',
      tag: true,
      code: true,
    };

    editor.children = [
      {
        type: 'paragraph',
        children: [tagNode],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];

    // 选中第二个段落的开始位置
    Transforms.select(editor, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });

    // 执行删除操作
    editor.deleteBackward('character');

    // 基本验证测试运行成功
    expect(editor.children).toBeDefined();
  });

  it('should debug tag deletion with multiple siblings', () => {
    const tagNode = {
      text: 'code',
      tag: true,
      code: true,
    };
    const textNode1 = { text: 'text1' };
    const textNode2 = { text: 'text2' };

    editor.children = [
      {
        type: 'paragraph',
        children: [tagNode, textNode1, textNode2],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];

    // 选中第二个段落的开始位置
    Transforms.select(editor, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });

    // 执行删除操作
    editor.deleteBackward('character');

    // 基本验证测试运行成功
    expect(editor.children).toBeDefined();
  });
});
