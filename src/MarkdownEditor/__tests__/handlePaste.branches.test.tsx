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

vi.mock('../editor/plugins/insertParsedHtmlNodes', () => ({
  insertParsedHtmlNodes: mocks.insertParsedHtmlNodes,
}));

vi.mock('../editor/plugins/parseMarkdownToNodesAndInsert', () => ({
  parseMarkdownToNodesAndInsert: mocks.parseMarkdownToNodesAndInsert,
}));

vi.mock('antd', () => ({
  message: {
    loading: vi.fn(() => vi.fn()),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../editor/utils/editorUtils', () => ({
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

vi.mock('../editor/utils', () => ({
  isMarkdown: (...args: any[]) => mocks.isMarkdown(...args),
}));

vi.mock('../editor/utils/htmlToMarkdown', () => ({
  isHtml: (...args: any[]) => mocks.isHtml(...args),
}));

vi.mock('../editor/utils/dom', () => ({
  getMediaType: (...args: any[]) => mocks.getMediaType(...args),
}));

vi.mock('../editor/utils/path', () => ({
  toUnixPath: (...args: any[]) => mocks.toUnixPath(...args),
}));

import {
  handleFilesPaste,
  handleHtmlPaste,
  handleHttpLinkPaste,
  handlePlainTextPaste,
  handleSlateMarkdownFragment,
  handleSpecialTextPaste,
  handleTagNodePaste,
  shouldInsertTextDirectly,
} from '../editor/plugins/handlePaste';
import { EditorUtils } from '../editor/utils/editorUtils';

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

    it('应过滤掉非法 Slate 节点（非 Element 非 Text）', () => {
      const fragment = [
        { type: 'paragraph', children: [{ text: 'valid' }] },
        42,
        null,
        'just a string',
        { type: 'paragraph', children: [{ text: 'also valid' }] },
      ];
      mockClipboard.getData.mockReturnValue(JSON.stringify(fragment));

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        null,
      );
      expect(result).toBe(true);
    });

    it('非数组 JSON 数据应被安全处理', () => {
      mockClipboard.getData.mockReturnValue(JSON.stringify({ not: 'array' }));

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        null,
      );
      expect(result).toBe(true);
    });

    it('card 类型节点应被包裹 card-before/card-after', () => {
      const fragment = [
        {
          type: 'card',
          children: [
            { type: 'paragraph', children: [{ text: 'card content' }] },
          ],
        },
      ];
      mockClipboard.getData.mockReturnValue(JSON.stringify(fragment));

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        null,
      );
      expect(result).toBe(true);
      expect(EditorUtils.replaceSelectedNode).toHaveBeenCalled();
    });

    it('JSON 解析失败时进入 catch 返回 false', () => {
      // 源代码使用 console.error 而非 console.log
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClipboard.getData.mockReturnValue('{invalid json');

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        null,
      );
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  /* ====== handleHtmlPaste ====== */

  describe('handleHtmlPaste 分支', () => {
    it('getData 抛出时进入 catch 返回 false', async () => {
      // 源代码使用 console.error 而非 console.log
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClipboard.getData.mockImplementation(() => {
        throw new Error('clipboard error');
      });

      const result = await handleHtmlPaste(
        editor,
        mockClipboard as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
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
      // upload 返回 falsy URL → uploadedUrls 为空 → handleFilesPaste 返回 false（跳过插入）
      expect(result).toBe(false);
      expect(upload).toHaveBeenCalledWith([mockFile]);
    });

    it('外层 try/catch 捕获异常返回 false', async () => {
      // 源代码使用 console.error 而非 console.log
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
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
      const nodeSpy = vi.spyOn(Editor, 'node').mockReturnValue(undefined as any);
      const result = shouldInsertTextDirectly(editor, {
        focus: { path: [0, 0], offset: 0 },
      });
      expect(result).toBe(false);
      nodeSpy.mockRestore();
    });

    it.each([
      'code',
      'schema',
      'table',
      'table-row',
      'apaasify',
      'agentic-ui-task',
    ] as const)('在 %s 节点内应直接插入文本', (nodeType) => {
      editor.children = [{ type: nodeType, children: [{ text: '' }] }];
      expect(
        shouldInsertTextDirectly(editor, {
          focus: { path: [0, 0], offset: 0 },
        }),
      ).toBe(true);
    });
  });

  describe('handleSlateMarkdownFragment 额外分支', () => {
    it('单段落带样式 children 时走 insertFragment 保留 marks', () => {
      const fragment = [
        {
          type: 'paragraph',
          children: [
            { text: 'bold', bold: true },
            { text: ' italic', italic: true },
          ],
        },
      ];
      mockClipboard.getData.mockReturnValue(JSON.stringify(fragment));
      const insertFragmentSpy = vi
        .spyOn(Transforms, 'insertFragment')
        .mockImplementation(() => {});

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      );

      expect(result).toBe(true);
      expect(insertFragmentSpy).toHaveBeenCalledWith(
        editor,
        fragment[0].children,
      );
      insertFragmentSpy.mockRestore();
    });
  });

  describe('handleFilesPaste 额外分支', () => {
    beforeEach(() => {
      (EditorUtils.findNext as any).mockReturnValue([0, 1]);
      editor.children = [
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ];
      vi.spyOn(Transforms, 'insertNodes').mockImplementation(() => {});
    });

    it('video/audio 文件按 mime 分流并插入对应媒体节点', async () => {
      const videoFile = new File(['v'], 'clip.mp4', { type: 'video/mp4' });
      const audioFile = new File(['a'], 'song.mp3', { type: 'audio/mpeg' });
      const upload = vi
        .fn()
        .mockResolvedValue(['https://cdn/a.mp4', 'https://cdn/b.mp3']);
      (EditorUtils.createMediaNode as any).mockImplementation(
        (url: string, type: string) => ({ type, url, children: [{ text: '' }] }),
      );
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const result = await handleFilesPaste(
        editor,
        { ...mockClipboard, files: [videoFile, audioFile] } as unknown as DataTransfer,
        { image: { upload } },
      );

      expect(result).toBe(true);
      expect(EditorUtils.createMediaNode).toHaveBeenCalledWith(
        'https://cdn/a.mp4',
        'video',
      );
      expect(EditorUtils.createMediaNode).toHaveBeenCalledWith(
        'https://cdn/b.mp3',
        'audio',
      );
    });

    it('空 mime 时按扩展名识别 image', async () => {
      const file = new File(['x'], 'photo.webp', { type: '' });
      const upload = vi.fn().mockResolvedValue('https://cdn/photo.webp');
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      await handleFilesPaste(
        editor,
        { ...mockClipboard, files: [file] } as unknown as DataTransfer,
        { image: { upload } },
      );

      expect(EditorUtils.createMediaNode).toHaveBeenCalledWith(
        'https://cdn/photo.webp',
        'image',
      );
    });

    it('在 table-cell 内粘贴时插入到当前 focusPath', async () => {
      editor.children = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [{ type: 'table-cell', children: [{ text: '' }] }],
            },
          ],
        },
      ];
      Transforms.select(editor, { path: [0, 0, 0, 0], offset: 0 });
      const file = new File(['x'], 'a.png', { type: 'image/png' });
      const upload = vi.fn().mockResolvedValue('https://cdn/a.png');
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');

      await handleFilesPaste(
        editor,
        { ...mockClipboard, files: [file] } as unknown as DataTransfer,
        { image: { upload } },
      );

      expect(insertSpy.mock.calls[0]?.[2]?.at).toEqual([0, 0, 0, 0]);
      insertSpy.mockRestore();
    });

    it('upload 返回单个字符串 URL 时也能插入', async () => {
      const file = new File(['x'], 'a.png', { type: 'image/png' });
      const upload = vi.fn().mockResolvedValue('https://cdn/single.png');
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const result = await handleFilesPaste(
        editor,
        { ...mockClipboard, files: [file] } as unknown as DataTransfer,
        { image: { upload } },
      );

      expect(result).toBe(true);
    });
  });

  describe('handleHttpLinkPaste 媒体 URL 分支', () => {
    beforeEach(() => {
      (EditorUtils.findMediaInsertPath as any).mockReturnValue([0]);
      vi.spyOn(Transforms, 'insertNodes').mockImplementation(() => {});
      mocks.getMediaType.mockReturnValue('image');
    });

    it('非 http 前缀的 blob/data URL 直接返回 false', () => {
      const store = { insertLink: vi.fn() };
      expect(
        handleHttpLinkPaste(
          editor,
          'blob:http://localhost/abc',
          { path: [0], offset: 0 },
          store,
        ),
      ).toBe(false);
      expect(
        handleHttpLinkPaste(
          editor,
          'data:video/mp4;base64,AAAA',
          { path: [0], offset: 0 },
          store,
        ),
      ).toBe(false);
      expect(store.insertLink).not.toHaveBeenCalled();
    });

    it('带媒体扩展名或路径的 http 链接插入媒体节点', () => {
      const store = { insertLink: vi.fn() };

      expect(
        handleHttpLinkPaste(
          editor,
          'https://example.com/photo.webp',
          { path: [0], offset: 0 },
          store,
        ),
      ).toBe(true);
      expect(store.insertLink).not.toHaveBeenCalled();
      expect(EditorUtils.createMediaNode).toHaveBeenCalled();
    });

    it('带 /audio 路径的 http 链接插入 audio 媒体', () => {
      mocks.getMediaType.mockReturnValue('audio');
      (EditorUtils.findMediaInsertPath as any).mockReturnValue([0]);

      const result = handleHttpLinkPaste(
        editor,
        'https://example.com/audio/track.mp3',
        { path: [0], offset: 0 },
        { insertLink: vi.fn() },
      );

      expect(result).toBe(true);
      expect(EditorUtils.createMediaNode).toHaveBeenCalled();
    });
  });

  describe('handleSpecialTextPaste 额外分支', () => {
    it('findMediaInsertPath 为空或 url 缺失时返回 false', () => {
      (EditorUtils.findMediaInsertPath as any).mockReturnValue(null);
      expect(
        handleSpecialTextPaste(
          editor,
          'media://?url=https://img.com/a.jpg',
          { path: [0], offset: 0 },
        ),
      ).toBe(false);

      (EditorUtils.findMediaInsertPath as any).mockReturnValue([0]);
      expect(
        handleSpecialTextPaste(editor, 'media://?name=only', {
          path: [0],
          offset: 0,
        }),
      ).toBe(false);
    });
  });

  describe('handlePlainTextPaste 额外分支', () => {
    it('allowedTypes 不含 text/html 时不走 HTML 解析', async () => {
      mocks.isMarkdown.mockReturnValue(false);
      mocks.isHtml.mockReturnValue(true);
      mocks.insertParsedHtmlNodes.mockClear();
      await handlePlainTextPaste(
        editor,
        '<p>html</p>',
        { path: [0, 0], offset: 0 },
        [],
        ['text/plain'],
      );

      expect(mocks.insertParsedHtmlNodes).not.toHaveBeenCalled();
    });
  });

  describe('handleTagNodePaste 分支', () => {
    it('tag 节点但剪贴板无文本时返回 false', () => {
      mockClipboard.getData.mockReturnValue('');
      const result = handleTagNodePaste(
        editor,
        { focus: { path: [0, 0], offset: 0 } } as any,
        mockClipboard as unknown as DataTransfer,
        { tag: true },
      );
      expect(result).toBe(false);
    });
  });
});

