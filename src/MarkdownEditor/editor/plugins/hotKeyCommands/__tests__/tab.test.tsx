import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { BaseEditor, createEditor, Node, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TabKey } from '../tab';

describe('TabKey', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  let editor: BaseEditor & ReactEditor & HistoryEditor;
  let tabKey: TabKey;

  beforeEach(() => {
    editor = withHistory(withReact(createEditor())) as BaseEditor &
      ReactEditor &
      HistoryEditor;
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    tabKey = new TabKey(editor);
  });

  describe('构造函数', () => {
    it('应该正确初始化 TabKey 实例', () => {
      expect(tabKey).toBeInstanceOf(TabKey);
    });
  });

  describe('run 方法 - 基本功能', () => {
    it('应该在没有选择时返回', () => {
      editor.selection = null;

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      // 当没有选择时，不应该调用 preventDefault
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('应该在折叠选择时插入制表符', () => {
      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 4 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      const originalInsertText = editor.insertText;
      const mockInsertText = vi.fn();
      editor.insertText = mockInsertText;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockInsertText).toHaveBeenCalledWith('\t');

      editor.insertText = originalInsertText;
    });

    it('应该在 Shift+Tab 时移除制表符', () => {
      Transforms.insertText(editor, '\ttest');
      Transforms.select(editor, { path: [0, 0], offset: 1 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Node.string(editor.children[0].children[0])).toBe('test');
    });
  });

  describe('表格单元格处理', () => {
    it('应该在表格单元格中处理 Tab 键', () => {
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
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在表格单元格中处理 Shift+Tab 键', () => {
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
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('列表项处理', () => {
    it('应该在列表项中处理 Tab 键', () => {
      // 创建列表
      const list = {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'list item' }],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      Transforms.select(editor, { path: [0, 0, 0, 0], offset: 9 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在列表项中处理 Shift+Tab 键', () => {
      // 创建嵌套列表
      const list = {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'list item' }],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      Transforms.select(editor, { path: [0, 0, 0, 0], offset: 9 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('代码块处理', () => {
    it('应该在代码块中选择时处理 Tab 键', () => {
      // 创建代码块
      const codeBlock = {
        type: 'code',
        children: [{ text: 'console.log("hello");' }],
      };

      editor.children = [codeBlock];
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 20 },
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在代码块中选择时处理 Shift+Tab 键', () => {
      // 创建代码块
      const codeBlock = {
        type: 'code',
        children: [{ text: '\tconsole.log("hello");' }],
      };

      editor.children = [codeBlock];
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 21 },
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('列表处理', () => {
    it('应该在列表中选择时处理 Shift+Tab 键', () => {
      // 创建列表
      const list = {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'list item' }],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 9 },
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('边界情况', () => {
    it('应该处理空编辑器', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      const originalInsertText = editor.insertText;
      const mockInsertText = vi.fn();
      editor.insertText = mockInsertText;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockInsertText).toHaveBeenCalledWith('\t');

      editor.insertText = originalInsertText;
    });

    it('应该处理没有制表符的 Shift+Tab', () => {
      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 4 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Node.string(editor.children[0].children[0])).toBe('test');
    });

    it('应该处理复杂的嵌套结构', () => {
      // 创建复杂的嵌套结构
      const complexStructure = {
        type: 'paragraph',
        children: [
          { text: 'text1' },
          { type: 'media', children: [{ text: '' }] },
          { text: 'text2' },
        ],
      };

      editor.children = [complexStructure];
      Transforms.select(editor, { path: [0, 2], offset: 5 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      const originalInsertText = editor.insertText;
      const mockInsertText = vi.fn();
      editor.insertText = mockInsertText;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockInsertText).toHaveBeenCalledWith('\t');

      editor.insertText = originalInsertText;
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量文本', () => {
      const longText = 'a'.repeat(1000);
      Transforms.insertText(editor, longText);
      Transforms.select(editor, { path: [0, 0], offset: 500 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      const originalInsertText = editor.insertText;
      const mockInsertText = vi.fn();
      editor.insertText = mockInsertText;

      const startTime = performance.now();
      tabKey.run(mockEvent);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockInsertText).toHaveBeenCalledWith('\t');

      editor.insertText = originalInsertText;
    });
  });

  describe('错误处理', () => {
    it('应该在编辑器操作失败时优雅处理', () => {
      // 模拟编辑器操作失败
      const originalInsertText = editor.insertText;
      editor.insertText = vi.fn(() => {
        throw new Error('Insert text failed');
      });

      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 4 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      expect(() => {
        tabKey.run(mockEvent);
      }).toThrow('Insert text failed');

      expect(mockEvent.preventDefault).toHaveBeenCalled();

      editor.insertText = originalInsertText;
    });
  });
});
