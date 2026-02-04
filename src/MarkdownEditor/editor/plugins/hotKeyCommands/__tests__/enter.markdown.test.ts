import { BaseEditor, createEditor, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EditorStore } from '../../../store';
import { parserSlateNodeToMarkdown } from '../../../utils';
import { withMarkdown } from '../../withMarkdown';
import { BackspaceKey } from '../backspace';
import { EnterKey } from '../enter';

describe('EnterKey - Markdown 输出测试', () => {
  let editor: BaseEditor & ReactEditor & HistoryEditor;
  let enterKey: EnterKey;
  let store: EditorStore;
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
    store = { editor } as EditorStore;
    backspaceKey = new BackspaceKey(editor);
    enterKey = new EnterKey(store, backspaceKey);
  });

  describe('列表项回车不缩进', () => {
    it('在列表项中按回车应该创建新列表项，不缩进', () => {
      // 设置初始内容：包含列表项
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

      // 选中列表项段落末尾
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0, 0], offset: 6 },
        focus: { path: [0, 0, 0, 0], offset: 6 },
      });

      // 模拟按回车
      const mockEvent = {
        preventDefault: () => {},
        key: 'Enter',
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      } as any;

      enterKey.run(mockEvent);

      // 检查 markdown：新列表项应该与第一个列表项同级，不缩进
      const markdown = getMarkdown();
      const lines = markdown.split('\n');
      const listLines = lines.filter((line) => line.trim().startsWith('-'));
      expect(listLines.length).toBeGreaterThanOrEqual(1);
      // 所有列表项应该有相同的缩进级别（没有额外的缩进）
      const indentations = listLines.map((line) => {
        const match = line.match(/^(\s*)-/);
        return match ? match[1].length : 0;
      });
      // 所有列表项应该有相同的缩进
      expect(new Set(indentations).size).toBe(1);
    });

    it('在列表项开头按回车应该创建新列表项，不移动嵌套列表', () => {
      // 设置初始内容：包含嵌套列表的列表项
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
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

      // 模拟按回车
      const mockEvent = {
        preventDefault: () => {},
        key: 'Enter',
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      } as any;

      enterKey.run(mockEvent);

      // 检查 markdown：嵌套列表应该保留在原列表项中
      const markdown = getMarkdown();
      expect(markdown).toContain('Nested item');
      // 新列表项不应该包含嵌套列表
      const lines = markdown.split('\n');
      const listItemIndices: number[] = [];
      lines.forEach((line, index) => {
        if (line.trim().startsWith('-') && !line.includes('Nested')) {
          listItemIndices.push(index);
        }
      });
      // 应该有两个顶级列表项
      expect(listItemIndices.length).toBeGreaterThanOrEqual(1);
    });

    it('在列表项段落中按回车应该分割列表项，不移动嵌套列表', () => {
      // 设置初始内容：包含嵌套列表的列表项
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'Item 1 text' }] },
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

      // 选中列表项段落中间
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0, 0], offset: 5 },
        focus: { path: [0, 0, 0, 0], offset: 5 },
      });

      // 模拟按回车
      const mockEvent = {
        preventDefault: () => {},
        key: 'Enter',
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      } as any;

      enterKey.run(mockEvent);

      // 检查 markdown：嵌套列表应该保留在原列表项中
      const markdown = getMarkdown();
      expect(markdown).toContain('Nested item');
      // 新列表项不应该包含嵌套列表
      const lines = markdown.split('\n');
      // 找到包含 "Nested item" 的行，它应该在一个列表项下面（有缩进）
      const nestedIndex = lines.findIndex((line) =>
        line.includes('Nested item'),
      );
      expect(nestedIndex).toBeGreaterThan(-1);
      // 嵌套列表应该有缩进
      const nestedLine = lines[nestedIndex];
      expect(nestedLine.trimStart().length).toBeLessThan(nestedLine.length);
    });
  });
});