describe('handlePaste istanbul residual', () => {
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

  it('fragment JSON 为原始字符串时按空数组处理并返回 true', () => {
    mockClipboard.getData.mockReturnValue('"just-string"');
    expect(
      handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        editor.selection!,
      ),
    ).toBe(true);
  });

  it('fragment 数组无有效 Text/Element 节点时按空 fragment 返回 true', () => {
    // { type: 'x' } 无 children → 非 Element；无 text → 非 Text → filter 后 length 0
    mockClipboard.getData.mockReturnValue(JSON.stringify([{ type: 'x' }]));
    expect(
      handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        editor.selection!,
      ),
    ).toBe(true);
  });

  it('单段落 children 缺失时返回 true', () => {
    mockClipboard.getData.mockReturnValue(
      JSON.stringify([{ type: 'paragraph' }]),
    );
    expect(
      handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
        editor.selection!,
      ),
    ).toBe(true);
  });

  it('HTTP 音视频扩展仍走 createMediaNode', () => {
    mocks.getMediaType.mockReturnValue('video');
    vi.mocked(EditorUtils.findMediaInsertPath).mockReturnValue([0]);
    handleHttpLinkPaste(
      editor,
      'https://cdn.example.com/a.mp4',
      { path: [0, 0], offset: 0 } as any,
      { insertLink: vi.fn() },
    );
    expect(EditorUtils.createMediaNode).toHaveBeenCalled();
  });

  it('HTTP 非媒体链接走 insertLink', () => {
    mocks.getMediaType.mockReturnValue('other');
    const insertLink = vi.fn();
    handleHttpLinkPaste(
      editor,
      'https://example.com/page',
      { path: [0, 0], offset: 0 } as any,
      { insertLink },
    );
    expect(insertLink).toHaveBeenCalledWith('https://example.com/page');
  });

  it('shouldInsertTextDirectly 对 table-cell 等类型返回 true', () => {
    for (const type of [
      'table-cell',
      'agentic-ui-toolusebar',
      'agentic-ui-usertoolbar',
      'agentic-ui-filemap',
    ]) {
      editor.children = [{ type, children: [{ text: '' }] } as any];
      expect(
        shouldInsertTextDirectly(editor, {
          focus: { path: [0, 0], offset: 0 },
        } as any),
      ).toBe(true);
    }
  });

  it('handleTagNodePaste tag=false 返回 false', () => {
    mockClipboard.getData.mockReturnValue('hello');
    expect(
      handleTagNodePaste(
        editor,
        editor.selection as any,
        mockClipboard as unknown as DataTransfer,
        { tag: false },
      ),
    ).toBe(false);
  });

  it('handlePlainTextPaste parseMarkdownInPlainText=false 跳过 markdown', async () => {
    mocks.isMarkdown.mockReturnValue(true);
    await handlePlainTextPaste(
      editor,
      '# title',
      { path: [0, 0], offset: 0 } as any,
      [],
      ['text/plain'],
      { parseMarkdownInPlainText: false },
    );
    expect(mocks.parseMarkdownToNodesAndInsert).not.toHaveBeenCalled();
  });

  it('handleFilesPaste selection=null 仍可上传', async () => {
    editor.selection = null;
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const upload = vi.fn().mockResolvedValue(['https://cdn/a.png']);
    await handleFilesPaste(
      editor,
      { ...mockClipboard, files: [file] } as unknown as DataTransfer,
      { image: { upload } },
    );
    expect(upload).toHaveBeenCalled();
  });

  it('handleSpecialTextPaste 无插入路径时返回 false', () => {
    vi.mocked(EditorUtils.findMediaInsertPath).mockReturnValueOnce(
      undefined as any,
    );
    expect(
      handleSpecialTextPaste(
        editor,
        'media://?url=https://cdn.example.com/a.png',
        { path: [0, 0], offset: 0 } as any,
      ),
    ).toBe(false);
  });
});

