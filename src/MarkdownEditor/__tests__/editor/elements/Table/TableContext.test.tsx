/**
 * TableContext / TablePropsProvider 测试：覆盖 setDeleteIconPosition 回调
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { describe, expect, it } from 'vitest';
import {
  TablePropsContext,
  TablePropsProvider,
  useTableRowChromeActive,
} from '../../../../editor/elements/Table/TableContext';
import { createTableChromeStore } from '../../../../editor/elements/Table/tableChromeStore';

const Consumer: React.FC = () => {
  const { setDeleteIconPosition } = useContext(TablePropsContext);
  return (
    <button
      type="button"
      data-testid="set-pos"
      onClick={() =>
        setDeleteIconPosition?.({ rowIndex: 1, columnIndex: undefined })
      }
    >
      Set
    </button>
  );
};

const RowActiveProbe: React.FC<{ rowIndex: number }> = ({ rowIndex }) => {
  const active = useTableRowChromeActive(rowIndex);
  return (
    <span data-testid={`row-active-${rowIndex}`}>{active ? 'yes' : 'no'}</span>
  );
};

describe('TableContext', () => {
  it('应在调用 setDeleteIconPosition 时更新上下文', () => {
    render(
      <TablePropsProvider>
        <Consumer />
      </TablePropsProvider>,
    );
    const btn = screen.getByTestId('set-pos');
    expect(btn).toBeInTheDocument();
    btn.click();
  });

  it('useTableRowChromeActive 仅激活匹配行', () => {
    render(
      <TablePropsProvider>
        <Consumer />
        <RowActiveProbe rowIndex={0} />
        <RowActiveProbe rowIndex={1} />
      </TablePropsProvider>,
    );
    expect(screen.getByTestId('row-active-0')).toHaveTextContent('no');
    expect(screen.getByTestId('row-active-1')).toHaveTextContent('no');
    // 用 fireEvent.click 包裹在 act 中，确保 useSyncExternalStore 的更新刷新到 DOM
    fireEvent.click(screen.getByTestId('set-pos'));
    expect(screen.getByTestId('row-active-0')).toHaveTextContent('no');
    expect(screen.getByTestId('row-active-1')).toHaveTextContent('yes');
  });

  it('createTableChromeStore 相同 position 不重复通知', () => {
    const store = createTableChromeStore(null);
    let calls = 0;
    store.subscribe(() => {
      calls += 1;
    });
    store.setPosition({ rowIndex: 2, columnIndex: undefined });
    store.setPosition({ rowIndex: 2, columnIndex: undefined });
    expect(calls).toBe(1);
  });
});
