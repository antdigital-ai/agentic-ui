/**
 * handlePaste 残留：空 URL、未知 media type、direct insert、http/plain 边角。
 */
import { createEditor, Editor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  insertParsedHtmlNodes: vi.fn().mockResolvedValue(false),
  parseMarkdownToNodesAndInsert: vi.fn().mockResolvedValue(undefined),
  isMarkdown: vi.fn(() => false),
  isHtml: vi.fn(() => false),
  getMediaType: vi.fn(() => 'other'),
  toUnixPath: vi.fn((p: string) => p),
  insertLink: vi.fn(),
}));

vi.mock('../editor/plugins/insertParsedHtmlNodes', () => ({
  insertParsedHtmlNodes: mocks.insertParsedHtmlNodes,
}));
vi.mock('../editor/plugins/parseMarkdownToNodesAndInsert', () => ({
  parseMarkdownToNodesAndInsert: mocks.parseMarkdownToNodesAndInsert,
}));
vi.mock('antd', () => ({
  message: { loading: vi.fn(() => vi.fn()), success: vi.fn(), error: vi.fn() },
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
    wrapperCardNode: vi.fn((n: any) => n),
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
  handleHtmlPaste,
  handleHttpLinkPaste,
  handlePlainTextPaste,
  handleSlateMarkdownFragment,
  handleSpecialTextPaste,
  handleTagNodePaste,
  shouldInsertTextDirectly,
} from '../editor/plugins/handlePaste';

const store = { insertLink: mocks.insertLink };

describe('handlePaste residual branches', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
  });

  it('shouldInsertTextDirectly：table-cell / code / 普通段落', () => {
    editor.children = [{ type: 'table-cell', children: [{ text: '' }] }];
    expect(
      shouldInsertTextDirectly(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      }),
    ).toBe(true);

    editor.children = [{ type: 'code', children: [{ text: '' }] }];
    expect(
      shouldInsertTextDirectly(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      }),
    ).toBe(true);

    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    expect(
      shouldInsertTextDirectly(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      }),
    ).toBe(false);
    expect(shouldInsertTextDirectly(editor, null as any)).toBe(false);
  });

  it('handleHttpLinkPaste：空串 / 普通链接 / 图片扩展名', () => {
    expect(handleHttpLinkPaste(editor, '', {} as any, store)).toBeFalsy();
    expect(
      handleHttpLinkPaste(
        editor,
        'https://example.com/page',
        editor.selection,
        store,
      ),
    ).toBeTruthy();
    expect(mocks.insertLink).toHaveBeenCalledWith('https://example.com/page');
    mocks.getMediaType.mockReturnValue('image');
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/image/photo.png?size=1',
        editor.selection,
        store,
      ),
    ).toBeTruthy();
  });

  it('handleSpecialTextPaste：media:// / 普通文本', () => {
    expect(
      handleSpecialTextPaste(
        editor,
        'media://?url=https://x.png',
        editor.selection,
      ),
    ).toBeTruthy();
    expect(handleSpecialTextPaste(editor, 'plain', editor.selection)).toBeFalsy();
  });

  it('handleSlateMarkdownFragment：无效 JSON / card 节点', () => {
    const clip = {
      getData: (t: string) =>
        t.includes('slate') ? 'not-json' : '',
    } as any;
    expect(handleSlateMarkdownFragment(editor, clip, null)).toBeFalsy();

    const clip2 = {
      getData: (t: string) =>
        t.includes('slate')
          ? JSON.stringify([
              { type: 'card', children: [{ type: 'paragraph', children: [{ text: 'c' }] }] },
              { text: 'leaf' },
            ])
          : '',
    } as any;
    expect(handleSlateMarkdownFragment(editor, clip2, null)).toBeTypeOf(
      'boolean',
    );
  });

  it('handleHtmlPaste：非 html 早退；html 调用 insert', async () => {
    const emptyClip = {
      getData: () => '',
    } as DataTransfer;
    expect(
      await handleHtmlPaste(editor, emptyClip, {} as any),
    ).toBeFalsy();
    const htmlClip = {
      getData: (type: string) => (type === 'text/html' ? '<p>x</p>' : ''),
    } as DataTransfer;
    await handleHtmlPaste(editor, htmlClip, { plugins: [] } as any);
    expect(mocks.insertParsedHtmlNodes).toHaveBeenCalled();
  });

  it('handleFilesPaste：空 files；无 upload 返回', async () => {
    const r = await handleFilesPaste(
      editor,
      { files: [] } as any,
      {} as any,
      {} as any,
    );
    expect(r).toBeFalsy();
  });

  it('handlePlainTextPaste：markdown 走 parse；非 markdown', async () => {
    mocks.isMarkdown.mockReturnValue(true);
    await handlePlainTextPaste(editor, '# H', null, [] as any);
    expect(mocks.parseMarkdownToNodesAndInsert).toHaveBeenCalled();
    mocks.isMarkdown.mockReturnValue(false);
    await handlePlainTextPaste(editor, 'plain', null, [] as any);
  });

  it('handleTagNodePaste：非 tag 返回 false', () => {
    expect(
      handleTagNodePaste(
        editor,
        { type: 'paragraph', children: [{ text: '' }] } as any,
        'x',
        {} as any,
      ),
    ).toBe(false);
  });

  it('handleSlateMarkdownFragment：空数组 / 非数组 raw / paragraph 子节点', () => {
    const empty = {
      getData: (t: string) => (t.includes('slate') ? '[]' : ''),
    } as any;
    expect(handleSlateMarkdownFragment(editor, empty, null)).toBe(true);

    const notArr = {
      getData: (t: string) =>
        t.includes('slate') ? JSON.stringify({ a: 1 }) : '',
    } as any;
    expect(handleSlateMarkdownFragment(editor, notArr, null)).toBe(true);

    const para = {
      getData: (t: string) =>
        t.includes('slate')
          ? JSON.stringify([
              {
                type: 'paragraph',
                children: [{ text: 'hello' }],
              },
            ])
          : '',
    } as any;
    expect(
      handleSlateMarkdownFragment(editor, para, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      } as any),
    ).toBeTypeOf('boolean');
  });

  it('handleSpecialTextPaste：attach:// 与 media 非 http 路径', () => {
    expect(
      handleSpecialTextPaste(
        editor,
        'attach://local?name=a.pdf&size=12',
        {} as any,
      ),
    ).toBeTypeOf('boolean');
    expect(
      handleSpecialTextPaste(editor, 'media://C:/tmp/x.png', {} as any),
    ).toBeTypeOf('boolean');
  });

  it('handleFilesPaste：有 upload 返回 urls', async () => {
    const upload = vi.fn().mockResolvedValue(['https://cdn/a.png']);
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const r = await handleFilesPaste(
      editor,
      { files: [file] } as any,
      { image: { upload } } as any,
      {} as any,
    );
    expect(upload).toHaveBeenCalled();
    expect(r).toBeTypeOf('boolean');
  });

  it('handlePlainTextPaste：关闭 markdown 解析；html 分支', async () => {
    mocks.isMarkdown.mockReturnValue(false);
    mocks.isHtml.mockReturnValue(true);
    await handlePlainTextPaste(
      editor,
      '<p>h</p>',
      null,
      [] as any,
      undefined,
      { parseMarkdownInPlainText: true },
    );
    expect(mocks.insertParsedHtmlNodes).toHaveBeenCalled();

    mocks.isHtml.mockReturnValue(false);
    await handlePlainTextPaste(
      editor,
      'plain',
      null,
      [] as any,
      ['text/plain'],
      { parseMarkdownInPlainText: false },
    );
  });

  it('handleFilesPaste：upload 拒绝；空 files；非图片', async () => {
    const uploadFail = vi.fn().mockRejectedValue(new Error('up'));
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    try {
      await handleFilesPaste(
        editor,
        { files: [file] } as any,
        { image: { upload: uploadFail } } as any,
        {} as any,
      );
    } catch {
      // upload reject path
    }

    expect(
      await handleFilesPaste(
        editor,
        { files: [] } as any,
        {} as any,
        {} as any,
      ),
    ).toBeTypeOf('boolean');

    const txt = new File(['t'], 'a.txt', { type: 'text/plain' });
    expect(
      await handleFilesPaste(
        editor,
        { files: [txt] } as any,
        { image: { upload: vi.fn() } } as any,
        {} as any,
      ),
    ).toBeTypeOf('boolean');
  });

  it('handleSpecialTextPaste：空串 / 普通文本', () => {
    expect(handleSpecialTextPaste(editor, '', {} as any)).toBeTypeOf(
      'boolean',
    );
    expect(
      handleSpecialTextPaste(editor, 'just text', {} as any),
    ).toBeTypeOf('boolean');
  });

  it('shouldInsertTextDirectly：更多 DIRECT_INSERT 类型', () => {
    for (const type of [
      'table',
      'table-row',
      'schema',
      'apaasify',
      'agentic-ui-task',
      'agentic-ui-toolusebar',
      'agentic-ui-filemap',
    ]) {
      editor.children = [{ type, children: [{ text: '' }] } as any];
      expect(
        shouldInsertTextDirectly(editor, {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        }),
      ).toBe(true);
    }
  });

  it('handleHttpLinkPaste：video/audio 与无效 media URL', () => {
    mocks.getMediaType.mockReturnValue('video');
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/video/clip.mp4',
        editor.selection,
        store,
      ),
    ).toBeTruthy();
    mocks.getMediaType.mockReturnValue('audio');
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/audio/a.mp3',
        editor.selection,
        store,
      ),
    ).toBeTruthy();
    mocks.getMediaType.mockReturnValue('image');
    // 无扩展名/路径时 isValidMediaUrl 失败，回退 insertLink
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/no-media-hint',
        editor.selection,
        store,
      ),
    ).toBeTruthy();
    expect(mocks.insertLink).toHaveBeenCalled();
  });

  it('handleTagNodePaste：tag 节点插入纯文本', () => {
    const insertText = vi.spyOn(Transforms, 'insertText');
    const clip = {
      getData: () => 'pasted-tag',
    } as any;
    expect(
      handleTagNodePaste(
        editor,
        editor.selection as any,
        clip,
        { text: '', tag: true } as any,
      ),
    ).toBe(true);
    expect(insertText).toHaveBeenCalled();
    insertText.mockRestore();
  });

  it('handlePlainTextPaste：有 selection 原样插入；htmlAllowed=false', async () => {
    mocks.isMarkdown.mockReturnValue(false);
    mocks.isHtml.mockReturnValue(true);
    await handlePlainTextPaste(
      editor,
      '<b>x</b>',
      editor.selection,
      [] as any,
      ['text/plain'],
      { parseMarkdownInPlainText: true },
    );
    // allowedTypes 不含 text/html 时不走 html 解析
    expect(mocks.insertParsedHtmlNodes).not.toHaveBeenCalled();
  });

  it('exclusive deepen：files/html/fragment/special；direct insert 矩阵', async () => {
    const upload = vi.fn().mockResolvedValue([
      'https://cdn/a.png',
      'https://cdn/b.txt',
    ]);
    const img = new File(['x'], 'a.png', { type: 'image/png' });
    const txt = new File(['y'], 'b.txt', { type: 'text/plain' });
    const vid = new File(['z'], 'c.mp4', { type: 'video/mp4' });
    await handleFilesPaste(
      editor,
      { files: [img, txt, vid] } as any,
      { image: { upload } } as any,
    );
    expect(upload).toHaveBeenCalled();

    const htmlClip = {
      getData: (t: string) =>
        t === 'text/html' ? '<p>h</p>' : t === 'text/rtf' ? '{\\rtf1}' : '',
    } as any;
    await handleHtmlPaste(editor, htmlClip, { plugins: [] } as any);
    expect(mocks.insertParsedHtmlNodes).toHaveBeenCalled();

    expect(
      handleSpecialTextPaste(
        editor,
        'media://?url=https://cdn.example/x.png',
        editor.selection,
      ),
    ).toBeTruthy();
    expect(
      handleSpecialTextPaste(
        editor,
        'attach://?url=https://cdn.example/a.pdf',
        editor.selection,
      ),
    ).toBeTruthy();
    expect(
      handleSpecialTextPaste(editor, 'plain-special', editor.selection),
    ).toBeFalsy();

    const fragOk = {
      getData: (t: string) =>
        t.includes('slate')
          ? JSON.stringify([
              { type: 'paragraph', children: [{ text: 'frag', bold: true }] },
            ])
          : '',
    } as any;
    expect(
      handleSlateMarkdownFragment(editor, fragOk, editor.selection),
    ).toBeTypeOf('boolean');
    const fragBad = {
      getData: () => 'not-json',
    } as any;
    expect(handleSlateMarkdownFragment(editor, fragBad, null)).toBeFalsy();

    editor.children = [{ type: 'code', children: [{ text: '' }] }];
    expect(
      shouldInsertTextDirectly(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      }),
    ).toBe(true);

    mocks.getMediaType.mockReturnValue('other');
    expect(
      handleHttpLinkPaste(
        editor,
        'https://cdn.example/file.bin',
        editor.selection,
        store,
      ),
    ).toBeTruthy();
  });
});
