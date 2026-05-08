import React, { useState } from 'react';
import { useRefFunction } from '../../../../Hooks/useRefFunction';
import { TableNode } from '../../types/Table';

export interface TableContextValue {
  tablePath?: number[];
  tableNode?: TableNode;
  deleteIconPosition?: { rowIndex?: number; columnIndex?: number } | null;
  setDeleteIconPosition?: (
    position: { rowIndex?: number; columnIndex?: number } | null,
  ) => void;
}

export const TablePropsContext = React.createContext<TableContextValue>({});

/**
 * TablePropsProvider 组件 - 提供表格上下文状态管理
 */
export const TablePropsProvider: React.FC<{
  children: React.ReactNode;
  tablePath?: number[];
  tableNode?: TableNode;
}> = ({ children, tablePath, tableNode }) => {
  const [deleteIconPosition, setDeleteIconPosition] = useState<{
    rowIndex?: number;
    columnIndex?: number;
  } | null>(null);

  const handleSetDeleteIconPosition = useRefFunction(
    (position: { rowIndex?: number; columnIndex?: number } | null) => {
      setDeleteIconPosition(position);
    },
  );

  const contextValue: TableContextValue = {
    tablePath,
    tableNode,
    deleteIconPosition,
    setDeleteIconPosition: handleSetDeleteIconPosition,
  };

  return (
    <TablePropsContext.Provider value={contextValue}>
      {children}
    </TablePropsContext.Provider>
  );
};
