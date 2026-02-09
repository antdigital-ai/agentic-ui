import { LinkOutlined } from '@ant-design/icons';
import classnames from 'clsx';
import React from 'react';
import { ToolBarItem } from './ToolBarItem';

interface LinkButtonProps {
  baseClassName: string;
  hashId?: string;
  i18n: any;
  onInsertLink: () => void;
  isLinkActive: boolean;
}

export const LinkButton = React.memo<LinkButtonProps>(
  ({ baseClassName, hashId, i18n, onInsertLink, isLinkActive }) => {
    return (
      <ToolBarItem
        title={i18n?.locale?.insertLink || '插入链接'}
        icon={<LinkOutlined />}
        onClick={onInsertLink}
        className={classnames(`${baseClassName}-item`, hashId)}
        style={{
          color: isLinkActive ? '#1677ff' : undefined,
        }}
      />
    );
  },
);

LinkButton.displayName = 'LinkButton';
