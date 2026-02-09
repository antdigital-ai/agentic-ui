import { HighlightOutlined } from '@ant-design/icons';
import { ColorPicker } from 'antd';
import classnames from 'clsx';
import React from 'react';
import { ToolBarItem } from './ToolBarItem';

const colors = [
  { color: 'rgba(16,185,129,1)' },
  { color: 'rgba(245,158,11,1)' },
  { color: 'rgba(59,130,246,1)' },
  { color: 'rgba(156,163,175,.8)' },
  { color: 'rgba(99,102, 241,1)' },
  { color: 'rgba(244,63,94,1)' },
  { color: 'rgba(217,70,239,1)' },
  { color: 'rgba(14, 165, 233, 1)' },
];

interface ColorPickerButtonProps {
  baseClassName: string;
  hashId?: string;
  i18n: any;
  highColor: string | null;
  isHighColorActive: boolean;
  onColorChange: (color: string) => void;
  onToggleHighColor: () => void;
}

export const ColorPickerButton = React.memo<ColorPickerButtonProps>(
  ({
    baseClassName,
    hashId,
    i18n,
    highColor,
    isHighColorActive,
    onColorChange,
    onToggleHighColor,
  }) => {
    const handleColorChange = React.useCallback(
      (color: any) => {
        onColorChange(color.toHexString());
      },
      [onColorChange],
    );

    return (
      <ToolBarItem
        title={i18n?.locale?.['font-color'] || '字体颜色'}
        icon={<HighlightOutlined />}
        className={classnames(`${baseClassName}-item`, hashId)}
        style={{ position: 'relative' }}
      >
        <ColorPicker
          style={{
            position: 'absolute',
            opacity: 0,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          size="small"
          value={highColor}
          presets={[
            {
              label: 'Colors',
              colors: colors.map((c) => c.color),
            },
          ]}
          onChange={handleColorChange}
        />
        <div
          style={{
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            fontWeight: isHighColorActive ? 'bold' : undefined,
            textDecoration: 'underline solid ' + highColor,
            textDecorationThickness: 2,
            lineHeight: 1,
            color: highColor || undefined,
          }}
          role="button"
          onMouseEnter={(e) => e.stopPropagation()}
          onClick={onToggleHighColor}
        >
          <HighlightOutlined />
        </div>
      </ToolBarItem>
    );
  },
);

ColorPickerButton.displayName = 'ColorPickerButton';
