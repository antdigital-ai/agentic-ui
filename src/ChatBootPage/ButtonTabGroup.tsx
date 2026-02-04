import React, { memo, useCallback, useState } from 'react';
import ButtonTab from './ButtonTab';
import { useStyle } from './ButtonTabGroupStyle';

export interface ButtonTabItem {
  /** Tab 的唯一标识 */
  key: string;
  /** Tab 显示的文本 */
  label: React.ReactNode;
  /** Tab 的图标 */
  icon?: React.ReactNode;
  /** 图标点击回调 */
  onIconClick?: () => void;
  /** 是否禁用 */
  disabled?: boolean;
}

export interface ButtonTabGroupProps {
  /** Tab 配置项 */
  items?: ButtonTabItem[];
  /** 当前选中的 Tab key */
  activeKey?: string;
  /** 默认选中的 Tab key（非受控模式） */
  defaultActiveKey?: string;
  /** Tab 切换时的回调 */
  onChange?: (key: string) => void;
  /** 自定义类名 */
  className?: string;
  /** 前缀类名 */
  prefixCls?: string;
}

const ButtonTabGroupComponent: React.FC<ButtonTabGroupProps> = ({
  items = [],
  activeKey,
  defaultActiveKey,
  onChange,
  className,
  prefixCls = 'md-editor-button-tab-group',
}) => {
  const { wrapSSR, hashId } = useStyle(prefixCls);
  const [internalActiveKey, setInternalActiveKey] = useState<string>(
    defaultActiveKey || items[0]?.key || '',
  );

  const currentActiveKey =
    activeKey !== undefined ? activeKey : internalActiveKey;

  // 使用 useCallback 优化点击处理函数
  const handleTabClick = useCallback(
    (key: string, disabled?: boolean) => {
      if (disabled) return;

      if (activeKey === undefined) {
        setInternalActiveKey(key);
      }

      onChange?.(key);
    },
    [activeKey, onChange],
  );

  return wrapSSR(
    <div
      className={`${prefixCls} ${className || ''} ${hashId}`}
      role="group"
      aria-label="Tab group"
    >
      {items.map((item) => (
        <ButtonTab
          key={item.key}
          selected={currentActiveKey === item.key}
          onClick={() => handleTabClick(item.key, item.disabled)}
          onIconClick={item.onIconClick}
          icon={item.icon}
          className={item.disabled ? `${prefixCls}-item-disabled` : ''}
        >
          {item.label}
        </ButtonTab>
      ))}
    </div>,
  );
};

ButtonTabGroupComponent.displayName = 'ButtonTabGroup';

// 使用 React.memo 优化性能，避免不必要的重新渲染
const ButtonTabGroup = memo(ButtonTabGroupComponent);

export default ButtonTabGroup;
