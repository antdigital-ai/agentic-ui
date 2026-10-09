import { act, createEvent, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Editor, Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import type { Elements } from '../el';
import type { MarkdownEditorPlugin } from '../plugin';
import type { MarkdownEditorInstance } from '../types';

const mediaTypes = ['image', 'media', 'attach'] as const;
type MediaType = (typeof mediaTypes)[number];
const media = (type: MediaType, name = 'target'): Elements => ({
  type,
  mediaType: type === 'image' ? 'image' : 'video',
  url: `https://cdn.example/${name}.${type === 'image' ? 'png' : 'mp4'}`,
  name,
  size: 12,
  width: 240,
  height: 120,
  children: [{ text: 'legacy hidden text' }],
});

const clipboard = (write?: (type: string) => void) => {
  const data: Record<string, string> = {};
  return {
    data,
    types: [] as string[],
    clearData: () => {
      for (const key of Object.keys(data)) delete data[key];
    },
    getData: (type: string) => data[type] || '',
    setData: (type: string, value: string) => {
      write?.(type);
      data[type] = value;
    },
  };
};

const mountMedia = async (
  type: MediaType,
  options: {
    multiple?: boolean;
    readonly?: boolean;
    plugins?: MarkdownEditorPlugin[];
  } = {},
) => {
  const editorRef = React.createRef<MarkdownEditorInstance>();
  const contents: Elements[] = options.multiple
    ? [
        media(type),
        { type: 'paragraph', children: [{ text: 'keep content' }] },
        media('image', 'keep-image'),
      ]
    : [media(type)];
  const schema: Elements[] = [
    {
      type: 'card',
      children: [
        { type: 'card-before', children: [{ text: '' }] },
        ...contents,
        { type: 'card-after', children: [{ text: '' }] },
      ],
    },
    { type: 'paragraph', children: [{ text: 'outside' }] },
  ];
  const view = render(
    <BaseMarkdownEditorSlate
      initSchemaValue={schema}
      editorRef={editorRef}
      readonly={options.readonly}
      plugins={options.plugins}
      toc={false}
    />,
  );
  const editor = editorRef.current!.markdownEditorRef.current;
  await act(async () =>
    Transforms.select(editor, { path: [0, 1, 0], offset: 0 }),
  );
  window.getSelection()?.removeAllRanges();
  return {
    ...view,
    editor,
    editorRef,
    editable: view.container.querySelector('[data-slate-editor]')!,
    before: JSON.parse(JSON.stringify(editor.children)) as Elements[],
  };
};

afterEach(() => vi.restoreAllMocks());

describe('selected media clipboard operations', () => {
  it.each(mediaTypes)(
    'copies the complete %s node and portable text with a collapsed hidden selection',
    async (type) => {
      const { editor, editable, before } = await mountMedia(type);
      const data = clipboard();
      await act(async () => fireEvent.copy(editable, { clipboardData: data }));
      const fragment = JSON.parse(data.data['application/x-slate-md-fragment']);
      expect(fragment).toEqual([before[0].children[1]]);
      expect(
        JSON.parse(
          decodeURIComponent(
            window.atob(data.data['application/x-slate-fragment']),
          ),
        ),
      ).toEqual(fragment);
      expect(data.data['text/plain']).toBe(data.data['text/markdown']);
      expect(data.data['text/plain']).toContain('/target.');
      expect(data.data['text/html']).toContain('data-slate-fragment=');
      expect(editor.children).toEqual(before);
      expect(editor.selection!.anchor.path).toEqual([0, 1, 0]);
    },
  );

  it.each(mediaTypes)(
    'pastes a copied %s node with its full dimensions and metadata',
    async (type) => {
      const { editor, editable } = await mountMedia(type);
      const data = clipboard();
      await act(async () => fireEvent.copy(editable, { clipboardData: data }));
      await act(async () =>
        Transforms.select(editor, { path: [1, 0], offset: 0 }),
      );
      await act(async () =>
        fireEvent.paste(editable, {
          clipboardData: { ...data, types: Object.keys(data.data), files: [] },
        }),
      );
      const copied = [...Node.elements(editor)]
        .map(([node]) => node)
        .filter((node) => 'url' in node && node.url === media(type).url);
      expect(copied).toHaveLength(2);
      expect(copied[1]).toMatchObject({
        width: 240,
        height: 120,
        name: 'target',
        size: 12,
      });
    },
  );

  it.each(mediaTypes)(
    'cuts %s without an empty card, allows typing and restores it with one undo',
    async (type) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { editor, editorRef, editable, before } = await mountMedia(type);
      const data = clipboard();
      await act(async () => fireEvent.cut(editable, { clipboardData: data }));
      expect(data.data['text/plain']).toContain('/target.');
      expect(editor.children.some((node) => node.type === 'card')).toBe(false);
      expect(Editor.hasPath(editor, editor.selection!.focus.path)).toBe(true);
      const afterCut = JSON.parse(JSON.stringify(editor.children));
      await act(async () => editor.insertText('continued'));
      expect(editorRef.current!.store.getMDContent()).toContain('continued');
      await act(async () => editor.undo());
      expect(editor.children).toEqual(afterCut);
      await act(async () => editor.undo());
      expect(editor.children).toEqual(before);
      expect(error).not.toHaveBeenCalled();
    },
  );

  it.each(mediaTypes)(
    'cuts only selected %s while preserving its card siblings and undo',
    async (type) => {
      const { editor, editorRef, editable, before } = await mountMedia(type, {
        multiple: true,
      });
      await act(async () =>
        fireEvent.cut(editable, { clipboardData: clipboard() }),
      );
      const markdown = editorRef.current!.store.getMDContent();
      expect(markdown).not.toContain('/target.');
      expect(markdown).toContain('keep content');
      expect(markdown).toContain('keep-image.png');
      await act(async () => editor.undo());
      expect(editor.children).toEqual(before);
    },
  );

  it.each(mediaTypes)(
    'waits for the actual clipboard event before cutting %s from a keyboard shortcut',
    async (type) => {
      const { editor, editable, before } = await mountMedia(type);
      await act(async () =>
        fireEvent.keyDown(editable, {
          key: 'x',
          code: 'KeyX',
          keyCode: 88,
          which: 88,
          ctrlKey: true,
        }),
      );
      expect(editor.children).toEqual(before);
      await act(async () =>
        fireEvent.cut(editable, { clipboardData: clipboard() }),
      );
      expect(editor.children.some((node) => node.type === 'card')).toBe(false);
      await act(async () => editor.undo());
      expect(editor.children).toEqual(before);
    },
  );

  it.each(mediaTypes)(
    'keeps %s intact when a clipboard write fails',
    async (type) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const { editor, editable, before } = await mountMedia(type);
      const event = createEvent.cut(editable, {
        clipboardData: clipboard((mime) => {
          if (mime === 'text/plain') throw new Error('clipboard denied');
        }),
      });
      await act(async () => fireEvent(editable, event));
      expect(event.defaultPrevented).toBe(true);
      expect(editor.children).toEqual(before);
      expect(editor.selection!.anchor.path).toEqual([0, 1, 0]);
    },
  );

  it.each(mediaTypes)('honors an already prevented %s cut', async (type) => {
    const { editor, editable, before } = await mountMedia(type);
    const data = clipboard();
    const event = createEvent.cut(editable, { clipboardData: data });
    event.preventDefault();
    await act(async () => fireEvent(editable, event));
    expect(data.data).toEqual({});
    expect(editor.children).toEqual(before);
  });

  it.each(mediaTypes)(
    'allows readonly %s copy and prevents readonly cut',
    async (type) => {
      const { editor, editable, before } = await mountMedia(type, {
        readonly: true,
      });
      const data = clipboard();
      await act(async () => fireEvent.copy(editable, { clipboardData: data }));
      expect(data.data['text/plain']).toContain('/target.');
      await act(async () =>
        fireEvent.cut(editable, { clipboardData: clipboard() }),
      );
      expect(editor.children).toEqual(before);
    },
  );

  it('uses the latest runtime serialization plugins for the selected media', async () => {
    const plugin = (language: string): MarkdownEditorPlugin => ({
      toMarkdown: [
        {
          match: (node) => node.type === 'image',
          convert: () => ({
            type: 'code',
            lang: language,
            value: 'custom media data',
          }),
        },
      ],
    });
    const { editorRef, editable } = await mountMedia('image', {
      plugins: [plugin('old')],
    });
    editorRef.current!.store.setRuntimeConfig({ plugins: [plugin('latest')] });
    const data = clipboard();
    await act(async () => fireEvent.copy(editable, { clipboardData: data }));
    expect(data.data['text/plain']).toBe('```latest\ncustom media data\n```');
  });

  it('follows a moved media path while the clipboard is being written', async () => {
    const { editor, editorRef, editable } = await mountMedia('image');
    const data = clipboard((mime) => {
      if (mime === 'text/html')
        Transforms.moveNodes(editor, { at: [0], to: [1] });
    });
    await act(async () => fireEvent.cut(editable, { clipboardData: data }));
    expect(editorRef.current!.store.getMDContent()).not.toContain('/target.');
    expect(editor.children.map(Node.string)).toContain('outside');
    expect(Editor.hasPath(editor, editor.selection!.focus.path)).toBe(true);
  });

  it('does not delete a different media which reuses the original path during clipboard writes', async () => {
    const { editor, editorRef, editable } = await mountMedia('image');
    const data = clipboard((mime) => {
      if (mime !== 'text/html') return;
      Editor.withoutNormalizing(editor, () => {
        Transforms.removeNodes(editor, { at: [0, 1] });
        Transforms.insertNodes(editor, media('image', 'replacement'), {
          at: [0, 1],
        });
      });
    });
    await act(async () => fireEvent.cut(editable, { clipboardData: data }));
    expect(data.data['text/plain']).toContain('/target.');
    expect(editorRef.current!.store.getMDContent()).toContain(
      '/replacement.png',
    );
  });

  it('keeps ordinary DOM text copy and cut behavior', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const { container } = render(
      <BaseMarkdownEditorSlate
        editorRef={editorRef}
        initSchemaValue={[
          { type: 'paragraph', children: [{ text: 'copy text' }] },
        ]}
        toc={false}
      />,
    );
    const editor = editorRef.current!.markdownEditorRef.current;
    const editable = container.querySelector('[data-slate-editor]')!;
    await act(async () =>
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      }),
    );
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(ReactEditor.toDOMRange(editor, editor.selection!));
    const data = clipboard();
    await act(async () => fireEvent.copy(editable, { clipboardData: data }));
    expect(data.data['text/plain'].trimEnd()).toBe('copy');
    await act(async () => fireEvent.cut(editable, { clipboardData: data }));
    expect(editorRef.current!.store.getMDContent()).toBe(' text');
    await act(async () => editor.undo());
    expect(Node.string(editor.children[0])).toBe('copy text');
  });
});
