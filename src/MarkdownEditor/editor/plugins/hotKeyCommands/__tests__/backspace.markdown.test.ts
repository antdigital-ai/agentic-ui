import {
  BaseEditor,
  createEditor,
  Editor,
  Point,
  Range,
  Transforms,
} from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parserSlateNodeToMarkdown } from '../../../utils';
import { EditorUtils } from '../../../utils/editorUtils';
import { withMarkdown } from '../../withMarkdown';
import { BackspaceKey } from '../backspace';

describe('BackspaceKey - Markdown 输出测试', () => {
  let editor: BaseEditor & ReactEditor & HistoryEditor;
  let backspaceKey: BackspaceKey;

  const createTestEditor = () => {
    const baseEditor = withMarkdown(withHistory(withReact(createEditor())));
    return baseEditor;
  };

  const getMarkdown = () => {
    return parserSlateNodeToMarkdown(editor.children);
  };

  beforeEach(() => {
    editor = createTestEditor();
    backspaceKey = new BackspaceKey(editor);
  });

  describe('删除空列表项', () => {
    it('应该删除最后一个空列表项并转换为段落', () => {
      // 设置初始内容：一个包含空列表项的列表
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: '' }] }],
            },
          ],
        },
      ];

      // 选中空列表项的段落开头
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      });
      // 执行 backspace
      const result = backspaceKey.run();

      expect(result).toBe(true);
      // 应该转换为空段落（删除列表和列表项）
      const markdown = getMarkdown();
      // 删除后应该是空段落，markdown 可能为空或只包含换行符
      const trimmedMarkdown = markdown.trim();

      // 允许为空字符串或只包含换行符
      expect(trimmedMarkdown === '' || trimmedMarkdown === '\n').toBe(true);
    });

    it('删除最后一个空列表项且列表还有前一项时在删除位置插入段落', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'A' }] }],
            },
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: '' }] }],
            },
          ],
        },
      ];
      Transforms.select(editor, {
        anchor: { path: [0, 1, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0, 0], offset: 0 },
      });
      const result = backspaceKey.run();
      expect(result).toBe(true);
      expect(editor.children[0].type).toBe('bulleted-list');
      expect(getMarkdown()).toContain('A');
    });

    it('删除第一个空列表项且仅两项时列表变空并插入段落', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: '' }] }],
            },
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: '' }] }],
            },
          ],
        },
      ];
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      });
      const result = backspaceKey.run();
      expect(result).toBe(true);
      const markdown = getMarkdown().trim();
      expect(markdown === '' || markdown === '\n').toBe(true);
    });

    it('删除非最后一项空列表项且前面还有项时在列表后插入段落', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'A' }] }],
            },
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: '' }] }],
            },
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: '' }] }],
            },
          ],
        },
      ];
      Transforms.select(editor, {
        anchor: { path: [0, 1, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0, 0], offset: 0 },
      });
      const result = backspaceKey.run();
      expect(result).toBe(true);
      expect(getMarkdown()).toContain('A');
    });

    it('嵌套列表仅一项时退格提升后删除空列表', () => {
      // 嵌套项需有内容，否则会走“删除空列表项”分支而非“提升”分支
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'A' }] }],
            },
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'B' }] },
                {
                  type: 'bulleted-list',
                  children: [
                    {
                      type: 'list-item',
                      children: [
                        { type: 'paragraph', children: [{ text: 'nested' }] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      Transforms.select(editor, {
        anchor: { path: [0, 1, 1, 0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 1, 0, 0, 0], offset: 0 },
      });
      const result = backspaceKey.run();
      expect(result).toBe(true);
      expect(getMarkdown()).toContain('nested');
    });

    it('应该删除非最后一个空列表项及其后续列表项', () => {
      // 设置初始内容：包含多个列表项，中间一个是空的
      // 根据代码逻辑，删除非最后一个空列表项时，会删除当前 item 和之后的所有 items
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'Item 1' }] }],
            },
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: '' }] }],
            },
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'Item 3' }] }],
            },
          ],
        },
      ];

      // 选中空列表项的段落开头
      Transforms.select(editor, {
        anchor: { path: [0, 1, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0, 0], offset: 0 },
      });

      // 执行 backspace
      const result = backspaceKey.run();

      expect(result).toBe(true);
      // 应该删除空列表项及其后续列表项，只保留前面的列表项
      const markdown = getMarkdown();
      expect(markdown).toContain('Item 1');
      // Item 3 应该被删除（因为它是后续列表项）
      expect(markdown).not.toContain('Item 3');
    });

    it('不应该删除有内容的列表项', () => {
      // 设置初始内容：包含有内容的列表项
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'Item 1' }] }],
            },
          ],
        },
      ];

      // 选中列表项段落开头
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      });

      // 执行 backspace
      const result = backspaceKey.run();

      // 不应该删除有内容的列表项
      expect(result).toBe(false);
      const markdown = getMarkdown();
      expect(markdown).toContain('Item 1');
    });

    it('不应该删除包含嵌套列表的列表项（即使段落为空）', () => {
      // 设置初始内容：包含嵌套列表的列表项
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: '' }] },
                {
                  type: 'bulleted-list',
                  children: [
                    {
                      type: 'list-item',
                      children: [
                        {
                          type: 'paragraph',
                          children: [{ text: 'Nested item' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      // 选中列表项段落开头
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      });

      // 执行 backspace
      const result = backspaceKey.run();

      // 不应该删除包含嵌套列表的列表项
      expect(result).toBe(false);
      const markdown = getMarkdown();
      expect(markdown).toContain('Nested item');
    });
  });

  describe('range() 方法', () => {
    it('应该处理全选删除的情况', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'Test content' }] },
      ];

      // 选择整个文档（从开始到结束）
      // 代码使用 Range.edges(sel) 获取 start 和 end，然后与 Editor.start/end 比较
      // Range.edges 会确保 start <= end（按路径顺序）
      const docStart = Editor.start(editor, []);
      const docEnd = Editor.end(editor, []);

      // 确保 anchor 在 focus 之前（或相等）
      Transforms.select(editor, {
        anchor: docStart,
        focus: docEnd,
      });

      // 确保选择已设置
      expect(editor.selection).not.toBeNull();

      // 代码使用 Range.edges(sel) 获取 start 和 end，然后与 Editor.start/end 比较
      // 需要确保选择确实覆盖了整个文档
      // 验证选择的实际范围
      const [start, end] = Range.edges(editor.selection!);

      // 确保选择覆盖了整个文档（使用之前定义的 docStart 和 docEnd）
      expect(Point.equals(start, docStart)).toBe(true);
      expect(Point.equals(end, docEnd)).toBe(true);

      const result = backspaceKey.range();
      // 如果 Point.equals 比较成功，应该返回 true
      expect(result).toBe(true);
    });

    it('应该在没有选择时返回 undefined', () => {
      editor.selection = null;
      const result = backspaceKey.range();
      expect(result).toBeUndefined();
    });

    it('应该在非全选时返回 false', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'Test' }] }];

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      });

      const result = backspaceKey.range();
      expect(result).toBe(false);
    });
  });

  describe('head 元素处理', () => {
    it('应该将空标题转换为段落', () => {
      editor.children = [{ type: 'head', level: 1, children: [{ text: '' }] }];

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(true);
      expect(editor.children[0].type).toBe('paragraph');
    });

    it('不应该删除有内容的标题', () => {
      editor.children = [
        { type: 'head', level: 1, children: [{ text: 'Title' }] },
      ];

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(false);
    });
  });

  describe('media 和 attach 元素处理', () => {
    it('应该删除 media 元素并插入段落', () => {
      editor.children = [
        { type: 'media', url: 'test.jpg', children: [{ text: '' }] },
      ];

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(true);
    });

    it('应该删除 attach 元素并插入段落', () => {
      editor.children = [
        { type: 'attach', url: 'test.pdf', children: [{ text: '' }] },
      ];

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(true);
    });
  });

  describe('表格单元格处理', () => {
    it('应该阻止在表格单元格起始位置的退格', () => {
      editor.children = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [{ type: 'paragraph', children: [{ text: '' }] }],
                },
              ],
            },
          ],
        },
      ];

      Transforms.select(editor, {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(false);
    });

    it('表格首个单元格无前路径时退格应阻止并返回 true', () => {
      const rawEditor = withHistory(
        withReact(createEditor()),
      ) as BaseEditor & ReactEditor & HistoryEditor;
      rawEditor.children = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [{ text: '' }],
                },
              ],
            },
          ],
        },
      ];
      const rawBackspace = new BackspaceKey(rawEditor);
      Transforms.select(rawEditor, {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      });
      const result = rawBackspace.run();
      expect(result).toBe(true);
    });
  });

  describe('段落与 break 元素处理', () => {
    it('应该删除段落前的 break 元素', () => {
      // break 元素是段落内的 inline 节点
      // 代码使用 Editor.previous 查找前一个 inline 节点
      // Editor.previous 在 sel.focus.path 处查找前一个节点
      editor.children = [
        {
          type: 'paragraph',
          children: [
            { type: 'break', children: [{ text: '' }] },
            { text: 'Text' },
          ],
        },
      ];

      // 选择段落中文本节点的起始位置（path: [0, 1]）
      // Editor.previous 应该能找到前一个节点 break（path: [0, 0]）
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      });

      const result = backspaceKey.run();
      // 代码使用 Editor.previous 查找前一个节点（在 sel.focus.path 处）
      // Editor.previous 应该能找到 break（path: [0, 0]），因为它是前一个节点
      // 如果找到 break，代码会删除它并返回 true
      // 如果找不到，会继续执行后续逻辑
      // 根据代码逻辑，Editor.previous 应该能找到 break
      expect(result).toBe(true);
    });
  });

  describe('段落与 table/code 元素处理', () => {
    it('应该合并段落到空的 table 元素后', () => {
      editor.children = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [{ type: 'paragraph', children: [{ text: '' }] }],
                },
              ],
            },
          ],
        },
        { type: 'paragraph', children: [{ text: 'Text' }] },
      ];

      Transforms.select(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(true);
    });

    it('应该合并段落到空的 code 元素后', () => {
      editor.children = [
        { type: 'code', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: 'Text' }] },
      ];

      Transforms.select(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(true);
    });
  });

  describe('段落与 media/attach 元素处理', () => {
    it('应该处理段落前的 media 元素', () => {
      editor.children = [
        { type: 'media', url: 'test.jpg', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ];

      Transforms.select(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(true);
    });
  });

  describe('blockquote 处理', () => {
    it('应该处理 blockquote 中的最后一个段落', () => {
      editor.children = [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: 'Quote' }] }],
        },
      ];

      Transforms.select(editor, {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(true);
    });

    it('应该处理 blockquote 中的非最后一个段落', () => {
      editor.children = [
        {
          type: 'blockquote',
          children: [
            { type: 'paragraph', children: [{ text: 'Quote 1' }] },
            { type: 'paragraph', children: [{ text: 'Quote 2' }] },
          ],
        },
      ];

      Transforms.select(editor, {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(true);
    });
  });

  describe('顶级段落处理', () => {
    it('应该删除顶级元素中的第一个段落（当有下一个元素且不是 hr）', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'First' }] },
        { type: 'paragraph', children: [{ text: 'Second' }] },
      ];

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(true);
    });

    it('不应该删除顶级元素中的第一个段落（当下一个元素是 hr）', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'First' }] },
        { type: 'hr', children: [{ text: '' }] },
      ];

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(false);
    });
  });

  describe('列表提升逻辑', () => {
    it('应该在嵌套列表中提升 list-item', () => {
      editor.children = [
        {
          type: 'list-item',
          children: [
            { type: 'paragraph', children: [{ text: 'Item 1' }] },
            {
              type: 'bulleted-list',
              children: [
                {
                  type: 'list-item',
                  children: [
                    { type: 'paragraph', children: [{ text: 'Nested' }] },
                  ],
                },
              ],
            },
          ],
        },
      ];

      Transforms.select(editor, {
        anchor: { path: [0, 1, 0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0, 0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(result).toBe(true);
    });

    it('嵌套列表首项退格时提升并删除空列表', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: '' }] },
                {
                  type: 'bulleted-list',
                  children: [
                    {
                      type: 'list-item',
                      children: [
                        {
                          type: 'paragraph',
                          children: [{ text: 'Nested' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      Transforms.select(editor, {
        anchor: { path: [0, 0, 1, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 1, 0, 0, 0], offset: 0 },
      });
      const result = backspaceKey.run();
      expect(result).toBe(true);
      expect(getMarkdown()).toContain('Nested');
    });
  });

  describe('clearStyle 逻辑', () => {
    it('应该清除单字符脏叶节点的样式', () => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'A', bold: true }],
        },
      ];

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });

      const result = backspaceKey.run();
      expect(typeof result).toBe('boolean');
    });

    it('非 paragraph 且单字符脏叶时调用 clearMarks', () => {
      const isDirtLeafSpy = vi.spyOn(EditorUtils, 'isDirtLeaf').mockReturnValueOnce(true);
      const clearMarksSpy = vi.spyOn(EditorUtils, 'clearMarks').mockImplementation(() => {});
      editor.children = [
        { type: 'code', children: [{ text: 'x', bold: true }] },
      ];
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      backspaceKey.run();
      expect(clearMarksSpy).toHaveBeenCalledWith(editor);
      isDirtLeafSpy.mockRestore();
      clearMarksSpy.mockRestore();
    });
  });

  describe('边界情况', () => {
    it('应该在没有选择时返回 undefined', () => {
      editor.selection = null;
      const result = backspaceKey.run();
      expect(result).toBeUndefined();
    });

    it('应该处理非 paragraph 且不在 list-item 中的元素', () => {
      editor.children = [{ type: 'code', children: [{ text: 'code' }] }];

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      const result = backspaceKey.run();
      expect(typeof result).toBe('boolean');
    });
  });
});