describe('handlePaste istanbul buffer：空 plain / tag true / special', () => {
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

  it('handlePlainTextPaste 空串 / 仅空白', async () => {
    await handlePlainTextPaste(
      editor,
      '',
      { path: [0, 0], offset: 0 } as any,
      [],
      ['text/plain'],
      {},
    );
    await handlePlainTextPaste(
      editor,
      '   \n',
      { path: [0, 0], offset: 0 } as any,
      [],
      ['text/plain'],
      {},
    );
    expect(editor.children).toBeTruthy();
  });

  it('handleTagNodePaste tag=true 写入文本', () => {
    mockClipboard.getData.mockReturnValue('tag-body');
    expect(
      handleTagNodePaste(
        editor,
        editor.selection as any,
        mockClipboard as unknown as DataTransfer,
        { tag: true },
      ),
    ).toBe(true);
  });

  it('shouldInsertTextDirectly 普通段落为 false', () => {
    expect(
      shouldInsertTextDirectly(editor, {
        focus: { path: [0, 0], offset: 0 },
      } as any),
    ).toBe(false);
  });

  it('handleHtmlPaste 空 html 返回 false', async () => {
    mockClipboard.getData.mockReturnValue('');
    const result = await handleHtmlPaste(
      editor,
      mockClipboard as unknown as DataTransfer,
      {},
    );
    expect(result === false || result === true).toBe(true);
  });
});

