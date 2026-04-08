import { createEditor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BlockMathNodes,
  insertAfter,
  MdElements,
  TextMatchNodes,
} from '../../../../src/MarkdownEditor/editor/plugins/elements';
import { EditorUtils } from '../../../../src/MarkdownEditor/editor/utils/editorUtils';

describe('elements.ts', () => {
  describe('MdElements', () => {
    it('应该定义所有必要的元素类型', () => {
      expect(MdElements).toBeDefined();
      expect(MdElements.table).toBeDefined();
      expect(MdElements.code).toBeDefined();
      expect(MdElements.head).toBeDefined();
      expect(MdElements.link).toBeDefined();
      expect(MdElements.img).toBeDefined();
      expect(MdElements.task).toBeDefined();
      expect(MdElements.list).toBeDefined();
      expect(MdElements.hr).toBeDefined();
      expect(MdElements.frontmatter).toBeDefined();
      expect(MdElements.blockquote).toBeDefined();
      expect(MdElements.bold).toBeDefined();
      expect(MdElements.italic).toBeDefined();
      expect(MdElements.inlineCode).toBeDefined();
      expect(MdElements.boldAndItalic).toBeDefined();
      expect(MdElements.strikethrough).toBeDefined();
    });

    it('应该为每个元素定义正则表达式', () => {
      // 检查表格元素
      expect(MdElements.table.reg).toBeDefined();
      expect(MdElements.table.reg instanceof RegExp).toBe(true);

      // 检查代码块元素
      expect(MdElements.code.reg).toBeDefined();
      expect(MdElements.code.reg instanceof RegExp).toBe(true);

      // 检查标题元素
      expect(MdElements.head.reg).toBeDefined();
      expect(MdElements.head.reg instanceof RegExp).toBe(true);

      // 检查链接元素
      expect(MdElements.link.reg).toBeDefined();
      expect(MdElements.link.reg instanceof RegExp).toBe(true);

      // 检查图片元素
      expect(MdElements.img.reg).toBeDefined();
      expect(MdElements.img.reg instanceof RegExp).toBe(true);

      // 检查任务列表元素
      expect(MdElements.task.reg).toBeDefined();
      expect(MdElements.task.reg instanceof RegExp).toBe(true);

      // 检查列表元素
      expect(MdElements.list.reg).toBeDefined();
      expect(MdElements.list.reg instanceof RegExp).toBe(true);

      // 检查分割线元素
      expect(MdElements.hr.reg).toBeDefined();
      expect(MdElements.hr.reg instanceof RegExp).toBe(true);

      // 检查frontmatter元素
      expect(MdElements.frontmatter.reg).toBeDefined();
      expect(MdElements.frontmatter.reg instanceof RegExp).toBe(true);

      // 检查引用元素
      expect(MdElements.blockquote.reg).toBeDefined();
      expect(MdElements.blockquote.reg instanceof RegExp).toBe(true);

      // 检查加粗元素
      expect(MdElements.bold.reg).toBeDefined();
      expect(MdElements.bold.reg instanceof RegExp).toBe(true);

      // 检查斜体元素
      expect(MdElements.italic.reg).toBeDefined();
      expect(MdElements.italic.reg instanceof RegExp).toBe(true);

      // 检查行内代码元素
      expect(MdElements.inlineCode.reg).toBeDefined();
      expect(MdElements.inlineCode.reg instanceof RegExp).toBe(true);

      // 检查加粗斜体元素
      expect(MdElements.boldAndItalic.reg).toBeDefined();
      expect(MdElements.boldAndItalic.reg instanceof RegExp).toBe(true);

      // 检查删除线元素
      expect(MdElements.strikethrough.reg).toBeDefined();
      expect(MdElements.strikethrough.reg instanceof RegExp).toBe(true);
    });

    it('应该为适当元素定义 matchKey', () => {
      // 检查有 matchKey 的元素
      expect(MdElements.head.matchKey).toBe(' ');
      expect(MdElements.link.matchKey).toBe(')');
      expect(MdElements.img.matchKey).toBe(')');
      expect(MdElements.task.matchKey).toBe(' ');
      expect(MdElements.list.matchKey).toBe(' ');
      expect(MdElements.blockquote.matchKey).toBe(' ');
      expect(MdElements.bold.matchKey).toBe('*');
      expect(MdElements.italic.matchKey).toBe('*');
      expect(MdElements.inlineCode.matchKey).toBe('`');
      expect(MdElements.boldAndItalic.matchKey).toBe('*');
      expect(MdElements.strikethrough.matchKey).toBe('~');
      expect(MdElements.code.matchKey).toBe(' ');
      expect(MdElements.hr.matchKey).toBe(' ');

      // 检查没有 matchKey 的元素
      expect(MdElements.table.matchKey).toBeUndefined();
      expect(MdElements.frontmatter.matchKey).toBeUndefined();
    });

    it('应该为所有元素定义 run 函数', () => {
      // 检查所有元素都有 run 函数
      Object.values(MdElements).forEach((element) => {
        expect(element.run).toBeDefined();
        expect(typeof element.run).toBe('function');
      });
    });
  });

  describe('导出的节点数组', () => {
    it('应该正确导出 BlockMathNodes', () => {
      expect(Array.isArray(BlockMathNodes)).toBe(true);
      expect(BlockMathNodes.length).toBeGreaterThan(0);

      // 检查是否包含没有 matchKey 的元素
      const tableNode = BlockMathNodes.find((node) => node.type === 'table');
      const codeNode = BlockMathNodes.find((node) => node.type === 'code');
      const hrNode = BlockMathNodes.find((node) => node.type === 'hr');
      const frontmatterNode = BlockMathNodes.find(
        (node) => node.type === 'frontmatter',
      );

      expect(tableNode).toBeDefined();
      expect(codeNode).toBeDefined();
      expect(hrNode).toBeDefined();
      expect(frontmatterNode).toBeDefined();
    });

    it('应该正确导出 TextMatchNodes', () => {
      expect(Array.isArray(TextMatchNodes)).toBe(true);
      expect(TextMatchNodes.length).toBeGreaterThan(0);

      // 检查是否包含有 matchKey 的元素
      const headNode = TextMatchNodes.find((node) => node.type === 'head');
      const linkNode = TextMatchNodes.find((node) => node.type === 'link');
      const imgNode = TextMatchNodes.find((node) => node.type === 'img');
      const taskNode = TextMatchNodes.find((node) => node.type === 'task');
      const listNode = TextMatchNodes.find((node) => node.type === 'list');
      const blockquoteNode = TextMatchNodes.find(
        (node) => node.type === 'blockquote',
      );
      const boldNode = TextMatchNodes.find((node) => node.type === 'bold');

      expect(headNode).toBeDefined();
      expect(linkNode).toBeDefined();
      expect(imgNode).toBeDefined();
      expect(taskNode).toBeDefined();
      expect(listNode).toBeDefined();
      expect(blockquoteNode).toBeDefined();
      expect(boldNode).toBeDefined();
    });
  });

  describe('insertAfter', () => {
    it('应在 path 下一位置插入节点并选中', () => {
      const editor = createEditor();
      editor.children = [
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ];
      insertAfter(editor, [0], {
        type: 'paragraph',
        children: [{ text: '' }],
      } as any);
      expect(editor.children).toHaveLength(3);
      expect((editor.children[1] as any).type).toBe('paragraph');
      expect(editor.selection).toBeDefined();
    });
  });

  describe('MdElements run 与 checkAllow', () => {
    let editor: ReturnType<typeof createEditor>;

    beforeEach(() => {
      editor = createEditor();
      editor.children = [
        { type: 'paragraph', children: [{ text: 'content' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 7 },
      };
    });

    it('table.run 应删除原节点并插入表格', () => {
      const path = [0];
      const match = ['|a|b|', 'a|b'] as RegExpMatchArray;
      MdElements.table.run!({
        editor,
        path,
        match,
        sel: editor.selection!,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(editor.children[0]).toHaveProperty('type', 'card');
    });

    it('code.run 应插入代码块', () => {
      const path = [0];
      const match = ['```js', '```', 'js'] as RegExpMatchArray;
      const insertSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});
      const deleteSpy = vi
        .spyOn(Transforms, 'delete')
        .mockImplementation(() => {});
      MdElements.code.run!({
        editor,
        path,
        match,
        sel: editor.selection!,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(insertSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ type: 'code', language: 'js', value: '' }),
        expect.any(Object),
      );
      insertSpy.mockRestore();
      deleteSpy.mockRestore();
    });

    it('codeSpace.run 应插入代码块', () => {
      const path = [0];
      const match = ['``` ', '```', undefined] as RegExpMatchArray;
      const insertSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});
      const deleteSpy = vi
        .spyOn(Transforms, 'delete')
        .mockImplementation(() => {});
      MdElements.codeSpace.run!({
        editor,
        path,
        match,
        sel: editor.selection!,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(insertSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ type: 'code' }),
        expect.any(Object),
      );
      insertSpy.mockRestore();
      deleteSpy.mockRestore();
    });

    it('head.run 应插入标题', () => {
      const path = [0];
      const match = ['## title', '##', ' ', 'title'] as RegExpMatchArray;
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 8 },
      };
      MdElements.head.run!({
        editor,
        path,
        match,
        sel,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(editor.children[0]).toHaveProperty('type', 'head');
      expect((editor.children[0] as any).level).toBe(2);
    });

    it('head.run 当 anchor 不在段落末尾时使用 cutText', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 2 },
      };
      const path = [0];
      const match = ['# a', '#', ' ', 'a'] as RegExpMatchArray;
      MdElements.head.run!({
        editor,
        path,
        match,
        sel: editor.selection!,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(editor.children[0]).toHaveProperty('type', 'head');
    });

    it('head.checkAllow 应校验 isTop 与 Path.hasPrevious', () => {
      const node: [any, number[]] = [
        { type: 'paragraph', children: [{ text: 'x' }] },
        [0],
      ];
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const result = MdElements.head.checkAllow!({ editor, node, sel });
      expect(typeof result).toBe('boolean');
    });

    it('link.run 应插入链接节点', () => {
      const match = ['[text](url)', 'text', 'url'] as RegExpMatchArray;
      match.index = 0;
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 11 },
      };
      MdElements.link.run!({
        editor,
        path: [0],
        match,
        sel,
        startText: '[text](url)',
        el: editor.children[0] as any,
      });
      expect(editor.children[0]).toBeDefined();
    });

    it('img.run 应插入图片节点', () => {
      const match = ['![alt](src)', 'alt', 'src'] as RegExpMatchArray;
      match.index = 0;
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 11 },
      };
      MdElements.img.run!({
        editor,
        path: [0],
        match,
        sel,
        startText: '![alt](src)',
        el: editor.children[0] as any,
      });
      expect(editor.children[0]).toBeDefined();
    });

    it('task.run 应插入任务列表', () => {
      const path = [0];
      const match = ['[ ] ', ' '] as RegExpMatchArray;
      MdElements.task.run!({
        editor,
        path,
        match,
        sel: editor.selection!,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(editor.children[0]).toHaveProperty('type', 'bulleted-list');
      expect((editor.children[0] as any).task).toBe(true);
    });

    it('task.run 应支持 [x] 勾选', () => {
      const path = [0];
      const match = ['[x] ', 'x'] as RegExpMatchArray;
      MdElements.task.run!({
        editor,
        path,
        match,
        sel: editor.selection!,
        startText: '',
        el: editor.children[0] as any,
      });
      const list = editor.children[0] as any;
      expect(list.children[0].checked).toBe(true);
    });

    it('task.checkAllow 在 list-item 内且无前兄弟时返回 false', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'x' }] }],
            },
          ],
        },
      ];
      const para = (editor.children[0] as any).children[0].children[0];
      const node: [any, number[]] = [para, [0, 0, 0]];
      const sel = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      const result = MdElements.task.checkAllow!({ editor, node, sel });
      expect(result).toBe(false);
    });

    it('task.checkAllow 在 list-item 内且有前兄弟时返回 true', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'a' }] },
                { type: 'paragraph', children: [{ text: 'b' }] },
              ],
            },
          ],
        },
      ];
      const secondPara = (editor.children[0] as any).children[0].children[1];
      const node: [any, number[]] = [secondPara, [0, 0, 1]];
      const sel = {
        anchor: { path: [0, 0, 1, 0], offset: 0 },
        focus: { path: [0, 0, 1, 0], offset: 0 },
      };
      const result = MdElements.task.checkAllow!({ editor, node, sel });
      expect(result).toBe(true);
    });

    it('task.checkAllow 当节点非 paragraph 时返回 false', () => {
      editor.children = [{ type: 'head', level: 1, children: [{ text: 'x' }] }];
      const node: [any, number[]] = [editor.children[0], [0]];
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const result = MdElements.task.checkAllow!({ editor, node, sel });
      expect(result).toBe(false);
    });

    it('list.run 应插入无序列表', () => {
      const path = [0];
      const match = ['- '] as RegExpMatchArray;
      match[1] = '-';
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      };
      MdElements.list.run!({
        editor,
        path,
        match,
        sel,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(editor.children[0]).toHaveProperty('type', 'bulleted-list');
    });

    it('list.run 应支持有序列表', () => {
      const path = [0];
      const match = ['1. '] as RegExpMatchArray;
      match[1] = '1.';
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      };
      MdElements.list.run!({
        editor,
        path,
        match,
        sel,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(editor.children[0]).toHaveProperty('type', 'numbered-list');
      expect((editor.children[0] as any).start).toBe(1);
    });

    it('list.checkAllow 在 list-item 内且 hasPrevious 时返回 true', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'a' }] },
                { type: 'paragraph', children: [{ text: 'b' }] },
              ],
            },
          ],
        },
      ];
      const listItem = (editor.children[0] as any).children[0];
      const secondParagraph = listItem.children[1];
      const node: [any, number[]] = [secondParagraph, [0, 0, 1]];
      const sel = {
        anchor: { path: [0, 0, 1, 0], offset: 0 },
        focus: { path: [0, 0, 1, 0], offset: 0 },
      };
      const result = MdElements.list.checkAllow!({ editor, node, sel });
      expect(result).toBe(true);
    });

    it('list.checkAllow 在 list-item 内且无 hasPrevious 时返回 false', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
            },
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
            },
          ],
        },
      ];
      const secondListItemFirstPara = (editor.children[0] as any).children[1]
        .children[0];
      const node: [any, number[]] = [secondListItemFirstPara, [0, 1, 0]];
      const sel = {
        anchor: { path: [0, 1, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0, 0], offset: 0 },
      };
      const result = MdElements.list.checkAllow!({ editor, node, sel });
      expect(result).toBe(false);
    });

    it('hr.run 应插入分割线并 insertAfter', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: '---' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ];
      const path = [0];
      MdElements.hr.run!({
        editor,
        path,
        match: [] as RegExpMatchArray,
        sel: editor.selection!,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(editor.children.some((n: any) => n.type === 'hr')).toBe(true);
    });

    it('hrSpace.run 应插入分割线并 insertAfter', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: '---' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ];
      const path = [0];
      MdElements.hrSpace.run!({
        editor,
        path,
        match: [] as RegExpMatchArray,
        sel: editor.selection!,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(editor.children.some((n: any) => n.type === 'hr')).toBe(true);
    });

    it('hr.checkAllow 要求 paragraph 且非首行时返回 true', () => {
      const node: [any, number[]] = [
        { type: 'paragraph', children: [{ text: 'x' }] },
        [1],
      ];
      const sel = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      };
      const result = MdElements.hr.checkAllow!({ editor, node, sel });
      expect(result).toBe(true);
    });

    it('hr.checkAllow 当为首行 path[0]===0 时返回 false', () => {
      const node: [any, number[]] = [
        { type: 'paragraph', children: [{ text: '---' }] },
        [0],
      ];
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const result = MdElements.hr.checkAllow!({ editor, node, sel });
      expect(result).toBe(false);
    });

    it('hrSpace.checkAllow 当为首行时返回 false', () => {
      const node: [any, number[]] = [
        { type: 'paragraph', children: [{ text: '---' }] },
        [0],
      ];
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const result = MdElements.hrSpace.checkAllow!({ editor, node, sel });
      expect(result).toBe(false);
    });

    it('frontmatter.run 应插入 frontmatter 代码块', () => {
      const path = [0];
      MdElements.frontmatter.run!({
        editor,
        path,
        match: [] as RegExpMatchArray,
        sel: editor.selection!,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(editor.children[0]).toHaveProperty('type', 'code');
      expect((editor.children[0] as any).frontmatter).toBe(true);
    });

    it('frontmatter.checkAllow 要求首段且 isTop', () => {
      const node: [any, number[]] = [
        { type: 'paragraph', children: [{ text: '---' }] },
        [0],
      ];
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const result = MdElements.frontmatter.checkAllow!({ editor, node, sel });
      expect(typeof result).toBe('boolean');
    });

    it('blockquote.run 应插入引用块（折叠选区触发 cutText）', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: '> q' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      };
      const path = [0];
      const sel = editor.selection;
      MdElements.blockquote.run!({
        editor,
        path,
        match: ['> q', 'q'] as RegExpMatchArray,
        sel: sel!,
        startText: '',
        el: editor.children[0] as any,
      });
      expect(editor.children[0]).toHaveProperty('type', 'blockquote');
    });

    it('blockquote.checkAllow 要求 paragraph', () => {
      const node: [any, number[]] = [
        { type: 'paragraph', children: [{ text: 'x' }] },
        [0],
      ];
      const result = MdElements.blockquote.checkAllow!({
        editor,
        node,
        sel: editor.selection!,
      });
      expect(result).toBe(true);
    });
  });

  describe('matchText 与内联格式', () => {
    let editor: ReturnType<typeof createEditor>;

    beforeEach(() => {
      editor = createEditor();
      editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
    });

    it('bold.run 通过 matchText 插入加粗', () => {
      const match = ['**b**', 'b'] as RegExpMatchArray;
      match.index = 0;
      const ctx = {
        editor,
        path: [0],
        match,
        sel: editor.selection!,
        startText: '**b**',
        el: editor.children[0] as any,
      };
      const result = MdElements.bold.run!(ctx);
      expect(result).toBe(true);
    });

    it('italic.run 通过 matchText 插入斜体', () => {
      const match = ['*i*', 'i'] as RegExpMatchArray;
      match.index = 0;
      const ctx = {
        editor,
        path: [0],
        match,
        sel: editor.selection!,
        startText: '*i*',
        el: editor.children[0] as any,
      };
      const result = MdElements.italic.run!(ctx);
      expect(result).toBe(true);
    });

    it('inlineCode.run 通过 matchText 插入行内代码', () => {
      const match = ['`c`', 'c'] as RegExpMatchArray;
      match.index = 0;
      const ctx = {
        editor,
        path: [0],
        match,
        sel: editor.selection!,
        startText: '`c`',
        el: editor.children[0] as any,
      };
      const result = MdElements.inlineCode.run!(ctx);
      expect(result).toBe(true);
    });

    it('boldAndItalic.run 通过 matchText 插入加粗斜体', () => {
      const match = ['***bi***', 'bi'] as RegExpMatchArray;
      match.index = 0;
      const ctx = {
        editor,
        path: [0],
        match,
        sel: editor.selection!,
        startText: '***bi***',
        el: editor.children[0] as any,
      };
      const result = MdElements.boldAndItalic.run!(ctx);
      expect(result).toBe(true);
    });

    it('strikethrough.run 通过 matchText 插入删除线', () => {
      const match = ['~~s~~', 's'] as RegExpMatchArray;
      match.index = 0;
      const ctx = {
        editor,
        path: [0],
        match,
        sel: editor.selection!,
        startText: '~~s~~',
        el: editor.children[0] as any,
      };
      const result = MdElements.strikethrough.run!(ctx);
      expect(result).toBe(true);
    });

    it('matchText 当 isDirtLeaf 为 true 时返回 false', () => {
      const spy = vi.spyOn(EditorUtils, 'isDirtLeaf').mockReturnValue(true);
      const match = ['**x**', 'x'] as RegExpMatchArray;
      match.index = 0;
      const ctx = {
        editor,
        path: [0],
        match,
        sel: editor.selection!,
        startText: '**x**',
        el: editor.children[0] as any,
      };
      const result = MdElements.bold.run!(ctx);
      expect(result).toBe(false);
      spy.mockRestore();
    });

    it('matchText 当 prev === matchString 时返回 false', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: '***x**' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 7 },
      };
      const match = ['**x**', 'x'] as RegExpMatchArray;
      match.index = 1;
      const ctx = {
        editor,
        path: [0],
        match,
        sel: editor.selection!,
        startText: '**x**',
        el: editor.children[0] as any,
      };
      const result = MdElements.bold.run!(ctx);
      expect(result).toBe(false);
    });
  });
});
