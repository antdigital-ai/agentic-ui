import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Editor, Element, Node, Transforms } from 'slate';
import { describe, expect, it } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import type { TableNode } from '../editor/types/Table';
import type { Elements } from '../el';
import type { MarkdownEditorInstance } from '../types';

const rowSelector = '.ant-agentic-md-editor-table-cell-index';
const rowDeleteSelector = '.ant-agentic-md-editor-table-cell-index-delete-icon';
const columnSelector = '.ant-agentic-md-editor-table-cell-index-spacer';
const columnDeleteSelector =
  '.ant-agentic-md-editor-table-cell-index-spacer-delete-icon';

function mountTable() {
  const editorRef = React.createRef<MarkdownEditorInstance>();
  const table: TableNode = {
    type: 'table',
    children: Array.from({ length: 3 }, (_, row) => ({
      type: 'table-row',
      children: Array.from({ length: 2 }, (_, column) => ({
        type: 'table-cell',
        children: [
          { type: 'paragraph', children: [{ text: `cell ${row}:${column}` }] },
        ],
      })),
    })),
  };
  const schema: Elements[] = [
    table,
    { type: 'paragraph', children: [{ text: 'outside' }] },
  ];
  const view = render(
    <BaseMarkdownEditorSlate
      initSchemaValue={schema}
      editorRef={editorRef}
      toc={false}
      floatBar={{ enable: false }}
    />,
  );
  const editor = editorRef.current!.markdownEditorRef.current;
  const getTable = () =>
    [
      ...Editor.nodes(editor, {
        at: [],
        match: (node) => Element.isElement(node) && node.type === 'table',
      }),
    ][0] as [TableNode, number[]];
  return { ...view, editor, getTable };
}

describe('table paths after structural changes', () => {
  it('deletes the intended row after inserting a paragraph before the table', async () => {
    const { container, editor, getTable } = mountTable();
    await act(async () =>
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: 'new prefix' }] },
        { at: [0] },
      ),
    );
    expect(getTable()[1]).toEqual([1]);
    fireEvent.click(container.querySelectorAll(rowSelector)[1]);
    await act(async () =>
      fireEvent.click(container.querySelector(rowDeleteSelector)!),
    );
    expect(Node.string(editor.children[0])).toBe('new prefix');
    expect(getTable()[0].children.map(Node.string)).toEqual([
      'cell 0:0cell 0:1',
      'cell 2:0cell 2:1',
    ]);
  });

  it('refreshes untouched row indices after a preceding row is inserted', async () => {
    const { container, editor, getTable } = mountTable();
    const [table, path] = getTable();
    const originalSecondRow = table.children[1];
    await act(async () =>
      Transforms.insertNodes(
        editor,
        {
          type: 'table-row',
          children: Array.from({ length: 2 }, () => ({
            type: 'table-cell',
            children: [{ type: 'paragraph', children: [{ text: 'inserted' }] }],
          })),
        },
        { at: [...path, 0] },
      ),
    );
    expect(getTable()[0].children[2]).toBe(originalSecondRow);
    fireEvent.click(container.querySelectorAll(rowSelector)[2]);
    await act(async () =>
      fireEvent.click(container.querySelector(rowDeleteSelector)!),
    );
    expect(getTable()[0].children.map(Node.string)).toEqual([
      'insertedinserted',
      'cell 0:0cell 0:1',
      'cell 2:0cell 2:1',
    ]);
  });

  it('deletes the intended column after the table moves without changing identity', async () => {
    const { container, editor, getTable } = mountTable();
    const originalTable = getTable()[0];
    await act(async () => Transforms.moveNodes(editor, { at: [0], to: [1] }));
    expect(getTable()[0]).toBe(originalTable);
    expect(getTable()[1]).toEqual([1]);
    fireEvent.click(container.querySelectorAll(columnSelector)[1]);
    await act(async () =>
      fireEvent.click(container.querySelector(columnDeleteSelector)!),
    );
    expect(Node.string(editor.children[0])).toBe('outside');
    expect(getTable()[0].children.map(Node.string)).toEqual([
      'cell 0:1',
      'cell 1:1',
      'cell 2:1',
    ]);
  });
});
