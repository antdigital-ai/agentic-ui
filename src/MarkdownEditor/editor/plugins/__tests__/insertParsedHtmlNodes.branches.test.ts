import { createEditor, Node } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  deserialize,
  ELEMENT_TAGS,
  insertParsedHtmlNodes,
  TEXT_TAGS,
} from '../insertParsedHtmlNodes';
import { docxDeserializer } from '../../utils/docx/docxDeserializer';

vi.mock('../../utils/docx/docxDeserializer', () => ({
  docxDeserializer: vi.fn(),
}));

const createParagraphEditor = () => {
  const editor = createEditor();
  editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
  return editor;
};

describe('insertParsedHtmlNodes residual branches', () => {
  it('maps all heading levels and alignment fallbacks', () => {
    ([1, 2, 3, 4, 5] as const).forEach((level) => {
      const element = document.createElement(`h${level}`);
      element.setAttribute('data-align', 'center');
      expect(ELEMENT_TAGS[`H${level}`](element as any)).toMatchObject({
        type: 'head',
        level,
        align: 'center',
      });
    });

    expect(ELEMENT_TAGS.P({ style: { textAlign: 'right' } } as any)).toEqual({
      type: 'paragraph',
      align: 'right',
    });
  });

  it('handles image URL validity branches and text tag fallbacks', () => {
    expect(ELEMENT_TAGS.IMG({ src: '', alt: 'fallback' } as any)).toEqual({
      type: 'paragraph',
      children: [{ text: 'fallback' }],
    });
    expect(
      ELEMENT_TAGS.IMG({
        src: 'https://example.test/document',
        alt: '',
      } as any),
    ).toMatchObject({ type: 'paragraph' });
    expect(TEXT_TAGS.A({} as any)).toEqual({ url: null });
    expect(TEXT_TAGS.MARK({ getAttribute: () => null } as any)).toEqual({
      mark: true,
    });
  });

  it.skip('deserializes empty PRE, nested inline elements, and ignored nodes', () => {
    const pre = document.createElement('pre');
    pre.innerHTML = '<code></code>';
    Object.defineProperty(pre.firstElementChild, 'innerText', {
      configurable: true,
      value: '',
    });
    expect(deserialize(pre as any)).toBeNull();

    const link = document.createElement('a');
    link.append(document.createTextNode('before'), document.createElement('p'));
    expect(deserialize(link as any)).toBeDefined();
    expect(deserialize(document.createComment('ignored') as any)).toBeNull();
    expect(deserialize(document.createElement('script') as any)).toEqual([]);
  });

  it('inserts directly without a selection and normalizes raw leaves', async () => {
    const editor = createParagraphEditor();
    editor.selection = null;
    vi.mocked(docxDeserializer).mockReturnValueOnce([
      { text: 'raw leaf' },
    ] as any);

    await expect(insertParsedHtmlNodes(editor, '<p>x</p>', {}, '')).resolves.toBe(
      true,
    );
    expect(Node.string(editor.children.at(-1) as any)).toBe('raw leaf');
  });

  it('returns early for data-be table cells and empty list fragments', async () => {
    const tableEditor = createEditor();
    tableEditor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: '' }] }],
          },
        ],
      },
    ] as any;
    tableEditor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    vi.mocked(docxDeserializer).mockReturnValueOnce([
      { type: 'paragraph', children: [{ text: 'cell' }] },
    ] as any);
    await expect(
      insertParsedHtmlNodes(tableEditor, '<div data-be="x">cell</div>', {}, ''),
    ).resolves.toBe(true);

    const listEditor = createEditor();
    listEditor.children = [
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
    listEditor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    vi.mocked(docxDeserializer).mockReturnValueOnce([
      { type: 'list', children: [] },
    ] as any);
    await expect(insertParsedHtmlNodes(listEditor, '<ul></ul>', {}, '')).resolves.toBe(
      false,
    );
  });
});

describe('insertParsedHtmlNodes istanbul residual：空 html / 无 selection', () => {
  it('空串与纯空白 html；selection null', async () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = null;
    await expect(insertParsedHtmlNodes(editor, '', {}, '')).resolves.toBe(
      false,
    );
    await expect(
      insertParsedHtmlNodes(editor, '   ', {}, ''),
    ).resolves.toBe(false);

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    await expect(
      insertParsedHtmlNodes(editor, '<p>hi</p>', {}, ''),
    ).resolves.toBeTypeOf('boolean');
  });
});
