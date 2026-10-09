import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Transforms } from 'slate';
import { describe, expect, it } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import type { Elements } from '../el';
import type { MarkdownEditorInstance } from '../types';

const createSchema = (): Elements[] => [
  {
    type: 'card',
    children: [
      { type: 'card-before', children: [{ text: '' }] },
      {
        type: 'media',
        mediaType: 'video',
        url: 'https://cdn.example/movie.mp4',
        alt: 'First video',
        width: 240,
        children: [{ text: '' }],
      },
      { type: 'card-after', children: [{ text: '' }] },
    ],
  },
  { type: 'paragraph', children: [{ text: 'after video' }] },
];

describe('media inside an editor card', () => {
  it.each(['image', 'media'] as const)(
    'typing after selecting %s inserts visible text after the card',
    async (type) => {
      const editorRef = React.createRef<MarkdownEditorInstance>();
      const schema = createSchema();
      schema[0].children[1].type = type;
      render(
        <BaseMarkdownEditorSlate
          initSchemaValue={schema}
          editorRef={editorRef}
          toc={false}
        />,
      );
      const editor = editorRef.current!.markdownEditorRef.current;
      await act(async () => {
        Transforms.select(editor, { path: [0, 1, 0], offset: 0 });
        editor.insertText('visible text');
      });
      expect(editor.children[0].children[1].children).toEqual([{ text: '' }]);
      expect(editor.children[1]).toMatchObject({
        type: 'paragraph',
        children: [{ text: 'visible text' }],
      });
      expect(editorRef.current!.store.getMDContent()).toContain('visible text');
    },
  );

  it.each(['image', 'media'] as const)(
    'Enter after selecting %s moves to a new paragraph after the card',
    async (type) => {
      const editorRef = React.createRef<MarkdownEditorInstance>();
      const schema = createSchema();
      schema[0].children[1].type = type;
      const { container } = render(
        <BaseMarkdownEditorSlate
          initSchemaValue={schema}
          editorRef={editorRef}
          toc={false}
        />,
      );
      const editor = editorRef.current!.markdownEditorRef.current;
      await act(async () => {
        Transforms.select(editor, { path: [0, 1, 0], offset: 0 });
      });
      fireEvent.keyDown(container.querySelector('[data-slate-editor]')!, {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
      });
      expect(editor.children[0].children).toHaveLength(3);
      expect(editor.children[1]).toMatchObject({
        type: 'paragraph',
        children: [{ text: '' }],
      });
      expect(editor.selection?.anchor.path).toEqual([1, 0]);
    },
  );

  it('reflects media edits through the card wrapper without remounting playback', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const view = render(
      <BaseMarkdownEditorSlate
        initSchemaValue={createSchema()}
        editorRef={editorRef}
        toc={false}
        floatBar={{ enable: false }}
      />,
    );
    const player = view.container.querySelector('video')!;
    expect(player).not.toBeNull();
    expect(player.style.width).toBe('240px');
    player.currentTime = 12;

    await act(async () => {
      Transforms.setNodes(
        editorRef.current!.markdownEditorRef.current,
        { width: 320, alt: 'Renamed video', controls: false },
        { at: [0, 1] },
      );
    });

    expect(view.container.querySelector('video')).toBe(player);
    expect(player.style.width).toBe('320px');
    expect(player.controls).toBe(false);
    expect(player.currentTime).toBe(12);
  });

  it('reflects media replacement and removal without changing the card block flag', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const view = render(
      <BaseMarkdownEditorSlate
        initSchemaValue={createSchema()}
        editorRef={editorRef}
        toc={false}
      />,
    );
    await act(async () => {
      Transforms.setNodes(
        editorRef.current!.markdownEditorRef.current,
        { url: 'https://cdn.example/replacement.mp4' },
        { at: [0, 1] },
      );
    });
    expect(view.container.querySelector('video')?.getAttribute('src')).toBe(
      'https://cdn.example/replacement.mp4',
    );

    await act(async () => {
      Transforms.removeNodes(editorRef.current!.markdownEditorRef.current, {
        at: [0, 1],
      });
    });
    expect(view.container.querySelector('video')).toBeNull();
    expect(view.getByText('after video')).toBeInTheDocument();
  });
});
