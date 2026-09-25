/**
 * insertParsedHtmlNodes deepen3：嵌套 media 上传、无 upload 移除、
 * 大批量分段插入、list-item 空子节点。
 */
import { createEditor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { insertParsedHtmlNodes } from '../insertParsedHtmlNodes';

vi.mock('../../utils/docx/docxDeserializer', () => ({
  docxDeserializer: vi.fn(() => []),
}));

describe('insertParsedHtmlNodes deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('嵌套 media blob：有 upload 时 fetch+upload', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    global.fetch = vi.fn().mockResolvedValue({
      blob: async () => new Blob(['x'], { type: 'image/png' }),
    }) as any;

    const upload = vi.fn().mockResolvedValue(['https://cdn.example/out.png']);
    // 顶层非 media，嵌套 media 才能进入 upLoadFileBatch 收集
    vi.mocked(docxDeserializer).mockReturnValueOnce([
      {
        type: 'paragraph',
        children: [
          { text: 'cap' },
          {
            type: 'media',
            url: 'blob:http://local/img-2',
            children: [{ text: '' }],
          },
        ],
      },
    ] as any);
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = null;
    const result = await insertParsedHtmlNodes(
      editor,
      '<p></p>',
      { image: { upload } },
      '',
    );
    expect(upload).toHaveBeenCalled();
    expect(typeof result).toBe('boolean');
  });

  it('嵌套 media：无 upload 时 removeMediaFragments 不抛', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    vi.mocked(docxDeserializer).mockReturnValueOnce([
      {
        type: 'paragraph',
        children: [
          { text: 'keep' },
          {
            type: 'media',
            url: 'blob:http://local/img-1',
            children: [{ text: '' }],
          },
        ],
      },
    ] as any);
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = null;
    await expect(
      insertParsedHtmlNodes(editor, '<p></p>', {}, ''),
    ).resolves.toBeTypeOf('boolean');
  });

  it('嵌套 media http：非 blob 上传分支', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    const upload = vi.fn().mockResolvedValue(['https://cdn.example/u.png']);
    vi.mocked(docxDeserializer).mockReturnValueOnce([
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
    await expect(
      insertParsedHtmlNodes(editor, '<p></p>', { image: { upload } }, ''),
    ).resolves.toBe(true);
    expect(upload).toHaveBeenCalled();
  });

  it('无选区大批量节点触发 insertNodesBatch 分段', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    const many = Array.from({ length: 12 }, (_, i) => ({
      type: 'paragraph',
      children: [{ text: `p${i}` }],
    }));
    vi.mocked(docxDeserializer).mockReturnValueOnce(many as any);
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = null;
    const p = insertParsedHtmlNodes(editor, '<p>x</p>', {}, '');
    await vi.runAllTimersAsync();
    await expect(p).resolves.toBe(true);
  });

  it('list-item 空列表片段返回 false', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    vi.mocked(docxDeserializer).mockReturnValueOnce([
      { type: 'list', children: [] },
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
      focus: { path: [0, 0, 0, 0], offset: 0 },
    });
    await expect(
      insertParsedHtmlNodes(editor, '<ul></ul>', {}, ''),
    ).resolves.toBe(false);
  });
});
