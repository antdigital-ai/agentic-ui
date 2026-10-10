import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { describe, expect, it } from 'vitest';
import BaseMarkdownEditorSlate from '../../../../BaseMarkdownEditorSlate';
import type { Elements, MediaNode } from '../../../../el';
import type { MarkdownEditorInstance } from '../../../../types';
import { EditorUtils } from '../../../utils/editorUtils';

describe('media DOM budget', () => {
  it.each([false, true])(
    'keeps Slate media attributes on the media surface with readonly=%s',
    (readonly) => {
      const editorRef = React.createRef<MarkdownEditorInstance>();
      const schema: Elements[] = Array.from({ length: 50 }, (_, index) =>
        EditorUtils.wrapperCardNode({
          type: 'media',
          mediaType: 'video',
          url: `https://example.com/${index}.mp4`,
          children: [{ text: '' }],
        }),
      );
      const { container, getAllByTestId } = render(
        <BaseMarkdownEditorSlate
          initSchemaValue={schema}
          editorRef={editorRef}
          readonly={readonly}
          toc={false}
          floatBar={{ enable: false }}
        />,
      );
      const surfaces = getAllByTestId('media-container');
      const roots = surfaces.map(
        (surface) => surface.closest('[data-slate-node="element"]')!,
      );
      expect(
        roots.reduce(
          (count, root) => count + 1 + root.querySelectorAll('*').length,
          0,
        ),
      ).toBeLessThanOrEqual(400);
      expect(surfaces).toHaveLength(50);
      expect(surfaces.every((surface, index) => surface === roots[index])).toBe(
        true,
      );
      expect(container.querySelectorAll('video')).toHaveLength(50);
      expect(
        Array.from(container.querySelectorAll('video')).every(
          (player) => player.preload === (readonly ? 'none' : 'metadata'),
        ),
      ).toBe(true);
      expect(
        roots.every(
          (root) =>
            root.querySelectorAll('[data-slate-node="text"]').length === 1,
        ),
      ).toBe(true);
      const editor = editorRef.current!.markdownEditorRef.current;
      for (let index = 0; index < 50; index++) {
        const media = editor.children[index].children[1];
        expect(ReactEditor.toDOMNode(editor, media)).toBe(surfaces[index]);
        expect(ReactEditor.toSlateNode(editor, surfaces[index])).toBe(media);
        const [textNode] = ReactEditor.toDOMPoint(editor, {
          path: [index, 1, 0],
          offset: 0,
        });
        expect(surfaces[index].contains(textNode)).toBe(true);
      }
    },
  );

  it('uses the existing Ant Design preview surface for readonly images', () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const schema: Elements[] = Array.from({ length: 50 }, (_, index) =>
      EditorUtils.wrapperCardNode({
        type: 'image',
        mediaType: 'image',
        url: `https://example.com/${index}.png`,
        children: [{ text: '' }],
      } as MediaNode),
    );
    const { container } = render(
      <BaseMarkdownEditorSlate
        initSchemaValue={schema}
        editorRef={editorRef}
        readonly
        toc={false}
        floatBar={{ enable: false }}
      />,
    );
    container.querySelectorAll('img').forEach((image) => fireEvent.load(image));
    const surfaces = container.querySelectorAll(
      '[data-be="image-container"][data-testid="image-container"]',
    );

    expect(surfaces).toHaveLength(50);
    expect(
      Array.from(surfaces).every((surface) =>
        surface.classList.contains('ant-image'),
      ),
    ).toBe(true);
    expect(
      container.querySelectorAll('[data-be="image"] [data-slate-node="text"]'),
    ).toHaveLength(50);
    const editor = editorRef.current!.markdownEditorRef.current;
    for (let index = 0; index < 50; index++) {
      const image = editor.children[index].children[1];
      const root = ReactEditor.toDOMNode(editor, image);
      expect(root.getAttribute('data-be')).toBe('image');
      expect(ReactEditor.toSlateNode(editor, root)).toBe(image);
      const [textNode] = ReactEditor.toDOMPoint(editor, {
        path: [index, 1, 0],
        offset: 0,
      });
      expect(root.contains(textNode)).toBe(true);
    }
  });

  it.each(['media', 'image'] as const)(
    'releases a closed %s toolbar while retaining its media DOM',
    async (type) => {
      const editorRef = React.createRef<MarkdownEditorInstance>();
      const schema: Elements[] = [
        EditorUtils.wrapperCardNode({
          type,
          mediaType: type === 'image' ? 'image' : 'video',
          url: `https://example.com/asset.${type === 'image' ? 'png' : 'mp4'}`,
          alt: 'Media toolbar sample',
          children: [{ text: '' }],
        } as MediaNode),
        { type: 'paragraph', children: [{ text: 'After media' }] },
      ];
      const { container } = render(
        <BaseMarkdownEditorSlate
          editorRef={editorRef}
          initSchemaValue={schema}
          toc={false}
          floatBar={{ enable: false }}
        />,
      );
      const editor = editorRef.current!.markdownEditorRef.current;
      const media = container.querySelector(
        type === 'image' ? 'img' : 'video',
      )!;
      if (type === 'image') fireEvent.load(media);
      await act(async () => {
        Transforms.select(editor, { path: [0, 1, 0], offset: 0 });
      });
      const trigger = container.querySelector('[data-be="media-container"]')!;
      fireEvent.mouseEnter(trigger);
      const deleteButton = await screen.findByRole('button', {
        name: /删除|Delete/,
      });
      const popup = deleteButton.closest('.ant-popover')!;
      fireEvent.mouseLeave(trigger);
      await waitFor(() => expect(popup.className).toContain('leave-active'));
      fireEvent.animationEnd(popup);
      fireEvent.transitionEnd(popup);
      await waitFor(() =>
        expect(
          screen.queryByRole('button', { name: /删除|Delete/ }),
        ).not.toBeInTheDocument(),
      );
      expect(container.querySelector(type === 'image' ? 'img' : 'video')).toBe(
        media,
      );
      expect(
        ReactEditor.toDOMNode(editor, editor.children[0].children[1]),
      ).toContainElement(media);
    },
  );
});
