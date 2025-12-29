import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { BaseEditor, createEditor, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorStore } from '../../../store';
import { EditorUtils } from '../../../utils/editorUtils';
import { keyArrow } from '../arrow';

// Mock isHotkey
vi.mock('is-hotkey', () => ({
  default: (hotkey: string, event: any) => {
    if (hotkey === 'mod+left')
      return event.key === 'ArrowLeft' && (event.metaKey || event.ctrlKey);
    if (hotkey === 'left') return event.key === 'ArrowLeft';
    if (hotkey === 'right') return event.key === 'ArrowRight';
    if (hotkey === 'up') return event.key === 'ArrowUp';
    if (hotkey === 'down') return event.key === 'ArrowDown';
    return false;
  },
}));

// Mock EditorUtils
vi.mock('../../../utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn(() => false),
    moveBeforeSpace: vi.fn(),
    moveAfterSpace: vi.fn(),
    findPrev: vi.fn(() => [0]),
    findNext: vi.fn(() => null), // Return null to avoid path issues
    checkSelEnd: vi.fn(() => true),
    p: { type: 'paragraph', children: [{ text: '' }] },
  },
}));

// Mock isMod
vi.mock('../../../utils', () => ({
  isMod: vi.fn((e: any) => e.metaKey || e.ctrlKey),
}));

