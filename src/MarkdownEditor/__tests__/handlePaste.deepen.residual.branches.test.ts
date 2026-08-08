/**
 * handlePaste deepen residual：空 url、blob/data、未知扩展、files 索引兜底、null selection。
 */
import { createEditor, Editor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  insertParsedHtmlNodes: vi.fn().mockResolvedValue(false),
  parseMarkdownToNodesAndInsert: vi.fn().mockResolvedValue(undefined),
  isMarkdown: vi.fn(() => false),
  isHtml: vi.fn(() => false),
  getMediaType: vi.fn(() => 'image'),
  toUnixPath: vi.fn((p: string) => p),
  insertLink: vi.fn(),
  findMediaInsertPath: vi.fn(() => [0]),
  findNext: vi.fn(() => [1]),
  createMediaNode: vi.fn((url: string, type?: string) => ({
    type: type || 'image',
    url,
    children: [{ text: '' }],
  })),
  replaceSelectedNode: vi.fn(),
}));

vi.mock('../editor/plugins/insertParsedHtmlNodes', () => ({
  insertParsedHtmlNodes: mocks.insertParsedHtmlNodes,
}));
vi.mock('../editor/plugins/parseMarkdownToNodesAndInsert', () => ({
  parseMarkdownToNodesAndInsert: mocks.parseMarkdownToNodesAndInsert,
}));
vi.mock('../editor/utils/editorUtils', () => ({
  EditorUtils: {
    replaceSelectedNode: mocks.replaceSelectedNode,
    findMediaInsertPath: mocks.findMediaInsertPath,
    createMediaNode: mocks.createMediaNode,
    findNext: mocks.findNext,
  },
}));
vi.mock('../editor/utils', () => ({
  isMarkdown: (...a: any[]) => mocks.isMarkdown(...a),
}));
vi.mock('../editor/utils/htmlToMarkdown', () => ({
  isHtml: (...a: any[]) => mocks.isHtml(...a),
}));
vi.mock('../editor/utils/dom', () => ({
  getMediaType: (...a: any[]) => mocks.getMediaType(...a),
}));
vi.mock('../editor/utils/path', () => ({
  toUnixPath: (...a: any[]) => mocks.toUnixPath(...a),
}));

import {
  handleFilesPaste,
  handleHttpLinkPaste,
} from '../editor/plugins/handlePaste';

const store = { insertLink: mocks.insertLink };

describe('handlePaste deepen residual branches', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    mocks.findMediaInsertPath.mockReturnValue([0]);
    mocks.getMediaType.mockReturnValue('image');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('handleHttpLinkPaste：null selection；路径命中；无效媒体走 insertLink', () => {
    mocks.getMediaType.mockReturnValue('image');
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/icon/avatar',
        null,
        store,
      ),
    ).toBe(true);

    mocks.getMediaType.mockReturnValue('video');
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/movie/clip',
        editor.selection,
        store,
      ),
    ).toBe(true);

    mocks.getMediaType.mockReturnValue('image');
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/not-media/file',
        editor.selection,
        store,
      ),
    ).toBe(true);
    expect(mocks.insertLink).toHaveBeenCalled();
  });

  it('handleFilesPaste：无名扩展 attachment；urls 多于 files 用 files[0]；video 扩展', async () => {
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    const nameless = new File(['x'], '', { type: '' });
    const upload = vi.fn().mockResolvedValue(['https://cdn/a.bin']);
    await handleFilesPaste(
      editor,
      { files: [nameless] } as any,
      { image: { upload } } as any,
    );
    expect(upload).toHaveBeenCalled();

    const one = new File(['v'], 'clip.mp4', { type: '' });
    const upload2 = vi
      .fn()
      .mockResolvedValue(['https://cdn/1.mp4', 'https://cdn/2.mp4']);
    await handleFilesPaste(
      editor,
      { files: [one] } as any,
      { image: { upload: upload2 } } as any,
    );
    expect(upload2).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('handleFilesPaste：无 selection 时插入末尾；audio 扩展名', async () => {
    editor.selection = null;
    mocks.findNext.mockReturnValue(undefined as any);
    const audio = new File(['a'], 'voice.mp3', { type: '' });
    const upload = vi.fn().mockResolvedValue(['https://cdn/a.mp3']);
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    await handleFilesPaste(
      editor,
      { files: [audio] } as any,
      { image: { upload } } as any,
    );
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();
  });
});
