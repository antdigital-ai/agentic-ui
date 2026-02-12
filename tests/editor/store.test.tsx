import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {
  BaseEditor,
  createEditor,
  Editor,
  Node,
  Path,
  Transforms,
} from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import type { Plugin } from 'unified';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parserMdToSchema } from '../../src';
import * as parserMdToSchemaModule from '../../src/MarkdownEditor/editor/parser/parserMdToSchema';
import { fixStrongWithSpecialChars } from '../../src/MarkdownEditor/editor/parser/remarkParse';
import { withMarkdown } from '../../src/MarkdownEditor/editor/plugins/withMarkdown';
import { EditorStore } from '../../src/MarkdownEditor/editor/store';
import * as editorUtils from '../../src/MarkdownEditor/editor/utils';
import type { MarkdownToHtmlOptions } from '../../src/MarkdownEditor/editor/utils/markdownToHtml';
import * as markdownToHtmlUtils from '../../src/MarkdownEditor/editor/utils/markdownToHtml';

// Mock ReactEditor DOM methods
vi.mock('slate-react', () => ({
  ReactEditor: {
    toDOMNode: vi.fn(() => ({
      querySelector: vi.fn(() => ({
        textContent: '',
      })),
    })),
    findPath: vi.fn(() => [0]),
    toSlateNode: vi.fn(() => ({ type: 'paragraph', children: [{ text: '' }] })),
    focus: vi.fn(),
    deselect: vi.fn(),
  },
  withReact: (editor: any) => editor,
}));

