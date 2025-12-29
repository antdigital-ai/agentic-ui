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

describe('Debug Content Tags', () => {
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

  it('should debug code tag behavior', () => {
    const codeTagNode = {
      text: '`code',
      tag: true,
      code: true,
      triggerText: '`',
    };

    editor.children = [
      {
        type: 'paragraph',
        children: [codeTagNode],
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

  it('should debug whitespace with tick tag behavior', () => {
    const tagWithTriggerNode = {
      text: '`   ',
      tag: true,
      code: true,
      triggerText: '`',
    };

    editor.children = [
      {
        type: 'paragraph',
        children: [tagWithTriggerNode],
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
});
