import { createEditor, Editor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---- Mocks ---- */

const mocks = vi.hoisted(() => ({
  insertParsedHtmlNodes: vi.fn().mockResolvedValue(true),
  parseMarkdownToNodesAndInsert: vi.fn().mockResolvedValue(undefined),
  isMarkdown: vi.fn(() => false),
  isHtml: vi.fn(() => false),
  getMediaType: vi.fn(() => 'other'),
  toUnixPath: vi.fn((p: string) => p.replace(/\\/g, '/')),
}));

vi.mock('../src/MarkdownEditor/editor/plugins/insertParsedHtmlNodes', () => ({
  insertParsedHtmlNodes: mocks.insertParsedHtmlNodes,
}));

vi.mock(
  '../src/MarkdownEditor/editor/plugins/parseMarkdownToNodesAndInsert',
  () => ({
    parseMarkdownToNodesAndInsert: mocks.parseMarkdownToNodesAndInsert,
  }),
);

vi.mock('antd', () => ({
  message: {
    loading: vi.fn(() => vi.fn()),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    replaceSelectedNode: vi.fn(),
    findMediaInsertPath: vi.fn(() => [0]),
    createMediaNode: vi.fn((url: string) => ({
      type: 'image',
      url,
      children: [{ text: '' }],
    })),
    findNext: vi.fn(() => [1]),
    wrapperCardNode: vi.fn((n) => n),
  },
}));

vi.mock('../src/MarkdownEditor/editor/utils', () => ({
  isMarkdown: (...args: any[]) => mocks.isMarkdown(...args),
}));

vi.mock('../src/MarkdownEditor/editor/utils/htmlToMarkdown', () => ({
  isHtml: (...args: any[]) => mocks.isHtml(...args),
}));

vi.mock('../src/MarkdownEditor/editor/utils/dom', () => ({
  getMediaType: (...args: any[]) => mocks.getMediaType(...args),
}));

vi.mock('../src/MarkdownEditor/editor/utils/path', () => ({
  toUnixPath: (...args: any[]) => mocks.toUnixPath(...args),
}));

import {
  handleFilesPaste,
  handleHtmlPaste,
  handleHttpLinkPaste,
  handlePlainTextPaste,
  handleSlateMarkdownFragment,
  handleSpecialTextPaste,
  shouldInsertTextDirectly,
} from '../src/MarkdownEditor/editor/plugins/handlePaste';
import { EditorUtils } from '../src/MarkdownEditor/editor/utils/editorUtils';

describe('handlePaste 分支覆盖', () => {
  let editor: Editor;
  let mockClipboard: { getData: ReturnType<typeof vi.fn>; files: File[] };

  beforeEach(() => {
    vi.clearAllMocks();
    editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'init' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    mockClipboard = { getData: vi.fn(), files: [] };
  });

  /* ====== handleSlateMarkdownFragment ====== */

  describe('handleSlateMarkdownFragment 分支', () => {
    it('单段落空文本时返回 true', () => {
      const fragment = [{ type: 'paragraph', children: [{ text: '' }] }];
      mockClipboard.getData.mockReturnValue(JSON.stringify(fragment));

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      );
      expect(result).toBe(true);
    });

    it('空 fragment 数组时返回 true', () => {
      mockClipboard.getData.mockReturnValue(JSON.stringify([]));

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      );
      expect(result).toBe(true);
    });

    it('JSON 解析失败时进入 catch 返回 false', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockClipboard.getData.mockReturnValue('{invalid json');

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        null,
      );
      expect(result).toBe(false);
      expect(logSpy).toHaveBeenCalledWith('error', expect.any(Error));
      logSpy.mockRestore();
    });
  });

  /* ====== handleHtmlPaste ====== */

  describe('handleHtmlPaste 分支', () => {
    it('getData 抛出时进入 catch 返回 false', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockClipboard.getData.mockImplementation(() => {
        throw new Error('clipboard error');
      });

      const result = await handleHtmlPaste(
        editor,
        mockClipboard as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(false);
      expect(logSpy).toHaveBeenCalledWith('error', expect.any(Error));
      logSpy.mockRestore();
    });
  });

  /* ====== handleFilesPaste ====== */

  describe('handleFilesPaste 分支', () => {
    it('上传返回 falsy URL 时跳过插入', async () => {
      const mockFile = new File(['x'], 'a.png', { type: 'image/png' });
      const upload = vi.fn().mockResolvedValue(null); // falsy URL
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const result = await handleFilesPaste(
        editor,
        { ...mockClipboard, files: [mockFile] } as unknown as DataTransfer,
        { image: { upload } },
      );
      expect(result).toBe(true);
      expect(upload).toHaveBeenCalledWith([mockFile]);
    });

    it('外层 try/catch 捕获异常返回 false', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      // files getter 抛出错误来触发外层 catch
      const badClipboard = {
        getData: vi.fn(),
        get files(): any {
          throw new Error('files access error');
        },
      };

      const result = await handleFilesPaste(
        editor,
        badClipboard as unknown as DataTransfer,
        { image: { upload: vi.fn() } },
      );
      expect(result).toBe(false);
      expect(logSpy).toHaveBeenCalledWith('error', expect.any(Error));
      logSpy.mockRestore();
    });
  });

  /* ====== handleSpecialTextPaste ====== */

  describe('handleSpecialTextPaste 分支', () => {
    beforeEach(() => {
      (EditorUtils.findMediaInsertPath as any).mockReturnValue([0]);
    });

    it('media:// URL 中本地路径触发 toUnixPath', () => {
      // url 不以 http 和 blob:http 开头 → 调用 toUnixPath
      vi.spyOn(Editor, 'next').mockReturnValue(undefined);
      const text = 'media://?url=C%3A%5Cimages%5Cphoto.jpg';

      const result = handleSpecialTextPaste(editor, text, {
        path: [0],
        offset: 0,
      });
      expect(result).toBe(true);
      expect(mocks.toUnixPath).toHaveBeenCalled();
    });

    it('media:// 后下一个节点是空段落时删除该节点', () => {
      vi.spyOn(Editor, 'next').mockReturnValue([
        { type: 'paragraph', children: [{ text: '' }] },
        [1],
      ] as any);
      const deleteSpy = vi
        .spyOn(Transforms, 'delete')
        .mockImplementation(() => {});

      const text = 'media://?url=https://img.com/a.jpg';
      const sel = { path: [0], offset: 0 };
      const result = handleSpecialTextPaste(editor, text, sel);

      expect(result).toBe(true);
      expect(deleteSpy).toHaveBeenCalledWith(editor, { at: sel });
      deleteSpy.mockRestore();
    });

    it('attach:// 后下一个节点是空段落时删除该节点', () => {
      vi.spyOn(Editor, 'next').mockReturnValue([
        { type: 'paragraph', children: [{ text: '' }] },
        [1],
      ] as any);
      const deleteSpy = vi
        .spyOn(Transforms, 'delete')
        .mockImplementation(() => {});

      const text =
        'attach://?url=https://files.com/doc.pdf&name=doc.pdf&size=100';
      const sel = { path: [0], offset: 0 };
      const result = handleSpecialTextPaste(editor, text, sel);

      expect(result).toBe(true);
      expect(deleteSpy).toHaveBeenCalledWith(editor, { at: sel });
      deleteSpy.mockRestore();
    });
  });

  /* ====== handleHttpLinkPaste ====== */

  describe('handleHttpLinkPaste 分支', () => {
    it('空 URL 时 isValidMediaUrl 返回 false', () => {
      mocks.getMediaType.mockReturnValue('image');
      const store = { insertLink: vi.fn() };

      // URL 看起来像 image 但 isValidMediaUrl('http://example.com', 'image') 返回 false
      // 因为没有 image 扩展名也没有 media path
      const result = handleHttpLinkPaste(
        editor,
        'http://example.com',
        { path: [0], offset: 0 },
        store,
      );
      expect(result).toBe(true);
      // 验证走了 insertLink 分支而不是 media 插入
      expect(store.insertLink).toHaveBeenCalledWith('http://example.com');
    });

    it('blob: URL 时 isValidMediaUrl 返回 true', () => {
      mocks.getMediaType.mockReturnValue('image');
      const store = { insertLink: vi.fn() };

      const result = handleHttpLinkPaste(
        editor,
        'http://blob:http://example.com/image',
        { path: [0], offset: 0 },
        store,
      );
      // "blob:" 不在 url 开头，不触发 blob 分支
      // 但 /image 路径包含 mediaPaths → isValidMediaUrl 返回 true
      expect(result).toBe(true);
    });

    it('findMediaInsertPath 返回 null 时返回 false', () => {
      mocks.getMediaType.mockReturnValue('image');
      (EditorUtils.findMediaInsertPath as any).mockReturnValue(null);
      const store = { insertLink: vi.fn() };

      const result = handleHttpLinkPaste(
        editor,
        'http://example.com/photo.jpg',
        { path: [0], offset: 0 },
        store,
      );
      expect(result).toBe(false);
    });

    it('非 http 开头的文本返回 false', () => {
      const store = { insertLink: vi.fn() };
      const result = handleHttpLinkPaste(
        editor,
        'ftp://example.com',
        { path: [0], offset: 0 },
        store,
      );
      expect(result).toBe(false);
    });
  });

  /* ====== handlePlainTextPaste ====== */

  describe('handlePlainTextPaste 分支', () => {
    it('文本是 HTML 时调用 insertParsedHtmlNodes 并成功返回', async () => {
      mocks.isMarkdown.mockReturnValue(false);
      mocks.isHtml.mockReturnValue(true);
      mocks.insertParsedHtmlNodes.mockResolvedValue(true);

      const result = await handlePlainTextPaste(
        editor,
        '<p>hello</p>',
        { path: [0, 0], offset: 0 },
        [],
      );
      expect(result).toBe(true);
      expect(mocks.insertParsedHtmlNodes).toHaveBeenCalled();
    });

    it('文本是 HTML 但 insertParsedHtmlNodes 失败时继续插入文本', async () => {
      mocks.isMarkdown.mockReturnValue(false);
      mocks.isHtml.mockReturnValue(true);
      mocks.insertParsedHtmlNodes.mockResolvedValue(false);

      const result = await handlePlainTextPaste(
        editor,
        '<p>hello</p>',
        { path: [0, 0], offset: 0 },
        [],
      );
      expect(result).toBe(true);
    });
  });

  /* ====== shouldInsertTextDirectly ====== */

  describe('shouldInsertTextDirectly 分支', () => {
    it('selection.focus 不存在时返回 false', () => {
      expect(shouldInsertTextDirectly(editor, null)).toBe(false);
      expect(shouldInsertTextDirectly(editor, {})).toBe(false);
      expect(shouldInsertTextDirectly(editor, { focus: undefined })).toBe(
        false,
      );
    });

    it('Editor.node 返回 falsy 时返回 false', () => {
      vi.spyOn(Editor, 'node').mockReturnValue(undefined as any);
      const result = shouldInsertTextDirectly(editor, {
        focus: { path: [0, 0], offset: 0 },
      });
      expect(result).toBe(false);
    });
  });
});
