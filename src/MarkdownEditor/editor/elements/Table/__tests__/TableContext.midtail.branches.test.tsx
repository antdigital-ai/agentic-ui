/**
 * TableContext mid-tail：无 store、行/列激活、TestProvider 回调。
 */
import { act, render, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { TableNode } from '../../../types/Table';
import {
  TableContextTestProvider,
  TablePropsProvider,
  useSetTableChromePosition,
  useTableChromeStore,
  useTableColumnChromeActive,
  useTableRowChromeActive,
  useTableStaticContext,
} from '../TableContext';

describe('TableContext midtail branches', () => {
  it.each(['production', 'test'] as const)(
    '%s Provider keeps setter consumers idle when table content or path changes',
    (provider) => {
      const renderSetter = vi.fn();
      const SetterConsumer = React.memo(() => {
        renderSetter(useSetTableChromePosition());
        return null;
      });
      const child = <SetterConsumer />;
      const table: TableNode = { type: 'table', children: [] };
      const wrap = (tableNode: TableNode, tablePath: number[]) =>
        provider === 'production' ? (
          <TablePropsProvider tableNode={tableNode} tablePath={tablePath}>
            {child}
          </TablePropsProvider>
        ) : (
          <TableContextTestProvider value={{ tableNode, tablePath }}>
            {child}
          </TableContextTestProvider>
        );
      const { rerender } = render(wrap(table, [0]));
      rerender(wrap({ ...table }, [1]));
      expect(renderSetter).toHaveBeenCalledTimes(1);
    },
  );

  it('无 Provider 时 hooks 安全回退', () => {
    const { result: store } = renderHook(() => useTableChromeStore());
    expect(store.current).toBeNull();

    const { result: row } = renderHook(() => useTableRowChromeActive(0));
    expect(row.current).toBe(false);

    const { result: col } = renderHook(() => useTableColumnChromeActive(1));
    expect(col.current).toBe(false);

    const { result: rowUndef } = renderHook(() => useTableRowChromeActive());
    expect(rowUndef.current).toBe(false);

    const { result: colUndef } = renderHook(() => useTableColumnChromeActive());
    expect(colUndef.current).toBe(false);
  });

  it('TestProvider：行激活 / 列激活 / setPosition 透传', () => {
    const onSet = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TableContextTestProvider
        value={{
          tablePath: [0],
          setDeleteIconPosition: onSet,
        }}
      >
        {children}
      </TableContextTestProvider>
    );

    const { result } = renderHook(
      () => ({
        row0: useTableRowChromeActive(0),
        row1: useTableRowChromeActive(1),
        col0: useTableColumnChromeActive(0),
        set: useSetTableChromePosition(),
        staticCtx: useTableStaticContext(),
      }),
      { wrapper },
    );

    expect(result.current.staticCtx.tablePath).toEqual([0]);
    expect(result.current.row0).toBe(false);

    act(() => {
      result.current.set({ rowIndex: 0 });
    });
    expect(result.current.row0).toBe(true);
    expect(result.current.row1).toBe(false);
    expect(onSet).toHaveBeenCalledWith({ rowIndex: 0 });

    act(() => {
      result.current.set({ columnIndex: 0 });
    });
    expect(result.current.col0).toBe(true);
    expect(result.current.row0).toBe(false);
  });

  it('行激活要求 columnIndex === undefined', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TableContextTestProvider
        value={{ deleteIconPosition: { rowIndex: 2, columnIndex: 1 } }}
      >
        {children}
      </TableContextTestProvider>
    );
    const { result } = renderHook(() => useTableRowChromeActive(2), {
      wrapper,
    });
    expect(result.current).toBe(false);
  });

  it('仅 rowIndex 时行激活为 true', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TableContextTestProvider value={{ deleteIconPosition: { rowIndex: 1 } }}>
        {children}
      </TableContextTestProvider>
    );
    const { result } = renderHook(() => useTableRowChromeActive(1), {
      wrapper,
    });
    expect(result.current).toBe(true);
  });
});
