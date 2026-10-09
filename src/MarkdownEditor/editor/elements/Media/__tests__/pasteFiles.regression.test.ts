import { Editor, Element, Node, Transforms } from 'slate';
import { expect, it, vi } from 'vitest';
import { createTestMarkdownEditor } from '../../../__tests__/helpers/createTestMarkdownEditor';
import {
  handleFilesPaste,
  handleHttpLinkPaste,
} from '../../../plugins/handlePaste';

const createFixture = () => {
  const editor = createTestMarkdownEditor();
  editor.children = [
    { type: 'paragraph', children: [{ text: 'abc' }] },
    { type: 'paragraph', children: [{ text: 'def' }] },
    { type: 'paragraph', children: [{ text: 'tail' }] },
  ];
  Transforms.select(editor, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  });
  const files = [
    new File(['first'], 'first.pdf', { type: 'application/pdf' }),
    new File(['second'], 'second.pdf', { type: 'application/pdf' }),
  ];
  const clipboard = { files } as unknown as DataTransfer;
  const attachments = () =>
    Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (node) => Element.isElement(node) && node.type === 'attach',
      }),
    ).map(([node]) => node);
  return { editor, clipboard, attachments };
};

it('inserts uploaded files in clipboard order with one batch', async () => {
  const { editor, clipboard, attachments } = createFixture();
  const result = await handleFilesPaste(editor, clipboard, {
    image: {
      upload: async () => [
        'https://example.com/first.pdf',
        'https://example.com/second.pdf',
      ],
    },
  });

  expect(result).toBe(true);
  expect(attachments().map((node) => node.name)).toEqual([
    'first.pdf',
    'second.pdf',
  ]);
  expect(editor.children.map(Node.string).filter(Boolean)).toEqual([
    'af',
    'tail',
  ]);
  expect(Editor.rangeRefs(editor).size).toBe(0);
});

it('pairs partial upload results with the original file index', async () => {
  const { editor, attachments } = createFixture();
  const files = [
    new File(['image'], 'first.png', { type: 'image/png' }),
    new File(['pdf'], 'second.pdf', { type: 'application/pdf' }),
  ];
  await handleFilesPaste(editor, { files } as unknown as DataTransfer, {
    image: { upload: async () => ['', 'https://example.com/second.pdf'] },
  });

  expect(attachments()).toHaveLength(1);
  expect(attachments()[0]).toMatchObject({
    type: 'attach',
    name: 'second.pdf',
    url: 'https://example.com/second.pdf',
  });
});

it('tracks the paste range when siblings move and the user moves their cursor during upload', async () => {
  const { editor, clipboard, attachments } = createFixture();
  let finishUpload!: (urls: string[]) => void;
  const pending = handleFilesPaste(editor, clipboard, {
    image: {
      upload: () =>
        new Promise<string[]>((resolve) => {
          finishUpload = resolve;
        }),
    },
  });
  Transforms.insertNodes(
    editor,
    { type: 'paragraph', children: [{ text: 'new sibling' }] },
    { at: [0] },
  );
  Transforms.select(editor, Editor.end(editor, [3]));
  finishUpload(['https://example.com/first.pdf']);
  await pending;

  expect(editor.children.map(Node.string).filter(Boolean)).toEqual([
    'new sibling',
    'af',
    'tail',
  ]);
  expect(attachments()).toHaveLength(1);
  expect(Editor.rangeRefs(editor).size).toBe(0);
});

it('keeps the current document if the upload range was removed', async () => {
  const { editor, clipboard, attachments } = createFixture();
  let finishUpload!: (urls: string[]) => void;
  const pending = handleFilesPaste(editor, clipboard, {
    image: {
      upload: () =>
        new Promise<string[]>((resolve) => {
          finishUpload = resolve;
        }),
    },
  });
  Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, { at: [1] });
    Transforms.removeNodes(editor, { at: [0] });
  });
  finishUpload(['https://example.com/first.pdf']);

  expect(await pending).toBe(false);
  expect(editor.children.map(Node.string)).toEqual(['tail']);
  expect(attachments()).toHaveLength(0);
  expect(Editor.rangeRefs(editor).size).toBe(0);
});

it.each([
  ['mp3', 'audio'],
  ['mp4', 'video'],
])('preserves the media type for a pasted %s URL', (extension, mediaType) => {
  const { editor } = createFixture();
  const handled = handleHttpLinkPaste(
    editor,
    `https://example.com/clip.${extension}`,
    editor.selection,
    { insertLink: vi.fn() },
  );

  expect(handled).toBe(true);
  const [media] = Editor.nodes(editor, {
    at: [],
    match: (node) => Element.isElement(node) && node.type === 'media',
  });
  expect(media[0]).toMatchObject({
    mediaType,
    url: `https://example.com/clip.${extension}`,
  });
  expect(editor.children.map(Node.string).filter(Boolean)).toEqual([
    'a',
    'f',
    'tail',
  ]);
});
