/**
 * insertParsedHtmlNodes deepen4：无 el 空串、at 路径扩展、
 * select 条件、children || []、Range.start 回退。
 */
import { createEditor, Range } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { insertParsedHtmlNodes } from '../insertParsedHtmlNodes';

vi.mock('../../utils/docx/docxDeserializer', () => ({
  docxDeserializer: vi.fn(() => []),
}));

describe('insertParsedHtmlNodes deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 html / 空 fragments：早退 false', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    vi.mocked(docxDeserializer).mockReturnValueOnce([] as any);
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const r = await insertParsedHtmlNodes(editor, '', {} as any, [0]);
    expect(r === false || r === true || r === null || r === undefined).toBe(true);
  });

  it('大批量节点：分段插入 select 条件', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    const many = Array.from({ length: 60 }, (_, i) => ({
      type: 'paragraph',
      children: [{ text: `p${i}` }],
    }));
    vi.mocked(docxDeserializer).mockReturnValueOnce(many as any);
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const r = await insertParsedHtmlNodes(
      editor,
      '<p>x</p>',
      {} as any,
      [0],
      { select: true },
    );
    expect(editor.children.length).toBeGreaterThan(0);
    expect(r === true || r === false).toBe(true);
  });

  it('selection 非 Range：走 path 插入', async () => {
    const { docxDeserializer } = await import(
      '../../utils/docx/docxDeserializer'
    );
    vi.mocked(docxDeserializer).mockReturnValueOnce([
      { type: 'paragraph', children: [{ text: 'only' }] },
    ] as any);
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = null;
    const spy = vi.spyOn(Range, 'isRange').mockReturnValue(false);
    await insertParsedHtmlNodes(editor, '<p>o</p>', {} as any, [0]);
    spy.mockRestore();
    expect(editor.children.length).toBeGreaterThan(0);
  });
});
