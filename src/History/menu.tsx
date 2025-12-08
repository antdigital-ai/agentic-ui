import { ConfigProvider, Spin } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { useRefFunction } from '../Hooks/useRefFunction';
import { useStyle } from './style';

// Antd Menu 兼容的菜单项类型
export interface MenuItemType {
  key: string;
  label: React.ReactNode;
  type?: 'group' | 'item';
  children?: MenuItemType[];
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface GroupMenuProps {
  /** 菜单项列表 - 支持最多双层嵌套 */
  items?: MenuItemType[];
  /** 当前选中的键列表 - 兼容 Antd Menu */
  selectedKeys?: string[];
  /** 菜单项点击回调 - 兼容 Antd Menu */
  onSelect?: (info: { key: string }) => void;
  /** 自定义样式类名 */
  className?: string;
  /** 子组件类名配置 */
  classNames?: {
    /** 菜单项类名 */
    menuItemClassName?: string;
    /** 激活菜单项类名 */
    menuItemActiveClassName?: string;
    /** 禁用菜单项类名 */
    menuItemDisabledClassName?: string;
    /** 菜单项内容类名 */
    menuItemContentClassName?: string;
    /** 菜单项图标类名 */
    menuItemIconClassName?: string;
    /** 子菜单类名 */
    submenuClassName?: string;
    /** 子菜单标题类名 */
    submenuTitleClassName?: string;
  };
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 缩进像素 */
  inlineIndent?: number;
  /** 菜单模式 - 兼容 Antd Menu */
  mode?: 'vertical' | 'horizontal' | 'inline';
  /** 加载状态 */
  loading?: boolean;
}

// 菜单项组件
const MenuItem: React.FC<{
  item: MenuItemType;
  isSelected: boolean;
  inlineIndent: number;
  onSelect: (key: string) => void;
  level?: number;
  prefixCls: string;
  hashId: string;
  currentSelectedKey?: string;
  classNames?: {
    menuItemClassName?: string;
    menuItemActiveClassName?: string;
    menuItemDisabledClassName?: string;
    menuItemContentClassName?: string;
    menuItemIconClassName?: string;
    submenuClassName?: string;
    submenuTitleClassName?: string;
  };
}> = ({
  item,
  isSelected,
  inlineIndent = 0,
  onSelect,
  level = 0,
  prefixCls,
  hashId,
  currentSelectedKey,
  classNames: customClassNames,
}) => {
  const baseClass = `${prefixCls}-item`;
  const handleClick = useRefFunction(() => {
    if (!item.disabled) {
      onSelect(item.key);
      item.onClick?.();
    }
  });

  // 如果是分组且有子项，并且嵌套层级小于2
  if (item.type === 'group' && item.children && level < 2) {
    return (
      <div
        className={classNames(
          `${prefixCls}-submenu`,
          hashId,
          customClassNames?.submenuClassName,
        )}
      >
        <div
          className={classNames(hashId, customClassNames?.menuItemClassName, {
            [`${baseClass}-group`]: true,
          })}
        >
          <div
            className={classNames(
              `${baseClass}-content`,
              hashId,
              customClassNames?.menuItemContentClassName,
            )}
          >
            {item.icon && (
              <span
                className={classNames(
                  `${baseClass}-icon`,
                  hashId,
                  customClassNames?.menuItemIconClassName,
                )}
              >
                {item.icon}
              </span>
            )}
            {item.label}
          </div>
        </div>
        {item.children.map((child) => (
          <MenuItem
            key={child.key}
            item={child}
            isSelected={currentSelectedKey === child.key}
            inlineIndent={inlineIndent}
            onSelect={onSelect}
            level={level + 1}
            prefixCls={prefixCls}
            hashId={hashId}
            currentSelectedKey={currentSelectedKey}
            classNames={customClassNames}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        baseClass,
        hashId,
        customClassNames?.menuItemClassName,
        {
          [`${baseClass}-selected`]: isSelected,
          [`${baseClass}-disabled`]: item.disabled,
        },
      )}
      onClick={handleClick}
      role="menuitem"
      tabIndex={item.disabled ? -1 : 0}
      aria-selected={isSelected}
      aria-disabled={item.disabled}
    >
      <div
        className={classNames(
          `${baseClass}-content`,
          hashId,
          customClassNames?.menuItemContentClassName,
        )}
      >
        {item.icon && (
          <span
            className={classNames(
              `${baseClass}-icon`,
              hashId,
              customClassNames?.menuItemIconClassName,
            )}
          >
            {item.icon}
          </span>
        )}
        {item.label}
      </div>
    </div>
  );
};

/**
 * GroupMenu 组件 - 兼容 Antd Menu API 的自定义菜单组件
 */
export const GroupMenu: React.FC<GroupMenuProps> = (props) => {
  const {
    items = [],
    selectedKeys = [],
    onSelect,
    inlineIndent = 20,
    className,
    classNames: propsClassNames = {},
    style,
    loading = false,
    ...restProps
  } = props;

  // 使用 ConfigProvider 获取前缀类名
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-chat-history-menu');

  // 注册样式
  const { wrapSSR, hashId } = useStyle(prefixCls);

  // 确定当前选中的键
  const currentSelectedKey = selectedKeys && selectedKeys[0];

  // 直接使用传入的 items，支持最多双层嵌套
  const dataSource = items || [];

  const handleSelect = useRefFunction((key: string) => {
    onSelect?.({ key });
  });

  // 直接传递用户自定义的 classNames
  return wrapSSR(
    <div
      className={classNames(prefixCls, hashId, className)}
      style={style}
      role="menu"
      aria-label="菜单"
      tabIndex={0}
      {...restProps}
    >
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Spin />
        </div>
      ) : (
        dataSource.map((item) => (
          <MenuItem
            key={item.key}
            item={item}
            isSelected={currentSelectedKey === item.key}
            inlineIndent={inlineIndent}
            onSelect={handleSelect}
            classNames={propsClassNames}
            prefixCls={prefixCls}
            hashId={hashId}
            currentSelectedKey={currentSelectedKey}
          />
        ))
      )}
    </div>,
  );
};

export default GroupMenu;
