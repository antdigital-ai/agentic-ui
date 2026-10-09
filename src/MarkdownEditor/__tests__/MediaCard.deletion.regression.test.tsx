import { act, fireEvent, render, screen } from '@testing-library/react';
import { Modal } from 'antd';
import React from 'react';
import { Editor, Node, Range, Transforms } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import type { Elements, MediaNode } from '../el';
import type { MarkdownEditorInstance } from '../types';

const cases = [
  ['image', 'Backspace', 8, 'deleteBackward'],
  ['image', 'Delete', 46, 'deleteForward'],
  ['media', 'Backspace', 8, 'deleteBackward'],
  ['media', 'Delete', 46, 'deleteForward'],
] as const;

const media = (type: 'image' | 'media', name = 'target'): MediaNode => ({
  type,
  mediaType: type === 'image' ? 'image' : 'video',
  url: `https://cdn.example/${name}.${type === 'image' ? 'png' : 'mp4'}`,
  children: [{ text: '' }],
});

const mountMedia = async (
  type: 'image' | 'media',
  keepCardContents = false,
  hiddenText = '',
) => {
  const editorRef = React.createRef<MarkdownEditorInstance>();
  const selectedMedia = { ...media(type), children: [{ text: hiddenText }] };
  const contents: Elements[] = keepCardContents
    ? [
        { type: 'paragraph', children: [{ text: 'keep before' }] },
        selectedMedia,
        media('image', 'keep-image'),
        { type: 'paragraph', children: [{ text: 'keep after' }] },
      ]
    : [selectedMedia];
  const schema: Elements[] = [
    {
      type: 'card',
      children: [
        { type: 'card-before', children: [{ text: '' }] },
        ...contents,
        { type: 'card-after', children: [{ text: '' }] },
      ],
    },
    { type: 'paragraph', children: [{ text: 'outside card' }] },
  ];
  const view = render(
    <BaseMarkdownEditorSlate
      initSchemaValue={schema}
      editorRef={editorRef}
      toc={false}
    />,
  );
  const editor = editorRef.current!.markdownEditorRef.current;
  await act(async () =>
    Transforms.select(editor, {
      path: [0, keepCardContents ? 2 : 1, 0],
      offset: 0,
    }),
  );
  const before = JSON.parse(JSON.stringify(editor.children));
  const editable = view.container.querySelector('[data-slate-editor]')!;
  return { ...view, editor, editorRef, before, editable };
};

afterEach(() => vi.restoreAllMocks());

