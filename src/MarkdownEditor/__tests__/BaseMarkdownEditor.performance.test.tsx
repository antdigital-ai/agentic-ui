import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { Node } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import * as markdownParser from '../editor/parser/parserMdToSchema';
import type { ParagraphNode } from '../el';
import type { MarkdownEditorInstance } from '../types';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BaseMarkdownEditor editable lifecycle performance', () => {
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
