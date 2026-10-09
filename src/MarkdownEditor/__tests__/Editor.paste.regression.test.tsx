import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Editor, Node, Transforms } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import type { MarkdownEditorInstance, MarkdownEditorProps } from '../types';

afterEach(() => vi.restoreAllMocks());

const mountEditor = async (props: MarkdownEditorProps = {}) => {
  const editorRef = React.createRef<MarkdownEditorInstance>();
  const view = render(
    <BaseMarkdownEditorSlate
      initSchemaValue={[
        { type: 'paragraph', children: [{ text: 'abc' }] },
        { type: 'paragraph', children: [{ text: 'def' }] },
        { type: 'paragraph', children: [{ text: 'tail' }] },
      ]}
      {...props}
      editorRef={editorRef}
    />,
  );
  const editor = editorRef.current!.markdownEditorRef.current!;
  await act(async () => {
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    });
  });
  const editable = view.container.querySelector('[data-slate-editor]')!;
  const paste = async (data: Record<string, string>, files: File[] = []) => {
    await act(async () => {
      fireEvent.paste(editable, {
        clipboardData: {
          types: [...Object.keys(data), ...(files.length ? ['Files'] : [])],
          getData: (type: string) => data[type] || '',
          files,
        },
      });
    });
  };
  return { editor, editable, paste };
};