describe('deleting selected media inside a card', () => {
  it.each(cases)(
    '%s %s removes the empty card, keeps a visible caret and supports typing and undo',
    async (type, key, keyCode) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { editor, editorRef, editable, before } = await mountMedia(type);
      await act(async () =>
        fireEvent.keyDown(editable, {
          key,
          code: key,
          keyCode,
          which: keyCode,
        }),
      );

      expect(error).not.toHaveBeenCalled();
      expect(editor.children.some((node) => node.type === 'card')).toBe(false);
      expect(editor.children.map(Node.string)).toContain('outside card');
      expect(Editor.hasPath(editor, editor.selection!.focus.path)).toBe(true);
      const afterDelete = JSON.parse(JSON.stringify(editor.children));
      await act(async () => editor.insertText('continued'));
      expect(editorRef.current!.store.getMDContent()).toContain('continued');

      await act(async () => editor.undo());
      expect(editor.children).toEqual(afterDelete);
      await act(async () => editor.undo());
      expect(editor.children).toEqual(before);
      expect(error).not.toHaveBeenCalled();
    },
  );

  it.each(cases)(
    '%s %s preserves the other content of the same card and restores it with undo',
    async (type, key, keyCode) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { editor, editorRef, editable, before } = await mountMedia(
        type,
        true,
      );
      await act(async () =>
        fireEvent.keyDown(editable, {
          key,
          code: key,
          keyCode,
          which: keyCode,
        }),
      );

      const markdown = editorRef.current!.store.getMDContent();
      expect(markdown).not.toContain('/target.');
      expect(markdown).toContain('keep before');
      expect(markdown).toContain('keep after');
      expect(markdown).toContain('keep-image.png');
      expect(editor.children[0].type).toBe('card');
      expect(Editor.hasPath(editor, editor.selection!.focus.path)).toBe(true);
      const afterDelete = JSON.parse(JSON.stringify(editor.children));
      await act(async () => editor.insertText('continued'));
      expect(editorRef.current!.store.getMDContent()).toContain('continued');

      await act(async () => editor.undo());
      expect(editor.children).toEqual(afterDelete);
      await act(async () => editor.undo());
      expect(editor.children).toEqual(before);
      expect(error).not.toHaveBeenCalled();
    },
  );

  it.each(cases)(
    '%s %s uses the same safe deletion through the Slate editor API',
    async (type, _key, _keyCode, method) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { editor, before } = await mountMedia(type);
      await act(async () => editor[method]('character'));

      expect(editor.children.some((node) => node.type === 'card')).toBe(false);
      expect(Editor.hasPath(editor, editor.selection!.focus.path)).toBe(true);
      await act(async () => editor.undo());
      expect(editor.children).toEqual(before);
      expect(error).not.toHaveBeenCalled();
    },
  );

  it.each(cases)(
    '%s mouse selection stays collapsed with legacy hidden text before Enter and %s',
    async (type, key, keyCode) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { editor, editable, container, before } = await mountMedia(
        type,
        false,
        'legacy hidden text',
      );
      fireEvent.mouseDown(container.querySelector(`[data-be="${type}"]`)!, {
        button: 0,
      });
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(editor.selection!.anchor.offset).toBe(0);
      await act(async () =>
        fireEvent.keyDown(editable, {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
        }),
      );
      expect(editor.children[0].children[1]).toMatchObject({
        type,
        children: [{ text: 'legacy hidden text' }],
      });
      expect(editor.selection!.focus.path).toEqual([1, 0]);
      await act(async () => editor.undo());
      await act(async () =>
        fireEvent.keyDown(editable, {
          key,
          code: key,
          keyCode,
          which: keyCode,
        }),
      );
      expect(editor.children.some((node) => node.type === 'card')).toBe(false);
      await act(async () => editor.undo());
      expect(editor.children).toEqual(before);
      expect(error).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['image', false],
    ['image', true],
    ['media', false],
    ['media', true],
  ] as const)(
    '%s toolbar deletion preserves other content=%s and restores the complete card with one undo',
    async (type, keepCardContents) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const confirm = vi.spyOn(Modal, 'confirm').mockReturnValue({
        destroy: vi.fn(),
        update: vi.fn(),
      });
      const { editor, editorRef, container, before } = await mountMedia(
        type,
        keepCardContents,
      );
      const toolbarTarget = container.querySelector(
        `[data-be="${type}"] [data-be="media-container"]`,
      )!;
      fireEvent.mouseEnter(toolbarTarget);
      fireEvent.click(
        await screen.findByRole('button', { name: /删除|Delete/ }),
      );
      const onOk = confirm.mock.calls[0][0].onOk!;
      // A dialog can outlive the selection which opened it.
      await act(async () =>
        Transforms.select(editor, { path: [1, 0], offset: 0 }),
      );
      await act(async () => onOk());

      expect(editorRef.current!.store.getMDContent()).not.toContain('/target.');
      expect(editor.children.some((node) => node.type === 'card')).toBe(
        keepCardContents,
      );
      if (keepCardContents) {
        const markdown = editorRef.current!.store.getMDContent();
        expect(markdown).toContain('keep before');
        expect(markdown).toContain('keep after');
        expect(markdown).toContain('keep-image.png');
      }
      expect(Editor.hasPath(editor, editor.selection!.focus.path)).toBe(true);
      await act(async () => editor.undo());
      expect(editor.children).toEqual(before);
      expect(error).not.toHaveBeenCalled();
    },
  );
});
