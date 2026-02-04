import { Dropdown } from 'antd';
import classnames from 'classnames';
import React from 'react';
import { ToolBarItem } from './ToolBarItem';

interface HeadingDropdownProps {
  baseClassName: string;
  hashId?: string;
  i18n: any;
  node: any;
  hideTools?: string[];
  onHeadingChange: (level: number) => void;
}

export const HeadingDropdown = React.memo<HeadingDropdownProps>(
  ({ baseClassName, hashId, i18n, node, hideTools, onHeadingChange }) => {
    const getHeadingText = React.useCallback(
      (level: number | string) => {
        const locale = i18n?.locale || {};
        switch (level) {
          case 1:
          case '1':
            return locale.largeTitle || '大标题';
          case 2:
          case '2':
            return locale.paragraphTitle || '段落标题';
          case 3:
          case '3':
            return locale.smallTitle || '小标题';
          case 4:
          case '4':
          case 'Text':
            return locale.bodyText || '正文';
          default:
            return `H${level}`;
        }
      },
      [i18n],
    );

    const headingItems = React.useMemo(
      () =>
        ['H1', 'H2', 'H3', 'Text']
          .map((item, index) => {
            if (hideTools?.includes(item)) {
              return null;
            }
            return {
              label: getHeadingText(item.replace('H', '')),
              key: `head-${item}`,
              onClick: () => onHeadingChange(index + 1),
            };
          })
          .filter(Boolean),
      [hideTools, onHeadingChange, getHeadingText],
    );

    const currentText = React.useMemo(() => {
      if (node?.[0]?.level) {
        return getHeadingText(node[0].level);
      }
      return getHeadingText('Text');
    }, [node, getHeadingText]);

    return (
      <Dropdown menu={{ items: headingItems }}>
        <ToolBarItem
          title={i18n?.locale?.heading || '标题'}
          icon={null}
          className={classnames(`${baseClassName}-item`, hashId)}
          style={{
            minWidth: 36,
            textAlign: 'center',
            fontSize: 12,
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {currentText}
        </ToolBarItem>
      </Dropdown>
    );
  },
);

HeadingDropdown.displayName = 'HeadingDropdown';
