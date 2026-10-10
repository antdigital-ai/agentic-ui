import { act, render } from '@testing-library/react';
import React, { Profiler } from 'react';
import { Transforms } from 'slate';
import { describe, expect, it } from 'vitest';
import BaseMarkdownEditorSlate from '../../../../BaseMarkdownEditorSlate';
import { Elements } from '../../../../el';
import { MarkdownEditorInstance, MarkdownEditorProps } from '../../../../types';
import { EditorUtils } from '../../../utils/editorUtils';

describe('card selection isolation', () => {
  it('updates only the old and new selected cards without FloatBar tracking', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const commits = new Set<string>();
    const schema: Elements[] = Array.from({ length: 30 }, (_, index) =>
      EditorUtils.wrapperCardNode(
        {
          type: 'media',
          mediaType: 'video',
          url: `https://example.com/${index}.mp4`,
          children: [{ text: '' }],
        },
        { id: String(index) },
      ),
    );
    const eleItemRender: MarkdownEditorProps['eleItemRender'] = (props, dom) =>
      props.element.type === 'card' ? (
        <Profiler
          id={String(props.element.id)}
          onRender={(id) => commits.add(id)}
        >
          {dom}
        </Profiler>
      ) : (
        dom
      );
    const { container } = render(
      <BaseMarkdownEditorSlate
        editorRef={editorRef}
        initSchemaValue={schema}
        eleItemRender={eleItemRender}
        toc={false}
        floatBar={{ enable: false }}
      />,
    );
    const editor = editorRef.current!.markdownEditorRef.current;
    const cards = Array.from(container.querySelectorAll('[data-be="card"]'));
    await act(async () => {
      Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
    });
    expect(cards[0]).toHaveAttribute('aria-selected', 'true');
    commits.clear();

    await act(async () => {
      Transforms.select(editor, { path: [1, 0, 0], offset: 0 });
    });

    expect(cards[0]).toHaveAttribute('aria-selected', 'false');
    expect(cards[1]).toHaveAttribute('aria-selected', 'true');
    expect(commits).toEqual(new Set(['0', '1']));
  });
});
