import { act, fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { Editor, Element, Node, Transforms } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import type { TableNode } from '../editor/types/Table';
import type { Elements } from '../el';
import type { MarkdownEditorInstance } from '../types';

const rowIndexSelector = '.ant-agentic-md-editor-table-cell-index';
const columnIndexSelector = '.ant-agentic-md-editor-table-cell-index-spacer';
const rowDeleteSelector = '.ant-agentic-md-editor-table-cell-index-delete-icon';
const columnDeleteSelector =
  '.ant-agentic-md-editor-table-cell-index-spacer-delete-icon';
const actionsSelector =
  '[class*="table-cell-index-action-buttons"], [class*="table-cell-index-spacer-action-buttons"]';

interface IndexRenderCounts {
  row: number;
  column: number;
}

const CountIndexRenders: React.FC<{
  counts: IndexRenderCounts;
  children: React.ReactNode;
}> = ({ counts, children }) => {
  const config = React.useContext(ConfigProvider.ConfigContext);
  const value = React.useMemo(
    () => ({
      ...config,
      getPrefixCls: (suffix?: string, customPrefix?: string) => {
        if (suffix === 'agentic-md-editor-table-cell-index') counts.row += 1;
        if (suffix === 'agentic-md-editor-table-cell-index-spacer') {
          counts.column += 1;
        }
        return config.getPrefixCls(suffix, customPrefix);
      },
    }),
    [config, counts],
  );
  return (
    <ConfigProvider.ConfigContext.Provider value={value}>
      {children}
    </ConfigProvider.ConfigContext.Provider>
  );
};

const mountTable = (
  rows = 3,
  columns = 3,
  counts: IndexRenderCounts = { row: 0, column: 0 },
) => {
  const editorRef = React.createRef<MarkdownEditorInstance>();
  const table: TableNode = {
    type: 'table',
    children: Array.from({ length: rows }, (_, row) => ({
      type: 'table-row',
      children: Array.from({ length: columns }, (_, column) => ({
        type: 'table-cell',
        children: [
          { type: 'paragraph', children: [{ text: `cell ${row}:${column}` }] },
        ],
      })),
    })),
  };
  const schema: Elements[] = [
    table,
    { type: 'paragraph', children: [{ text: 'outside table' }] },
  ];
  const view = render(
    <CountIndexRenders counts={counts}>
      <BaseMarkdownEditorSlate
        initSchemaValue={schema}
        editorRef={editorRef}
        toc={false}
        floatBar={{ enable: false }}
      />
    </CountIndexRenders>,
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
};

afterEach(() => vi.restoreAllMocks());

describe('editable table chrome DOM and interaction', () => {
  it('keeps unrelated row and column indices idle when typing in a real cell', async () => {
    const counts = { row: 0, column: 0 };
    const { editor, getTable } = mountTable(100, 10, counts);
    counts.row = 0;
    counts.column = 0;
    const [, path] = getTable();
    await act(async () =>
      Transforms.insertText(editor, ' edited', {
        at: Editor.end(editor, [...path, 50, 4]),
      }),
    );
    expect(Node.string(getTable()[0].children[50].children[4])).toBe(
      'cell 50:4 edited',
    );
    expect(counts).toEqual({ row: 1, column: 0 });
  });

  it('mounts no hidden tools or outside-click listeners for a 100 by 10 table', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const { container, getTable } = mountTable(100, 10);
    const table = container.querySelector('table')!;
    const chrome = [
      ...table.querySelectorAll(`${rowIndexSelector}, ${columnIndexSelector}`),
    ];
    const chromeElements = chrome.reduce(
      (count, cell) => count + cell.querySelectorAll('*').length,
      0,
    );
    const clickAwayListeners = add.mock.calls.filter(
      ([event, listener]) =>
        (event === 'mousedown' || event === 'touchstart') &&
        typeof listener === 'function' &&
        listener.name === 'listener',
    ).length;
    expect({ chromeElements, clickAwayListeners }).toEqual({
      chromeElements: 0,
      clickAwayListeners: 0,
    });
    expect(chrome).toHaveLength(111);
    expect(
      table.querySelectorAll('td[data-slate-node="element"]'),
    ).toHaveLength(1000);
    expect(getTable()[0].children).toHaveLength(100);
    expect(table.querySelectorAll('col')).toHaveLength(11);
  });

  it('mounts only the active toolbar, switches row and column selection, and closes outside', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const { container } = mountTable();
    const firstRow = container.querySelector(rowIndexSelector)!;
    const secondColumn = container.querySelectorAll(columnIndexSelector)[2];
    fireEvent.click(firstRow);
    expect(container.querySelectorAll(actionsSelector)).toHaveLength(1);
    expect(container.querySelectorAll('td[data-select]')).toHaveLength(3);
    expect(firstRow.querySelector(rowDeleteSelector)).not.toBeNull();
    fireEvent.click(secondColumn);
    expect(container.querySelectorAll(actionsSelector)).toHaveLength(1);
    expect(firstRow.querySelector(actionsSelector)).toBeNull();
    expect(secondColumn.querySelector(columnDeleteSelector)).not.toBeNull();
    expect(container.querySelectorAll('td[data-select]')).toHaveLength(3);
    fireEvent.mouseDown(document.body);
    expect(container.querySelectorAll(actionsSelector)).toHaveLength(0);
    expect(container.querySelectorAll('td[data-select]')).toHaveLength(0);
    const clickAway = (calls: typeof add.mock.calls) =>
      calls.filter(
        ([event, listener]) =>
          (event === 'mousedown' || event === 'touchstart') &&
          typeof listener === 'function' &&
          listener.name === 'listener',
      ).length;
    expect(clickAway(add.mock.calls)).toBe(4);
    expect(clickAway(remove.mock.calls as typeof add.mock.calls)).toBe(4);
  });

  it('deletes active rows and columns, retains editable cells, and supports undo', async () => {
    const { container, editor, getTable } = mountTable();
    const original = JSON.parse(JSON.stringify(editor.children));
    fireEvent.click(container.querySelectorAll(rowIndexSelector)[1]);
    await act(async () =>
      fireEvent.click(container.querySelector(rowDeleteSelector)!),
    );
    expect(getTable()[0].children).toHaveLength(2);
    expect(container.querySelectorAll(actionsSelector)).toHaveLength(0);
    fireEvent.click(container.querySelectorAll(columnIndexSelector)[2]);
    await act(async () =>
      fireEvent.click(container.querySelector(columnDeleteSelector)!),
    );
    expect(
      getTable()[0].children.every((row) => row.children.length === 2),
    ).toBe(true);
    await act(async () => editor.undo());
    await act(async () => editor.undo());
    expect(editor.children).toEqual(original);
    const [, path] = getTable();
    await act(async () =>
      Transforms.insertText(editor, ' edited', {
        at: Editor.end(editor, [...path, 0, 0]),
      }),
    );
    expect(Node.string(getTable()[0].children[0].children[0])).toBe(
      'cell 0:0 edited',
    );
  });
});
