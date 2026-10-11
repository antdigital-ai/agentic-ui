import { act, render } from '@testing-library/react';
import React from 'react';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../../../../BaseMarkdownEditorSlate';
import { Elements, LinkCardNode } from '../../../../el';
import { MarkdownEditorInstance } from '../../../../types';
import { AvatarList } from '../../../components/ContributorAvatar';
import { EditorUtils } from '../../../utils/editorUtils';
import { LinkCard } from '../index';
import { ReadonlyLinkCard } from '../ReadonlyLinkCard';

vi.mock('../../../components/ContributorAvatar', () => ({
  AvatarList: vi.fn(() => <span data-testid="collaborators">Avatars</span>),
}));

const node: LinkCardNode<{
  url: string;
  collaborators: Record<string, number>[];
  updateTime: string;
}> = {
  type: 'link-card',
  url: 'https://example.com/link',
  title: 'A link',
  alt: 'Link',
  children: [{ text: '' }],
};

describe.each([LinkCard, ReadonlyLinkCard])(
  '%s body isolation',
  (Component) => {
    it('skips metadata rendering on Slate child updates and honors metadata changes', () => {
      const element = {
        ...node,
        otherProps: {
          url: node.url!,
          collaborators: [{ Alice: 1 }],
          updateTime: 'Today',
        },
      };
      const view = (current: typeof element, leaf: string) => (
        <Component
          element={current}
          attributes={{ 'data-slate-node': 'element', ref: () => {} }}
        >
          {[<span key="before">{leaf}</span>, <span key="after" />]}
        </Component>
      );
      const { rerender, getByText } = render(view(element, 'Before'));
      vi.mocked(AvatarList).mockClear();

      rerender(
        view({ ...element, children: [{ text: 'New leaf' }] }, 'New leaf'),
      );

      expect(AvatarList).not.toHaveBeenCalled();
      expect(getByText('New leaf')).toBeInTheDocument();

      rerender(view({ ...element, title: 'Updated link' }, 'New leaf'));

      expect(AvatarList).toHaveBeenCalledTimes(1);
      expect(getByText('Updated link')).toHaveAttribute('href', element.url);
    });

    it('uses seven DOM elements per card without empty metadata wrappers', () => {
      const { container } = render(
        <>
          {Array.from({ length: 50 }, (_, index) => (
            <Component
              key={index}
              element={node}
              attributes={{ 'data-slate-node': 'element', ref: () => {} }}
            >
              {[null, null]}
            </Component>
          ))}
        </>,
      );
      const surfaces = container.querySelectorAll('[data-be="link-card"]');

      expect(surfaces).toHaveLength(50);
      expect(container.querySelectorAll('*')).toHaveLength(350);
      expect(
        Array.from(surfaces).every((surface) =>
          surface.hasAttribute('data-slate-node'),
        ),
      ).toBe(true);
      expect(container.querySelector('[class*="__collaborators"]')).toBeNull();
    });
  },
);

it.each([false, true])(
  'retains real Slate DOM mappings and editable boundaries with readonly=%s',
  async (readonly) => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const schema: Elements[] = [
      EditorUtils.wrapperCardNode(node),
      { type: 'paragraph', children: [{ text: 'After' }] },
    ];
    const { container } = render(
      <BaseMarkdownEditorSlate
        editorRef={editorRef}
        initSchemaValue={schema}
        readonly={readonly}
        toc={false}
        floatBar={{ enable: false }}
      />,
    );
    const editor = editorRef.current!.markdownEditorRef.current;
    const element = editor.children[0].children[1];
    const surface = container.querySelector('[data-be="link-card"]')!;

    expect(ReactEditor.toDOMNode(editor, element)).toBe(surface);
    expect(ReactEditor.toSlateNode(editor, surface)).toBe(element);
    const [text] = ReactEditor.toDOMPoint(editor, {
      path: [0, 1, 0],
      offset: 0,
    });
    expect(surface.contains(text)).toBe(true);

    if (!readonly) {
      await act(async () => {
        Transforms.select(editor, { path: [1, 0], offset: 5 });
        Transforms.insertText(editor, '!');
      });
      expect(container.querySelector('[data-be="link-card"]')).toBe(surface);
      expect(editor.children[1].children[0].text).toBe('After!');
    }
  },
);
