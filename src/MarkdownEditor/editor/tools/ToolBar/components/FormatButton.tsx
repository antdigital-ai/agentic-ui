import { FormatPainterOutlined } from '@ant-design/icons';
import classnames from 'clsx';
import React from 'react';
import { ToolBarItem } from './ToolBarItem';

interface FormatButtonProps {
  baseClassName: string;
  hashId?: string;
  i18n: any;
  onFormat: () => void;
}

export const FormatButton = React.memo<FormatButtonProps>(
  ({ baseClassName, hashId, i18n, onFormat }) => {
    return (
      <ToolBarItem
        title={i18n.locale?.format || '格式化'}
        icon={<FormatPainterOutlined />}
        onClick={onFormat}
        className={classnames(`${baseClassName}-item`, hashId)}
        style={{ fontSize: '0.9em' }}
      />
    );
  },
);

FormatButton.displayName = 'FormatButton';
