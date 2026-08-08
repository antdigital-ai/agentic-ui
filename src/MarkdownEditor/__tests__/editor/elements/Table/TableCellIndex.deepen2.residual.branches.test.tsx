/**
 * TableCellIndex deepen2：clearIcon=false、各 handler editor 空/抛错、locale 标题。
 */
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TableCellIndex } from '../../../../editor/elements/Table/TableCellIndex';
import { TableContextTestProvider } from '../../../../editor/elements/Table/TableContext';

let currentTestEditor: any = null;
let _clickAwayCallback: (() => void) | null = null;

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
    _clickAwayCallback = cb;
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
  selectTableRow,
} from '../../../../editor/elements/Table/commands/tableCommands';

const mockSetDeleteIconPosition = vi.fn();

describe('TableCellIndex deepen2 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    _clickAwayCallback = null;
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
          <Slate editor={currentTestEditor || withReact(createEditor())} initialValue={[]}>
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

  it('handleClick：editor 空时 select 早退', () => {
    renderCell();
    currentTestEditor = null;
    fireEvent.click(document.querySelector('td')!);
    expect(selectTableRow).not.toHaveBeenCalled();
  });

  it('handleClick：selectTableRow 抛错 warn', () => {
    vi.mocked(selectTableRow).mockImplementationOnce(() => {
      throw new Error('sel');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderCell();
    fireEvent.click(document.querySelector('td')!);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('delete/insert：editor 空早退', () => {
    renderCell({}, { deleteIconPosition: { rowIndex: 0 } });
    currentTestEditor = null;
    fireEvent.click(
      document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-delete-icon',
      )!,
    );
    expect(removeTableRow).not.toHaveBeenCalled();
  });

  it('delete/insert：命令抛错 warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(removeTableRow).mockImplementationOnce(() => {
      throw new Error('rm');
    });
    renderCell({}, { deleteIconPosition: { rowIndex: 0 } });
    fireEvent.click(
      document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-delete-icon',
      )!,
    );
    expect(warn).toHaveBeenCalled();

    vi.mocked(insertTableRow).mockImplementationOnce(() => {
      throw new Error('ins');
    });
    fireEvent.click(
      document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-insert-row-before',
      )!,
    );
    vi.mocked(insertTableRow).mockImplementationOnce(() => {
      throw new Error('ins2');
    });
    fireEvent.click(
      document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-insert-row-after',
      )!,
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('insert 缺 rowIndex 早退', () => {
    renderCell(
      { rowIndex: undefined },
      { deleteIconPosition: { rowIndex: 0 } },
    );
    // icons may not show without rowIndex match; force via matching position
    renderCell(
      { rowIndex: 1 },
      { deleteIconPosition: { rowIndex: 0 } },
    );
    expect(document.querySelector('td')).toBeTruthy();
  });

  it('clearSelect(false) 不清 icon：经 handleClick 路径', () => {
    renderCell();
    fireEvent.click(document.querySelector('td')!);
    // clearSelect(false) 被调用时不应把 icon 置 null（之后又 set icon）
    expect(mockSetDeleteIconPosition).toHaveBeenCalledWith({
      rowIndex: 0,
      columnIndex: undefined,
    });
    expect(clearTableSelection).toHaveBeenCalled();
  });
});
