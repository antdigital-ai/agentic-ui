import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Editor, Node, Operation, Transforms } from 'slate';
import { HistoryEditor } from 'slate-history';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import { EditorUtils } from '../editor/utils/editorUtils';
import type { Elements } from '../el';
import type { MarkdownEditorPlugin } from '../plugin';
import type { MarkdownEditorInstance } from '../types';

afterEach(() => vi.restoreAllMocks());

describe('Slate initial document installation', () => {
  it.each([false, true])(
    'keeps valid node references and one real player mount with readonly=%s',
    async (readonly) => {
      const operations: Operation[] = [];
      const plugins: MarkdownEditorPlugin[] = [
        {
          withEditor: (editor) => {
            const apply = editor.apply;
            editor.apply = (operation) => {
              operations.push(operation);
              apply(operation);
            };
            return editor;
          },
        },
      ];
      const schema: Elements[] = [
        EditorUtils.wrapperCardNode({
          type: 'media',
          mediaType: 'video',
          url: 'https://example.com/initial.mp4',
          children: [{ text: '' }],
        }),
        { type: 'paragraph', children: [{ text: 'initial text' }] },
      ];
      const source = JSON.stringify(schema);
      const reset = vi.spyOn(EditorUtils, 'reset');
      const createElement = vi.spyOn(document, 'createElement');
      const firstNodes = new Map<string, Elements>();
      const readyDocuments: string[] = [];
      let instance: MarkdownEditorInstance | undefined;
      const editorRef = (next: MarkdownEditorInstance | undefined | null) => {
        if (!next) return;
        instance = next;
        readyDocuments.push(Node.string(next.markdownEditorRef.current));
      };
      const renderEditor = (className?: string) => (
        <BaseMarkdownEditorSlate
          readonly={readonly}
          editorRef={editorRef}
          initSchemaValue={schema}
          plugins={plugins}
          className={className}
          floatBar={{ enable: false }}
          eleItemRender={(props, dom) => {
            if (!firstNodes.has(props.element.type)) {
              firstNodes.set(props.element.type, props.element as Elements);
            }
            return dom;
          }}
        />
      );
      const { getByTestId, rerender } = render(renderEditor());
      const player = getByTestId('video-element');
      await act(async () => {});
      const editor = instance!.markdownEditorRef.current;

      expect(editor.children[0]).toBe(firstNodes.get('card'));
      expect(editor.children[1]).toBe(firstNodes.get('paragraph'));
      expect(editor.children[0]).not.toBe(schema[0]);
      expect(JSON.stringify(schema)).toBe(source);
      expect(operations).toEqual([]);
      expect(reset).not.toHaveBeenCalled();
      expect(readyDocuments.length).toBeGreaterThan(0);
      expect(readyDocuments.every((text) => text === 'initial text')).toBe(
        true,
      );
      const requestedPlayers = () =>
        createElement.mock.results.filter(
          (result) =>
            result.type === 'return' &&
            result.value instanceof HTMLVideoElement &&
            result.value.hasAttribute('src'),
        );
      expect(requestedPlayers()).toHaveLength(1);
      expect(requestedPlayers()[0].value).toBe(player);

      rerender(renderEditor('changed'));
      expect(getByTestId('video-element')).toBe(player);
      expect(editor.children[0]).toBe(firstNodes.get('card'));
      expect(operations).toEqual([]);
      expect(requestedPlayers()).toHaveLength(1);
    },
  );

  it.each([undefined, []])(
    'installs one usable empty paragraph for schema=%j',
    (schema) => {
      const editorRef = React.createRef<MarkdownEditorInstance>();
      render(
        <BaseMarkdownEditorSlate
          editorRef={editorRef}
          initSchemaValue={schema}
          floatBar={{ enable: false }}
        />,
      );
      const editor = editorRef.current!.markdownEditorRef.current;
      expect(editor.children).toEqual([
        { type: 'paragraph', children: [{ text: '' }] },
      ]);
      expect(Editor.start(editor, [])).toEqual({ path: [0, 0], offset: 0 });
    },
  );

  it('pads the first client and server table without mutating the supplied schema', () => {
    const schema: Elements[] = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'seed' }] }],
          },
        ],
      },
    ];
    const source = JSON.stringify(schema);
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const view = (
      <BaseMarkdownEditorSlate
        editorRef={editorRef}
        initSchemaValue={schema}
        tableConfig={{ minColumn: 3, minRows: 2 }}
        floatBar={{ enable: false }}
      />
    );
    const html = renderToString(React.cloneElement(view, { readonly: true }));
    expect(html).toContain('seed');
    expect((html.match(/<td(?:\s|>)/g) ?? []).length).toBe(6);
    render(view);
    const table = editorRef.current!.markdownEditorRef.current.children[0];
    expect(table.type).toBe('table');
    expect(table.children).toHaveLength(2);
    for (const row of table.children as Elements[]) {
      expect(row.children).toHaveLength(3);
    }
    expect(Node.string(table)).toBe('seed');
    expect(JSON.stringify(schema)).toBe(source);
  });

  it('normalizes an imported document and still reports the first real edit', async () => {
    const schema: Elements[] = [
      { type: 'paragraph', children: [{ text: 'first' }, { text: ' draft' }] },
    ];
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const reset = vi.spyOn(EditorUtils, 'reset');
    const onChange = vi.fn();
    render(
      <BaseMarkdownEditorSlate
        initSchemaValue={schema}
        editorRef={editorRef}
        onChange={onChange}
        onChangeDebounceWait={0}
        floatBar={{ enable: false }}
      />,
    );
    const editor = editorRef.current!.markdownEditorRef.current;
    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: 'first draft' }] },
    ]);
    expect(schema[0].children).toHaveLength(2);
    expect(reset).not.toHaveBeenCalled();
    expect((editor as HistoryEditor).history.undos).toEqual([]);
    await act(async () => {});
    onChange.mockClear();
    await act(async () => {
      Transforms.insertText(editor, '!', { at: Editor.end(editor, []) });
    });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledExactlyOnceWith(
        'first draft!',
        editor.children,
      ),
    );
    await act(async () => {
      HistoryEditor.undo(editor as HistoryEditor);
    });
    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: 'first draft' }] },
    ]);
    expect((editor as HistoryEditor).history.undos).toEqual([]);
  });

  it('keeps initialization recovery out of undo history when normalization fails', () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    vi.spyOn(Editor, 'normalize').mockImplementationOnce(() => {
      throw new Error('initial normalization failed');
    });
    render(
      <BaseMarkdownEditorSlate
        initValue="initial draft"
        editorRef={editorRef}
        floatBar={{ enable: false }}
      />,
    );
    const editor = editorRef.current!.markdownEditorRef.current;
    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
    expect((editor as HistoryEditor).history.undos).toEqual([]);
  });
});
