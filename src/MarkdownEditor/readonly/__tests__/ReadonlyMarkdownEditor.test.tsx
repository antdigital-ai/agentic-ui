import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { BaseMarkdownEditor } from '../../BaseMarkdownEditor';
import { findByPathAndText } from '../../editor/utils/editorUtils';
import { applyReadonlyCommentHighlights } from '../applyReadonlyCommentHighlights';
import { READONLY_MARKDOWN_CONTAINER_KEY } from '../findTextInReadonlyMarkdownDom';
import { ReadonlyMarkdownEditorStore } from '../ReadonlyMarkdownEditorStore';

describe('ReadonlyMarkdownEditorStore', () => {
  it('findByPathAndText 与 findByPathAndText(editor) 在只读 DOM 上可用', () => {
    const container = document.createElement('div');
    container.innerHTML =
      '<div data-be="paragraph">Hello readonly markdown</div>';

    const store = new ReadonlyMarkdownEditorStore({
      getContent: () => 'Hello readonly markdown',
      getContainer: () => container,
    });

    const viaStore = store.findByPathAndText([], 'readonly', { maxResults: 1 });
    expect(viaStore.length).toBeGreaterThan(0);

    const viaEditor = findByPathAndText(store.editor as any, [], 'readonly', {
      maxResults: 1,
    });
    expect(viaEditor.length).toBeGreaterThan(0);
    expect((viaEditor[0] as any).matchedText).toContain('readonly');
  });

  it('editor 携带 READONLY_MARKDOWN_CONTAINER_KEY', () => {
    const container = document.createElement('div');
    const store = new ReadonlyMarkdownEditorStore({
      getContent: () => '',
      getContainer: () => container,
    });
    expect(store.editor[READONLY_MARKDOWN_CONTAINER_KEY]).toBe(container);
  });
});

describe('applyReadonlyCommentHighlights', () => {
  it('wraps refContent with comment id for jump target', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<div data-be="paragraph">Highlight me in markdown mode.</div>';
    document.body.appendChild(root);

    applyReadonlyCommentHighlights(
      root,
      [
        {
          id: 'c1',
          commentType: 'highlight',
          content: 'note',
          refContent: 'Highlight me',
          time: Date.now(),
          path: [],
          anchorOffset: 0,
          focusOffset: 12,
          selection: null as any,
        },
      ],
      'ant-agentic-md-editor-content',
    );

    const mark = document.getElementById('comment-c1');
    expect(mark).toBeTruthy();
    expect(mark?.tagName).toBe('MARK');
    expect(mark?.className).toContain('comment-highlight');
    document.body.removeChild(root);
  });

  it('falls back to refContent when the persisted block path is stale', () => {
    const root = document.createElement('div');
    root.innerHTML = [
      '<div data-be="paragraph">Unrelated first block.</div>',
      '<div data-be="paragraph">Recovered comment anchor lives here.</div>',
    ].join('');
    document.body.appendChild(root);

    applyReadonlyCommentHighlights(
      root,
      [
        {
          id: 'stale-path',
          commentType: 'highlight',
          content: 'note',
          refContent: 'Recovered comment anchor',
          time: Date.now(),
          path: [0],
          anchorOffset: 0,
          focusOffset: 24,
          selection: null as any,
        },
      ],
      'ant-agentic-md-editor-content',
    );

    const mark = document.getElementById('comment-stale-path');
    expect(mark).toBeTruthy();
    expect(mark?.textContent).toBe('Recovered comment anchor');
    expect(root.children[0].querySelector('mark')).toBeNull();
    expect(root.children[1].querySelector('mark')).toBe(mark);
    document.body.removeChild(root);
  });
});

describe('ReadonlyMarkdownEditorView comment', () => {
  it('renderMode=markdown 时根据 refContent 高亮评论锚点', async () => {
    const md = '# Title\n\nHighlight me in markdown mode.';

    render(
      <BaseMarkdownEditor
        readonly
        renderMode="markdown"
        initValue={md}
        comment={{
          enable: true,
          commentList: [
            {
              id: 'c1',
              commentType: 'highlight',
              content: 'note',
              refContent: 'Highlight me',
              time: Date.now(),
              path: [1],
              anchorOffset: 0,
              focusOffset: 12,
              selection: null as any,
            },
          ],
        }}
      />,
    );

    await waitFor(() => {
      expect(document.getElementById('comment-c1')).toBeTruthy();
    });

    const mark = document.getElementById('comment-c1');
    expect(mark?.getAttribute('data-be')).toBe('comment-text');
    expect(mark?.tagName).toBe('MARK');
    expect(mark?.className).toContain('comment-highlight');
    expect(mark?.textContent).toContain('Highlight');
  });
});

describe('ReadonlyMarkdownEditorView editorRef', () => {
  it('renderMode=markdown 时 editorRef 提供 store 与 getDisplayedContent', async () => {
    const ref = React.createRef<any>();
    const md = 'editor ref content';

    render(
      <BaseMarkdownEditor
        readonly
        renderMode="markdown"
        initValue={md}
        editorRef={ref}
      />,
    );

    await waitFor(() => {
      expect(ref.current?.store?.getMDContent()).toBe(md);
    });
    expect(ref.current?.getDisplayedContent?.()).toBe(md);
    expect(ref.current?.markdownContainerRef?.current).toBeTruthy();
  });
});
