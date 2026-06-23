import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { useRefFunction } from '../../../../Hooks/useRefFunction';
import { TableNode } from '../../types/Table';
import {
  createTableChromeStore,
  type TableChromePosition,
  type TableChromeStore,
} from './tableChromeStore';

export type { TableChromePosition };

export interface TableContextValue {
  tablePath?: number[];
  tableNode?: TableNode;
  /** @deprecated 请用 chrome store 订阅；保留供测试直接注入 legacy Provider */
  deleteIconPosition?: TableChromePosition;
  setDeleteIconPosition?: (position: TableChromePosition) => void;
}

/** 稳定字段：不随行/列 chrome 激活态变化 */
export interface TableStaticContextValue {
  tablePath?: number[];
  tableNode?: TableNode;
  setDeleteIconPosition: (position: TableChromePosition) => void;
}

export const TablePropsContext = createContext<TableContextValue>({});

export const TableStaticContext = createContext<TableStaticContextValue>({
  setDeleteIconPosition: () => {},
});

export const TableChromeStoreContext = createContext<TableChromeStore | null>(
  null,
);

const emptySubscribe = () => () => {};

export function useTableStaticContext(): TableStaticContextValue {
  return useContext(TableStaticContext);
}

export function useTableChromeStore(): TableChromeStore | null {
  return useContext(TableChromeStoreContext);
}

export function useSetTableChromePosition(): (
  position: TableChromePosition,
) => void {
  return useTableStaticContext().setDeleteIconPosition;
}

/** 仅当该行处于「行 chrome 激活」时返回 true，其它行不因 store 更新而重渲染 */
export function useTableRowChromeActive(rowIndex?: number): boolean {
  const store = useTableChromeStore();

  return useSyncExternalStore(
    store?.subscribe ?? emptySubscribe,
    () => {
      if (!store || rowIndex === undefined) {
        return false;
      }
      const pos = store.getSnapshot();
      return (
        pos !== null &&
        pos.rowIndex === rowIndex &&
        pos.columnIndex === undefined
      );
    },
    () => false,
  );
}

/** 列头 spacer：columnIndex 含 -1（整表） */
export function useTableColumnChromeActive(columnIndex?: number): boolean {
  const store = useTableChromeStore();

  return useSyncExternalStore(
    store?.subscribe ?? emptySubscribe,
    () => {
      if (!store || columnIndex === undefined) {
        return false;
      }
      const pos = store.getSnapshot();
      return pos !== null && pos.columnIndex === columnIndex;
    },
    () => false,
  );
}

/**
 * 测试用：与 legacy TablePropsContext 并存，内部用 chrome store 驱动行/列激活态。
 */
export const TableContextTestProvider: React.FC<{
  children: React.ReactNode;
  value?: Partial<TableContextValue>;
}> = ({ children, value = {} }) => {
  const storeRef = useRef<TableChromeStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createTableChromeStore(value.deleteIconPosition ?? null);
  }

  const setDeleteIconPosition = useRefFunction(
    (position: TableChromePosition) => {
      storeRef.current?.setPosition(position);
      value.setDeleteIconPosition?.(position);
    },
  );

  const staticValue = useMemo(
    (): TableStaticContextValue => ({
      tablePath: value.tablePath,
      tableNode: value.tableNode,
      setDeleteIconPosition,
    }),
    [value.tablePath, value.tableNode, setDeleteIconPosition],
  );

  const legacyValue = useMemo(
    (): TableContextValue => ({
      ...value,
      setDeleteIconPosition,
    }),
    [value, setDeleteIconPosition],
  );

  return (
    <TableChromeStoreContext.Provider value={storeRef.current}>
      <TableStaticContext.Provider value={staticValue}>
        <TablePropsContext.Provider value={legacyValue}>
          {children}
        </TablePropsContext.Provider>
      </TableStaticContext.Provider>
    </TableChromeStoreContext.Provider>
  );
};

/**
 * TablePropsProvider 组件 - 提供表格上下文状态管理
 */
export const TablePropsProvider: React.FC<{
  children: React.ReactNode;
  tablePath?: number[];
  tableNode?: TableNode;
}> = ({ children, tablePath, tableNode }) => {
  const storeRef = useRef<TableChromeStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createTableChromeStore(null);
  }

  const handleSetDeleteIconPosition = useRefFunction(
    (position: TableChromePosition) => {
      storeRef.current?.setPosition(position);
    },
  );

  const staticValue = useMemo(
    (): TableStaticContextValue => ({
      tablePath,
      tableNode,
      setDeleteIconPosition: handleSetDeleteIconPosition,
    }),
    [tablePath, tableNode, handleSetDeleteIconPosition],
  );

  const legacyValue = useMemo(
    (): TableContextValue => ({
      tablePath,
      tableNode,
      setDeleteIconPosition: handleSetDeleteIconPosition,
    }),
    [tablePath, tableNode, handleSetDeleteIconPosition],
  );

  return (
    <TableChromeStoreContext.Provider value={storeRef.current}>
      <TableStaticContext.Provider value={staticValue}>
        <TablePropsContext.Provider value={legacyValue}>
          {children}
        </TablePropsContext.Provider>
      </TableStaticContext.Provider>
    </TableChromeStoreContext.Provider>
  );
};
