import { RedoOutlined, UndoOutlined } from '@ant-design/icons';
import classNames from 'clsx';
import React from 'react';
import { ToolBarItem } from './ToolBarItem';

interface UndoRedoButtonsProps {
  baseClassName: string;
  hashId?: string;
  i18n: any;
  onUndo: () => void;
  onRedo: () => void;
}

export const UndoRedoButtons = React.memo<UndoRedoButtonsProps>(
  ({ baseClassName, hashId, i18n, onUndo, onRedo }) => {
    return (
      <>
        <ToolBarItem
          title={i18n?.locale?.undo || '撤销'}
          icon={<UndoOutlined />}
          onClick={onUndo}
          className={classNames(`${baseClassName}-item`, hashId)}
        />
        <ToolBarItem
          title={i18n?.locale?.redo || '重做'}
          icon={<RedoOutlined />}
          onClick={onRedo}
          className={classNames(`${baseClassName}-item`, hashId)}
        />
      </>
    );
  },
);

UndoRedoButtons.displayName = 'UndoRedoButtons';