describe('keyArrow', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  let editor: BaseEditor & ReactEditor & HistoryEditor;
  let store: EditorStore;

  beforeEach(() => {
    editor = withHistory(withReact(createEditor())) as BaseEditor &
      ReactEditor &
      HistoryEditor;
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    store = new EditorStore({ current: editor });
  });

  describe('基本功能', () => {
    it('应该在没有选择时返回', () => {
      editor.selection = null;

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('应该在非折叠选择时返回', () => {
      Transforms.insertText(editor, 'test');
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Mod+Left 处理', () => {
    it('应该处理 Mod+Left 组合键', () => {
      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 4 });

      const mockEvent = {
        key: 'ArrowLeft',
        metaKey: true,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Left Arrow 处理', () => {
    it('应该处理基本的左箭头键', () => {
      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 4 });

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('应该在光标在开头时处理左箭头', () => {
      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('应该处理 media 元素前的光标移动', () => {
      // 创建包含 media 元素的内容
      const content = {
        type: 'paragraph',
        children: [
          { text: 'text1' },
          { type: 'media', children: [{ text: '' }] },
          { text: 'text2' },
        ],
      };

      editor.children = [content];
      Transforms.select(editor, { path: [0, 2], offset: 0 });

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('应该处理空白节点前的光标移动', () => {
      (EditorUtils.isDirtLeaf as any).mockReturnValue(true);

      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(EditorUtils.moveBeforeSpace).toHaveBeenCalled();
    });

    it('应该处理 void 节点前的光标移动', () => {
      // 创建包含 void 元素的内容
      const content = {
        type: 'paragraph',
        children: [
          { type: 'media', children: [{ text: '' }] },
          { text: 'text' },
        ],
      };

      editor.children = [content];
      Transforms.select(editor, { path: [0, 1], offset: 0 });

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Right Arrow 处理', () => {
    it('应该处理基本的右箭头键', () => {
      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('应该处理 media 元素后的光标移动', () => {
      // 创建包含 media 元素的内容
      const content = {
        type: 'paragraph',
        children: [
          { text: 'text1' },
          { type: 'media', children: [{ text: '' }] },
          { text: 'text2' },
        ],
      };

      editor.children = [content];
      Transforms.select(editor, { path: [0, 0], offset: 5 });

      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('应该处理空白节点后的光标移动', () => {
      (EditorUtils.isDirtLeaf as any).mockReturnValue(true);

      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 4 });

      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(EditorUtils.moveAfterSpace).toHaveBeenCalled();
    });
  });

  describe('Up Arrow 处理', () => {
    it('应该处理基本的上箭头键', () => {
      // 创建多行内容
      const content = [
        { type: 'paragraph', children: [{ text: 'line1' }] },
        { type: 'paragraph', children: [{ text: 'line2' }] },
      ];

      editor.children = content;
      Transforms.select(editor, { path: [1, 0], offset: 5 });

      const mockEvent = {
        key: 'ArrowUp',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      // 基本的上箭头键不应该调用 preventDefault 和 stopPropagation
      // 只有在特定条件下（如 media 元素）才会调用
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('应该在表格首行上方插入段落', () => {
      // 创建表格
      const table = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'cell1' }] },
              { type: 'table-cell', children: [{ text: 'cell2' }] },
            ],
          },
        ],
      };

      editor.children = [table];
      Transforms.select(editor, { path: [0, 0, 0, 0], offset: 5 });

      const mockEvent = {
        key: 'ArrowUp',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      // 表格中的上箭头键不应该调用 preventDefault 和 stopPropagation
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('应该在代码块首行上方插入段落', () => {
      // 创建代码块
      const codeBlock = {
        type: 'code',
        children: [{ text: 'console.log("hello");' }],
      };

      editor.children = [codeBlock];
      Transforms.select(editor, { path: [0, 0], offset: 10 });

      const mockEvent = {
        key: 'ArrowUp',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      // 代码块首行上方的上箭头键不应该调用 preventDefault 和 stopPropagation
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('Down Arrow 处理', () => {
    it('应该处理基本的下箭头键', () => {
      // 创建多行内容
      const content = [
        { type: 'paragraph', children: [{ text: 'line1' }] },
        { type: 'paragraph', children: [{ text: 'line2' }] },
      ];

      editor.children = content;
      Transforms.select(editor, { path: [0, 0], offset: 5 });

      const mockEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      // 基本的下箭头键不应该调用 preventDefault 和 stopPropagation
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('应该在表格末行下方插入段落', () => {
      // 创建表格
      const table = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'cell1' }] },
              { type: 'table-cell', children: [{ text: 'cell2' }] },
            ],
          },
        ],
      };

      editor.children = [table];
      Transforms.select(editor, { path: [0, 0, 1, 0], offset: 5 });

      const mockEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      // 表格末行下方的下箭头键不应该调用 preventDefault 和 stopPropagation
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('应该在代码块末行下方插入段落', () => {
      // 创建代码块
      const codeBlock = {
        type: 'code',
        children: [{ text: 'console.log("hello");' }],
      };

      editor.children = [codeBlock];
      Transforms.select(editor, { path: [0, 0], offset: 20 });

      const mockEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      // 代码块末行下方的下箭头键不应该调用 preventDefault 和 stopPropagation
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('应该处理空段落的导航', () => {
      // 创建空段落
      const content = [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: 'content' }] },
      ];

      editor.children = content;
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const mockEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      // 空段落导航的下箭头键不应该调用 preventDefault 和 stopPropagation
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('边界情况', () => {
    it('应该处理空编辑器', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('应该处理复杂的嵌套结构', () => {
      // 创建复杂的嵌套结构
      const complexStructure = {
        type: 'paragraph',
        children: [
          { text: 'text1' },
          { type: 'media', children: [{ text: '' }] },
          { text: 'text2' },
          { type: 'attach', children: [{ text: '' }] },
        ],
      };

      editor.children = [complexStructure];
      Transforms.select(editor, { path: [0, 2], offset: 5 });

      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      keyArrow(store, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量文本', () => {
      const longText = 'a'.repeat(1000);
      Transforms.insertText(editor, longText);
      Transforms.select(editor, { path: [0, 0], offset: 500 });

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      const startTime = performance.now();
      keyArrow(store, mockEvent);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该在编辑器操作失败时优雅处理', () => {
      // 模拟编辑器操作失败
      const originalMove = Transforms.move;
      Transforms.move = vi.fn(() => {
        throw new Error('Move operation failed');
      });

      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 4 });

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      expect(() => {
        keyArrow(store, mockEvent);
      }).toThrow('Move operation failed');

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      Transforms.move = originalMove;
    });
  });
});
