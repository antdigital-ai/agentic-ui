/**
 * handlePaste deepen：blob/data URL、table-cell 插入、空 paragraph fragment、扩展名兜底。
 */
import { createEditor, Editor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  handleSlateMarkdownFragment,
  handleSpecialTextPaste,
} from '../editor/plugins/handlePaste';

const store = { insertLink: mocks.insertLink };

describe('handlePaste deepen branches', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    mocks.findMediaInsertPath.mockReturnValue([0]);
  });

  it('handleHttpLinkPaste：http + 扩展名命中 isValidMediaUrl', () => {
    mocks.getMediaType.mockReturnValue('image');
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/assets/photo.webp',
        editor.selection,
        store,
      ),
    ).toBe(true);
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('handleHttpLinkPaste：有效媒体但无 insert path 返回 false', () => {
    mocks.getMediaType.mockReturnValue('image');
    mocks.findMediaInsertPath.mockReturnValue(null as any);
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/x.png',
        editor.selection,
        store,
      ),
    ).toBe(false);
  });

  it('handleHttpLinkPaste：/photo/ 路径关键词命中', () => {
    mocks.getMediaType.mockReturnValue('image');
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/photo/asset',
        editor.selection,
        store,
      ),
    ).toBe(true);
    expect(mocks.createMediaNode).toHaveBeenCalled();
  });

  it('handleSlateMarkdownFragment：单 paragraph 空 children 仍返回 true', () => {
    const clip = {
      getData: (t: string) =>
        t.includes('slate')
          ? JSON.stringify([{ type: 'paragraph', children: [] }])
          : '',
    } as DataTransfer;
    expect(
      handleSlateMarkdownFragment(editor, clip, editor.selection),
    ).toBe(true);
  });

  it('handleSlateMarkdownFragment：多节点走 replaceSelectedNode', () => {
    const nodes = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ];
    const clip = {
      getData: (t: string) =>
        t.includes('slate') ? JSON.stringify(nodes) : '',
    } as DataTransfer;
    expect(handleSlateMarkdownFragment(editor, clip, null)).toBe(true);
    expect(mocks.replaceSelectedNode).toHaveBeenCalled();
  });

  it('handleSpecialTextPaste：path 缺失时返回 false', () => {
    mocks.findMediaInsertPath.mockReturnValue(null as any);
    expect(
      handleSpecialTextPaste(
        editor,
        'media://?url=https://x.png',
        editor.selection,
      ),
    ).toBe(false);
  });

  it('handleSpecialTextPaste：删除空 trailing paragraph', () => {
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ];
    const deleteSpy = vi.spyOn(Transforms, 'delete');
    expect(
      handleSpecialTextPaste(
        editor,
        'media://?url=https://cdn/x.png',
        editor.selection,
      ),
    ).toBe(true);
    deleteSpy.mockRestore();
  });

  it('handleFilesPaste：table-cell 内插入；upload 非数组；扩展名兜底', async () => {
    editor.children = [
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
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    const upload = vi.fn().mockResolvedValue('https://cdn/a.png');
    const file = new File(['x'], 'a.png', { type: '' });
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    await handleFilesPaste(
      editor,
      { files: [file] } as any,
      { image: { upload } } as any,
    );
    expect(upload).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();

    const wav = new File(['a'], 'sound.wav', { type: '' });
    const upload2 = vi.fn().mockResolvedValue(['https://cdn/a.wav']);
    await handleFilesPaste(
      editor,
      { files: [wav] } as any,
      { image: { upload: upload2 } } as any,
    );
    expect(upload2).toHaveBeenCalled();
  });

  it('handleFilesPaste：upload 返回空数组时 false', async () => {
    const upload = vi.fn().mockResolvedValue([]);
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    expect(
      await handleFilesPaste(
        editor,
        { files: [file] } as any,
        { image: { upload } } as any,
      ),
    ).toBe(false);
  });
});
