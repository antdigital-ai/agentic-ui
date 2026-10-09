import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Editor, Element, Node, Transforms } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../../../../BaseMarkdownEditorSlate';
import type {
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from '../../../../types';
import { EditorUtils } from '../../../utils/editorUtils';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mountMedia = async (
  type: 'image' | 'media',
  props: MarkdownEditorProps = {},
) => {
  const editorRef = React.createRef<MarkdownEditorInstance>();
  const url = `https://cdn.example.com/original.${type === 'image' ? 'png' : 'mp4'}`;
  const view = render(
    <BaseMarkdownEditorSlate
      editorRef={editorRef}
      floatBar={{ enable: false }}
      initSchemaValue={[
        EditorUtils.wrapperCardNode({
          type,
          mediaType: type === 'image' ? 'image' : 'video',
          url,
          children: [{ text: '' }],
        }),
        { type: 'paragraph', children: [{ text: 'tail' }] },
      ]}
      {...props}
    />,
  );
  const editor = editorRef.current!.markdownEditorRef.current;
  await act(async () =>
    Transforms.select(editor, { path: [0, 1, 0], offset: 0 }),
  );
  const editable = view.container.querySelector('[data-slate-editor]')!;
  const paste = async (data: Record<string, string>, files: File[] = []) => {
    await act(async () => {
      fireEvent.paste(editable, {
        clipboardData: {
          types: [...Object.keys(data), ...(files.length ? ['Files'] : [])],
          getData: (format: string) => data[format] || '',
          files,
        },
      });
    });
  };
  const originalMedia = () =>
    Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (node) => Element.isElement(node) && node.url === url,
      }),
    )[0];
  return { editor, editorRef, paste, originalMedia };
};

const formats: [string, Record<string, string>, MarkdownEditorProps?][] = [
  ['plain text', { 'text/plain': 'pasted' }],
  ['Markdown text', { 'text/plain': '**pasted**' }],
  ['Markdown MIME', { 'text/markdown': '**pasted**' }],
  ['HTML', { 'text/html': '<p><strong>pasted</strong></p>' }],
  [
    'same editor fragment',
    {
      'application/x-slate-md-fragment': JSON.stringify([
        { type: 'paragraph', children: [{ text: 'pasted', bold: true }] },
      ]),
    },
  ],
  ['HTTP link', { 'text/plain': 'https://example.com/pasted' }],
  ['HTTP media', { 'text/plain': 'https://example.com/pasted.mp4' }],
  [
    'special media URL',
    { 'text/plain': 'media://?url=https://example.com/pasted.png' },
  ],
  [
    'plainTextOnly',
    { 'text/plain': 'pasted' },
    { pasteConfig: { plainTextOnly: true } },
  ],
  [
    'disabled Markdown parsing',
    { 'text/plain': '**pasted**' },
    { pasteConfig: { parseMarkdownInPlainText: false } },
  ],
];

describe.each(['image', 'media'] as const)(
  'paste after selected %s',
  (type) => {
    it.each(formats)(
      'inserts %s visibly and retains the selected media',
      async (_format, data, props) => {
        const { editor, editorRef, paste, originalMedia } = await mountMedia(
          type,
          props,
        );
        const before = JSON.parse(JSON.stringify(editor.children));
        await paste(data);
        expect(editorRef.current!.store.getMDContent()).toContain('pasted');
        expect(originalMedia()).toBeDefined();
        expect(Node.string(originalMedia()[0])).toBe('');
        expect(editor.children.map(Node.string).join('')).toContain('tail');
        expect(Editor.hasPath(editor, editor.selection!.focus.path)).toBe(true);
        await act(async () => editor.undo());
        expect(editor.children).toEqual(before);
      },
    );

    it.each<[string, Record<string, string>, MarkdownEditorProps]>([
      [
        'intercepted content',
        { 'text/plain': 'pasted' },
        { onPaste: () => false },
      ],
      ['empty clipboard', {}, {}],
      [
        'disabled content',
        { 'text/plain': 'pasted' },
        { pasteConfig: { enabled: false } },
      ],
      [
        'disallowed format',
        { 'text/plain': 'pasted' },
        { pasteConfig: { allowedTypes: [] } },
      ],
      [
        'invalid fragment',
        {
          'application/x-slate-md-fragment': JSON.stringify([
            { type: 'paragraph', children: ['invalid'] },
          ]),
        },
        {},
      ],
      [
        'unsupported HTML',
        {
          'text/html': '<html>\r\n<body>\r\n<!--StartFragment--><img src="x">',
        },
        {},
      ],
    ])('does not create a paragraph for %s', async (_format, data, props) => {
      const { editor, paste } = await mountMedia(type, props);
      const before = JSON.parse(JSON.stringify(editor.children));
      const selection = editor.selection;
      await paste(data);
      expect(editor.children).toEqual(before);
      expect(editor.selection).toEqual(selection);
    });

    it('preserves media and selection when file upload fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const { editor, paste } = await mountMedia(type, {
        image: {
          upload: async () => {
            throw new Error('upload failed');
          },
        },
      });
      const before = JSON.parse(JSON.stringify(editor.children));
      const selection = editor.selection;
      await paste({}, [
        new File(['pdf'], 'pasted.pdf', { type: 'application/pdf' }),
      ]);
      expect(editor.children).toEqual(before);
      expect(editor.selection).toEqual(selection);
      expect(Editor.rangeRefs(editor).size).toBe(0);
    });

    it('tracks selected media across edits during file upload', async () => {
      let finishUpload!: (urls: string[]) => void;
      const { editor, editorRef, paste, originalMedia } = await mountMedia(
        type,
        {
          image: {
            upload: () =>
              new Promise((resolve) => {
                finishUpload = resolve;
              }),
          },
        },
      );
      const before = JSON.parse(JSON.stringify(editor.children));
      await paste({}, [
        new File(['pdf'], 'pasted.pdf', { type: 'application/pdf' }),
      ]);
      expect(editor.children).toEqual(before);
      await act(async () => {
        Transforms.insertNodes(
          editor,
          { type: 'paragraph', children: [{ text: 'sibling' }] },
          { at: [0] },
        );
        Transforms.select(editor, Editor.end(editor, []));
        finishUpload(['https://example.com/pasted.pdf']);
      });
      expect(originalMedia()).toBeDefined();
      expect(Node.string(originalMedia()[0])).toBe('');
      expect(editorRef.current!.store.getMDContent()).toContain('pasted.pdf');
      const attachment = Array.from(
        Editor.nodes(editor, {
          at: [],
          match: (node) => Element.isElement(node) && node.type === 'attach',
        }),
      )[0];
      expect(attachment[1][0]).toBeGreaterThan(originalMedia()[1][0]);
      expect(Editor.rangeRefs(editor).size).toBe(0);
    });
  },
);
