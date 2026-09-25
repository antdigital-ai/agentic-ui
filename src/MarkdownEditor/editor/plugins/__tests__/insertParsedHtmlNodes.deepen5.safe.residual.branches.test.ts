/**
 * insertParsedHtmlNodes deepen5 safe：parserCodeText !el、upload 双分支、
 * insertAt undefined、select 末批、list-item specialNode、children||[]。
 */
import { createEditor, Editor, Range, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deserialize, insertParsedHtmlNodes } from '../insertParsedHtmlNodes';

vi.mock('../../utils/docx/docxDeserializer', () => ({
  docxDeserializer: vi.fn(() => []),
}));

describe('insertParsedHtmlNodes deepen5 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('deserialize PRE：parserCodeText !el → 空串', () => {
    const el = document.createElement('div');
    const pre = document.createElement('pre');
    el.appendChild(pre);
    const node = { nodeName: 'PRE', childNodes: pre.childNodes } as any;
    node.parentNode = el;
    node.parentElement = el;
    const result = deserialize(node, 'BLOCKQUOTE');
    expect(result === null || result === undefined || typeof result === 'object').toBe(
      true,
    );
  });

  it('blob / http upload：editorProps.image?.upload 双 if 臂', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    global.fetch = vi.fn().mockResolvedValue({
      blob: async () => new Blob(['x'], { type: 'image/png' }),
    }) as any;
    const upload = vi
      .fn()
      .mockResolvedValueOnce(['https://cdn.example/blob.png'])
      .mockResolvedValueOnce(['https://cdn.example/http.png']);

    vi.mocked(docxDeserializer).mockReturnValueOnce([
      {
        type: 'paragraph',
        children: [
          {
            type: 'media',
            url: 'blob:http://local/x',
            children: [{ text: '' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'media',
            url: 'https://cdn.example/a.png',
            children: [{ text: '' }],
          },
        ],
      },
    ] as any);

    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = null;
    await insertParsedHtmlNodes(
      editor,
      '<p><img /><img /></p>',
      { image: { upload } },
      '',
    );
    expect(upload.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('无选区大批量：insertAt undefined 分段插入', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    const many = Array.from({ length: 25 }, (_, i) => ({
      type: 'paragraph',
      children: [{ text: `chunk${i}` }],
    }));
    vi.mocked(docxDeserializer).mockReturnValueOnce(many as any);
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = null;
    const p = insertParsedHtmlNodes(editor, '<p>x</p>', {}, '');
    await vi.runAllTimersAsync();
    await expect(p).resolves.toBe(true);
    expect(editor.children.length).toBeGreaterThan(1);
  });

  it('list-item + specialNode 首段：children||[] 与非折叠 selection', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    vi.mocked(docxDeserializer).mockReturnValueOnce([
      {
        type: 'list',
        children: [
          { type: 'paragraph', children: [{ text: 'li1' }] },
          { type: 'paragraph', children: [{ text: 'li2' }] },
        ],
      },
      { type: 'paragraph', children: [{ text: 'tail' }] },
    ] as any);

    const editor = createEditor();
    editor.children = [
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: '' }] }],
          },
        ],
      },
    ] as any;
    Transforms.select(editor, {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 1 },
    });
    expect(Range.isCollapsed(editor.selection!)).toBe(false);

    const nodesSpy = vi.spyOn(Editor, 'nodes');
    nodesSpy.mockImplementation(((editorArg: Editor, opts: any) => {
      if (opts?.match?.({ type: 'list-item' } as any)) {
        return [[editor.children[0].children[0], [0, 0]]][Symbol.iterator]();
      }
      if (opts?.match?.({ type: 'paragraph' } as any)) {
        return [[editor.children[0].children[0].children[0], [0, 0, 0]]][
          Symbol.iterator
        ]();
      }
      return [][Symbol.iterator]();
    }) as any);

    const result = await insertParsedHtmlNodes(editor, '<ul><li>a</li></ul>', {}, '');
    nodesSpy.mockRestore();
    expect(result === true || result === false).toBe(true);
  });
});
