import * as SofaIcons from '@sofa-design/icons';
import { Input, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

type SofaIconEntry = [string, React.ElementType];

const GRID_GAP = 16;
const GRID_MIN_COLUMN_WIDTH = 140;
const ICON_SIZE = 24;
const CELL_PADDING = 12;
const CELL_RADIUS = 8;
const LABEL_FONT_SIZE = 12;
const LABEL_LINE_HEIGHT = 1.4;
const ICON_NAME_GAP = 8;
const CELL_BORDER_COLOR = '#E6E8EB';
const CELL_BACKGROUND = '#FFFFFF';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: GRID_GAP,
  padding: GRID_GAP,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_MIN_COLUMN_WIDTH}px, 1fr))`,
  gap: GRID_GAP,
};

const cellStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: ICON_NAME_GAP,
  padding: CELL_PADDING,
  borderRadius: CELL_RADIUS,
  border: `1px solid ${CELL_BORDER_COLOR}`,
  background: CELL_BACKGROUND,
  textAlign: 'center',
};

const iconStyle: React.CSSProperties = {
  fontSize: ICON_SIZE,
  lineHeight: 1,
};

const labelStyle: React.CSSProperties = {
  fontSize: LABEL_FONT_SIZE,
  lineHeight: LABEL_LINE_HEIGHT,
  wordBreak: 'break-word',
};

const isValidIconComponent = (value: unknown): value is React.ElementType => {
  if (!value) {
    return false;
  }

  if (typeof value === 'function') {
    return true;
  }

  if (typeof value === 'object' && '$$typeof' in value) {
    return true;
  }

  return false;
};

const shouldIncludeIcon = (name: string, icon: unknown) => {
  if (name === 'default') {
    return false;
  }

  const firstChar = name.charAt(0);
  if (!firstChar || firstChar !== firstChar.toUpperCase()) {
    return false;
  }

  return isValidIconComponent(icon);
};

const getSofaIconEntries = (): SofaIconEntry[] => {
  const entries = Object.entries(SofaIcons as Record<string, unknown>);
  const iconEntries: SofaIconEntry[] = [];

  entries.forEach(([name, icon]) => {
    if (!shouldIncludeIcon(name, icon)) {
      return;
    }

    iconEntries.push([name, icon as React.ElementType]);
  });

  return iconEntries.sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
};

const sofaIconEntries = getSofaIconEntries();

const IconListDemo: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');

  const filteredIconEntries = useMemo(() => {
    if (!searchValue.trim()) {
      return sofaIconEntries;
    }

    const lowerSearchValue = searchValue.toLowerCase();
    return sofaIconEntries.filter(([iconName]) =>
      iconName.toLowerCase().includes(lowerSearchValue),
    );
  }, [searchValue]);

  return (
    <div style={containerStyle}>
      <Input
        placeholder="搜索图标名称"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        allowClear
        style={{ marginBottom: GRID_GAP }}
      />
      <Typography.Text type="secondary">
        共 {filteredIconEntries.length} 个 Sofa Icons
        {searchValue && ` (从 ${sofaIconEntries.length} 个中筛选)`}
      </Typography.Text>
      <div style={gridStyle}>
        {filteredIconEntries.map(([iconName, IconComponent]) => (
          <div key={iconName} style={cellStyle} title={iconName}>
            <IconComponent style={iconStyle} aria-label={iconName} />
            <span style={labelStyle}>{iconName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconListDemo;
