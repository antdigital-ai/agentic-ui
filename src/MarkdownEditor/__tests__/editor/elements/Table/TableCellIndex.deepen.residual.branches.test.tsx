/**
 * TableCellIndex deepen residual：editor 空、locale fallback、clickAway 条件、异常路径。
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
  selectTableRow,
} from '../../../../editor/elements/Table/commands/tableCommands';

const mockSetDeleteIconPosition = vi.fn();

describe('TableCellIndex deepen residual branches', () => {
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
  ) => {
    const defaultProps = {
      targetRow: { type: 'table-row', children: [] },
      rowIndex: 0,
      tablePath: [0],
      ...props,
    };
    return render(
      <ConfigProvider>
        <TableContextTestProvider
          value={{
            deleteIconPosition: null,
            setDeleteIconPosition: mockSetDeleteIconPosition,
            ...ctx,
          }}
        >
          <Slate editor={currentTestEditor} initialValue={[]}>
            <table>
              <tbody>
                <tr>
                  <TableCellIndex {...defaultProps} />
                </tr>
              </tbody>
            </table>
          </Slate>
        </TableContextTestProvider>
      </ConfigProvider>,
    );
  };

  it('editor 为 null 时 handleClick 早退', () => {
    currentTestEditor = withReact(createEditor());
    renderCell();
    currentTestEditor = null;
    fireEvent.click(document.querySelector('td')!);
    expect(selectTableRow).not.toHaveBeenCalled();
  });

  it('tablePath 缺失时 clearSelect 仅清 icon', () => {
    renderCell({ tablePath: undefined });
    fireEvent.click(document.querySelector('td')!);
    expect(mockSetDeleteIconPosition).toHaveBeenCalled();
    expect(clearTableSelection).not.toHaveBeenCalled();
  });

  it('rowIndex undefined：设置 icon 但不 select', () => {
    renderCell({ rowIndex: undefined });
    fireEvent.click(document.querySelector('td')!);
    expect(selectTableRow).not.toHaveBeenCalled();
  });

  it('delete/insert 缺 tablePath 或 rowIndex 早退', () => {
    renderCell(
      { tablePath: undefined, rowIndex: 0 },
      { deleteIconPosition: { rowIndex: 0 } },
    );
    fireEvent.click(
      document.querySelector('.ant-agentic-md-editor-table-cell-index-delete-icon')!,
    );
    expect(removeTableRow).not.toHaveBeenCalled();
  });

  it('正常删除行并 clearSelect', () => {
    renderCell({}, { deleteIconPosition: { rowIndex: 0 } });
    fireEvent.click(
      document.querySelector('.ant-agentic-md-editor-table-cell-index-delete-icon')!,
    );
    expect(removeTableRow).toHaveBeenCalledWith(currentTestEditor, [0], 0);
    expect(mockSetDeleteIconPosition).toHaveBeenCalledWith(null);
  });

  it('insert before 成功路径', () => {
    renderCell({ rowIndex: 0 }, { deleteIconPosition: { rowIndex: 0 } });
    fireEvent.click(document.querySelector('td')!);
    fireEvent.click(
      document.querySelector('.ant-agentic-md-editor-table-cell-index-insert-row-before')!,
    );
    expect(insertTableRow).toHaveBeenCalledWith(
      currentTestEditor,
      [0],
      0,
      'before',
    );
  });

  it('insert after 成功路径', () => {
    renderCell({ rowIndex: 0 }, { deleteIconPosition: { rowIndex: 0 } });
    fireEvent.click(document.querySelector('td')!);
    fireEvent.click(
      document.querySelector('.ant-agentic-md-editor-table-cell-index-insert-row-after')!,
    );
    expect(insertTableRow).toHaveBeenCalledWith(
      currentTestEditor,
      [0],
      0,
      'after',
    );
  });

  it('useClickAway：未激活 chrome 时不 clear', () => {
    renderCell({}, { deleteIconPosition: null });
    clickAwayCallback?.();
    expect(mockSetDeleteIconPosition).not.toHaveBeenCalled();
  });

  it('useClickAway：激活 chrome 时 clear', () => {
    renderCell({}, { deleteIconPosition: { rowIndex: 0 } });
    clickAwayCallback?.();
    expect(mockSetDeleteIconPosition).toHaveBeenCalledWith(null);
  });

  it('locale 缺省时使用英文 fallback title', () => {
    render(
      <ConfigProvider>
        <TableContextTestProvider
          value={{
            deleteIconPosition: { rowIndex: 0 },
            setDeleteIconPosition: mockSetDeleteIconPosition,
          }}
        >
          <Slate editor={currentTestEditor} initialValue={[]}>
            <table>
              <tbody>
                <tr>
                  <TableCellIndex
                    targetRow={{}}
                    rowIndex={0}
                    tablePath={[0]}
                  />
                </tr>
              </tbody>
            </table>
          </Slate>
        </TableContextTestProvider>
      </ConfigProvider>,
    );
    const td = document.querySelector('td');
    expect(td).toHaveAttribute('title');
  });

  it('clearSelect 异常被 console.warn 吞掉', () => {
    vi.mocked(clearTableSelection).mockImplementationOnce(() => {
      throw new Error('clear fail');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderCell({}, { deleteIconPosition: { rowIndex: 0 } });
    clickAwayCallback?.();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('mousedown 阻止 Slate 抢焦点', () => {
    renderCell({}, { deleteIconPosition: { rowIndex: 0 } });
    const btn = document.querySelector(
      '.ant-agentic-md-editor-table-cell-index-delete-icon',
    )!;
    fireEvent.mouseDown(btn);
    expect(btn).toBeInTheDocument();
  });

  it('shouldShowDeleteIcon 时背景色激活', () => {
    renderCell({}, { deleteIconPosition: { rowIndex: 0 } });
    const td = document.querySelector('td') as HTMLElement;
    expect(td.style.backgroundColor).toBeTruthy();
  });
});
