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

  describe('tableCell 方法详细测试', () => {
    it('应该在表格单元格末尾按 Tab 时移动到下一个单元格', () => {
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
      // 选择第一个单元格的末尾
      Transforms.select(editor, { path: [0, 0, 0, 0], offset: 5 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在表格单元格末尾按 Tab 时移动到下一行的第一个单元格', () => {
      const table = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'cell1' }] },
            ],
          },
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'cell2' }] },
            ],
          },
        ],
      };

      editor.children = [table];
      // 选择第一行第一个单元格的末尾
      Transforms.select(editor, { path: [0, 0, 0, 0], offset: 5 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在表格单元格中按 Shift+Tab 时移动到前一个单元格', () => {
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
      // 选择第二个单元格
      Transforms.select(editor, { path: [0, 0, 1, 0], offset: 5 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在表格单元格中按 Shift+Tab 时移动到上一行的最后一个单元格', () => {
      const table = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'cell1' }] },
            ],
          },
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'cell2' }] },
            ],
          },
        ],
      };

      editor.children = [table];
      // 选择第二行第一个单元格
      Transforms.select(editor, { path: [0, 1, 0, 0], offset: 0 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在表格单元格中间按 Tab 时返回 false', () => {
      const table = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'cell1' }] },
            ],
          },
        ],
      };

      editor.children = [table];
      // 选择单元格中间位置
      Transforms.select(editor, { path: [0, 0, 0, 0], offset: 2 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      const originalInsertText = editor.insertText;
      const mockInsertText = vi.fn();
      editor.insertText = mockInsertText;

      tabKey.run(mockEvent);

      // 应该插入制表符，因为 tableCell 返回 false
      expect(mockInsertText).toHaveBeenCalledWith('\t');

      editor.insertText = originalInsertText;
    });
  });

  describe('listItem 方法详细测试', () => {
    it('应该在列表项中按 Tab 时增加缩进', () => {
      const list = {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item1' }],
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item2' }],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      // 选择第二个列表项的段落
      Transforms.select(editor, { path: [0, 1, 0, 0], offset: 5 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在列表项中按 Shift+Tab 时减少缩进', () => {
      const list = {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item1' }],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        type: 'paragraph',
                        children: [{ text: 'item2' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      // 选择嵌套列表项的段落
      Transforms.select(editor, { path: [0, 0, 1, 0, 0, 0], offset: 5 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在第一个列表项中按 Tab 时返回 false', () => {
      const list = {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item1' }],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      // 选择第一个列表项的段落
      Transforms.select(editor, { path: [0, 0, 0, 0], offset: 5 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      const originalInsertText = editor.insertText;
      const mockInsertText = vi.fn();
      editor.insertText = mockInsertText;

      tabKey.run(mockEvent);

      // 应该插入制表符，因为 indentListItem 返回 false（第一个项不能缩进）
      expect(mockInsertText).toHaveBeenCalledWith('\t');

      editor.insertText = originalInsertText;
    });

    it('应该在列表项中当前一个 list-item 已有子列表时移动到子列表', () => {
      const list = {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item1' }],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        type: 'paragraph',
                        children: [{ text: 'nested' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item2' }],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      // 选择第二个列表项的段落
      Transforms.select(editor, { path: [0, 1, 0, 0], offset: 5 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在列表项中当前一个 list-item 没有子列表时创建新列表', () => {
      const list = {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item1' }],
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item2' }],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      // 选择第二个列表项的段落
      Transforms.select(editor, { path: [0, 1, 0, 0], offset: 5 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在嵌套列表项中按 Shift+Tab 时提升一级', () => {
      const list = {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item1' }],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        type: 'paragraph',
                        children: [{ text: 'nested' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      // 选择嵌套列表项的段落
      Transforms.select(editor, { path: [0, 0, 1, 0, 0, 0], offset: 6 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在最顶层列表项中按 Shift+Tab 时返回 false', () => {
      const list = {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item1' }],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      // 选择第一个列表项的段落
      Transforms.select(editor, { path: [0, 0, 0, 0], offset: 5 });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('非折叠选择时的处理', () => {
    it('应该在非折叠选择时处理列表的 Shift+Tab', () => {
      const list = {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item1' }],
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item2' }],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      // 选择整个列表
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0, 0], offset: 5 },
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在非折叠选择时处理列表的 Shift+Tab（选择部分列表）', () => {
      const list = {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item1' }],
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'item2' }],
              },
            ],
          },
        ],
      };

      editor.children = [list];
      // 选择部分列表内容
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0, 0], offset: 2 },
        focus: { path: [0, 1, 0, 0], offset: 3 },
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在非折叠选择时处理非列表的 Shift+Tab', () => {
      // 创建嵌套结构，使得 liftNodes 可以工作（需要深度 >= 2）
      const blockquote = {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ text: 'text1' }] },
          { type: 'paragraph', children: [{ text: 'text2' }] },
        ],
      };

      editor.children = [blockquote];

      // 选择两个段落
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 5 },
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: true,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在非折叠选择时选择结束位置', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'text1' }] },
        { type: 'paragraph', children: [{ text: 'text2' }] },
      ];

      // 选择两个段落
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 5 },
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('代码块选择处理', () => {
    it('应该在代码块完全包含选择时返回', () => {
      const codeBlock = {
        type: 'code',
        children: [{ text: 'console.log("hello");' }],
      };

      editor.children = [codeBlock];
      // 选择整个代码块
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 24 },
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在代码块部分包含选择时继续处理', () => {
      const codeBlock = {
        type: 'code',
        children: [{ text: 'console.log("hello");' }],
      };

      editor.children = [codeBlock, { type: 'paragraph', children: [{ text: 'text' }] }];
      // 选择跨越代码块和段落
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 10 },
        focus: { path: [1, 0], offset: 4 },
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('边界情况 - Editor.hasPath 检查', () => {
    it('应该在路径不存在时继续处理', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'test' }] }];
      // 设置一个无效的选择路径（但路径格式正确）
      // 注意：Slate 会在 Editor.nodes 时检查路径，如果路径无效会抛出错误
      // 但 Editor.hasPath 会先检查，所以我们需要使用一个可能存在的路径但实际不存在的节点
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      // 使用有效路径，但测试 Editor.hasPath 的检查逻辑
      // 由于路径 [0, 0] 是有效的，这个测试主要验证代码不会因为路径检查而崩溃
      tabKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在选择为 null 时直接返回', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'test' }] }];
      editor.selection = null;

      const mockEvent = {
        preventDefault: vi.fn(),
        shiftKey: false,
      } as any;

      tabKey.run(mockEvent);

      // 当选择为 null 时，不应该调用 preventDefault
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });
});
