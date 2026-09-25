/**
 * handlePaste deepen2：空 slate fragment 走 encoded || '[]'。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../insertParsedHtmlNodes', () => ({
  insertParsedHtmlNodes: vi.fn().mockResolvedValue(false),
}));
vi.mock('../parseMarkdownToNodesAndInsert', () => ({
  parseMarkdownToNodesAndInsert: vi.fn(),
}));
vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    replaceSelectedNode: vi.fn(),
    findMediaInsertPath: vi.fn(() => [0]),
    createMediaNode: vi.fn((url) => ({
      type: 'image',
      url,
      children: [{ text: '' }],
    })),
    findNext: vi.fn(),
  },
}));
vi.mock('../../utils', () => ({
  isMarkdown: () => false,
}));
vi.mock('../../utils/htmlToMarkdown', () => ({
  isHtml: () => false,
}));
vi.mock('../../utils/dom', () => ({
  getMediaType: () => 'image',
}));
vi.mock('../../utils/path', () => ({
  toUnixPath: (p) => p,
}));

import { handleSlateMarkdownFragment } from '../handlePaste';

describe('handlePaste deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 encoded fragment 解析为 []', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const clipboardData = {
      getData: () => '',
    };
    expect(() =>
      handleSlateMarkdownFragment(
        editor,
        clipboardData as any,
        editor.selection,
      ),
    ).not.toThrow();
  });
});
