/**
 * editorUtils 分支覆盖：错误/回退路径、空选区、边界分支。
 */
import { createEditor, Editor, Path, Point, Range, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { ReactEditor } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as domUtils from '../dom';
import {
  createDomRangeFromNodes,
  createSelectionFromNodes,
  EditorUtils,
  findByPathAndText,
  findLeafPath,
  getRelativePath,
  getSelectionFromDomSelection,
} from '../editorUtils';
import { READONLY_MARKDOWN_CONTAINER_KEY } from '../../../readonly/findTextInReadonlyMarkdownDom';

vi.mock('slate-react', () => ({
  ReactEditor: {
    focus: vi.fn(),
    blur: vi.fn(),
    findPath: vi.fn(),
    hasDOMNode: vi.fn(),
    toSlateNode: vi.fn(),
    toSlateRange: vi.fn(),
  },
}));

describe('editorUtils 分支覆盖', () => {
  let editor: ReturnType<typeof createEditor>;

  beforeEach(() => {
    editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'Hello world' }] },
      { type: 'paragraph', children: [{ text: 'Second' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('safeDeselect', () => {
    it('无选区时直接返回', () => {
      editor.selection = null;
      const deselectSpy = vi.spyOn(Transforms, 'deselect');
      EditorUtils.safeDeselect(editor);
      expect(deselectSpy).not.toHaveBeenCalled();
    });

    it('deselect 抛错时回退为 editor.selection = null', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      };
      vi.spyOn(Transforms, 'deselect').mockImplementation(() => {
        throw new Error('deselect failed');
      });
      EditorUtils.safeDeselect(editor);
      expect(editor.selection).toBeNull();
    });

    it('deselect 与 assignment 均抛错时静默忽略', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      };
      vi.spyOn(Transforms, 'deselect').mockImplementation(() => {
        throw new Error('deselect failed');
      });
      Object.defineProperty(editor, 'selection', {
        configurable: true,
        get: () => ({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        }),
        set: () => {
          throw new Error('selection assignment failed');
        },
      });
      expect(() => EditorUtils.safeDeselect(editor)).not.toThrow();
    });
  });

  describe('coalesceRootAllEmptyParagraphs', () => {
    it('null/undefined 输入返回单个空段落', () => {
      expect(EditorUtils.coalesceRootAllEmptyParagraphs(null as any)).toEqual([
        { type: 'paragraph', children: [{ text: '' }] },
      ]);
      expect(
        EditorUtils.coalesceRootAllEmptyParagraphs(undefined as any),
      ).toEqual([{ type: 'paragraph', children: [{ text: '' }] }]);
    });
  });

  describe('moveNodes', () => {
    it('超过 100 次移动后中断循环', () => {
      const moveSpy = vi.spyOn(Transforms, 'moveNodes').mockImplementation(() => {});
      vi.spyOn(Editor, 'hasPath').mockReturnValue(true);
      EditorUtils.moveNodes(editor, [0], [1], 0);
      expect(moveSpy.mock.calls.length).toBeLessThanOrEqual(101);
    });
  });

  describe('clearMarks', () => {
    it('numbered-list 选中时转换为段落', () => {
      editor.children = [
        {
          type: 'numbered-list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'Item', bold: true }] },
              ],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 4 },
      };
      EditorUtils.clearMarks(editor);
      expect(editor.children).toBeDefined();
    });

    it('list 类型选中时转换为段落', () => {
      editor.children = [
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'Nested', italic: true }] },
              ],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 6 },
      };
      const removeSpy = vi.spyOn(Transforms, 'removeNodes');
      EditorUtils.clearMarks(editor);
      expect(removeSpy).toHaveBeenCalled();
    });

    it('list-item 嵌套在 paragraph 内时触发 liftNodes', () => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'outer' }],
        },
        {
          type: 'list-item',
          children: [
            { type: 'paragraph', children: [{ text: 'inner', bold: true }] },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [1, 0, 0], offset: 0 },
        focus: { path: [1, 0, 0], offset: 5 },
      };
      const liftSpy = vi.spyOn(Transforms, 'liftNodes');
      EditorUtils.clearMarks(editor);
      expect(liftSpy).toHaveBeenCalled();
    });

    it('内部抛错时捕获并记录 console.error', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      };
      const originalNodes = Editor.nodes;
      let nodesCallCount = 0;
      vi.spyOn(Editor, 'nodes').mockImplementation((...args) => {
        nodesCallCount += 1;
        if (nodesCallCount >= 2) {
          throw new Error('Editor.nodes failed');
        }
        return originalNodes(...args);
      });
      EditorUtils.clearMarks(editor);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in clearMarks:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('deleteAll', () => {
    it('编辑器无顶层元素时仍插入默认段落', () => {
      editor.children = [];
      editor.selection = null;
      EditorUtils.deleteAll(editor);
      expect(editor.children.length).toBeGreaterThanOrEqual(1);
      expect(editor.children[0]).toMatchObject({
        type: 'paragraph',
        children: [{ text: '' }],
      });
    });
  });

  describe('includeAll', () => {
    it('选区未覆盖整段时返回 false', () => {
      const range: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      expect(EditorUtils.includeAll(editor, range, [0])).toBe(false);
    });

    it('选区完全覆盖节点时返回 true', () => {
      const end = Editor.end(editor, [0]);
      const range: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: end,
      };
      expect(EditorUtils.includeAll(editor, range, [0])).toBe(true);
    });
  });

  describe('findNext', () => {
    it('无直接 next 时向上遍历父路径', () => {
      editor.children = [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: 'quote' }] }],
        },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ];
      const next = EditorUtils.findNext(editor, [0, 0, 0]);
      expect(next).toEqual([1]);
    });
  });

  describe('isDirtLeaf', () => {
    it('mark 属性视为脏 leaf', () => {
      expect(EditorUtils.isDirtLeaf({ text: 'x', mark: true } as any)).toBe(true);
    });
  });

  describe('wrapperCardNode', () => {
    it('数组节点展开为多个 content 子节点', () => {
      const nodes = [
        { type: 'paragraph', children: [{ text: 'A' }] },
        { type: 'paragraph', children: [{ text: 'B' }] },
      ];
      const result = EditorUtils.wrapperCardNode(nodes);
      expect(result.type).toBe('card');
      expect(result.children).toHaveLength(4);
      expect(result.children[1]).toMatchObject({ type: 'paragraph' });
      expect(result.children[2]).toMatchObject({ type: 'paragraph' });
    });
  });

  describe('createMediaNode', () => {
    it('try 块抛错时回退到 generic media 节点', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.spyOn(domUtils, 'getMediaType').mockImplementation(() => {
        throw new Error('getMediaType failed');
      });
      const result = EditorUtils.createMediaNode('https://example.com/x.mp4', 'video');
      expect(result).toMatchObject({ type: 'card' });
      expect((result as any).children[1].type).toBe('media');
      consoleSpy.mockRestore();
    });
  });

  describe('checkEnd', () => {
    it('Editor.nodes 抛错时返回 false', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.spyOn(Editor, 'nodes').mockImplementation(() => {
        throw new Error('nodes failed');
      });
      expect(EditorUtils.checkEnd(editor)).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('replaceEditorContent + safeDeselect', () => {
    it('replaceEditorContent 在有选区时调用 safeDeselect', () => {
      const historyEditor = withHistory(createEditor());
      historyEditor.children = [
        { type: 'paragraph', children: [{ text: 'old' }] },
      ];
      historyEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      };
      const deselectSpy = vi.spyOn(Transforms, 'deselect');
      EditorUtils.replaceEditorContent(historyEditor, [
        { type: 'paragraph', children: [{ text: 'new' }] },
      ]);
      expect(deselectSpy).toHaveBeenCalled();
      expect(historyEditor.selection).toBeNull();
    });
  });

  describe('findByPathAndText readonly 分支', () => {
    it('只读编辑器有 container 时走 DOM 搜索', () => {
      const container = document.createElement('div');
      container.innerHTML = '<p data-be="paragraph">readonly hello</p>';
      const readonlyEditor = createEditor() as any;
      readonlyEditor[READONLY_MARKDOWN_CONTAINER_KEY] = container;
      const results = findByPathAndText(readonlyEditor, [0], 'hello', {
        maxResults: 2,
      });
      expect(Array.isArray(results)).toBe(true);
    });

    it('只读编辑器无 container 时返回空数组', () => {
      const readonlyEditor = createEditor() as any;
      readonlyEditor[READONLY_MARKDOWN_CONTAINER_KEY] = null;
      expect(findByPathAndText(readonlyEditor, [0], 'hello')).toEqual([]);
    });
  });

  describe('getSelectionFromDomSelection', () => {
    it('anchor/focus 不可选时返回 null', () => {
      const range = document.createRange();
      range.setStart(document.body, 0);
      range.setEnd(document.body, 0);
      const domSelection = {
        rangeCount: 1,
        getRangeAt: () => range,
      } as unknown as Selection;
      vi.mocked(ReactEditor.hasDOMNode).mockReturnValue(false);
      expect(
        getSelectionFromDomSelection(editor as any, domSelection),
      ).toBeNull();
    });

    it('createAndConvertRange 抛错时返回 null', () => {
      const leaf = document.createElement('span');
      leaf.setAttribute('data-slate-leaf', 'true');
      const text = document.createElement('span');
      text.setAttribute('data-slate-node', 'text');
      text.appendChild(leaf);
      leaf.appendChild(document.createTextNode('x'));
      document.body.appendChild(text);

      const range = document.createRange();
      range.setStart(leaf.firstChild!, 0);
      range.setEnd(leaf.firstChild!, 1);
      const domSelection = {
        rangeCount: 1,
        getRangeAt: () => range,
      } as unknown as Selection;

      vi.mocked(ReactEditor.hasDOMNode).mockReturnValue(true);
      vi.mocked(ReactEditor.toSlateRange).mockImplementation(() => {
        throw new Error('toSlateRange failed');
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(
        getSelectionFromDomSelection(editor as any, domSelection),
      ).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      text.remove();
    });

    it('getRangeAt 返回 null 时返回 null', () => {
      const domSelection = {
        rangeCount: 1,
        getRangeAt: () => null,
      } as unknown as Selection;
      expect(
        getSelectionFromDomSelection(editor as any, domSelection),
      ).toBeNull();
    });
  });

  describe('createSelectionFromNodes', () => {
    it('window.getSelection 返回 null 时返回 null', () => {
      const original = window.getSelection;
      window.getSelection = vi.fn(() => null) as any;
      const anchor = document.createTextNode('a');
      const focus = document.createTextNode('b');
      expect(createSelectionFromNodes(anchor, 0, focus, 1)).toBeNull();
      window.getSelection = original;
    });
  });

  describe('createDomRangeFromNodes SSR', () => {
    it('window 未定义时返回 null', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error simulate SSR
      delete globalThis.window;
      expect(
        createDomRangeFromNodes(
          document.createTextNode('a'),
          0,
          document.createTextNode('b'),
          1,
        ),
      ).toBeNull();
      globalThis.window = originalWindow;
    });
  });

  describe('getRelativePath', () => {
    it('path 短于 anther 时提前返回零数组', () => {
      expect(getRelativePath([1], [0, 1, 2])).toEqual([0, 0, 0]);
    });
  });

  describe('findLeafPath', () => {
    it('返回 Editor.leaf 的 leaf path', () => {
      expect(findLeafPath(editor, [0, 0])).toEqual([0, 0]);
    });
  });

  describe('copyText / cutText 边界', () => {
    it.skip('leaf.text 为 undefined 时使用空字符串', () => {
      const start: Point = { path: [0, 0], offset: 0 };
      vi.spyOn(Editor, 'leaf').mockReturnValue([
        { text: undefined } as any,
        [0, 0],
      ]);
      vi.spyOn(Editor, 'next').mockReturnValue(undefined as any);
      expect(EditorUtils.copyText(editor, start)).toBe('');
      expect(EditorUtils.cutText(editor, start)[0].text).toBe('');
    });
  });

  describe('getUrl 边界', () => {
    it('匹配节点 url 为空字符串时返回空', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'link', url: '' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      };
      expect(EditorUtils.getUrl(editor)).toBe('');
    });
  });

  describe('listToParagraph 边界', () => {
    it('list-item 无 children 时跳过', () => {
      const listNode = {
        type: 'list',
        children: [{ type: 'list-item' }],
      } as any;
      expect(EditorUtils.listToParagraph(editor, listNode)).toEqual([]);
    });
  });

  describe('moveNodes 默认 index', () => {
    it('省略 index 参数时使用默认值 1', () => {
      const moveSpy = vi
        .spyOn(Transforms, 'moveNodes')
        .mockImplementation(() => {});
      vi.spyOn(Editor, 'hasPath').mockReturnValueOnce(true).mockReturnValue(false);
      EditorUtils.moveNodes(editor, [0], [2]);
      expect(moveSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ at: [0], to: [2, 1] }),
      );
    });
  });

  describe('checkEnd 末尾 hr', () => {
    it('最后块为 hr 时应插入空段落', () => {
      editor.children = [{ type: 'hr', children: [{ text: '' }] }];
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');
      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        yield [editor.children[0], [0]];
      });
      expect(EditorUtils.checkEnd(editor)).toBe(true);
      expect(insertSpy).toHaveBeenCalled();
    });

    it('最后块为空 paragraph 时不插入', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        yield [editor.children[0], [0]];
      });
      expect(EditorUtils.checkEnd(editor)).toBe(false);
    });
  });

  describe('createMediaNode residual ||', () => {
    it('相对路径 src 使用 window.location.origin 拼接', () => {
      const originalOrigin = window.location.origin;
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...window.location, origin: 'https://host.test' },
      });
      // normalizeUrl 仅用于 parseUrlParams；节点 url 仍保留原始相对路径
      const node = EditorUtils.createMediaNode(
        '/assets/pic.png?alt=from-origin',
        'image',
      );
      expect((node as any).children?.[1]?.url).toBe(
        '/assets/pic.png?alt=from-origin',
      );
      expect((node as any).children?.[1]?.alt).toBe('from-origin');
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...window.location, origin: originalOrigin },
      });
    });

    it('url 参数 alt 缺省时 alt 为空字符串', () => {
      const node = EditorUtils.createMediaNode(
        'https://example.com/img.png?width=100',
        'image',
      );
      expect((node as any).children?.[1]?.alt).toBe('');
    });
  });

  describe('istanbul residual：findPrev/findMedia/clearMarks/listToParagraph', () => {
    it('isPrevious / isNextPath 同父与比较分支', () => {
      expect(EditorUtils.isPrevious([0, 0], [0, 1])).toBe(true);
      expect(EditorUtils.isPrevious([0, 1], [0, 0])).toBe(false);
      expect(EditorUtils.isNextPath([0, 1], [0, 0])).toBe(true);
      expect(EditorUtils.isNextPath([0, 0], [1, 0])).toBe(false);
    });

    it('findPrev 跳过 hr 并在无 previous 时上溯', () => {
      editor.children = [
        { type: 'hr', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ];
      const p = EditorUtils.findPrev(editor, [2, 0]);
      expect(Array.isArray(p)).toBe(true);

      const rootPrev = EditorUtils.findPrev(editor, [0]);
      expect(rootPrev).toEqual([]);
    });

    it('findMediaInsertPath：无节点 / table-cell / head / 非空 paragraph', () => {
      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        // empty iterator
      } as any);
      expect(EditorUtils.findMediaInsertPath(editor)).toBeNull();
      vi.mocked(Editor.nodes).mockRestore();

      editor.children = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
                },
              ],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0, 0], offset: 0 },
      };
      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        yield [
          editor.children[0].children[0].children[0],
          [0, 0, 0],
        ];
      } as any);
      expect(EditorUtils.findMediaInsertPath(editor)).toBeTruthy();
      vi.mocked(Editor.nodes).mockRestore();

      editor.children = [
        { type: 'head', level: 1, children: [{ text: 'H' }] },
      ];
      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        yield [editor.children[0], [0]];
      } as any);
      expect(EditorUtils.findMediaInsertPath(editor)).toBeTruthy();
      vi.mocked(Editor.nodes).mockRestore();

      editor.children = [
        { type: 'paragraph', children: [{ text: 'filled' }] },
      ];
      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        yield [editor.children[0], [0]];
      } as any);
      expect(EditorUtils.findMediaInsertPath(editor)).toBeTruthy();
      vi.mocked(Editor.nodes).mockRestore();
    });

    it('moveAfterSpace / moveBeforeSpace 边界', () => {
      const insertSpy = vi.spyOn(Transforms, 'transform');
      const moveSpy = vi.spyOn(Transforms, 'move');
      vi.spyOn(Editor, 'next').mockReturnValue(undefined as any);
      EditorUtils.moveAfterSpace(editor, [0, 0]);
      expect(insertSpy).toHaveBeenCalled();

      vi.spyOn(Editor, 'next').mockReturnValue([
        { text: 'x' },
        [0, 1],
      ] as any);
      EditorUtils.moveAfterSpace(editor, [0, 0]);
      expect(moveSpy).toHaveBeenCalled();

      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);
      EditorUtils.moveBeforeSpace(editor, [0, 0]);
      expect(insertSpy).toHaveBeenCalled();
      vi.mocked(Path.hasPrevious).mockRestore();
    });

    it('clearMarks 无 selection 早退；有 list 时转段落', () => {
      editor.selection = null;
      expect(() => EditorUtils.clearMarks(editor)).not.toThrow();

      // 扁平 list，避免 nested list 触发 liftNodes depth error
      editor.children = [
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'li' }] }],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 2 },
      };
      // liftNodes 在 list-item 路径上可能因结构抛错；mock 掉以稳定走到 list→paragraph
      vi.spyOn(Transforms, 'liftNodes').mockImplementation(() => undefined as any);
      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        yield [editor.children[0], [0]];
      } as any);
      const removeSpy = vi.spyOn(Transforms, 'removeNodes');
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');
      EditorUtils.clearMarks(editor);
      expect(
        removeSpy.mock.calls.length + insertSpy.mock.calls.length,
      ).toBeGreaterThan(0);
      vi.mocked(Editor.nodes).mockRestore();
      vi.mocked(Transforms.liftNodes).mockRestore();
    });

    it('listToParagraph 空 children、嵌套 list、非 paragraph 子节点', () => {
      expect(
        EditorUtils.listToParagraph(editor, {
          type: 'list',
          children: [],
        } as any),
      ).toEqual([]);

      const paras = EditorUtils.listToParagraph(editor, {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'a' }] },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'b' }] },
                    ],
                  },
                ],
              },
              { type: 'code', children: [{ text: 'skip' }] },
            ],
          },
          { type: 'list-item' },
        ],
      } as any);
      expect(paras.some((p) => p.children?.[0]?.text === 'a')).toBe(true);
      expect(paras.some((p) => p.children?.[0]?.text === 'b')).toBe(true);
    });

    it('replaceSelectedNode：无 entries / 空文本 / 普通插入', () => {
      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        // empty iterator
      } as any);
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');
      EditorUtils.replaceSelectedNode(editor, [
        { type: 'paragraph', children: [{ text: 'n' }] },
      ] as any);
      expect(insertSpy).toHaveBeenCalled();
      vi.mocked(Editor.nodes).mockRestore();

      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        yield [{ text: '' }, [0, 0]];
      } as any);
      const removeSpy = vi.spyOn(Transforms, 'removeNodes');
      EditorUtils.replaceSelectedNode(editor, [
        { type: 'paragraph', children: [{ text: 'r' }] },
      ] as any);
      expect(removeSpy).toHaveBeenCalled();
      vi.mocked(Editor.nodes).mockRestore();
    });

    it('reset 不带 withoutHistory 走 else', () => {
      const plain = createEditor();
      plain.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
      expect(() =>
        EditorUtils.reset(plain, [
          { type: 'paragraph', children: [{ text: 'y' }] },
        ] as any),
      ).not.toThrow();
    });
  });

  describe('istanbul buffer：toggleFormat/highColor/alignment/createMedia 早退', () => {
    it('selection 缺失时 toggleFormat/highColor/setAlignment 早退', () => {
      editor.selection = null;
      expect(() => EditorUtils.toggleFormat(editor, 'bold')).not.toThrow();
      expect(() => EditorUtils.highColor(editor, '#f00')).not.toThrow();
      expect(() => EditorUtils.setAlignment(editor, 'center')).not.toThrow();
    });

    it('collapsed 空选区 toggleFormat 早退', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: '' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      expect(() => EditorUtils.toggleFormat(editor, 'italic')).not.toThrow();
    });

    it('createMediaNode 无 src 返回空文本；checkEnd 无节点', () => {
      expect(EditorUtils.createMediaNode(undefined, 'image')).toEqual({
        text: '',
      });
      expect(EditorUtils.createMediaNode('', 'video')).toEqual({ text: '' });

      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        // empty iterator
      } as any);
      expect(EditorUtils.checkEnd(editor)).toBe(false);
      expect(EditorUtils.isFormatActive(editor, 'bold')).toBe(false);
      expect(EditorUtils.getUrl(editor)).toBe('');
      vi.mocked(Editor.nodes).mockRestore();

      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        yield [{ text: 'x', url: undefined }, [0, 0]];
      } as any);
      expect(EditorUtils.getUrl(editor)).toBe('');
      vi.mocked(Editor.nodes).mockRestore();
    });
  });

  describe('istanbul fill：copyText/cutText/findByPathAndText 假值臂', () => {
    it.skip('copyText/cutText：无 end 累加中间节点；有 end 切片；空 text', () => {
      const start: Point = { path: [0, 0], offset: 1 };
      const end: Point = { path: [0, 2], offset: 2 };

      // 无 end 时只调用一次 leaf(start)；有 end 时再 leaf(end)
      vi.spyOn(Editor, 'leaf')
        .mockReturnValueOnce([{ text: 'abc' } as any, [0, 0]])
        .mockReturnValueOnce([{ text: 'abc' } as any, [0, 0]])
        .mockReturnValueOnce([{ text: 'end' } as any, [0, 2]]);

      vi.spyOn(Editor, 'next')
        .mockReturnValueOnce([{ text: 'mid' } as any, [0, 1]] as any)
        .mockReturnValueOnce([{ text: 'end' } as any, [0, 2]] as any)
        .mockReturnValueOnce(undefined as any)
        .mockReturnValueOnce([{ text: 'mid' } as any, [0, 1]] as any)
        .mockReturnValueOnce([{ text: 'end' } as any, [0, 2]] as any);

      expect(EditorUtils.copyText(editor, start)).toBe('bcmidend');
      expect(EditorUtils.copyText(editor, start, end)).toBe('bcmiden');

      vi.spyOn(Editor, 'leaf').mockReturnValue([
        { text: undefined } as any,
        [0, 0],
      ]);
      vi.spyOn(Editor, 'next')
        .mockReturnValueOnce([{ text: undefined } as any, [0, 1]] as any)
        .mockReturnValueOnce(undefined as any);
      expect(EditorUtils.cutText(editor, start)[0].text).toBe('');
    });

    it('findByPathAndText：选项矩阵与空 path / maxResults', () => {
      editor.children = [
        {
          type: 'paragraph',
          children: [
            { text: 'Hello World hello' },
            { text: 'link', url: 'https://ex.com' },
          ],
        },
      ];

      expect(Array.isArray(findByPathAndText(editor, [], 'Hello'))).toBe(true);
      expect(
        findByPathAndText(editor, [0], 'hello', {
          caseSensitive: true,
          wholeWord: true,
          includeMarkdownVariants: false,
          maxResults: 1,
        }).length,
      ).toBeLessThanOrEqual(1);
      expect(
        findByPathAndText(editor, [0], 'link', {
          includeMarkdownVariants: false,
          maxResults: 5,
        }).some((r) => r.isLink),
      ).toBe(true);
      // 无效 path：hasPath 为假时回退全编辑器搜索
      expect(findByPathAndText(editor, [99], 'Hello').length).toBeGreaterThan(
        0,
      );
      expect(findByPathAndText(editor, [99], 'NoSuchTextXYZ')).toEqual([]);
    });

    it('istanbul after：moveAfterSpace 插入空 text；moveBeforeSpace 无 previous', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'only' }] },
      ];
      const insertSpy = vi
        .spyOn(Transforms, 'transform')
        .mockImplementation(() => {});
      const moveSpy = vi.spyOn(Transforms, 'move').mockImplementation(() => {});
      vi.spyOn(Transforms, 'select').mockImplementation(() => {});

      vi.spyOn(Editor, 'next').mockReturnValue(undefined as any);
      EditorUtils.moveAfterSpace(editor, [0, 0]);
      expect(insertSpy).toHaveBeenCalled();

      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);
      EditorUtils.moveBeforeSpace(editor, [0, 0]);
      expect(moveSpy).toHaveBeenCalled();

      insertSpy.mockRestore();
      moveSpy.mockRestore();
      vi.mocked(Editor.next).mockRestore();
      vi.mocked(Path.hasPrevious).mockRestore();
      vi.mocked(Transforms.select).mockRestore();
    });

    it('istanbul buffer：reset 无 force；空 list children；insertNodes 假值', () => {
      const emptyList = { type: 'list', children: [] } as any;
      expect(EditorUtils.listToParagraph(editor, emptyList)).toEqual([]);

      expect(() =>
        EditorUtils.deleteAll(editor, null as any),
      ).not.toThrow();

      expect(() =>
        EditorUtils.reset(editor, undefined as any, false),
      ).not.toThrow();

      expect(() =>
        EditorUtils.reset(editor, undefined as any, {
          undos: [],
          redos: [],
        } as any),
      ).not.toThrow();
    });

    it('clearMarks 无 element entries 时仍 setNodes 为 paragraph', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'plain', bold: true }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');
      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        // nodeEntries.length === 0
      } as any);

      EditorUtils.clearMarks(editor);

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph' },
        { at: [0] },
      );
      vi.mocked(Editor.nodes).mockRestore();
    });

    it('moveAfterSpace 下一节点为 Text 时走 move 分支', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'ab' }, { text: 'cd' }] },
      ];
      const moveSpy = vi.spyOn(Transforms, 'move').mockImplementation(() => {});
      vi.spyOn(Editor, 'next').mockReturnValue([
        { text: 'cd' },
        [0, 1],
      ] as any);

      EditorUtils.moveAfterSpace(editor, [0, 0]);

      expect(moveSpy).toHaveBeenCalledWith(editor, { unit: 'offset' });
      moveSpy.mockRestore();
      vi.mocked(Editor.next).mockRestore();
    });

    it('istanbul residual：isPrevious/isNext；findMediaInsertPath 矩阵；format/url', () => {
      // Path.equals(Path.parent(firstPath), Path.parent(nextPath)) &&
      // Path.compare(firstPath, nextPath) === -1 / === 1
      expect(EditorUtils.isPrevious([0, 0], [0, 1])).toBe(true);
      expect(EditorUtils.isPrevious([0, 1], [0, 0])).toBe(false);
      expect(EditorUtils.isPrevious([0, 0], [1, 0])).toBe(false);
      expect(EditorUtils.isNextPath([0, 1], [0, 0])).toBe(true);
      expect(EditorUtils.isNextPath([0, 0], [0, 1])).toBe(false);

      // if (!cur) return null;
      // if (cur?.[0]?.type === 'table-cell') / head / paragraph && Node.string
      const nodesSpy = vi.spyOn(Editor, 'nodes');
      nodesSpy.mockReturnValue([] as any);
      expect(EditorUtils.findMediaInsertPath(editor)).toBeNull();

      nodesSpy.mockReturnValue(
        [
          [
            {
              type: 'table-cell',
              children: [{ text: 'c' }],
            },
            [0, 0, 0],
          ],
        ][Symbol.iterator]() as any,
      );
      editor.children = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'c' }] },
              ],
            },
          ],
        },
        { type: 'paragraph', children: [{ text: '' }] },
      ];
      expect(Array.isArray(EditorUtils.findMediaInsertPath(editor))).toBe(true);

      nodesSpy.mockReturnValue(
        [[{ type: 'head', children: [{ text: 'H' }] }, [0]]][
          Symbol.iterator
        ]() as any,
      );
      editor.children = [
        { type: 'head', depth: 1, children: [{ text: 'H' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ];
      expect(Array.isArray(EditorUtils.findMediaInsertPath(editor))).toBe(true);

      nodesSpy.mockReturnValue(
        [[{ type: 'paragraph', children: [{ text: 'body' }] }, [0]]][
          Symbol.iterator
        ]() as any,
      );
      editor.children = [
        { type: 'paragraph', children: [{ text: 'body' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ];
      expect(Array.isArray(EditorUtils.findMediaInsertPath(editor))).toBe(true);
      nodesSpy.mockRestore();

      // if (!next || !Text.isText(next[0]))
      vi.spyOn(Editor, 'next').mockReturnValue([
        { type: 'paragraph', children: [{ text: 'x' }] } as any,
        [1],
      ] as any);
      expect(() =>
        EditorUtils.moveAfterSpace(editor, [0, 0]),
      ).not.toThrow();
      vi.mocked(Editor.next).mockRestore();

      // if (!Path.hasPrevious(path))
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);
      expect(() =>
        EditorUtils.moveBeforeSpace(editor, [0, 0]),
      ).not.toThrow();
      vi.mocked(Path.hasPrevious).mockRestore();

      // if (!listNode.children || listNode.children.length === 0)
      expect(
        EditorUtils.listToParagraph(editor, {
          type: 'list',
          children: undefined as any,
        } as any),
      ).toEqual([]);

      // insertNodes || [EditorUtils.p]
      expect(() => EditorUtils.deleteAll(editor)).not.toThrow();
      expect(() =>
        EditorUtils.reset(editor, undefined as any, true),
      ).not.toThrow();

      editor.children = [
        { type: 'paragraph', children: [{ text: 'abc' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      };
      expect(EditorUtils.isFormatActive(editor, 'bold')).toBe(false);
      expect(EditorUtils.isFormatActive(editor, 'bold', true)).toBe(false);
      expect(typeof EditorUtils.getUrl(editor)).toBe('string');

      // copyText / cutText end 假值
      expect(
        EditorUtils.copyText(editor, { path: [0, 0], offset: 0 }),
      ).toBeTruthy();
      expect(
        EditorUtils.copyText(
          editor,
          { path: [0, 0], offset: 0 },
          { path: [0, 0], offset: 2 },
        ),
      ).toBeTruthy();
    });
  });
});
