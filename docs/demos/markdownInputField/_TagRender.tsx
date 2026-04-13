import { ChevronDown } from '@sofa-design/icons';
import { Dropdown } from 'antd';
import React, { useMemo } from 'react';

export const TagRender: React.FC<{
  onSelect: (value: string) => void;
  defaultDom: React.ReactNode;
  placeholder: string;
  readonly?: boolean;
  style?: React.CSSProperties;
  chevronColor: string;
}> = ({ onSelect, defaultDom, readonly, style, placeholder, chevronColor }) => {
  const items = useMemo(
    () => [
      { key: '1', label: '选项1' },
      { key: '2', label: '选项2' },
      { key: '3', label: '选项3' },
    ],
    [],
  );

  return (
    <Dropdown
      disabled={readonly}
      menu={{
        items,
        onClick: (e) => {
          const item = items.find((i) => i.key === e.key);
          if (item) {
            onSelect(item.label);
          }
        },
      }}
      trigger={['click']}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 4, ...style }}
        title={placeholder || undefined}
      >
        {defaultDom}
        <ChevronDown style={{ color: chevronColor, fontSize: 12 }} />
      </div>
    </Dropdown>
  );
};
