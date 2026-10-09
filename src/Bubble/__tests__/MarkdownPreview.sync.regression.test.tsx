import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { Code } from 'mdast';
import React from 'react';
import { Node } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parserMdToSchema } from '../../MarkdownEditor/editor/parser/parserMdToSchema';
import type { MarkdownEditorPlugin } from '../../MarkdownEditor/plugin';
import type { MarkdownEditorInstance } from '../../MarkdownEditor/types';
import { MarkdownPreview } from '../MessagesContent/MarkdownPreview';

vi.mock(
  '../../MarkdownEditor/editor/parser/parserMdToSchema',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('../../MarkdownEditor/editor/parser/parserMdToSchema')
      >();
    return { ...actual, parserMdToSchema: vi.fn(actual.parserMdToSchema) };
  },
);

beforeEach(() => vi.mocked(parserMdToSchema).mockClear());

describe('Bubble MarkdownPreview document synchronization', () => {
  it('parses each readonly source once with its plugins and keeps the external editor ref', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const plugins: MarkdownEditorPlugin[] = [
      {
        parseMarkdown: [
          {
            match: (node) =>
              node.type === 'code' && (node as Code).lang === 'preview-custom',
            convert: (node) => ({
              type: 'paragraph',
              children: [{ text: `Custom preview: ${(node as Code).value}` }],
            }),
          },
        ],
      },
    ];
    const config = { plugins, editorRef, floatBar: { enable: false } };
    const initial = '```preview-custom\nfirst document\n```';
    const updated = '```preview-custom\nupdated document\n```';
    const renderPreview = (content: string) => (
      <MarkdownPreview
        content={content}
        beforeContent={null}
        afterContent={null}
        markdownRenderConfig={config}
      />
    );
    const { rerender } = render(renderPreview(initial));
    expect(
      screen.getByText('Custom preview: first document'),
    ).toBeInTheDocument();
    expect(editorRef.current).toBeTruthy();
    expect(
      vi
        .mocked(parserMdToSchema)
        .mock.calls.filter(([source]) => source === initial),
    ).toHaveLength(1);

    await act(async () => {
      rerender(renderPreview(updated));
    });
    expect(
      screen.getByText('Custom preview: updated document'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Custom preview: first document'),
    ).not.toBeInTheDocument();
    expect(
      vi
        .mocked(parserMdToSchema)
        .mock.calls.filter(([source]) => source === updated),
    ).toHaveLength(1);
    expect(Node.string(editorRef.current!.markdownEditorRef.current)).toBe(
      'Custom preview: updated document',
    );

    await act(async () => {
      rerender(renderPreview(''));
    });
    expect(editorRef.current).toBeFalsy();
    await waitFor(() =>
      expect(
        screen.queryByText('Custom preview: updated document'),
      ).not.toBeInTheDocument(),
    );
    expect(
      document.querySelector('[data-slate-editor]'),
    ).not.toBeInTheDocument();
    await act(async () => {
      rerender(renderPreview(initial));
    });
    expect(
      screen.getByText('Custom preview: first document'),
    ).toBeInTheDocument();
    expect(editorRef.current).toBeTruthy();
  });

  it('keeps message slots while omitting an empty editor and still accepts explicit schemas or whitespace', () => {
    const renderPreview = (
      content: string,
      schema?: import('../../MarkdownEditor/el').Elements[],
    ) => (
      <MarkdownPreview
        content={content}
        beforeContent={<span>before slot</span>}
        afterContent={<span>after slot</span>}
        docListNode={<span>reference slot</span>}
        extra={<span>actions slot</span>}
        markdownRenderConfig={{
          initSchemaValue: schema,
          floatBar: { enable: false },
        }}
      />
    );
    const { rerender } = render(renderPreview(''));
    expect(
      document.querySelector('[data-slate-editor]'),
    ).not.toBeInTheDocument();
    for (const slot of [
      'before slot',
      'after slot',
      'reference slot',
      'actions slot',
    ]) {
      expect(screen.getByText(slot)).toBeInTheDocument();
    }
    rerender(
      renderPreview('', [
        { type: 'paragraph', children: [{ text: 'Explicit schema content' }] },
      ]),
    );
    expect(screen.getByText('Explicit schema content')).toBeInTheDocument();
    expect(document.querySelector('[data-slate-editor]')).toBeInTheDocument();
    rerender(renderPreview(' '));
    expect(document.querySelector('[data-slate-editor]')).toBeInTheDocument();
  });
});
