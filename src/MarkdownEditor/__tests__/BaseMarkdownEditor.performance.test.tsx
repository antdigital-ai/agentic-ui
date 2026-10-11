import { act, render, waitFor } from '@testing-library/react';
import React, { useContext } from 'react';
import { Node, Transforms } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import * as markdownParser from '../editor/parser/parserMdToSchema';
import { useEditorStore } from '../editor/store';
import type { ParagraphNode } from '../el';
import { PluginContext } from '../plugin';
import type { MarkdownEditorInstance } from '../types';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BaseMarkdownEditor editable lifecycle performance', () => {
  it('updates the TOC without waking unchanged runtime context subscribers', async () => {
    vi.useFakeTimers();
    try {
      const editorRef = React.createRef<MarkdownEditorInstance>();
      const renders = vi.fn();
      const Probe = React.memo(() => {
        const { editorProps } = useEditorStore();
        const plugins = useContext(PluginContext);
        renders({ editorProps, plugins });
        return (
          <span data-testid="context-placeholder">
            {editorProps.placeholder}
          </span>
        );
      });
      const children = <Probe />;
      const props = {
        initValue: '# Heading',
        editorRef,
        toc: true,
        floatBar: { enable: false },
        placeholder: 'first placeholder',
        children,
      };
      const view = render(<BaseMarkdownEditorSlate {...props} />);
      await act(async () => {});
      renders.mockClear();

      await act(async () => {
        Transforms.insertText(
          editorRef.current!.markdownEditorRef.current,
          '!',
          {
            at: { path: [0, 0], offset: 7 },
          },
        );
      });
      await act(() => vi.advanceTimersByTimeAsync(500));
      expect(
        view.container.querySelector('.ant-anchor-link-title'),
      ).toHaveTextContent('Heading!');
      expect(renders).not.toHaveBeenCalled();

      view.rerender(
        <BaseMarkdownEditorSlate {...props} placeholder="latest placeholder" />,
      );
      expect(view.getByTestId('context-placeholder')).toHaveTextContent(
        'latest placeholder',
      );
      expect(renders).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not reconstruct the editor or reparse editable input echoes', () => {
    const withEditor = vi.fn((editor) => editor);
    const plugins = [{ withEditor }];
    const parse = vi.spyOn(markdownParser, 'parserMdToSchema');
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="hello" plugins={plugins} />,
    );
    const initialParseCount = parse.mock.calls.length;
    const initialEditorCount = withEditor.mock.calls.length;

    expect(initialParseCount).toBeGreaterThan(0);
    expect(initialEditorCount).toBe(1);
    rerender(
      <BaseMarkdownEditorSlate
        initValue="hello edited"
        plugins={plugins}
        className="updated"
      />,
    );

    expect(parse).toHaveBeenCalledTimes(initialParseCount);
    expect(withEditor).toHaveBeenCalledTimes(initialEditorCount);
  });

  it('uses the supplied initial schema without parsing unused Markdown', () => {
    const parse = vi.spyOn(markdownParser, 'parserMdToSchema');
    const schema: ParagraphNode[] = [
      { type: 'paragraph', children: [{ text: 'schema content' }] },
    ];
    const { getByText } = render(
      <BaseMarkdownEditorSlate
        initValue="unused markdown"
        initSchemaValue={schema}
      />,
    );

    expect(getByText('schema content')).toBeInTheDocument();
    expect(parse).not.toHaveBeenCalled();
  });

  it('preserves an edited draft when only readonly changes', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="original" editorRef={editorRef} />,
    );
    await act(async () => {
      await editorRef.current!.store.setMDContent('edited draft');
    });

    rerender(
      <BaseMarkdownEditorSlate
        initValue="original"
        editorRef={editorRef}
        readonly
      />,
    );

    expect(Node.string(editorRef.current!.markdownEditorRef.current)).toBe(
      'edited draft',
    );
  });

  it('preserves a draft when a plugin remount coincides with an editable echo', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="original" editorRef={editorRef} />,
    );
    await act(async () => {
      await editorRef.current!.store.setMDContent('edited draft');
    });
    rerender(
      <BaseMarkdownEditorSlate
        initValue="edited draft"
        editorRef={editorRef}
        plugins={[{ withEditorKey: 'changed', withEditor: (editor) => editor }]}
      />,
    );

    expect(Node.string(editorRef.current!.markdownEditorRef.current)).toBe(
      'edited draft',
    );
  });

  it('prioritizes a new readonly source over a plugin remount snapshot', () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const { rerender } = render(
      <BaseMarkdownEditorSlate
        initValue="original"
        editorRef={editorRef}
        readonly
      />,
    );
    rerender(
      <BaseMarkdownEditorSlate
        initValue="updated source"
        editorRef={editorRef}
        readonly
        plugins={[{ withEditorKey: 'changed', withEditor: (editor) => editor }]}
      />,
    );

    expect(Node.string(editorRef.current!.markdownEditorRef.current)).toBe(
      'updated source',
    );
  });

  it('continues applying readonly Markdown and schema updates', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const { rerender } = render(
      <BaseMarkdownEditorSlate
        initValue="first"
        editorRef={editorRef}
        readonly
      />,
    );
    rerender(
      <BaseMarkdownEditorSlate
        initValue="second"
        editorRef={editorRef}
        readonly
      />,
    );
    await waitFor(() => {
      expect(Node.string(editorRef.current!.markdownEditorRef.current)).toBe(
        'second',
      );
    });

    rerender(
      <BaseMarkdownEditorSlate
        initValue="second"
        initSchemaValue={[
          { type: 'paragraph', children: [{ text: 'schema update' }] },
        ]}
        editorRef={editorRef}
        readonly
      />,
    );
    await waitFor(() => {
      expect(Node.string(editorRef.current!.markdownEditorRef.current)).toBe(
        'schema update',
      );
    });
  });

  it('keeps the latest streamed document and TOC when entering editable mode', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const { rerender, container } = render(
      <BaseMarkdownEditorSlate
        initValue="# Original"
        editorRef={editorRef}
        readonly
        toc
      />,
    );
    rerender(
      <BaseMarkdownEditorSlate
        initValue="# Streamed"
        editorRef={editorRef}
        readonly
        toc
      />,
    );
    await waitFor(() => {
      expect(
        container.querySelector('.ant-anchor-link-title'),
      ).toHaveTextContent('Streamed');
    });
    rerender(
      <BaseMarkdownEditorSlate
        initValue="# Streamed"
        editorRef={editorRef}
        toc
      />,
    );

    expect(container.querySelector('.ant-anchor-link-title')).toHaveTextContent(
      'Streamed',
    );
    expect(Node.string(editorRef.current!.markdownEditorRef.current)).toBe(
      'Streamed',
    );
  });
});