describe('paste selection replacement', () => {
  it.each<[string, Record<string, string>]>([
    ['plain text', { 'text/plain': 'X' }],
    ['Markdown text', { 'text/plain': '**X**' }],
    ['Markdown MIME', { 'text/markdown': '**X**' }],
    ['HTML', { 'text/html': '<p><strong>X</strong></p>' }],
    [
      'same editor fragment',
      {
        'application/x-slate-md-fragment': JSON.stringify([
          { type: 'paragraph', children: [{ text: 'X', bold: true }] },
        ]),
      },
    ],
    [
      'empty fragment with plain text fallback',
      {
        'application/x-slate-md-fragment': '[]',
        'text/plain': 'X',
      },
    ],
    [
      'invalid fragment with plain text fallback',
      {
        'application/x-slate-md-fragment': JSON.stringify([
          { type: 'paragraph', children: ['invalid'] },
        ]),
        'text/plain': 'X',
      },
    ],
    [
      'non-array fragment with plain text fallback',
      {
        'application/x-slate-md-fragment': JSON.stringify({ invalid: true }),
        'text/plain': 'X',
      },
    ],
  ])('replaces a cross paragraph selection with %s', async (_name, data) => {
    const { editor, paste } = await mountEditor();
    await paste(data);

    expect(editor.children.map(Node.string)).toEqual(['aXf', 'tail']);
    expect(editor.selection).not.toBeNull();
    expect(Editor.hasPath(editor, editor.selection!.focus.path)).toBe(true);
  });

  it('runs onPaste before modifying a cross paragraph selection', async () => {
    let editor: Editor;
    const onPaste = vi.fn(() => {
      expect(editor.children.map(Node.string)).toEqual(['abc', 'def', 'tail']);
      expect(Editor.string(editor, editor.selection!)).toBe('bcde');
      return false;
    });
    const mounted = await mountEditor({ onPaste });
    editor = mounted.editor;
    const selection = editor.selection;
    await mounted.paste({ 'text/plain': 'X' });

    expect(onPaste).toHaveBeenCalledOnce();
    expect(editor.children.map(Node.string)).toEqual(['abc', 'def', 'tail']);
    expect(editor.selection).toEqual(selection);
  });

  it.each<
    [
      string,
      Record<string, string>,
      NonNullable<MarkdownEditorProps['pasteConfig']>,
    ]
  >([
    ['empty clipboard', {}, {}],
    ['disallowed content', { 'text/plain': 'X' }, { allowedTypes: [] }],
    ['disabled paste', { 'text/plain': 'X' }, { enabled: false }],
    ['empty Markdown', { 'text/markdown': '  ' }, {}],
    ['empty fragment', { 'application/x-slate-md-fragment': '[]' }, {}],
    [
      'empty paragraph fragment',
      {
        'application/x-slate-md-fragment': JSON.stringify([
          { type: 'paragraph', children: [{ text: '' }] },
        ]),
      },
      {},
    ],
    [
      'invalid fragment descendants',
      {
        'application/x-slate-md-fragment': JSON.stringify([
          { type: 'paragraph', children: ['invalid'] },
        ]),
      },
      {},
    ],
    [
      'unhandled HTML',
      { 'text/html': '<html>\r\n<body>\r\n<!--StartFragment--><img src="x">' },
      {},
    ],
  ])('preserves selected text for %s', async (_name, data, pasteConfig) => {
    const { editor, paste } = await mountEditor({ pasteConfig });
    const selection = editor.selection;
    await paste(data);

    expect(editor.children.map(Node.string)).toEqual(['abc', 'def', 'tail']);
    expect(editor.selection).toEqual(selection);
  });

  it('replaces the selected text when pasting an HTTP link', async () => {
    const { editor, paste } = await mountEditor();
    await paste({ 'text/plain': 'https://example.com' });

    expect(editor.children.map(Node.string)).toEqual([
      'ahttps://example.comf',
      'tail',
    ]);
    expect(Array.from(Node.texts(editor)).some(([leaf]) => leaf.url)).toBe(
      true,
    );
  });

  it.each([
    'media://?url=https://example.com/image.jpg',
    'attach://?url=https://example.com/document.pdf&name=document.pdf',
  ])('replaces a cross paragraph selection with %s', async (text) => {
    const { editor, paste } = await mountEditor();
    await paste({ 'text/plain': text });

    expect(editor.children.map(Node.string).filter(Boolean)).toEqual([
      'af',
      'tail',
    ]);
    expect(Array.from(Node.elements(editor)).some(([node]) => node.url)).toBe(
      true,
    );
  });

  it('keeps selected text if clipboardData is unavailable', async () => {
    const { editor, editable } = await mountEditor();
    const selection = editor.selection;
    await act(async () => {
      fireEvent.paste(editable);
    });

    expect(editor.children.map(Node.string)).toEqual(['abc', 'def', 'tail']);
    expect(editor.selection).toEqual(selection);
  });

  it('keeps the selection when files cannot be uploaded', async () => {
    const { editor, paste } = await mountEditor();
    const selection = editor.selection;
    await paste({}, [
      new File(['pdf'], 'document.pdf', { type: 'application/pdf' }),
    ]);

    expect(editor.children.map(Node.string)).toEqual(['abc', 'def', 'tail']);
    expect(editor.selection).toEqual(selection);
  });

  it('does not remove selected text while an upload is pending or fails', async () => {
    let finishUpload!: (urls: string[]) => void;
    const upload = vi.fn(
      () =>
        new Promise<string[]>((resolve) => {
          finishUpload = resolve;
        }),
    );
    const { editor, paste } = await mountEditor({ image: { upload } });
    const selection = editor.selection;
    await paste({}, [
      new File(['pdf'], 'document.pdf', { type: 'application/pdf' }),
    ]);
    expect(upload).toHaveBeenCalledOnce();
    expect(editor.children.map(Node.string)).toEqual(['abc', 'def', 'tail']);

    await act(async () => finishUpload([]));
    expect(editor.children.map(Node.string)).toEqual(['abc', 'def', 'tail']);
    expect(editor.selection).toEqual(selection);
  });

  it('replaces selected text after a successful file upload', async () => {
    const upload = vi
      .fn()
      .mockResolvedValue(['https://example.com/document.pdf']);
    const { editor, paste } = await mountEditor({ image: { upload } });
    await paste({}, [
      new File(['pdf'], 'document.pdf', { type: 'application/pdf' }),
    ]);

    expect(editor.children.map(Node.string).filter(Boolean)).toEqual([
      'af',
      'tail',
    ]);
    expect(
      Array.from(Node.elements(editor)).some(
        ([node]) =>
          node.type === 'attach' &&
          node.url === 'https://example.com/document.pdf',
      ),
    ).toBe(true);
  });

  it('replaces a tag range', async () => {
    const { editor, paste } = await mountEditor({
      initSchemaValue: [
        { type: 'paragraph', children: [{ text: 'abc', tag: true }] },
        { type: 'paragraph', children: [{ text: 'def' }] },
        { type: 'paragraph', children: [{ text: 'tail' }] },
      ],
    });
    await act(async () =>
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 2 },
      }),
    );
    await paste({ 'text/plain': 'X' });
    expect(Node.string(editor.children[0])).toBe('aXc');
  });

  it.each<MarkdownEditorProps>([
    { onPaste: () => false },
    { pasteConfig: { allowedTypes: ['text/html'] } },
  ])(
    'does not bypass interception or allowed types for a tag',
    async (props) => {
      const { editor, paste } = await mountEditor({
        ...props,
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'abc', tag: true }] },
          { type: 'paragraph', children: [{ text: 'def' }] },
        ],
      });
      await act(async () =>
        Transforms.select(editor, {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 2 },
        }),
      );
      await paste({ 'text/plain': 'X' });

      expect(editor.children.map(Node.string)).toEqual(['abc', 'def']);
    },
  );
});
