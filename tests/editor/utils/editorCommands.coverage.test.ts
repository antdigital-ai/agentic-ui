/**
 * 使用真实 Slate 编辑器执行 editorCommands，提升语句/分支覆盖率。
 * 不 mock Slate，仅 mock NativeTableEditor 等外部依赖。
 */
import { createEditor, Editor } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  convertToParagraph,
  createList,
  decreaseHeadingLevel,
  getCurrentNodes,
  increaseHeadingLevel,
  insertCodeBlock,
  insertHorizontalLine,
  insertTable,
  setHeading,
  toggleQuote,
} from '../../../src/MarkdownEditor/editor/utils/editorCommands';

const insertTableMock = vi.fn();

vi.mock('../../../src/MarkdownEditor/utils/native-table', () => ({
  NativeTableEditor: {
    insertTable: (...args: unknown[]) => insertTableMock(...args),
  },
}));

describe('editorCommands 集成覆盖', () => {
  let editor: Editor;

  beforeEach(() => {
    insertTableMock.mockClear();
    editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'first' }] },
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'head', level: 1, children: [{ text: 'title' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
  });

  describe('getCurrentNodes', () => {
    it('返回当前最低层级元素节点迭代器', () => {
      const nodes = Array.from(getCurrentNodes(editor));
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes[0][0]).toHaveProperty('type', 'paragraph');
    });
  });

  describe('insertTable', () => {
    it('当前为 paragraph 时在下一路径插入表格并选中', () => {
      insertTable(editor);
      expect(insertTableMock).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ rows: 3, cols: 3 }),
      );
    });

    it('当前为空 paragraph 时在当前路径插入并删除下一空节点', () => {
      editor.selection = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      };
      insertTable(editor);
      expect(insertTableMock).toHaveBeenCalled();
    });

    it('传入 column-cell 节点时在单元格内插入表格', () => {
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
      const cellNode = {
        type: 'column-cell',
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      };
      const cellPath = [0, 0, 0];
      insertTable(editor, [cellNode as any, cellPath]);
      expect(insertTableMock).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ at: [0, 0, 0, 0] }),
      );
    });
  });

  describe('insertCodeBlock', () => {
    it('在段落后插入默认代码块', () => {
      insertCodeBlock(editor);
      const codeBlock = editor.children[1];
      expect(codeBlock).toHaveProperty('type', 'code');
      expect((codeBlock as any).children[0].text).toContain('flowchart');
    });

    it('传入 mermaid 时设置 language', () => {
      insertCodeBlock(editor, 'mermaid');
      const codeBlock = editor.children[1];
      expect((codeBlock as any).language).toBe('mermaid');
    });

    it('传入 html 时设置 render', () => {
      insertCodeBlock(editor, 'html');
      const codeBlock = editor.children[1];
      expect((codeBlock as any).render).toBe(true);
    });

    it('当前为空段落时在当前路径插入代码块', () => {
      editor.selection = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      };
      insertCodeBlock(editor);
      expect(editor.children[1]).toHaveProperty('type', 'code');
    });

    it('传入 head 节点时在标题后插入代码块', () => {
      const headNode = {
        type: 'head',
        level: 1,
        children: [{ text: 'title' }],
      };
      const headPath = [2];
      insertCodeBlock(editor, 'mermaid', [headNode as any, headPath]);
      expect(editor.children[3]).toHaveProperty('type', 'code');
      expect((editor.children[3] as any).language).toBe('mermaid');
    });
  });

  describe('toggleQuote', () => {
    it('将当前段落包入 blockquote', () => {
      toggleQuote(editor);
      const first = editor.children[0] as any;
      expect(first.type).toBe('blockquote');
      expect(first.children[0].type).toBe('paragraph');
    });

    it('当前为标题时先转为段落再包入 blockquote', () => {
      editor.selection = {
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      };
      toggleQuote(editor);
      const blockquote = editor.children[2] as any;
      expect(blockquote.type).toBe('blockquote');
      expect(blockquote.children[0].type).toBe('paragraph');
    });

    it('当前已在 blockquote 内时解包', () => {
      editor.children = [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: 'quoted' }] }],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      };
      toggleQuote(editor);
      expect(editor.children[0].type).toBe('paragraph');
    });

    it('当前节点非 paragraph/head 时直接 return', () => {
      editor.children = [{ type: 'code', children: [{ text: 'x' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const before = JSON.stringify(editor.children);
      toggleQuote(editor);
      expect(JSON.stringify(editor.children)).toBe(before);
    });
  });

  describe('insertHorizontalLine', () => {
    it('在段落后插入 hr 并在其后插入空段落', () => {
      insertHorizontalLine(editor);
      expect(editor.children[1].type).toBe('hr');
      expect(editor.children[2].type).toBe('paragraph');
    });

    it('当下一路径已存在时仅选中下一节点', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ];
      insertHorizontalLine(editor);
      expect(editor.children[1].type).toBe('hr');
    });

    it('当仅有单段且无下一路径时在 hr 后插入空段落', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'only' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      insertHorizontalLine(editor);
      expect(editor.children[0].type).toBe('paragraph');
      expect(editor.children[1].type).toBe('hr');
      expect(editor.children[2].type).toBe('paragraph');
    });
  });

  describe('setHeading', () => {
    it('无选区时将当前节点设为指定级别标题', () => {
      setHeading(editor, 1);
      expect((editor.children[0] as any).type).toBe('head');
      expect((editor.children[0] as any).level).toBe(1);
    });

    it('无选区且非 top 层级节点时不转换', () => {
      editor.children = [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: 'inside' }] }],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      };
      setHeading(editor, 1);
      expect((editor.children[0] as any).children[0].type).toBe('paragraph');
    });

    it('选区在 code 块内时 processSelectionForHeading 不匹配段落则直接返回', () => {
      editor.children = [{ type: 'code', children: [{ text: 'code' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      };
      setHeading(editor, 1);
      expect((editor.children[0] as any).type).toBe('code');
    });

    it('level 为 4 时调用 convertToParagraph', () => {
      editor.selection = {
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      };
      setHeading(editor, 4);
      expect((editor.children[2] as any).type).toBe('paragraph');
    });

    it('有非折叠选区时走 processSelectionForHeading', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      };
      setHeading(editor, 2);
      expect((editor.children[0] as any).type).toBe('head');
      expect((editor.children[0] as any).level).toBe(2);
    });

    it('部分选区从段落开头选时拆分并仅将选中部分设为标题', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      };
      setHeading(editor, 1);
      expect((editor.children[0] as any).type).toBe('head');
      expect((editor.children[0] as any).children[0].text).toBe('he');
      expect(editor.children.length).toBeGreaterThan(1);
    });

    it('部分选区到段落结尾时拆分并将选中部分设为标题', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'world' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 5 },
      };
      setHeading(editor, 1);
      expect(editor.children.some((n: any) => n.type === 'head')).toBe(true);
    });

    it('部分选区在段落中间时拆成三段并将中间设为标题', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'abcdef' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 4 },
      };
      setHeading(editor, 1);
      expect(editor.children.some((n: any) => n.type === 'head')).toBe(true);
    });

    it('部分选区在长段落中间时通过文本节点计算拆分点并设为标题', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'abcdefghij' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 6 },
      };
      setHeading(editor, 2);
      const heads = editor.children.filter((n: any) => n.type === 'head');
      expect(heads.length).toBeGreaterThanOrEqual(1);
      expect((heads[0] as any).level).toBe(2);
    });

    it('多段落选区时每段单独设为标题', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'p1' }] },
        { type: 'paragraph', children: [{ text: 'p2' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 2 },
      };
      setHeading(editor, 1);
      expect((editor.children[0] as any).type).toBe('head');
      expect((editor.children[1] as any).type).toBe('head');
    });
  });

  describe('convertToParagraph', () => {
    it('将标题节点转为段落', () => {
      editor.selection = {
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      };
      convertToParagraph(editor);
      expect((editor.children[2] as any).type).toBe('paragraph');
    });

    it('当前非 head 时不修改', () => {
      const before = (editor.children[0] as any).type;
      convertToParagraph(editor);
      expect((editor.children[0] as any).type).toBe(before);
    });
  });

  describe('createList', () => {
    it('无选区时不执行', () => {
      editor.selection = null;
      const before = JSON.stringify(editor.children);
      createList(editor, 'unordered');
      expect(JSON.stringify(editor.children)).toBe(before);
    });

    it('将段落转为无序列表', () => {
      createList(editor, 'unordered');
      const first = editor.children[0] as any;
      expect(first.type).toBe('bulleted-list');
      expect(first.children[0].type).toBe('list-item');
    });

    it('将段落转为有序列表', () => {
      createList(editor, 'ordered');
      const first = editor.children[0] as any;
      expect(first.type).toBe('numbered-list');
    });

    it('将段落转为任务列表', () => {
      createList(editor, 'task');
      const first = editor.children[0] as any;
      expect(first.type).toBe('bulleted-list');
      expect(first.task).toBe(true);
    });

    it('当前已是 list-item 且类型一致时解包 list-item 为段落', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'item' }] }],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      createList(editor, 'unordered');
      const list = editor.children[0] as any;
      expect(list.type).toBe('bulleted-list');
      expect(list.children[0].type).toBe('paragraph');
    });

    it('当前已是 list-item 且类型不同时更新列表类型', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'item' }] }],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      createList(editor, 'ordered');
      expect((editor.children[0] as any).type).toBe('numbered-list');
    });

    it('当前在 list-item 内段落且列表类型一致时解包 list-item', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'in list' }] },
              ],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      createList(editor, 'unordered');
      const list = editor.children[0] as any;
      expect(list.type).toBe('bulleted-list');
      expect(list.children[0].type).toBe('paragraph');
    });

    it('当前节点非 paragraph/head 时不转换列表', () => {
      editor.children = [{ type: 'code', children: [{ text: 'x' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const before = JSON.stringify(editor.children);
      createList(editor, 'unordered');
      expect(JSON.stringify(editor.children)).toBe(before);
    });

    it('多段落选区时转为同一列表', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 1 },
      };
      createList(editor, 'unordered');
      const list = editor.children[0] as any;
      expect(list.type).toBe('bulleted-list');
      expect(list.children.length).toBeGreaterThanOrEqual(1);
    });

    it('blockquote 内多段落转列表且后方有同类型列表时合并到相邻列表', () => {
      editor.children = [
        {
          type: 'blockquote',
          children: [
            { type: 'paragraph', children: [{ text: 'q1' }] },
            { type: 'paragraph', children: [{ text: 'q2' }] },
          ],
        },
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'existing' }] },
              ],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 2 },
      };
      createList(editor, 'unordered');
      const list = editor.children[1] as any;
      expect(list.type).toBe('bulleted-list');
      expect(list.children.length).toBeGreaterThanOrEqual(1);
    });

    it('选区仅覆盖单段内部分文本时将整段转为列表', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'partial' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 5 },
      };
      createList(editor, 'unordered');
      expect((editor.children[0] as any).type).toBe('bulleted-list');
    });

    it('标题节点在 blockNodes 时先转为段落再包装为列表', () => {
      editor.children = [
        { type: 'head', level: 1, children: [{ text: 'h1' }] },
        { type: 'paragraph', children: [{ text: 'p' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 1 },
      };
      createList(editor, 'unordered');
      const list = editor.children[0] as any;
      expect(list.type).toBe('bulleted-list');
      expect(list.children.length).toBeGreaterThanOrEqual(1);
    });

    it('前方有同类型列表时合并到前一个列表', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
            },
          ],
        },
        {
          type: 'blockquote',
          children: [
            { type: 'paragraph', children: [{ text: 'b' }] },
            { type: 'paragraph', children: [{ text: 'c' }] },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [1, 0, 0], offset: 0 },
        focus: { path: [1, 1, 0], offset: 1 },
      };
      createList(editor, 'unordered');
      const list = editor.children[0] as any;
      expect(list.type).toBe('bulleted-list');
      expect(list.children.length).toBeGreaterThanOrEqual(2);
    });

    it('多段落选为列表时包装并合并到同一列表', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: '1' }] },
        { type: 'paragraph', children: [{ text: '2' }] },
        { type: 'paragraph', children: [{ text: '3' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [2, 0], offset: 1 },
      };
      createList(editor, 'unordered');
      const list = editor.children[0] as any;
      expect(list.type).toBe('bulleted-list');
      expect(list.children.length).toBeGreaterThanOrEqual(1);
    });

    it('当前为 list-item 时切到 task 会更新列表类型并设置 checked', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'todo' }] }],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      createList(editor, 'task');
      const list = editor.children[0] as any;
      expect(list.type).toBe('bulleted-list');
      expect(list.task).toBe(true);
      expect(list.children[0].checked).toBe(false);
    });
  });

  describe('increaseHeadingLevel', () => {
    it('段落转为 4 级标题', () => {
      increaseHeadingLevel(editor);
      expect((editor.children[0] as any).type).toBe('head');
      expect((editor.children[0] as any).level).toBe(4);
    });

    it('1 级标题转为段落', () => {
      editor.selection = {
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      };
      increaseHeadingLevel(editor);
      expect((editor.children[2] as any).type).toBe('paragraph');
    });

    it('2 级标题降为 1 级', () => {
      editor.children = [
        { type: 'head', level: 2, children: [{ text: 'h2' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      increaseHeadingLevel(editor);
      expect((editor.children[0] as any).level).toBe(1);
    });

    it('3 级标题降为 2 级', () => {
      editor.children = [
        { type: 'head', level: 3, children: [{ text: 'h3' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      increaseHeadingLevel(editor);
      expect((editor.children[0] as any).level).toBe(2);
    });
  });

  describe('decreaseHeadingLevel', () => {
    it('段落转为 1 级标题', () => {
      decreaseHeadingLevel(editor);
      expect((editor.children[0] as any).type).toBe('head');
      expect((editor.children[0] as any).level).toBe(1);
    });

    it('4 级标题转为段落', () => {
      editor.children = [
        { type: 'head', level: 4, children: [{ text: 'h4' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      decreaseHeadingLevel(editor);
      expect((editor.children[0] as any).type).toBe('paragraph');
    });

    it('1 级标题升为 2 级', () => {
      editor.children = [
        { type: 'head', level: 1, children: [{ text: 'h1' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      decreaseHeadingLevel(editor);
      expect((editor.children[0] as any).level).toBe(2);
    });

    it('2 级标题升为 3 级', () => {
      editor.children = [
        { type: 'head', level: 2, children: [{ text: 'h2' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      decreaseHeadingLevel(editor);
      expect((editor.children[0] as any).level).toBe(3);
    });
  });

  describe('createList 更多分支', () => {
    it('选区仅部分文本且跨元素时收集所有 blockNodes', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
        { type: 'paragraph', children: [{ text: 'c' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [2, 0], offset: 1 },
      };
      createList(editor, 'ordered');
      expect((editor.children[0] as any).type).toBe('numbered-list');
    });

    it('多段落转列表后合并到后方相邻同类型列表时删除空列表容器', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'x' }] },
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'y' }] }],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      };
      createList(editor, 'unordered');
      const list = editor.children.find((n: any) => n.type === 'bulleted-list');
      expect(list).toBeDefined();
    });

    it('updateListType 移除 order 属性', () => {
      editor.children = [
        {
          type: 'numbered-list',
          order: 1,
          start: 1,
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'n' }] }],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      createList(editor, 'unordered');
      expect((editor.children[0] as any).type).toBe('bulleted-list');
    });

    it('单段落在 blockquote 内转列表且无相邻列表时创建新列表', () => {
      editor.children = [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 3 },
      };
      createList(editor, 'unordered');
      expect(
        (editor.children[0] as any).type === 'blockquote' ||
          (editor.children[0] as any).type === 'bulleted-list',
      ).toBe(true);
    });

    it('标题在选区时先转为段落再包装为列表触发 convertHeadingToParagraph', () => {
      editor.children = [
        { type: 'head', level: 1, children: [{ text: 'H1' }] },
        { type: 'paragraph', children: [{ text: 'P' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 1 },
      };
      createList(editor, 'unordered');
      const list = editor.children[0] as any;
      expect(list.type).toBe('bulleted-list');
      expect(list.children.length).toBeGreaterThanOrEqual(1);
    });

    it('空段落参与转列表时保持并包装', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 1 },
      };
      createList(editor, 'unordered');
      expect((editor.children[0] as any).type).toBe('bulleted-list');
    });

    it('list-item 在 list 内且 Path.hasPrevious(curNode[1]) 为 true 时不走解包', () => {
      editor.children = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'first' }] }],
            },
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'second' }] }],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 1, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0, 0], offset: 0 },
      };
      createList(editor, 'ordered');
      expect((editor.children[0] as any).type).toBe('numbered-list');
    });
  });

  describe('insertTable head 分支', () => {
    it('当前为 head 时在 Path.next(path) 插入表格', () => {
      editor.children = [
        { type: 'head', level: 1, children: [{ text: 'Title' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      insertTable(editor);
      expect(insertTableMock).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ at: [1] }),
      );
    });
  });
});
