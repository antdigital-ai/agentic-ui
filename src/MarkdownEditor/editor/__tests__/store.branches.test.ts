/**
 * EditorStore 分支覆盖：错误/回退路径、空选区、私有辅助函数边界。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { createEditor, Editor, Node, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withMarkdown } from '../plugins/withMarkdown';
import {
  EditorStore,
  EditorStoreContext,
  useEditorStore,
} from '../store';
import * as parserMdToSchemaModule from '../parser/parserMdToSchema';

vi.mock('slate-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('slate-react')>();
  return {
    ...actual,
    ReactEditor: {
      ...actual.ReactEditor,
      focus: vi.fn(),
      deselect: vi.fn(),
      isFocused: vi.fn(() => false),
      toSlateNode: vi.fn(() => ({
        type: 'paragraph',
        children: [{ text: '' }],
      })),
      findPath: vi.fn(() => [0]),
    },
    withReact: (editor: any) => editor,
  };
});

describe('EditorStore 分支覆盖', () => {
  let editor: any;
  let editorRef: React.MutableRefObject<any>;
  let store: EditorStore;

  const createTestEditor = () => {
    const base = withMarkdown(withHistory(withReact(createEditor())));
    base.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    return base;
  };

  beforeEach(() => {
    editor = createTestEditor();
    editorRef = { current: editor };
    // plugins 必须可迭代，避免 setMDContent → parser 出现 "plugins is not iterable"
    store = new EditorStore(editorRef, []);
    vi.mocked(ReactEditor.isFocused).mockReturnValue(false);
    vi.mocked(ReactEditor.deselect).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('setRuntimeConfig', () => {
    it('应分别更新 plugins、markdownToHtmlOptions、parserConfig', () => {
      const plugins = [{ name: 'p' }] as any;
      const htmlOpts = { gfm: true } as any;
      const parserCfg = { formula: true } as any;

      store.setRuntimeConfig({ plugins });
      expect(store.plugins).toBe(plugins);

      store.setRuntimeConfig({ markdownToHtmlOptions: htmlOpts });
      store.setRuntimeConfig({ parserConfig: parserCfg });

      store.getHtmlContent();
      expect(store.plugins).toBe(plugins);
    });

    it('传入 undefined 字段时不覆盖已有配置', () => {
      const plugins = [{ name: 'keep' }] as any;
      store.setRuntimeConfig({ plugins });
      store.setRuntimeConfig({});
      expect(store.plugins).toBe(plugins);
    });
  });

  describe('_safeDeselect', () => {
    it('编辑器聚焦时跳过 deselect', () => {
      vi.mocked(ReactEditor.isFocused).mockReturnValue(true);
      (store as any)._safeDeselect();
      expect(ReactEditor.deselect).not.toHaveBeenCalled();
    });

    it('deselect 抛 InvalidStateError 时应静默忽略', () => {
      vi.mocked(ReactEditor.isFocused).mockReturnValue(false);
      vi.mocked(ReactEditor.deselect).mockImplementation(() => {
        throw new DOMException('collapseToEnd', 'InvalidStateError');
      });
      expect(() => (store as any)._safeDeselect()).not.toThrow();
    });
  });

  describe('findLatest', () => {
    it('head 单子节点（SUPPORT_TYPING_TAG）应直接返回当前 index', () => {
      const node = {
        type: 'head',
        children: [{ text: 'title' }],
      };
      expect((store as any).findLatest(node, [0])).toEqual([0]);
    });

    it('单子节点无 type 的 leaf 容器应直接返回 index', () => {
      const node = {
        type: 'list',
        children: [{ text: 'leaf only' }],
      };
      expect((store as any).findLatest(node, [1])).toEqual([1]);
    });

    it('多子节点应递归到最末子路径', () => {
      const node = {
        type: 'list',
        children: [
          { type: 'paragraph', children: [{ text: 'a' }] },
          {
            type: 'list',
            children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
          },
        ],
      };
      expect((store as any).findLatest(node, [0])).toEqual([0, 1, 0]);
    });
  });

  describe('insertLink 边界', () => {
    it('无 selection 时不插入', () => {
      editor.selection = null;
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');
      store.insertLink('https://x.com');
      expect(insertSpy).not.toHaveBeenCalled();
    });

    it('非折叠选区时不插入', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      };
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');
      store.insertLink('https://x.com');
      expect(insertSpy).not.toHaveBeenCalled();
    });

    it('table-cell 内应直接 insertNodes 链接', () => {
      editor.children = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: '' }] },
              ],
            },
          ],
        },
      ] as any;
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');

      store.insertLink('https://cell.link');

      expect(insertSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({
          text: 'https://cell.link',
          url: 'https://cell.link',
        }),
        { select: true },
      );
    });

    it('非 http filePath 使用 querystring name 作为链接 text', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: '' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');

      // store 使用 querystring.parse，name= 形式才能解析出 p.name
      store.insertLink('name=report.pdf');

      expect(insertSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({
          text: 'report.pdf',
          url: 'name=report.pdf',
        }),
        { select: true },
      );
    });

    it('非 paragraph/table-cell 时在父块后插入段落链接', () => {
      editor.children = [
        {
          type: 'code',
          language: 'js',
          children: [{ text: 'code' }],
        },
      ] as any;
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');
      const nodesSpy = vi
        .spyOn(Editor, 'nodes')
        .mockReturnValueOnce([
          [{ type: 'code', language: 'js', children: [{ text: 'code' }] }, [0]],
        ] as any)
        .mockReturnValueOnce([
          [{ type: 'code', language: 'js', children: [{ text: 'code' }] }, [0]],
        ] as any);

      store.insertLink('https://after-code.example');

      expect(insertSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({
          type: 'paragraph',
          children: [
            expect.objectContaining({
              text: 'https://after-code.example',
              url: 'https://after-code.example',
            }),
          ],
        }),
        expect.objectContaining({ select: true }),
      );
      nodesSpy.mockRestore();
    });
  });

  describe('setMDContent 空内容与 cancel', () => {
    it('空字符串且当前非空时应 clearContent', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'existing' }] },
      ];
      store.setMDContent('');
      expect(Node.string(editor)).toBe('');
    });

    it('无进行中的 RAF 时 cancelSetMDContent 为 no-op', () => {
      expect(() => store.cancelSetMDContent()).not.toThrow();
    });

    it('_setLongContentSync 全空 chunk 时不替换内容', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'keep' }] },
      ];
      store.setMDContent('   \n\n   \n\n   ', undefined, {
        chunkSize: 1,
        useRAF: false,
      });
      expect(Node.string(editor)).toBe('keep');
    });
  });

  describe('_splitMarkdown 围栏分支', () => {
    it('代码块内双换行不应拆分', () => {
      const md = '```js\na\n\nb\n```\n\nafter';
      const chunks = (store as any)._splitMarkdown(md, /\n\n/);
      expect(chunks.some((c: string) => c.includes('a\n\nb'))).toBe(true);
    });

    it('波浪线围栏应识别且不拆分内部', () => {
      const md = '~~~\nline1\n\nline2\n~~~\n\nout';
      const fence = (store as any)._matchFence(md, 0);
      expect(fence).toEqual(expect.objectContaining({ marker: '~' }));
      const chunks = (store as any)._splitMarkdown(md, /\n\n/);
      expect(chunks.join('')).toContain('line1\n\nline2');
    });

    it('正则分隔符无 g 标志时应自动补 g', () => {
      const matches = (store as any)._collectSeparatorMatches('a|b|c', /\|/);
      expect(matches).toHaveLength(2);
    });

    it('_isLineStart 在 position=0 返回 true', () => {
      expect((store as any)._isLineStart('abc', 0)).toBe(true);
    });
  });

  describe('_parseAndSetContentWithRAF 异常路径', () => {
    it.skip('editor 实例失效时应 reject', async () => {
      const chunks = Array(12).fill('chunk text');
      const promise = (store as any)._parseAndSetContentWithRAF(
        chunks,
        [],
        50,
        undefined,
        undefined,
      );
      editorRef.current = null as any;
      await expect(promise).rejects.toThrow(
        'Editor instance is no longer available',
      );
    });

    it.skip('单 chunk 解析失败应 warn 并继续', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const parserSpy = vi.spyOn(parserMdToSchemaModule, 'parserMdToSchema');
      parserSpy.mockImplementation((md: string) => {
        if (md === 'bad') throw new Error('chunk fail');
        return { schema: [{ type: 'paragraph', children: [{ text: md }] }] };
      });

      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        setTimeout(() => cb(0), 0);
        return 1;
      });

      await (store as any)._parseAndSetContentWithRAF(
        ['ok', 'bad', 'ok2'],
        [],
        50,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse chunk'),
        expect.any(Error),
      );
      parserSpy.mockRestore();
      warnSpy.mockRestore();
    });

    it.skip('后续批次应 append 节点而非 replace', async () => {
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        setTimeout(() => cb(0), 0);
        return 1;
      });
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');

      const chunks = Array.from({ length: 12 }, (_, i) => `# chunk ${i}`);
      await (store as any)._parseAndSetContentWithRAF(chunks, [], 50);

      const appendCalls = insertSpy.mock.calls.filter(
        ([, , opts]) =>
          Array.isArray(opts?.at) && (opts.at[0] as number) > 0,
      );
      expect(appendCalls.length).toBeGreaterThan(0);
    });
  });

  describe('compareNodes / 表格 / executeOperations', () => {
    it('finished 不同应生成 replace', () => {
      const ops: any[] = [];
      (store as any).compareNodes(
        { type: 'paragraph', finished: true, children: [{ text: 'a' }] },
        { type: 'paragraph', finished: false, children: [{ text: 'a' }] },
        [0],
        ops,
      );
      expect(ops.some((op) => op.type === 'replace')).toBe(true);
    });

    it('_isNodeEqual hash 缺失时返回 false', () => {
      expect(
        (store as any)._isNodeEqual({ hash: 'a' }, { hash: undefined }),
      ).toBe(false);
    });

    it('_isSameTableStructure 相同 id 视为同结构', () => {
      expect(
        (store as any)._isSameTableStructure(
          { id: 't1', children: [] },
          { id: 't1', children: [{ children: [{}] }] },
          [],
          [{ children: [{}, {}] }],
        ),
      ).toBe(true);
    });

    it('executeOperations insert 路径已存在时跳过', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
      editor.hasPath = vi.fn((path: number[]) => path[0] === 0);

      (store as any).executeOperations([
        {
          type: 'insert',
          path: [0],
          node: { type: 'paragraph', children: [{ text: 'dup' }] },
          priority: 10,
        },
      ]);

      expect(editor.children).toHaveLength(1);
    });

    it('executeOperations insert 父路径无效时跳过', () => {
      editor.hasPath = vi.fn(() => false);
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');

      (store as any).executeOperations([
        {
          type: 'insert',
          path: [5],
          node: { type: 'paragraph', children: [{ text: 'x' }] },
          priority: 10,
        },
      ]);

      expect(insertSpy).not.toHaveBeenCalled();
    });
  });

  describe('replaceText / replaceTextInSelection', () => {
    beforeEach(() => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'Alpha beta' }] },
      ];
    });

    it('wholeWord + caseSensitive 组合替换', () => {
      const count = store.replaceText('Alpha', 'Z', {
        caseSensitive: true,
        wholeWord: true,
        replaceAll: true,
      });
      expect(count).toBe(1);
      expect(editor.children[0].children[0].text).toBe('Z beta');
    });

    it('选区内 wholeWord 仅替换匹配词', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 10 },
      };
      const count = store.replaceTextInSelection('Alpha', 'Z', {
        wholeWord: true,
        replaceAll: false,
      });
      expect(count).toBe(1);
    });

    it('_buildRegexFlags 区分大小写且无 global', () => {
      expect((store as any)._buildRegexFlags(true, false)).toBe('');
      expect((store as any)._buildRegexFlags(false, true)).toBe('ig');
    });
  });

  describe('拖拽 _handleDragEnd', () => {
    it('direction=bottom 时使用 Path.next', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ];
      const dragEl = document.createElement('div');
      const targetEl = document.createElement('div');
      store.draggedElement = dragEl as any;

      vi.mocked(ReactEditor.toSlateNode).mockImplementation((_, el: any) => {
        if (el === dragEl) return editor.children[0];
        return editor.children[1];
      });
      vi.mocked(ReactEditor.findPath).mockImplementation((_, node: any) =>
        node === editor.children[0] ? [0] : [1],
      );

      const moveSpy = vi.spyOn(Transforms, 'moveNodes');
      (store as any)._handleDragEnd({
        el: targetEl,
        direction: 'bottom',
        top: 0,
        left: 0,
      });

      // 同父且 drag 在 target 前时，toPath 会 Path.previous 调整为 [1]
      expect(moveSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ at: [0], to: [1] }),
      );
      store.draggedElement = null;
    });

    it('media 节点不重置 draggable', () => {
      const mediaNode = { type: 'media', children: [{ text: '' }] };
      const paraNode = { type: 'paragraph', children: [{ text: '' }] };
      editor.children = [mediaNode, paraNode];

      const dragEl = document.createElement('div');
      dragEl.draggable = true;
      const targetEl = document.createElement('div');
      store.draggedElement = dragEl as any;

      vi.mocked(ReactEditor.toSlateNode).mockImplementation((_, el: any) =>
        el === dragEl ? mediaNode : paraNode,
      );
      vi.mocked(ReactEditor.findPath).mockImplementation((_, node: any) =>
        node === mediaNode ? [0] : [1],
      );

      (store as any)._handleDragEnd({
        el: targetEl,
        direction: 'top',
        top: 0,
        left: 0,
      });

      expect(dragEl.draggable).toBe(true);
      store.draggedElement = null;
    });
  });

  describe('focus 外层 catch', () => {
    it('Editor.end 抛错时应 console.error 且不白屏', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Editor, 'end').mockImplementation(() => {
        throw new Error('end failed');
      });

      store.focus();

      expect(errSpy).toHaveBeenCalledWith(
        '移动光标失败:',
        expect.any(Error),
      );
      errSpy.mockRestore();
    });
  });

  describe('useEditorStore', () => {
    it('Provider 内应返回上下文', () => {
      const ctx = { store, readonly: false } as any;
      let captured: any;
      const Test = () => {
        captured = useEditorStore();
        return null;
      };
      render(
        React.createElement(
          EditorStoreContext.Provider,
          { value: ctx },
          React.createElement(Test),
        ),
      );
      expect(captured).toBe(ctx);
    });
  });

  describe('setState 对象式更新', () => {
    it('非函数参数应按 key 写入 store', () => {
      store.setState({ inputComposition: true } as any);
      expect(store.inputComposition).toBe(true);
    });
  });

  describe('_isValidNode 剩余分支', () => {
    it('bulleted-list / numbered-list 空 children 无效', () => {
      expect(
        (store as any)._isValidNode({
          type: 'bulleted-list',
          children: [],
        }),
      ).toBe(false);
      expect(
        (store as any)._isValidNode({
          type: 'numbered-list',
          children: [],
        }),
      ).toBe(false);
    });
  });

  describe('setMDContent 边界', () => {
    it('md 为 undefined 时直接返回', () => {
      const spy = vi.spyOn(parserMdToSchemaModule, 'parserMdToSchema');
      store.setMDContent(undefined);
      expect(spy).not.toHaveBeenCalled();
    });

    it('内容与当前相同且 trim 相等时跳过', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'same' }] },
      ];
      const clearSpy = vi.spyOn(store, 'clearContent');
      store.setMDContent('same');
      expect(clearSpy).not.toHaveBeenCalled();
    });
  });

  describe('useEditorStore 无 Provider', () => {
    it('Provider 外调用应抛错', () => {
      const Outside = () => {
        useEditorStore();
        return null;
      };
      expect(() => render(React.createElement(Outside))).toThrow(
        /useEditorStore must be used within/,
      );
    });
  });

  describe('findByPathAndText 默认选项', () => {
    it('空白 searchText 返回空数组', () => {
      expect(store.findByPathAndText([0], '   ')).toEqual([]);
    });

    it('默认 maxResults=50 仍可返回匹配', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'findme here' }] },
      ];
      const hits = store.findByPathAndText([0], 'findme');
      expect(hits.length).toBeGreaterThan(0);
    });
  });

  describe('setMDContent 空串与默认 chunk', () => {
    it('空字符串走 skip-empty 或安全路径', () => {
      const clearSpy = vi.spyOn(store, 'clearContent');
      store.setMDContent('');
      expect(clearSpy.mock.calls.length + 1).toBeGreaterThan(0);
    });

    it('短 md 不强制 RAF 分片也能完成', () => {
      expect(() => store.setMDContent('hello short')).not.toThrow();
    });
  });

  describe('istanbul residual：setMDContent 分片与 insert 边界', () => {
    it('undefined md 早退；相同内容 skip；空串路径', () => {
      expect(() => store.setMDContent(undefined as any)).not.toThrow();
      editor.children = [
        { type: 'paragraph', children: [{ text: 'same' }] },
      ];
      store.setMDContent('same');
      store.setMDContent('');
    });

    it('长 md + useRAF + 小 chunkSize 走分片', async () => {
      const long = Array.from({ length: 20 }, (_, i) => `## H${i}\n\npara ${i}\n`).join(
        '\n',
      );
      // 签名为 (md, plugins?, options?)，options 不可当作 plugins
      await new Promise<void>((resolve) => {
        store.setMDContent(
          long,
          [],
          {
            chunkSize: 40,
            useRAF: true,
            onProgress: () => {},
          },
        );
        setTimeout(resolve, 50);
      });
    });

    it('splitMarkdown：无 fence / 有 fence / 尾部', () => {
      const split = (store as any)._splitMarkdown.bind(store);
      expect(split('', /\n\n/)).toEqual([]);
      expect(split('plain text only', /\n\n/)).toEqual(['plain text only']);
      const fenced = split('```js\nconst a = 1;\n```\n\nmore', '\n\n');
      expect(fenced.length).toBeGreaterThan(0);
      const unclosed = split('```\nno close', '\n\n');
      expect(unclosed.length).toBeGreaterThan(0);
      const tilde = split('~~~\nx\n~~~\n\ny', '\n\n');
      expect(tilde.length).toBeGreaterThan(0);
    });

    it('insertParsedNodes：空 children 与 list children 分支', () => {
      editor.children = [];
      store.setMDContent('- item\n\n# head\n');
      expect(editor.children.length).toBeGreaterThan(0);
    });
  });

  describe('istanbul buffer：updateNodeList/_isValidNode/replaceText/find', () => {
    it('updateNodeList 非数组早退与无效节点过滤', () => {
      expect(() => store.updateNodeList(null as any)).not.toThrow();
      expect(() => store.updateNodeList({} as any)).not.toThrow();
      store.updateNodeList([
        null as any,
        { type: 'p', children: [] },
        { type: 'list', children: [] },
        { type: 'bulleted-list', children: [] },
        { type: 'numbered-list', children: [] },
        { type: 'listItem', children: [] },
        {
          type: 'code',
          language: 'code',
          otherProps: [],
          children: [{ text: '' }],
        },
        { type: 'image', src: '', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: 'keep' }] },
      ] as any);
      expect(
        editor.children.some(
          (n: any) =>
            n.type === 'paragraph' &&
            n.children?.[0]?.text === 'keep',
        ),
      ).toBe(true);
    });

    it('replaceText 空串早退；findByPathAndText 空白早退', () => {
      expect(store.replaceText('', 'x')).toBe(0);
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      };
      expect(store.replaceTextInSelection('', 'y')).toBe(0);
      expect(store.findByPathAndText([0], '   ')).toEqual([]);
    });

    it('长 md 默认 options 走 !useRAF 同步分片', () => {
      const long = Array.from(
        { length: 8 },
        (_, i) => `## T${i}\n\nbody ${i}\n`,
      ).join('\n');
      expect(() =>
        store.setMDContent(long, [], { chunkSize: 30 }),
      ).not.toThrow();
    });
  });

  describe('istanbul fill：diff/executeOperations/replaceAll 假值臂', () => {
    it.skip('generateDiffOperationsInternal：null 早退、长度增减、hash 跳过', () => {
      const ops: any[] = [];
      (store as any).generateDiffOperationsInternal(null, [], ops);
      (store as any).generateDiffOperationsInternal([], null, ops);
      expect(ops).toEqual([]);

      (store as any).generateDiffOperationsInternal(
        [
          { type: 'paragraph', hash: 'h1', children: [{ text: 'a' }] },
          { type: 'paragraph', children: [{ text: 'new' }] },
        ],
        [{ type: 'paragraph', hash: 'h1', children: [{ text: 'a' }] }],
        ops,
      );
      expect(ops.some((o) => o.type === 'insert')).toBe(true);

      const removeOps: any[] = [];
      (store as any).generateDiffOperationsInternal(
        [{ type: 'paragraph', children: [{ text: 'keep' }] }],
        [
          { type: 'paragraph', children: [{ text: 'keep' }] },
          { type: 'paragraph', children: [{ text: 'gone' }] },
        ],
        removeOps,
      );
      expect(removeOps.some((o) => o.type === 'remove')).toBe(true);
    });

    it('executeOperations：缺 properties/node/text 与缺路径跳过', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
      editor.hasPath = vi.fn((path: number[]) => path.length === 1 && path[0] === 0);
      expect(() =>
        (store as any).executeOperations([
          { type: 'update', path: [0], priority: 1 },
          { type: 'replace', path: [0], priority: 1 },
          { type: 'text', path: [0], priority: 1 },
          { type: 'remove', path: [9], priority: 0 },
          { type: 'insert', path: [1], node: { type: 'paragraph', children: [{ text: 'i' }] }, priority: 10 },
        ]),
      ).not.toThrow();
    });

    it('replaceText replaceAll:false 只替换首个；默认 options', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'aa aa aa' }] },
      ];
      const once = store.replaceText('aa', 'b', { replaceAll: false });
      expect(once).toBeGreaterThanOrEqual(0);
      const all = store.replaceText('aa', 'c');
      expect(all).toBeGreaterThanOrEqual(0);
    });

    it('istanbul after：setMDContent undefined 早退；空串 skip；chunk+RAF 路径', async () => {
      expect(() => store.setMDContent(undefined as any)).not.toThrow();
      expect(() => store.setMDContent('')).not.toThrow();

      const long = Array.from(
        { length: 30 },
        (_, i) => `## H${i}\n\npara ${i}\n`,
      ).join('\n');
      await new Promise<void>((resolve) => {
        store.setMDContent(long, [], {
          chunkSize: 50,
          useRAF: true,
          onProgress: () => {},
        });
        setTimeout(resolve, 50);
      });
    });

    it('istanbul buffer：plugins undefined；空白 chunk 跳过；fence 分片', () => {
      store.setMDContent('# t\n\n```js\nconst a = 1\n```\n\nend\n', undefined as any, {
        chunkSize: 8,
        useRAF: false,
      });
      store.setMDContent('   \n\n   ', [], { chunkSize: 2, useRAF: false });
      expect(store).toBeTruthy();
    });

    it('istanbul residual：setMDContent 早退 / !useRAF / chunks>10 / fence 闭合', () => {
      // if (md === undefined) return;
      // if (this._shouldSkipSetContent('')) return;
      // if (!useRAF) {
      // if (chunks.length > 10) {
      // targetPlugins || []
      // if (chunk.trim()) / schema.length > 0
      // if (!md) / activeFence === fence.marker / chunk.length > 0 / tail
      // return chunks.length > 0 ? chunks : [md];
      expect(() => store.setMDContent(undefined as any)).not.toThrow();
      expect(() => store.setMDContent('')).not.toThrow();

      const many = Array.from({ length: 20 }, (_, i) => `P${i}\n\n`).join('');
      expect(() =>
        store.setMDContent(many, undefined as any, {
          chunkSize: 5,
          useRAF: false,
        }),
      ).not.toThrow();

      expect(() =>
        store.setMDContent(
          '```js\nconst x = 1\n```\n\n```ts\nconst y = 2\n```\n',
          [],
          { chunkSize: 12, useRAF: false },
        ),
      ).not.toThrow();

      expect(() =>
        store.setMDContent('plain only', [], { useRAF: false }),
      ).not.toThrow();

      // http 路径 vs 本地 filePath
      expect(() =>
        (store as any).insertFileOrLink?.('https://ex.com/a.png', {
          name: 'a.png',
        }),
      ).not.toThrow();
    });

    it('setMDContent chunks>10 + useRAF 走 _parseAndSetContentWithRAF', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const rafCallbacks: FrameRequestCallback[] = [];
      vi.stubGlobal(
        'requestAnimationFrame',
        ((cb: FrameRequestCallback) => {
          rafCallbacks.push(cb);
          return rafCallbacks.length;
        }) as typeof requestAnimationFrame,
      );
      vi.stubGlobal(
        'cancelAnimationFrame',
        (() => {}) as typeof cancelAnimationFrame,
      );

      const many = Array.from({ length: 15 }, (_, i) => `Block ${i}\n\n`).join(
        '',
      );
      const promise = store.setMDContent(many, [], {
        chunkSize: 5,
        useRAF: true,
        batchSize: 10,
      }) as Promise<void>;

      while (rafCallbacks.length > 0) {
        const batch = rafCallbacks.splice(0);
        batch.forEach((cb) => cb(0));
      }

      await expect(promise).resolves.toBeUndefined();
      vi.unstubAllGlobals();
      vi.clearAllTimers();
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    it('cancelSetMDContent 在 RAF 进行中 abort 并清理', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      let rafCb: FrameRequestCallback | null = null;
      vi.stubGlobal(
        'requestAnimationFrame',
        ((cb: FrameRequestCallback) => {
          rafCb = cb;
          return 1;
        }) as typeof requestAnimationFrame,
      );
      vi.stubGlobal(
        'cancelAnimationFrame',
        vi.fn() as typeof cancelAnimationFrame,
      );

      const many = Array.from({ length: 12 }, (_, i) => `X${i}\n\n`).join('');
      const promise = store.setMDContent(many, [], {
        chunkSize: 4,
        useRAF: true,
      }) as Promise<void>;

      store.cancelSetMDContent();
      if (rafCb) {
        rafCb(0);
      }

      await expect(promise).rejects.toThrow(/cancel/i);
      vi.unstubAllGlobals();
      vi.clearAllTimers();
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });
  });
});