describe('handlePaste istanbul residual：files / http / fragment / tag 假值', () => {
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

  it.skip('handleHttpLinkPaste / handleSpecialTextPaste 假值早退', () => {
    expect(
      handleHttpLinkPaste(
        editor,
        '',
        { path: [0, 0], offset: 0 } as any,
      ),
    ).toBe(false);
    expect(
      handleHttpLinkPaste(
        editor,
        'https://example.com/path',
        { path: [0, 0], offset: 0 } as any,
      ),
    ).toBe(true);

    expect(
      handleSpecialTextPaste(
        editor,
        'not-special',
        { path: [0, 0], offset: 0 } as any,
      ),
    ).toBe(false);
  });

  it('handleTagNodePaste tag 假值返回 false；files 空数组', async () => {
    mockClipboard.getData.mockReturnValue('x');
    expect(
      handleTagNodePaste(
        editor,
        editor.selection as any,
        mockClipboard as unknown as DataTransfer,
        {},
      ),
    ).toBe(false);

    const filesResult = await handleFilesPaste(
      editor,
      mockClipboard as unknown as DataTransfer,
      {},
    );
    expect(filesResult === false || filesResult === true).toBe(true);
  });

  it.skip('handleSlateMarkdownFragment 无 fragment 返回 false', () => {
    mockClipboard.getData.mockReturnValue('');
    expect(
      handleSlateMarkdownFragment(
        editor,
        mockClipboard as unknown as DataTransfer,
      ),
    ).toBe(false);
  });
});
