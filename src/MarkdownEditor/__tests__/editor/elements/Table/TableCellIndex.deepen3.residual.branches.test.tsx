/**
 * TableCellIndex deepen3：无 tablePath 早退、locale 缺省标题。
 */
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Slate, withReact } from 'slate-react';
import { TableCellIndex } from '../../../../editor/elements/Table/TableCellIndex';
import { TableContextTestProvider } from '../../../../editor/elements/Table/TableContext';

let currentTestEditor: any = null;
let clickAwayCallback: (() => void) | null = null;

vi.mock('../../../../editor/store', () => ({
  useEditorStore: () => ({
    markdownEditorRef: {
      get current() {
        return currentTestEditor;
      },
    },
  }),
}));

vi.mock('../../../../../Hooks/useClickAway', () => ({
  useClickAway: vi.fn((cb: () => void) => {
    clickAwayCallback = cb;
  }),
}));

vi.mock('../../../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: (...args: any[]) => any) => fn,
}));

vi.mock('../../../../editor/elements/Table/commands/tableCommands', () => ({
  clearTableSelection: vi.fn(),
  insertTableRow: vi.fn(),
  removeTableRow: vi.fn(),
  selectTableRow: vi.fn(),
}));

import {
  clearTableSelection,
  insertTableRow,
  removeTableRow,
} from '../../../../editor/elements/Table/commands/tableCommands';

const mockSetDeleteIconPosition = vi.fn();

describe('TableCellIndex deepen3 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    clickAwayCallback = null;
    currentTestEditor = withReact(createEditor());
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  const renderCell = (
    props: Partial<React.ComponentProps<typeof TableCellIndex>> = {},
    ctx: Record<string, unknown> = {},
  ) =>
    render(
      <ConfigProvider>
        <TableContextTestProvider
          value={{
            deleteIconPosition: null,
            setDeleteIconPosition: mockSetDeleteIconPosition,
            ...ctx,
          }}
        >
          <Slate
            editor={currentTestEditor || withReact(createEditor())}
            initialValue={[]}
          >
            <table>
              <tbody>
                <tr>
                  <TableCellIndex
                    targetRow={{ type: 'table-row', children: [] }}
                    rowIndex={0}
                    tablePath={[0]}
                    {...props}
                  />
                </tr>
              </tbody>
            </table>
          </Slate>
        </TableContextTestProvider>
      </ConfigProvider>,
    );

  it('clearSelect：无 tablePath 早退', () => {
    renderCell(
      { tablePath: undefined as any },
      { deleteIconPosition: { rowIndex: 0 } },
    );
    clickAwayCallback?.();
    expect(clearTableSelection).not.toHaveBeenCalled();
  });

  it('insert before/after：无 tablePath 早退', () => {
    renderCell(
      { tablePath: undefined as any, rowIndex: 0 },
      { deleteIconPosition: { rowIndex: 0 } },
    );
    const before = document.querySelector(
      '.ant-agentic-md-editor-table-cell-index-insert-row-before',
    );
    const after = document.querySelector(
      '.ant-agentic-md-editor-table-cell-index-insert-row-after',
    );
    if (before) fireEvent.click(before);
    if (after) fireEvent.click(after);
    expect(insertTableRow).not.toHaveBeenCalled();
  });

  it('insert before/after：editor 空早退', () => {
    renderCell({}, { deleteIconPosition: { rowIndex: 0 } });
    currentTestEditor = null;
    fireEvent.click(
      document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-insert-row-before',
      )!,
    );
    fireEvent.click(
      document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-insert-row-after',
      )!,
    );
    expect(insertTableRow).not.toHaveBeenCalled();
    expect(removeTableRow).not.toHaveBeenCalled();
  });

  it('locale 缺省：title 回退中文文案', () => {
    renderCell({}, { deleteIconPosition: { rowIndex: 0 } });
    const before = document.querySelector(
      '.ant-agentic-md-editor-table-cell-index-insert-row-before',
    ) as HTMLElement;
    const after = document.querySelector(
      '.ant-agentic-md-editor-table-cell-index-insert-row-after',
    ) as HTMLElement;
    expect(before?.getAttribute('title')).toBe('在上面增加一行');
    expect(after?.getAttribute('title')).toBe('在下面增加一行');
  });
});