describe('EditorStore', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  let editor: BaseEditor & ReactEditor & HistoryEditor;
  let editorRef: React.MutableRefObject<
    BaseEditor & ReactEditor & HistoryEditor
  >;
  let store: EditorStore;

  const createTestEditor = () => {
    const baseEditor = withMarkdown(withHistory(withReact(createEditor())));
    baseEditor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    return baseEditor;
  };

  beforeEach(() => {
    editor = createTestEditor();
    editorRef = { current: editor };
    store = new EditorStore(editorRef);
  });

  describe('构造函数和基本属性', () => {
    it('应该正确初始化 EditorStore 实例', () => {
      expect(store).toBeInstanceOf(EditorStore);
      expect(store.highlightCache).toBeInstanceOf(Map);
      expect(store.footnoteDefinitionMap).toBeInstanceOf(Map);
      expect(store.inputComposition).toBe(false);
      expect(store.draggedElement).toBe(null);
      expect(store.domRect).toBe(null);
    });

    it('应该正确设置编辑器引用', () => {
      expect(store.editor).toBe(editor);
    });

    it('应该正确设置插件', () => {
      const mockPlugins = [{ name: 'test-plugin' }] as any;
      const storeWithPlugins = new EditorStore(editorRef, mockPlugins);
      expect(storeWithPlugins.plugins).toBe(mockPlugins);
    });
  });

  describe('focus 方法', () => {
    it('应该聚焦到编辑器', async () => {
      const focusSpy = vi.spyOn(ReactEditor, 'focus');
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      store.focus();

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0);

      // 等待异步操作完成
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      expect(focusSpy).toHaveBeenCalledWith(editor);
    });

    it('应该处理空文档情况', () => {
      editor.children = [];
      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      store.focus();

      expect(insertNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: [0] },
      );
    });

    it('应该设置光标到文档末尾', () => {
      const endSpy = vi.spyOn(Editor, 'end');
      const selectSpy = vi.spyOn(Transforms, 'select');

      store.focus();

      expect(endSpy).toHaveBeenCalledWith(editor, []);
      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('isLatestNode 方法', () => {
    it('应该正确识别最新节点', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'first' }] },
        { type: 'paragraph', children: [{ text: 'second' }] },
      ];

      const latestNode = editor.children[1];
      // 模拟 ReactEditor.findPath 返回正确的路径
      vi.spyOn(ReactEditor, 'findPath').mockReturnValue([1]);

      const result = store.isLatestNode(latestNode);

      expect(result).toBe(true);
    });

    it('应该正确识别非最新节点', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'first' }] },
        { type: 'paragraph', children: [{ text: 'second' }] },
      ];

      const nonLatestNode = editor.children[0];
      // 模拟 ReactEditor.findPath 返回正确的路径
      vi.spyOn(ReactEditor, 'findPath').mockReturnValue([0]);

      const result = store.isLatestNode(nonLatestNode);

      expect(result).toBe(false);
    });

    it('应该在出错时返回 false', () => {
      // 模拟 ReactEditor.findPath 抛出错误
      vi.spyOn(ReactEditor, 'findPath').mockImplementation(() => {
        throw new Error('Find path error');
      });

      const result = store.isLatestNode({} as Node);
      expect(result).toBe(false);
    });
  });

  describe('insertLink 方法', () => {
    it('应该插入 HTTP 链接', () => {
      const selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = selection;

      store.insertLink('https://example.com');

      expect(editor.children[0].children[0]).toEqual({
        text: 'https://example.com',
        url: 'https://example.com',
      });
    });

    it('应该插入文件链接', () => {
      const selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = selection;

      // 模拟 Editor.nodes 返回有效的节点
      vi.spyOn(Editor, 'nodes').mockReturnValue([
        [{ type: 'paragraph', children: [{ text: '' }] }, [0]],
      ] as any);

      // 模拟 Path.next 返回有效路径
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      // 模拟 Transforms.insertNodes 实际执行插入
      vi.spyOn(Transforms, 'insertNodes').mockImplementation((editor) => {
        if (
          editor.children &&
          editor.children[0] &&
          editor.children[0].children
        ) {
          editor.children[0].children[0] = {
            text: 'document.pdf',
            url: 'file:///path/to/document.pdf',
          };
        }
      });

      store.insertLink('file:///path/to/document.pdf');

      expect(editor.children[0].children[0]).toEqual({
        text: 'document.pdf',
        url: 'file:///path/to/document.pdf',
      });
    });

    it('应该在选区不存在时返回', () => {
      editor.selection = null;
      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      store.insertLink('https://example.com');

      expect(insertNodesSpy).not.toHaveBeenCalled();
    });

    it('应该在选区未折叠时返回', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      store.insertLink('https://example.com');

      expect(insertNodesSpy).not.toHaveBeenCalled();
    });
  });

  describe('insertNodes 方法', () => {
    it('应该插入单个节点', () => {
      const node = { type: 'paragraph', children: [{ text: 'test' }] };
      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      store.insertNodes(node);

      expect(insertNodesSpy).toHaveBeenCalledWith(editor, node, undefined);
    });

    it('应该插入节点数组', () => {
      const nodes = [
        { type: 'paragraph', children: [{ text: 'test1' }] },
        { type: 'paragraph', children: [{ text: 'test2' }] },
      ];
      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      store.insertNodes(nodes);

      expect(insertNodesSpy).toHaveBeenCalledWith(editor, nodes, undefined);
    });

    it('应该使用自定义选项插入节点', () => {
      const node = { type: 'paragraph', children: [{ text: 'test' }] };
      const options = { at: [0] };
      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      store.insertNodes(node, options);

      expect(insertNodesSpy).toHaveBeenCalledWith(editor, node, options);
    });
  });

  describe('clearContent 方法', () => {
    it('应该清空编辑器内容', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'existing content' }] },
      ];

      store.clearContent();

      expect(editor.children).toEqual([
        { type: 'paragraph', children: [{ text: '' }] },
      ]);
      expect(editor.selection).toBe(null);
    });
  });

  describe('setMDContent 方法', () => {
    it('应该在 markdown 为 undefined 时返回', () => {
      const originalChildren = editor.children;

      store.setMDContent(undefined);

      expect(editor.children).toBe(originalChildren);
    });

    it('应该在 markdown 与当前内容相同时返回', () => {
      const originalChildren = editor.children;

      store.setMDContent('');

      expect(editor.children).toBe(originalChildren);
    });

    it('应该设置新的 markdown 内容', () => {
      const markdown = '# Test Heading\n\nTest paragraph';

      store.setMDContent(markdown);

      expect(editor.children).not.toEqual([]);
    });
  });

  describe('removeNodes 方法', () => {
    it('应该移除节点', () => {
      const removeNodesSpy = vi.spyOn(Transforms, 'removeNodes');
      const options = { at: [0] } as any;

      store.removeNodes(options);

      expect(removeNodesSpy).toHaveBeenCalledWith(editor, options);
    });
  });

  describe('getContent 方法', () => {
    it('应该返回编辑器内容', () => {
      const content = store.getContent();
      expect(content).toBe(editor.children);
    });
  });

  describe('getMDContent 方法', () => {
    it('应该返回 markdown 内容', () => {
      const content = store.getMDContent();
      expect(typeof content).toBe('string');
    });

    it('应该使用自定义插件', () => {
      const mockPlugins = [{ name: 'test-plugin' }] as any;
      const content = store.getMDContent(mockPlugins);
      expect(typeof content).toBe('string');
    });
  });

  describe('getHtmlContent 方法', () => {
    it('应该返回 HTML 内容', () => {
      const html = store.getHtmlContent();
      expect(typeof html).toBe('string');
    });

    it('应该使用构造函数传入的 markdownToHtmlOptions', () => {
      const markdownToHtmlSyncSpy = vi.spyOn(
        markdownToHtmlUtils,
        'markdownToHtmlSync',
      );
      const options: MarkdownToHtmlOptions = [
        remarkParse,
        fixStrongWithSpecialChars,
        [remarkMath as unknown as Plugin, { singleDollarTextMath: true }],
        [remarkFrontmatter, ['yaml']],
        [remarkRehype as unknown as Plugin, { allowDangerousHtml: true }],
      ];
      const storeWithOptions = new EditorStore(editorRef, undefined, options);

      storeWithOptions.getHtmlContent();

      expect(markdownToHtmlSyncSpy).toHaveBeenCalled();
      const lastCall =
        markdownToHtmlSyncSpy.mock.calls[
          markdownToHtmlSyncSpy.mock.calls.length - 1
        ]!;
      const [, receivedOptions] = lastCall;
      expect(receivedOptions).toBe(options);
    });

    it('应该允许在调用 getHtmlContent 时覆盖 markdownToHtmlOptions', () => {
      const markdownToHtmlSyncSpy = vi.spyOn(
        markdownToHtmlUtils,
        'markdownToHtmlSync',
      );
      const initialOptions: MarkdownToHtmlOptions = [
        remarkParse,
        remarkGfm,
        fixStrongWithSpecialChars,
      ];
      const overrideOptions: MarkdownToHtmlOptions = [
        remarkParse,
        fixStrongWithSpecialChars,
        [remarkMath as unknown as Plugin, { singleDollarTextMath: false }],
      ];

      const storeWithInitialOptions = new EditorStore(
        editorRef,
        undefined,
        initialOptions,
      );

      storeWithInitialOptions.getHtmlContent(overrideOptions);

      const lastCall =
        markdownToHtmlSyncSpy.mock.calls[
          markdownToHtmlSyncSpy.mock.calls.length - 1
        ]!;
      const [, receivedOptions] = lastCall;
      expect(receivedOptions).toBe(overrideOptions);
    });
  });

  describe('setContent 方法', () => {
    it('应该设置编辑器内容', () => {
      const newContent = [
        { type: 'paragraph', children: [{ text: 'new content' }] },
      ];

      // Mock Transforms 来确保它们能够正确更新 editor.children
      const originalInsertNodes = Transforms.insertNodes;
      const originalRemoveNodes = Transforms.removeNodes;

      Transforms.insertNodes = vi.fn((editor, nodes, options) => {
        if (options?.at) {
          const at = options.at[0];
          if (Array.isArray(nodes)) {
            editor.children.splice(at, 0, ...nodes);
          } else {
            editor.children.splice(at, 0, nodes);
          }
        } else {
          if (Array.isArray(nodes)) {
            editor.children.push(...nodes);
          } else {
            editor.children.push(nodes);
          }
        }
      });

      Transforms.removeNodes = vi.fn((editor, options) => {
        if (options?.at) {
          const at = options.at[0];
          editor.children.splice(at, 1);
        }
      });

      store.setContent(newContent);

      // 恢复原始方法
      Transforms.insertNodes = originalInsertNodes;
      Transforms.removeNodes = originalRemoveNodes;

      expect(editor.children).toEqual(newContent);
    });

    it('应该调用 onChange', () => {
      const onChangeSpy = vi.spyOn(editor, 'onChange');
      const newContent = [
        { type: 'paragraph', children: [{ text: 'new content' }] },
      ];

      store.setContent(newContent);

      expect(onChangeSpy).toHaveBeenCalled();
    });
  });

  describe('updateNodeList 方法', () => {
    it('应该在 nodeList 为空时返回', () => {
      const originalChildren = editor.children;

      store.updateNodeList(null as any);

      expect(editor.children).toBe(originalChildren);
    });

    it('应该在 nodeList 不是数组时返回', () => {
      const originalChildren = editor.children;

      store.updateNodeList('not an array' as any);

      expect(editor.children).toBe(originalChildren);
    });

    it('应该过滤无效节点', () => {
      const nodeList = [
        { type: 'p', children: [] }, // 空段落
        { type: 'list', children: [] }, // 空列表
        { type: 'paragraph', children: [{ text: 'valid' }] }, // 有效节点
      ];

      store.updateNodeList(nodeList);

      // 应该只保留有效节点
      expect(editor.children.length).toBe(1);
    });

    it('应该在优化更新失败时回退到直接替换', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const nodeList = [{ type: 'paragraph', children: [{ text: 'test' }] }];

      // 模拟 generateDiffOperations 抛出错误
      vi.spyOn(store as any, 'generateDiffOperations').mockImplementation(
        () => {
          throw new Error('Test error');
        },
      );

      store.updateNodeList(nodeList);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update nodes with optimized method:',
        expect.any(Error),
      );
    });
  });

  describe('generateDiffOperations 方法', () => {
    it('应该在参数为空时返回空数组', () => {
      const result = (store as any).generateDiffOperations([], []);
      expect(result).toEqual([]);
    });

    it('应该生成插入操作', () => {
      const newNodes = [{ type: 'paragraph', children: [{ text: 'new' }] }];
      const oldNodes: any[] = [];
      const result = (store as any).generateDiffOperations(newNodes, oldNodes);

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((op: any) => op.type === 'insert')).toBe(true);
    });

    it('应该生成删除操作', () => {
      const newNodes: any[] = [];
      const oldNodes = [{ type: 'paragraph', children: [{ text: 'old' }] }];
      const result = (store as any).generateDiffOperations(newNodes, oldNodes);

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((op: any) => op.type === 'remove')).toBe(true);
    });

    it('应该生成更新操作', () => {
      const newNodes = [{ type: 'paragraph', children: [{ text: 'updated' }] }];
      const oldNodes = [{ type: 'paragraph', children: [{ text: 'old' }] }];
      const result = (store as any).generateDiffOperations(newNodes, oldNodes);

      expect(result.length).toBeGreaterThan(0);
    });

    it('应该处理复杂节点结构', () => {
      const newNodes = [
        {
          type: 'list',
          children: [
            { type: 'list-item', children: [{ text: 'item 1' }] },
            { type: 'list-item', children: [{ text: 'item 2' }] },
          ],
        },
      ];
      const oldNodes = [
        {
          type: 'list',
          children: [{ type: 'list-item', children: [{ text: 'item 1' }] }],
        },
      ];
      const result = (store as any).generateDiffOperations(newNodes, oldNodes);

      expect(result.length).toBeGreaterThan(0);
    });

    it('应该处理表格节点', () => {
      const newNodes = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'cell 1' }] },
                { type: 'table-cell', children: [{ text: 'cell 2' }] },
              ],
            },
          ],
        },
      ];
      const oldNodes = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'cell 1' }] },
              ],
            },
          ],
        },
      ];
      const result = (store as any).generateDiffOperations(newNodes, oldNodes);

      expect(result.length).toBeGreaterThan(0);
    });

    it('应该处理混合节点类型', () => {
      const newNodes = [
        { type: 'paragraph', children: [{ text: 'text' }] },
        { type: 'heading', children: [{ text: 'heading' }] },
        {
          type: 'list',
          children: [{ type: 'list-item', children: [{ text: 'item' }] }],
        },
      ];
      const oldNodes = [
        { type: 'paragraph', children: [{ text: 'text' }] },
        { type: 'heading', children: [{ text: 'old heading' }] },
      ];
      const result = (store as any).generateDiffOperations(newNodes, oldNodes);

      expect(result.length).toBeGreaterThan(0);
    });

    it('应该处理节点属性变化', () => {
      const newNodes = [
        { type: 'paragraph', align: 'center', children: [{ text: 'text' }] },
      ];
      const oldNodes = [
        { type: 'paragraph', align: 'left', children: [{ text: 'text' }] },
      ];
      const result = (store as any).generateDiffOperations(newNodes, oldNodes);

      expect(result.length).toBeGreaterThan(0);
    });

    it('应该处理空节点数组', () => {
      const result = (store as any).generateDiffOperations([], []);
      expect(result).toEqual([]);
    });

    it('应该处理单节点变化', () => {
      const newNodes = [{ type: 'paragraph', children: [{ text: 'new' }] }];
      const oldNodes = [{ type: 'paragraph', children: [{ text: 'old' }] }];
      const result = (store as any).generateDiffOperations(newNodes, oldNodes);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('compareNodes 方法', () => {
    it('应该在节点类型不同时生成替换操作', () => {
      const newNode = { type: 'paragraph', children: [{ text: 'new' }] };
      const oldNode = { type: 'heading', children: [{ text: 'old' }] };
      const operations: any[] = [];

      (store as any).compareNodes(newNode, oldNode, [0], operations);

      expect(operations).toHaveLength(1);
      expect(operations[0].type).toBe('replace');
    });

    it('应该比较文本节点', () => {
      const newNode = { text: 'new text', bold: true };
      const oldNode = { text: 'old text', bold: false };
      const operations: any[] = [];

      (store as any).compareNodes(newNode, oldNode, [0], operations);

      expect(operations.length).toBeGreaterThan(0);
    });
  });

  describe('executeOperations 方法', () => {
    it('应该执行插入操作', () => {
      const operations = [
        {
          type: 'insert',
          path: [0],
          node: { type: 'paragraph', children: [{ text: 'new' }] },
          priority: 1,
        },
      ];

      (store as any).executeOperations(operations);

      expect(editor.children.length).toBeGreaterThan(0);
    });

    it('应该执行删除操作', () => {
      // 先插入一个节点
      editor.children = [
        { type: 'paragraph', children: [{ text: 'to delete' }] },
      ];

      const operations = [
        {
          type: 'remove',
          path: [0],
          priority: 1,
        },
      ];

      (store as any).executeOperations(operations);

      expect(editor.children.length).toBe(0);
    });

    it('应该执行更新操作', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'old' }] }];

      const operations = [
        {
          type: 'update',
          path: [0],
          properties: { type: 'heading', children: [{ text: 'updated' }] },
          priority: 1,
        },
      ];

      (store as any).executeOperations(operations);

      expect(editor.children[0].type).toBe('heading');
    });

    it('应该处理执行错误', () => {
      const operations = [
        {
          type: 'invalid' as any,
          path: [0],
          priority: 1,
        },
      ];

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (store as any).executeOperations(operations);

      // 由于无效操作类型，switch 语句会跳过，不会调用 console.error
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('应该按优先级执行操作', () => {
      const operations = [
        {
          type: 'insert',
          path: [0],
          node: { type: 'paragraph', children: [{ text: 'first' }] },
          priority: 2,
        },
        {
          type: 'insert',
          path: [0],
          node: { type: 'paragraph', children: [{ text: 'second' }] },
          priority: 1,
        },
      ];

      (store as any).executeOperations(operations);

      expect(editor.children.length).toBe(1);
    });

    it('应该执行文本操作', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'old text' }] },
      ];

      const operations = [
        {
          type: 'text',
          path: [0, 0],
          text: 'new text',
          priority: 1,
        },
      ];

      (store as any).executeOperations(operations);

      expect(editor.children[0].children[0].text).toBe('new text');
    });

    it('应该执行替换操作', () => {
      // 使用更新操作来模拟替换
      editor.children = [{ type: 'paragraph', children: [{ text: 'old' }] }];

      const operations = [
        {
          type: 'update',
          path: [0],
          properties: { type: 'heading', children: [{ text: 'replaced' }] },
          priority: 1,
        },
      ];

      (store as any).executeOperations(operations);

      expect(editor.children.length).toBe(1);
      expect(editor.children[0].type).toBe('heading');
    });

    it('应该处理空操作数组', () => {
      const originalChildren = [...editor.children];

      (store as any).executeOperations([]);

      expect(editor.children).toEqual(originalChildren);
    });

    it('应该处理无效路径', () => {
      const operations = [
        {
          type: 'update',
          path: [999],
          properties: { type: 'heading' },
          priority: 1,
        },
      ];

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (store as any).executeOperations(operations);

      // 由于路径无效，操作不会执行，但也不会抛出错误
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('应该处理表格操作', () => {
      // 使用更新操作来模拟表格操作
      editor.children = [{ type: 'paragraph', children: [{ text: 'old' }] }];

      const operations = [
        {
          type: 'update',
          path: [0],
          properties: {
            type: 'table',
            children: [
              {
                type: 'table-row',
                children: [
                  { type: 'table-cell', children: [{ text: 'cell' }] },
                ],
              },
            ],
          },
          priority: 1,
        },
      ];

      (store as any).executeOperations(operations);

      expect(editor.children.length).toBe(1);
      expect(editor.children[0].type).toBe('table');
    });
  });

  describe('dragStart 方法', () => {
    it('应该处理拖拽开始事件', () => {
      const mockEvent = {
        stopPropagation: vi.fn(),
        dataTransfer: {
          setDragImage: vi.fn(),
        },
      } as any;

      const mockContainer = document.createElement('div');
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      store.dragStart(mockEvent, mockContainer);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockEvent.dataTransfer.setDragImage).toHaveBeenCalled();
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'dragover',
        expect.any(Function),
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'dragend',
        expect.any(Function),
        { once: true },
      );
    });

    it('draggedElement 为 list-item 时 _getAbleToEnterSet 应返回 list-item 可进入集合', () => {
      const listItemEl = document.createElement('div');
      listItemEl.setAttribute('data-be', 'list-item');
      store.draggedElement = listItemEl as any;
      const mockContainer = document.createElement('div');
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any);

      store.dragStart(
        {
          stopPropagation: vi.fn(),
          dataTransfer: { setDragImage: vi.fn() },
        } as any,
        mockContainer,
      );

      expect(store.draggedElement?.dataset?.be).toBe('list-item');
      store.draggedElement = null;
      vi.mocked(document.querySelectorAll).mockRestore();
    });
  });

  describe('拖拽私有方法 _updateDragMark _shouldIncludeElement', () => {
    it('_updateDragMark 在 point.el 为 list-item 时应使用加宽 width', () => {
      const container = document.createElement('div');
      container.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect;
      Object.defineProperty(container, 'scrollTop', { value: 0 });
      Object.defineProperty(container, 'scrollLeft', { value: 0 });
      const parent = document.createElement('div');
      parent.appendChild(container);
      const listItemEl = document.createElement('div');
      listItemEl.setAttribute('data-be', 'list-item');
      Object.defineProperty(listItemEl, 'clientWidth', { value: 100 });

      const mark = (store as any)._updateDragMark(
        null,
        { el: listItemEl, direction: 'top', top: 10, left: 0 },
        container,
      );

      expect(mark).not.toBeNull();
      expect(mark.getAttribute('data-move-mark')).toBe('');
      expect(mark.style.width).toBe('120px');
    });

    it('_shouldIncludeElement 在 paragraph + list-item 且前兄弟为 data-check-item 时应排除', () => {
      const paragraphEl = document.createElement('div');
      paragraphEl.setAttribute('data-be', 'paragraph');
      const pre = document.createElement('div');
      pre.setAttribute('data-check-item', '');
      Object.defineProperty(paragraphEl, 'previousSibling', { get: () => pre });
      const listItemEl = document.createElement('div');
      listItemEl.setAttribute('data-be', 'list-item');
      store.draggedElement = listItemEl as any;
      const ableToEnter = new Set(['paragraph', 'list-item']);

      const result = (store as any)._shouldIncludeElement(
        paragraphEl as any,
        ableToEnter,
      );

      expect(result).toBe(false);
      store.draggedElement = null;
    });
  });

  describe('_handleDragEnd 与 _moveNode（mock toPath）', () => {
    it('list-item 拖到 paragraph 时应走 _moveListItemToNonListItem', () => {
      editor.children = [
        {
          type: 'list',
          children: [{ type: 'list-item', children: [{ text: 'item' }] }],
        },
        { type: 'paragraph', children: [{ text: 'target' }] },
      ];
      const listItemNode = editor.children[0].children[0] as any;
      const paragraphNode = editor.children[1] as any;
      listItemNode.__path = [0, 0];
      paragraphNode.__path = [1];
      const dragEl = document.createElement('div');
      const targetEl = document.createElement('div');
      (dragEl as any).__node = listItemNode;
      (targetEl as any).__node = paragraphNode;

      vi.mocked(ReactEditor.toSlateNode).mockImplementation(
        (_, el: any) => el.__node,
      );
      vi.mocked(ReactEditor.findPath).mockImplementation((_, node: any) =>
        node?.__path ? node.__path : [0],
      );

      store.draggedElement = dragEl as any;
      expect(() => {
        (store as any)._handleDragEnd({
          el: targetEl,
          direction: 'top',
          top: 0,
          left: 0,
        });
      }).not.toThrow();
      store.draggedElement = null;
      delete listItemNode.__path;
      delete paragraphNode.__path;
      vi.mocked(ReactEditor.toSlateNode).mockReturnValue({
        type: 'paragraph',
        children: [{ text: '' }],
      } as any);
      vi.mocked(ReactEditor.findPath).mockReturnValue([0]);
    });

    it('非 list-item 拖到另一位置时应走 moveNodes 与 _cleanupEmptyParent', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ];
      const dragNode = editor.children[0];
      const targetNode = editor.children[1];
      const dragEl = document.createElement('div');
      const targetEl = document.createElement('div');
      (dragEl as any).__node = dragNode;
      (targetEl as any).__node = targetNode;

      vi.mocked(ReactEditor.toSlateNode).mockImplementation(
        (_, el: any) => el.__node,
      );
      vi.mocked(ReactEditor.findPath).mockImplementation((_, node: any) => {
        if (node === dragNode) return [0];
        if (node === targetNode) return [1];
        return [0];
      });

      store.draggedElement = dragEl as any;
      (store as any)._handleDragEnd({
        el: targetEl,
        direction: 'bottom',
        top: 0,
        left: 0,
      });

      expect(editor.children.length).toBe(2);
      store.draggedElement = null;
      vi.mocked(ReactEditor.toSlateNode).mockReturnValue({
        type: 'paragraph',
        children: [{ text: '' }],
      } as any);
      vi.mocked(ReactEditor.findPath).mockReturnValue([0]);
    });
  });

  describe('_cleanupEmptyParent 私有方法', () => {
    it('parent 仅有一子时应删除 delPath 并触发 Transforms.delete', () => {
      editor.children = [
        {
          type: 'list',
          children: [{ type: 'list-item', children: [{ text: 'only' }] }],
        },
        { type: 'paragraph', children: [{ text: 'p' }] },
      ];
      const parent = editor.children[0] as any;
      (store as any)._cleanupEmptyParent(parent, [0, 0], [1]);
      expect(editor.children.length).toBe(1);
      expect(editor.children[0].type).toBe('paragraph');
    });
  });

  describe('setState 方法', () => {
    it('应该使用函数式更新', () => {
      const updateFn = vi.fn((state: EditorStore) => {
        state.inputComposition = true;
      });

      store.setState(updateFn);

      expect(updateFn).toHaveBeenCalledWith(store);
      expect(store.inputComposition).toBe(true);
    });

    it('应该使用对象式更新', () => {
      const updateObj = {
        inputComposition: true,
        domRect: { x: 0, y: 0 } as DOMRect,
      };

      store.setState(updateObj as any);

      expect(store.inputComposition).toBe(true);
      expect(store.domRect).toEqual({ x: 0, y: 0 });
    });
  });

  describe('私有方法', () => {
    describe('findLatest 方法', () => {
      it('应该找到最新节点索引', () => {
        const node = {
          type: 'paragraph',
          children: [{ text: 'test' }],
        };
        const result = (store as any).findLatest(node, [0]);
        expect(Array.isArray(result)).toBe(true);
      });

      it('应该处理嵌套节点', () => {
        const node = {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'item' }],
            },
          ],
        };
        const result = (store as any).findLatest(node, [0]);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('toPath 方法', () => {
      it('应该转换 HTML 元素为 Slate 路径和节点', () => {
        const mockElement = document.createElement('div');
        // 模拟 ReactEditor.toSlateNode 和 findPath 返回有效值
        vi.spyOn(ReactEditor, 'toSlateNode').mockReturnValue({
          type: 'paragraph',
          children: [{ text: '' }],
        });
        vi.spyOn(ReactEditor, 'findPath').mockReturnValue([0]);

        const result = (store as any).toPath(mockElement);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
      });
    });
  });

  describe('错误处理', () => {
    it('应该在 focus 方法出错时记录错误', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // 模拟 setTimeout 中的错误
      vi.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        try {
          fn();
        } catch (error) {
          console.error('移动光标失败:', error);
        }
        return 1 as any;
      });

      vi.spyOn(ReactEditor, 'focus').mockImplementation(() => {
        throw new Error('Focus error');
      });

      store.focus();

      expect(consoleSpy).toHaveBeenCalledWith(
        '移动光标失败:',
        expect.any(Error),
      );

      // 清理 mock
      vi.restoreAllMocks();
    });

    it('应该在 isLatestNode 方法出错时返回 false', () => {
      vi.spyOn(ReactEditor, 'findPath').mockImplementation(() => {
        throw new Error('Find path error');
      });

      const result = store.isLatestNode({} as Node);

      expect(result).toBe(false);
    });
  });

  describe('compareTableNodes 方法', () => {
    it('应该比较相同结构的表格', () => {
      const newTable = {
        type: 'table',
        id: 'table-1',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'new content' }] },
              { type: 'table-cell', children: [{ text: 'cell 2' }] },
            ],
          },
        ],
      };
      const oldTable = {
        type: 'table',
        id: 'table-1',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'old content' }] },
              { type: 'table-cell', children: [{ text: 'cell 2' }] },
            ],
          },
        ],
      };
      const operations: any[] = [];

      (store as any).compareTableNodes(newTable, oldTable, [0], operations);

      expect(operations.length).toBeGreaterThan(0);
      // 应该生成文本更新操作
      expect(operations.some((op) => op.type === 'text')).toBe(true);
    });

    it('应该处理表格属性变化', () => {
      const newTable = {
        type: 'table',
        id: 'table-1',
        align: 'center',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'content' }] }],
          },
        ],
      };
      const oldTable = {
        type: 'table',
        id: 'table-1',
        align: 'left',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'content' }] }],
          },
        ],
      };
      const operations: any[] = [];

      (store as any).compareTableNodes(newTable, oldTable, [0], operations);

      expect(operations.length).toBeGreaterThan(0);
      // 应该生成表格属性更新操作
      expect(
        operations.some((op) => op.type === 'update' && op.path.length === 1),
      ).toBe(true);
    });

    it('应该处理不同结构的表格', () => {
      const newTable = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'cell 1' }] },
              { type: 'table-cell', children: [{ text: 'cell 2' }] },
            ],
          },
        ],
      };
      const oldTable = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'cell 1' }] }],
          },
        ],
      };
      const operations: any[] = [];

      (store as any).compareTableNodes(newTable, oldTable, [0], operations);

      expect(operations.length).toBeGreaterThan(0);
    });

    it('应该处理行数变化的表格', () => {
      const newTable = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'row 1' }] }],
          },
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'row 2' }] }],
          },
        ],
      };
      const oldTable = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'row 1' }] }],
          },
        ],
      };
      const operations: any[] = [];

      (store as any).compareTableNodes(newTable, oldTable, [0], operations);

      expect(operations.length).toBeGreaterThan(0);
    });

    it('应该处理空表格', () => {
      const newTable = {
        type: 'table',
        children: [],
      };
      const oldTable = {
        type: 'table',
        children: [],
      };
      const operations: any[] = [];

      (store as any).compareTableNodes(newTable, oldTable, [0], operations);

      expect(operations.length).toBe(0);
    });
  });

  describe('compareCells 方法', () => {
    it('应该比较简单文本单元格', () => {
      const newCell = {
        type: 'table-cell',
        children: [{ text: 'new text', bold: true }],
      };
      const oldCell = {
        type: 'table-cell',
        children: [{ text: 'old text', bold: false }],
      };
      const operations: any[] = [];

      (store as any).compareCells(newCell, oldCell, [0, 0, 0], operations);

      expect(operations.length).toBeGreaterThan(0);
      // 应该生成文本更新操作
      expect(operations.some((op) => op.type === 'text')).toBe(true);
      // 应该生成属性更新操作
      expect(operations.some((op) => op.type === 'update')).toBe(true);
    });

    it('应该处理单元格属性变化', () => {
      const newCell = {
        type: 'table-cell',
        align: 'center',
        children: [{ text: 'content' }],
      };
      const oldCell = {
        type: 'table-cell',
        align: 'left',
        children: [{ text: 'content' }],
      };
      const operations: any[] = [];

      (store as any).compareCells(newCell, oldCell, [0, 0, 0], operations);

      expect(operations.length).toBeGreaterThan(0);
      expect(operations.some((op) => op.type === 'update')).toBe(true);
    });

    it('应该处理复杂单元格内容', () => {
      const newCell = {
        type: 'table-cell',
        children: [
          { text: 'text 1' },
          {
            type: 'link',
            url: 'http://example.com',
            children: [{ text: 'link' }],
          },
        ],
      };
      const oldCell = {
        type: 'table-cell',
        children: [{ text: 'text 1' }, { text: 'plain text' }],
      };
      const operations: any[] = [];

      (store as any).compareCells(newCell, oldCell, [0, 0, 0], operations);

      expect(operations.length).toBeGreaterThan(0);
    });

    it('应该处理结构不同的单元格', () => {
      const newCell = {
        type: 'table-cell',
        children: [{ text: 'text 1' }, { text: 'text 2' }],
      };
      const oldCell = {
        type: 'table-cell',
        children: [{ text: 'text 1' }],
      };
      const operations: any[] = [];

      (store as any).compareCells(newCell, oldCell, [0, 0, 0], operations);

      expect(operations.length).toBeGreaterThan(0);
    });

    it('应该处理空单元格', () => {
      const newCell = {
        type: 'table-cell',
        children: [],
      };
      const oldCell = {
        type: 'table-cell',
        children: [],
      };
      const operations: any[] = [];

      (store as any).compareCells(newCell, oldCell, [0, 0, 0], operations);

      expect(operations.length).toBe(0);
    });

    it('应该处理单元格内容从空变为有内容', () => {
      const newCell = {
        type: 'table-cell',
        children: [{ text: 'new content' }],
      };
      const oldCell = {
        type: 'table-cell',
        children: [],
      };
      const operations: any[] = [];

      (store as any).compareCells(newCell, oldCell, [0, 0, 0], operations);

      expect(operations.length).toBeGreaterThan(0);
    });

    it('应该处理单元格内容从有内容变为空', () => {
      const newCell = {
        type: 'table-cell',
        children: [],
      };
      const oldCell = {
        type: 'table-cell',
        children: [{ text: 'old content' }],
      };
      const operations: any[] = [];

      (store as any).compareCells(newCell, oldCell, [0, 0, 0], operations);

      expect(operations.length).toBeGreaterThan(0);
    });

    it('应该处理嵌套结构的单元格', () => {
      const newCell = {
        type: 'table-cell',
        children: [
          {
            type: 'paragraph',
            children: [
              { text: 'paragraph text' },
              {
                type: 'link',
                url: 'http://example.com',
                children: [{ text: 'link' }],
              },
            ],
          },
        ],
      };
      const oldCell = {
        type: 'table-cell',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'paragraph text' }],
          },
        ],
      };
      const operations: any[] = [];

      (store as any).compareCells(newCell, oldCell, [0, 0, 0], operations);

      expect(operations.length).toBeGreaterThan(0);
    });
  });

  describe('replaceText 方法', () => {
    beforeEach(() => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'Hello world, hello universe' }],
        },
        { type: 'paragraph', children: [{ text: 'Another hello message' }] },
      ];
    });

    it('应该替换所有匹配的文本', () => {
      const count = store.replaceText('hello', 'hi');

      expect(count).toBe(3); // 'hello' 在文本中出现 3 次
      expect(editor.children[0].children[0].text).toBe('hi world, hi universe');
      expect(editor.children[1].children[0].text).toBe('Another hi message');
    });

    it('应该支持区分大小写的替换', () => {
      const count = store.replaceText('Hello', 'Hi', { caseSensitive: true });

      expect(count).toBe(1); // 只有 'Hello' 匹配
      expect(editor.children[0].children[0].text).toBe(
        'Hi world, hello universe',
      );
      expect(editor.children[1].children[0].text).toBe('Another hello message');
    });

    it('应该支持完整单词匹配', () => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'Hello world, hello universe, helloworld' }],
        },
      ];

      const count = store.replaceText('hello', 'hi', { wholeWord: true });

      expect(count).toBe(2); // 只有完整的 'hello' 单词匹配
      expect(editor.children[0].children[0].text).toBe(
        'hi world, hi universe, helloworld',
      );
    });

    it('应该支持只替换第一个匹配项', () => {
      const count = store.replaceText('hello', 'hi', { replaceAll: false });

      expect(count).toBe(1); // 只替换第一个匹配项
      expect(editor.children[0].children[0].text).toBe(
        'hi world, hello universe',
      );
      expect(editor.children[1].children[0].text).toBe('Another hello message');
    });

    it('应该在搜索文本为空时返回 0', () => {
      const count = store.replaceText('', 'hi');
      expect(count).toBe(0);
    });

    it('应该处理正则表达式特殊字符', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'Test $100 and (value)' }] },
      ];

      const count = store.replaceText('$100', '$200');
      expect(count).toBe(1);
      expect(editor.children[0].children[0].text).toBe('Test $200 and (value)');
    });

    it('应该处理多个文本节点的替换', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'First hello' }] },
        { type: 'paragraph', children: [{ text: 'Second hello' }] },
        { type: 'paragraph', children: [{ text: 'Third hello' }] },
      ];

      const count = store.replaceText('hello', 'hi');
      expect(count).toBe(3);
      expect(editor.children[0].children[0].text).toBe('First hi');
      expect(editor.children[1].children[0].text).toBe('Second hi');
      expect(editor.children[2].children[0].text).toBe('Third hi');
    });
  });

  describe('replaceTextInSelection 方法', () => {
    beforeEach(() => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'Hello world, hello universe' }],
        },
        { type: 'paragraph', children: [{ text: 'Another hello message' }] },
      ];
    });

    it('应该在选中区域内替换文本', () => {
      // 设置选中区域为第一个段落
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 25 }, // 选中 "Hello world, hello universe"
      };

      const count = store.replaceTextInSelection('hello', 'hi');

      expect(count).toBe(2); // 在选中区域内替换了 2 次
      expect(editor.children[0].children[0].text).toBe('hi world, hi universe');
      expect(editor.children[1].children[0].text).toBe('Another hello message'); // 未选中区域不变
    });

    it('应该在无选中区域时返回 0', () => {
      editor.selection = null;
      const count = store.replaceTextInSelection('hello', 'hi');
      expect(count).toBe(0);
    });

    it('应该在选区折叠时返回 0', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 }, // 折叠选区
      };

      const count = store.replaceTextInSelection('hello', 'hi');
      expect(count).toBe(0);
    });

    it('应该支持选中区域内的区分大小写替换', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 25 },
      };

      const count = store.replaceTextInSelection('Hello', 'Hi', {
        caseSensitive: true,
      });
      expect(count).toBe(1);
      expect(editor.children[0].children[0].text).toBe(
        'Hi world, hello universe',
      );
    });
  });

  describe('replaceAll 方法', () => {
    beforeEach(() => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'Hello world, hello universe' }],
        },
      ];
    });

    it('应该替换所有匹配的文本', () => {
      const count = store.replaceAll('hello', 'hi');

      expect(count).toBe(2);
      expect(editor.children[0].children[0].text).toBe('hi world, hi universe');
    });

    it('应该支持区分大小写', () => {
      const count = store.replaceAll('Hello', 'Hi', true);

      expect(count).toBe(1);
      expect(editor.children[0].children[0].text).toBe(
        'Hi world, hello universe',
      );
    });

    it('应该在搜索文本为空时返回 0', () => {
      const count = store.replaceAll('', 'hi');
      expect(count).toBe(0);
    });
  });

  describe('escapeRegExp 私有方法', () => {
    it('应该转义正则表达式特殊字符', () => {
      const result = (store as any).escapeRegExp('$100 + (value)');
      expect(result).toBe('\\$100 \\+ \\(value\\)');
    });

    it('应该处理空字符串', () => {
      const result = (store as any).escapeRegExp('');
      expect(result).toBe('');
    });

    it('应该处理普通字符串', () => {
      const result = (store as any).escapeRegExp('hello world');
      expect(result).toBe('hello world');
    });
  });

  describe('边界情况', () => {
    it('应该处理空编辑器', () => {
      editor.children = [];
      const result = store.isLatestNode({} as Node);
      expect(result).toBe(false);
    });

    it('应该处理只有一个节点的编辑器', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'test' }] }];
      // 模拟 ReactEditor.findPath 返回正确的路径
      vi.spyOn(ReactEditor, 'findPath').mockReturnValue([0]);

      const result = store.isLatestNode(editor.children[0]);
      expect(result).toBe(true);
    });

    it('应该处理复杂的嵌套结构', () => {
      editor.children = [
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'item 1' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'item 2' }],
            },
          ],
        },
      ];

      // 模拟 ReactEditor.findPath 返回正确的路径
      vi.spyOn(ReactEditor, 'findPath').mockReturnValue([0, 1]);

      const result = store.isLatestNode(editor.children[0].children[1]);
      expect(result).toBe(true);
    });
  });

  describe('replaceText', () => {
    beforeEach(() => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'old text with old value and OLD item' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'another old paragraph' }],
        },
      ];
    });

    it('应该替换所有匹配的文本（默认行为）', () => {
      const count = store.replaceText('old', 'new');

      expect(count).toBe(4); // 4个 "old" (不区分大小写: old, old, OLD, old)
    });

    it('应该支持大小写敏感替换', () => {
      const count = store.replaceText('OLD', 'NEW', { caseSensitive: true });

      expect(count).toBe(1); // 只有1个大写的 "OLD"
    });

    it('应该支持完整单词替换', () => {
      const count = store.replaceText('old', 'new', { wholeWord: true });

      expect(count).toBe(4); // "old" 作为完整单词出现4次
    });

    it('应该支持只替换第一个匹配项', () => {
      const count = store.replaceText('old', 'new', { replaceAll: false });

      expect(count).toBe(1); // 只替换第一个
    });

    it('应该处理空字符串搜索', () => {
      const count = store.replaceText('', 'new');

      expect(count).toBe(0);
    });
  });

  describe('replaceTextInSelection', () => {
    beforeEach(() => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'old text with old value' }],
        },
      ];

      // 模拟选中区域
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 13 }, // 选中 "old text with" - 包含2个 "old"
      };
    });

    it('应该在选中区域内替换文本', () => {
      const count = store.replaceTextInSelection('old', 'new');

      expect(count).toBe(2); // 选中区域内有2个 "old" ("old" 和 "old" 在 "with old")
    });

    it('应该在没有选中时返回0', () => {
      editor.selection = null;
      const count = store.replaceTextInSelection('old', 'new');

      expect(count).toBe(0);
    });

    it('应该在折叠选区时返回0', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 }, // 折叠选区
      };

      const count = store.replaceTextInSelection('old', 'new');

      expect(count).toBe(0);
    });
  });

  describe('replaceAll', () => {
    beforeEach(() => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'test Test TEST text' }],
        },
      ];
    });

    it('应该替换所有匹配项（不区分大小写）', () => {
      const count = store.replaceAll('test', 'replaced');

      expect(count).toBe(3); // test, Test, TEST
    });

    it('应该支持大小写敏感替换', () => {
      const count = store.replaceAll('test', 'replaced', true);

      expect(count).toBe(1); // 只有小写的 "test"
    });
  });

  describe('setMDContent 长文本处理', () => {
    beforeEach(() => {
      // 为测试环境提供 requestAnimationFrame
      if (typeof window.requestAnimationFrame === 'undefined') {
        (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
          return setTimeout(() => cb(Date.now()), 0) as any;
        };
      }
    });

    it('应该正常处理短文本（小于 5000 字符）', () => {
      const shortMd = '# 标题\n\n这是一段内容';
      store.setMDContent(shortMd);

      expect(editor.children.length).toBeGreaterThan(0);
      expect(ReactEditor.deselect).toHaveBeenCalled();
    });

    it('应该对长文本进行拆分处理（大于 5000 字符）', async () => {
      // 生成一个超过 5000 字符的 markdown 文本
      const paragraphs = [];
      for (let i = 0; i < 100; i++) {
        paragraphs.push(
          `## 段落标题 ${i}\n\n这是第 ${i} 段的内容，包含一些文本来增加长度。这段话需要足够长才能让整个文档超过5000个字符。我们添加更多的内容来确保测试能够正确验证长文本的拆分处理功能。`,
        );
      }
      const longMd = paragraphs.join('\n\n');

      expect(longMd.length).toBeGreaterThan(5000);

      const result = store.setMDContent(longMd);

      // 使用 RAF 时会返回 Promise
      if (result) {
        await result;
      }

      // 验证内容被正确设置
      expect(editor.children.length).toBeGreaterThan(0);
    });

    it('应该处理包含多个双换行符的长文本', async () => {
      const content = Array(80)
        .fill(0)
        .map(
          (_, i) =>
            `段落 ${i}：这是第${i}段的内容部分，我们需要增加足够的文本长度来确保整个文档超过5000个字符的阈值，这样才能触发分批处理的逻辑。\n\n这是更多内容来进一步增加长度。`,
        )
        .join('\n\n');

      expect(content.length).toBeGreaterThan(5000);

      const result = store.setMDContent(content);
      if (result) {
        await result;
      }

      expect(editor.children.length).toBeGreaterThan(0);
    });

    it('应该跳过空的拆分块', async () => {
      const contentWithEmptyChunks = Array(250)
        .fill(0)
        .map((_, i) =>
          i % 2 === 0
            ? `这是第${i}段的内容块，我们需要包含足够多的文本内容来增加总体长度，以确保能够触发长文本处理的逻辑分支。`
            : '',
        )
        .join('\n\n');

      expect(contentWithEmptyChunks.length).toBeGreaterThan(5000);

      const result = store.setMDContent(contentWithEmptyChunks);
      if (result) {
        await result;
      }

      // 应该成功处理，不会因为空块而出错
      expect(editor.children.length).toBeGreaterThan(0);
    });

    it('当内容与当前内容相同时不应更新', () => {
      const md = '# 测试\n\n内容';
      store.setMDContent(md);

      vi.clearAllMocks();

      // 再次设置相同内容
      store.setMDContent(md);

      // 由于内容相同，不应该调用 deselect
      expect(ReactEditor.deselect).not.toHaveBeenCalled();
    });

    it('应该支持自定义 chunkSize', () => {
      // 生成一个 1000 字符的文本
      const content = Array(50)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：这是一些内容文本，需要足够长来超过阈值触发分批处理`,
        )
        .join('\n\n');

      expect(content.length).toBeGreaterThan(500);
      expect(content.length).toBeLessThan(5000);

      // 使用更小的 chunkSize，触发分批处理
      store.setMDContent(content, undefined, { chunkSize: 500, useRAF: false });

      expect(editor.children.length).toBeGreaterThan(0);
      expect(ReactEditor.deselect).toHaveBeenCalled();
    });

    it('应该支持自定义分隔符（字符串）', async () => {
      const content = Array(120)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：这是第${i}段的内容，包含足够的文本来增加总长度，确保能够超过5000字符的阈值`,
        )
        .join('---'); // 使用 --- 作为分隔符

      expect(content.length).toBeGreaterThan(5000);

      const result = store.setMDContent(content, undefined, {
        separator: '---',
      });
      if (result) {
        await result;
      }

      expect(editor.children.length).toBeGreaterThan(0);
    });

    it('应该支持自定义分隔符（正则表达式）', async () => {
      const content = Array(120)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：这是第${i}段的内容，包含足够的文本来增加总长度，确保能够超过5000字符的阈值`,
        )
        .join('\n===\n'); // 使用 === 分隔

      expect(content.length).toBeGreaterThan(5000);

      // 使用正则表达式匹配包含 = 的分隔符
      const result = store.setMDContent(content, undefined, {
        separator: /\n={2,}\n/,
      });
      if (result) {
        await result;
      }

      expect(editor.children.length).toBeGreaterThan(0);
    });

    it('应该同时支持自定义 chunkSize 和 separator', async () => {
      const content = Array(60)
        .fill(0)
        .map((_, i) => `内容块${i}：这是一些文本内容，需要足够长度`)
        .join('|||');

      expect(content.length).toBeGreaterThan(800);

      const result = store.setMDContent(content, undefined, {
        chunkSize: 800,
        separator: '|||',
      });
      if (result) {
        await result;
      }

      expect(editor.children.length).toBeGreaterThan(0);
    });

    it('应该避免在代码块内部拆分内容', () => {
      const md = [
        '```js',
        "console.log('line 1');",
        '',
        "console.log('line 3');",
        '```',
        '',
        '结尾段落',
      ].join('\n');

      const expectedNodes = parserMdToSchema(md, store.plugins ?? []).schema;

      store.setMDContent(md, undefined, {
        chunkSize: 20,
        useRAF: false,
      });

      expect(editor.children).toEqual(expectedNodes);
    });

    it('应该在小于 chunkSize 时不进行拆分', () => {
      const shortContent = '# 标题\n\n简短内容';

      store.setMDContent(shortContent, undefined, { chunkSize: 10000 });

      // 即使有分隔符也不应该拆分，因为内容小于 chunkSize
      expect(editor.children.length).toBeGreaterThan(0);
      expect(ReactEditor.deselect).toHaveBeenCalled();
    });

    it('应该支持使用 requestAnimationFrame 避免卡顿', async () => {
      const content = Array(120)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：这是第${i}段的内容，包含足够的文本来增加总长度，确保能够超过5000字符的阈值`,
        )
        .join('\n\n');

      expect(content.length).toBeGreaterThan(5000);

      // 模拟 requestAnimationFrame
      let rafCallback: FrameRequestCallback | null = null;
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallback = cb;
        // 异步执行回调
        setTimeout(() => rafCallback?.(0), 0);
        return 1;
      });

      const result = store.setMDContent(content, undefined, {
        useRAF: true,
        batchSize: 10,
      });

      // 应该返回 Promise
      expect(result).toBeInstanceOf(Promise);

      // 等待完成
      await result;

      expect(editor.children.length).toBeGreaterThan(0);

      vi.restoreAllMocks();
    });

    it('应该支持禁用 RAF 进行同步处理', () => {
      const content = Array(120)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：这是第${i}段的内容，包含足够的文本来增加总长度，确保能够超过5000字符的阈值`,
        )
        .join('\n\n');

      const result = store.setMDContent(content, undefined, {
        useRAF: false,
      });

      // 同步执行，不返回 Promise
      expect(result).toBeUndefined();
      expect(editor.children.length).toBeGreaterThan(0);
      expect(ReactEditor.deselect).toHaveBeenCalled();
    });

    it('应该支持进度回调', async () => {
      const content = Array(120)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：这是第${i}段的内容，包含足够的文本来增加总长度，确保能够超过5000字符的阈值`,
        )
        .join('\n\n');

      const progressValues: number[] = [];
      const onProgress = vi.fn((progress: number) => {
        progressValues.push(progress);
      });

      // 模拟 requestAnimationFrame
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        setTimeout(() => cb(0), 0);
        return 1;
      });

      const result = store.setMDContent(content, undefined, {
        useRAF: true,
        batchSize: 10,
        onProgress,
      });

      await result;

      // 应该调用了进度回调
      expect(onProgress).toHaveBeenCalled();
      expect(progressValues.length).toBeGreaterThan(0);

      // 最后一次进度应该是 1（100%）
      expect(progressValues[progressValues.length - 1]).toBe(1);

      // 进度应该是递增的
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
      }

      vi.restoreAllMocks();
    });

    it('应该在同步模式下也支持进度回调', () => {
      const content = Array(120)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：这是第${i}段的内容，包含足够的文本来增加总长度，确保能够超过5000字符的阈值`,
        )
        .join('\n\n');

      const onProgress = vi.fn();

      store.setMDContent(content, undefined, {
        useRAF: false,
        onProgress,
      });

      // 同步模式下，应该直接调用一次 onProgress(1)
      expect(onProgress).toHaveBeenCalledWith(1);
    });

    it('应该支持自定义 batchSize', async () => {
      const content = Array(120)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：这是第${i}段的内容，包含足够的文本来增加总长度，确保能够超过5000字符的阈值，添加更多内容`,
        )
        .join('\n\n');

      expect(content.length).toBeGreaterThan(5000);

      const result = store.setMDContent(content, undefined, {
        useRAF: true,
        batchSize: 20, // 自定义批次大小
      });

      // 应该返回 Promise
      expect(result).toBeInstanceOf(Promise);
      await result;

      // 内容应该被正确设置
      expect(editor.children.length).toBeGreaterThan(0);
    });

    it('节点数量小于 batchSize 时不应使用 RAF', () => {
      const content = Array(80)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：这是第${i}段的内容，包含足够的文本来增加总长度，确保能够超过5000字符的阈值`,
        )
        .join('\n\n');

      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

      const result = store.setMDContent(content, undefined, {
        useRAF: true,
        batchSize: 1000, // 批次大小大于节点数
      });

      // 节点数少，应该同步执行
      expect(result).toBeUndefined();
      expect(rafSpy).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });

  describe('insertLink 在 code/table/head 节点时插入到下一段', () => {
    it('当前节点为 code 时应在下一位置插入段落链接', () => {
      editor.children = [
        { type: 'code', language: 'js', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        yield [
          { type: 'code', language: 'js', children: [{ text: '' }] },
          [0],
        ] as any;
      });
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      store.insertLink('https://link.com');

      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        {
          type: 'paragraph',
          children: [{ text: 'https://link.com', url: 'https://link.com' }],
        },
        expect.objectContaining({ at: [1], select: true }),
      );
    });
  });

  describe('_shouldSkipSetContent 与 setMDContent 异常分支', () => {
    it('_shouldSkipSetContent 比较抛错时应继续设置内容', () => {
      const parserSpy = vi.spyOn(editorUtils, 'parserSlateNodeToMarkdown');
      parserSpy.mockImplementationOnce(() => {
        throw new Error('compare error');
      });
      store.setMDContent('# new');
      expect(editor.children.length).toBeGreaterThan(0);
      parserSpy.mockRestore();
    });

    it('cancelSetMDContent 应取消进行中的 setMDContent', async () => {
      const longContent = Array(120)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：足够长的内容以触发长文本拆分，需要超过五千字符才能进入 RAF 分支，这里增加足够多的文字以满足长度要求。`,
        )
        .join('\n\n');
      expect(longContent.length).toBeGreaterThan(5000);
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        setTimeout(() => cb(0), 0);
        return 1;
      });
      const promise = store.setMDContent(longContent, undefined, {
        useRAF: true,
        batchSize: 10,
      });
      expect(promise).toBeInstanceOf(Promise);
      store.cancelSetMDContent();
      await expect(promise).rejects.toThrow();
      vi.restoreAllMocks();
    });
  });

  describe('setMDContent _setShortContent 解析失败', () => {
    it('parserMdToSchema 抛错时应向上抛出', () => {
      const parserSpy = vi.spyOn(parserMdToSchemaModule, 'parserMdToSchema');
      parserSpy.mockImplementationOnce(() => {
        throw new Error('parse error');
      });
      expect(() => store.setMDContent('# bad')).toThrow('parse error');
      parserSpy.mockRestore();
    });
  });

  describe('setContent 与 setMDContent 同步长内容', () => {
    it('_setLongContentSync 解析失败时应抛出', () => {
      const parserSpy = vi.spyOn(parserMdToSchemaModule, 'parserMdToSchema');
      let callCount = 0;
      parserSpy.mockImplementation((md: string, plugins?: any) => {
        callCount += 1;
        if (callCount > 5) throw new Error('chunk error');
        return parserMdToSchema(md, plugins);
      });
      const longContent = Array(80)
        .fill(0)
        .map((_, i) => `段落${i}：内容`)
        .join('\n\n');
      expect(() =>
        store.setMDContent(longContent, undefined, { useRAF: false }),
      ).toThrow();
      parserSpy.mockRestore();
    });
  });

  describe('executeOperations replace 与 text 类型', () => {
    it('应执行 replace 操作', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'old' }] }];
      const removeSpy = vi.spyOn(Transforms, 'removeNodes');
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');
      store.updateNodeList([
        { type: 'paragraph', children: [{ text: 'new' }] },
      ] as any);
      expect(editor.children.length).toBeGreaterThanOrEqual(1);
      removeSpy.mockRestore?.();
      insertSpy.mockRestore?.();
    });

    it('executeOperations 应执行 insert/remove/update/replace/text 五种类型', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ];
      (store as any).executeOperations([
        {
          type: 'insert',
          path: [2],
          node: { type: 'paragraph', children: [{ text: 'c' }] },
          priority: 10,
        },
        { type: 'remove', path: [1], priority: 0 },
      ]);
      expect(editor.children.length).toBe(2);
      (store as any).executeOperations([
        {
          type: 'update',
          path: [0],
          properties: { type: 'paragraph' },
          priority: 7,
        },
      ]);
      (store as any).executeOperations([
        {
          type: 'replace',
          path: [0],
          node: { type: 'paragraph', children: [{ text: 'replaced' }] },
          priority: 5,
        },
      ]);
      expect(Node.string(editor.children[0])).toBe('replaced');
      (store as any).executeOperations([
        { type: 'text', path: [0, 0], text: 'x', priority: 8 },
      ]);
      expect(Node.string(editor.children[0])).toBe('x');
    });

    it('executeOperations 单步抛错时应捕获并继续', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const removeSpy = vi
        .spyOn(Transforms, 'removeNodes')
        .mockImplementationOnce(() => {
          throw new Error('remove error');
        });
      (store as any).executeOperations([
        { type: 'remove', path: [0], priority: 0 },
      ]);
      expect(errSpy).toHaveBeenCalled();
      removeSpy.mockRestore();
      errSpy.mockRestore();
    });
  });

  describe('findByPathAndText', () => {
    it('searchText 为空或仅空白时应返回空数组', () => {
      expect(store.findByPathAndText([], '')).toEqual([]);
      expect(store.findByPathAndText([], '   ')).toEqual([]);
    });

    it('应支持 caseSensitive、wholeWord、maxResults 选项', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'Hello world' }] },
      ];
      const result = store.findByPathAndText([], 'hello', {
        caseSensitive: true,
        wholeWord: false,
        maxResults: 10,
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it('不传 options 时应使用默认 maxResults 并调用工具函数', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'target word' }] },
      ];
      const result = store.findByPathAndText([], 'word');
      expect(Array.isArray(result)).toBe(true);
    });

    it('传空对象 options 时应走默认 caseSensitive wholeWord maxResults', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'abc' }] }];
      const result = store.findByPathAndText([], 'abc', {});
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('replaceTextInSelection replaceAll false', () => {
    it('replaceAll 为 false 时只替换第一个匹配后 break', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'foo bar foo' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 11 },
      };
      const count = store.replaceTextInSelection('foo', 'x', {
        replaceAll: false,
      });
      expect(count).toBe(1);
      expect(editor.children[0].children[0].text).toBe('x bar foo');
    });

    it('有选区但 searchText 为空时应 return 0', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'abc' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      };
      const count = store.replaceTextInSelection('', 'x');
      expect(count).toBe(0);
    });

    it('replaceAll 为 false 且选区内有匹配时应只替换一处后 break（_replaceInSelectionNodes）', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'a ab a' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 6 },
      };
      const count = store.replaceTextInSelection('a', 'z', {
        replaceAll: false,
      });
      expect(count).toBe(1);
      expect(editor.children[0].children[0].text).toBe('z ab a');
    });
  });

  describe('setMDContent 含代码块围栏不拆分', () => {
    it('应调用 _splitMarkdown 且遇到 ``` 围栏时不拆分', () => {
      const md = [
        '```js',
        'code line 1',
        'code line 2',
        '```',
        '',
        'after fence',
      ].join('\n');
      const filler = Array(200)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：足够长的内容以触发长文本拆分，需要超过五千字符才能进入长文本分支。`,
        )
        .join('\n\n');
      const longMd = md + '\n\n' + filler;
      expect(longMd.length).toBeGreaterThan(5000);
      store.setMDContent(longMd, undefined, { useRAF: false });
      expect(editor.children.length).toBeGreaterThan(0);
    });
  });

  describe('updateNodeList 异常回退', () => {
    it('executeOperations 抛错时应回退为直接替换 children', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'old' }] }];
      const execSpy = vi
        .spyOn(store as any, 'executeOperations')
        .mockImplementationOnce(() => {
          throw new Error('execute error');
        });
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      store.updateNodeList([
        { type: 'paragraph', children: [{ text: 'new' }] },
      ] as any);
      expect(editor.children).toHaveLength(1);
      expect(editor.children[0].children[0].text).toBe('new');
      execSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('_isValidNode 过滤与 generateDiff', () => {
    it('updateNodeList 应过滤无效节点（空 p、空 list、无 src 的 image 等）', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
      store.updateNodeList([
        { type: 'p', children: [] },
        { type: 'paragraph', children: [{ text: 'valid' }] },
      ] as any);
      expect(editor.children.length).toBeGreaterThanOrEqual(1);
      expect(Node.string(editor)).toContain('valid');
    });

    it('generateDiff 旧节点多于新节点时应生成 remove 操作', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
        { type: 'paragraph', children: [{ text: 'c' }] },
      ];
      store.updateNodeList([
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ] as any);
      expect(editor.children.length).toBe(2);
    });

    it('compareNodes 类型不同时应生成 replace 操作', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'old' }] }];
      store.updateNodeList([
        { type: 'heading', level: 1, children: [{ text: 'new' }] },
      ] as any);
      expect(editor.children[0].type).toBe('heading');
    });
  });

  describe('表格 diff _updateTableWithRowChanges _handleRowCountChanges _handleCellCountChanges', () => {
    const tableRow = (cells: string[]) => ({
      type: 'table-row',
      children: cells.map((t) => ({
        type: 'table-cell',
        children: [{ text: t }],
      })),
    });

    it('表格行数增加时应通过 _updateTableWithRowChanges 与 _handleRowCountChanges 更新', () => {
      editor.children = [
        {
          type: 'table',
          children: [tableRow(['a', 'b']), tableRow(['c', 'd'])],
        } as any,
      ];
      store.updateNodeList([
        {
          type: 'table',
          children: [
            tableRow(['a', 'b']),
            tableRow(['c', 'd']),
            tableRow(['e', 'f']),
          ],
        } as any,
      ]);
      expect(editor.children[0].children.length).toBe(3);
    });

    it('表格行数减少时应执行 remove 行操作', () => {
      editor.children = [
        {
          type: 'table',
          children: [tableRow(['a', 'b']), tableRow(['c', 'd'])],
        } as any,
      ];
      store.updateNodeList([
        { type: 'table', children: [tableRow(['a', 'b'])] } as any,
      ]);
      expect(editor.children[0].children.length).toBe(1);
    });

    it('表格单元格数增加时应通过 _handleCellCountChanges 更新', () => {
      editor.children = [
        { type: 'table', children: [tableRow(['x', 'y'])] } as any,
      ];
      store.updateNodeList([
        { type: 'table', children: [tableRow(['x', 'y', 'z'])] } as any,
      ]);
      expect(editor.children[0].children[0].children.length).toBe(3);
    });
  });

  describe('replaceText 触发 _replaceAllInNodes 与 _replaceFirstInNodes insertText', () => {
    it('replaceAll 时多节点有匹配应逐节点替换', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'aa' }] },
        { type: 'paragraph', children: [{ text: 'aa' }] },
      ];
      const count = store.replaceText('a', 'b', { replaceAll: true });
      expect(count).toBe(4);
      expect(editor.children[0].children[0].text).toBe('bb');
      expect(editor.children[1].children[0].text).toBe('bb');
    });

    it('replaceAll 为 false 时仅第一处匹配替换', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'needle x needle' }] },
      ];
      const count = store.replaceText('needle', 'y', { replaceAll: false });
      expect(count).toBe(1);
      expect(editor.children[0].children[0].text).toBe('y x needle');
    });

    it('replaceAll 为 false 且第一个文本节点无匹配时在后续节点替换', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'no match here' }] },
        { type: 'paragraph', children: [{ text: 'needle in second' }] },
      ];
      const count = store.replaceText('needle', 'x', { replaceAll: false });
      expect(count).toBe(1);
      expect(editor.children[0].children[0].text).toBe('no match here');
      expect(editor.children[1].children[0].text).toBe('x in second');
    });

    it('replaceAll 为 false 时应在第一个匹配节点上执行 Transforms.insertText', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'prefix word suffix' }] },
      ];
      const insertSpy = vi.spyOn(Transforms, 'insertText');
      const count = store.replaceText('word', 'X', { replaceAll: false });
      expect(count).toBe(1);
      expect(insertSpy).toHaveBeenCalledWith(
        editor,
        'prefix X suffix',
        expect.objectContaining({ at: [0, 0], voids: true }),
      );
      insertSpy.mockRestore();
    });
  });

  describe('dragend 回调触发 _handleDragEnd', () => {
    it('dragStart 后触发 dragend 应执行 removeEventListener 并清理 mark 与 draggedElement', () => {
      const parent = document.createElement('div');
      const mockContainer = document.createElement('div');
      parent.appendChild(mockContainer);
      const dragEl = document.createElement('div');
      dragEl.setAttribute('data-be', 'list-item');
      store.draggedElement = dragEl as any;
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any);

      let dragendCallback: () => void;
      vi.spyOn(window, 'addEventListener').mockImplementation(
        (event, handler) => {
          if (event === 'dragend') dragendCallback = handler as () => void;
        },
      );
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      store.dragStart(
        {
          stopPropagation: vi.fn(),
          dataTransfer: { setDragImage: vi.fn() },
        } as any,
        mockContainer,
      );

      dragendCallback!();
      expect(store.draggedElement).toBeNull();
      expect(removeSpy).toHaveBeenCalledWith('dragover', expect.any(Function));

      vi.mocked(document.querySelectorAll).mockRestore();
      removeSpy.mockRestore();
      vi.mocked(window.addEventListener).mockRestore();
    });
  });

  describe('dragStart dragend 与进度回调异常', () => {
    it('RAF 进度回调抛错时不应中断流程', async () => {
      const content = Array(120)
        .fill(0)
        .map(
          (_, i) =>
            `段落${i}：足够长的内容以触发 RAF，需要超过五千字符，添加更多文字以满足长度。`,
        )
        .join('\n\n');
      expect(content.length).toBeGreaterThan(5000);
      const onProgress = vi.fn((p: number) => {
        if (p > 0.5) throw new Error('progress error');
      });
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        setTimeout(() => cb(0), 0);
        return 1;
      });
      const result = store.setMDContent(content, undefined, {
        useRAF: true,
        batchSize: 10,
        onProgress,
      });
      await result;
      expect(editor.children.length).toBeGreaterThan(0);
      vi.restoreAllMocks();
    });
  });
});
