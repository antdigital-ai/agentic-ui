import { Dropdown } from 'antd';
import classnames from 'clsx';
import React from 'react';
import { ToolBarItem } from './ToolBarItem';

const HeadingLocaleKeyMap = {
  1: 'largeTitle',
  2: 'paragraphTitle',
  3: 'smallTitle',
  4: 'bodyText',
  Text: 'bodyText',
} as const;

const getHeadingText = (i18n: any, level: keyof typeof HeadingLocaleKeyMap) => {
  const localeKey = HeadingLocaleKeyMap[level];
  return i18n?.locale?.[localeKey] || localeKey;
};

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
    const headingItems = React.useMemo(
      () =>
        ['H1', 'H2', 'H3', 'Text']
          .map((item, index) => {
            if (hideTools?.includes(item)) {
              return null;
            }
            const level =
              item === 'Text'
                ? 'Text'
                : (Number(item.slice(1)) as 1 | 2 | 3 | 4);
            return {
              label: getHeadingText(i18n, level),
              key: `head-${item}`,
              onClick: () => onHeadingChange(index + 1),
            };
          })
          .filter(Boolean),
      [hideTools, i18n, onHeadingChange],
    );

    const currentText = React.useMemo(() => {
      if (node?.[0]?.level) {
        return getHeadingText(i18n, node[0].level);
      }
      return getHeadingText(i18n, 'Text');
    }, [i18n, node]);

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
