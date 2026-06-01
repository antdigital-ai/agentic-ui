import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useEffect, useState } from 'react';
import { useRefFunction } from '../Hooks/useRefFunction';
import ButtonTab from './ButtonTab';
import { useStyle } from './ButtonTabGroupStyle';

const EMPTY_ITEMS: ButtonTabGroupProps['items'] = [];

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
  items = EMPTY_ITEMS,
  activeKey,
  defaultActiveKey,
  onChange,
  className,
  prefixCls: customPrefixCls,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  // P0-4：与 ButtonTab 一同迁入 'agentic-chatboot-*' 命名空间，并接入 ConfigProvider。
  const prefixCls = getPrefixCls(
    'agentic-chatboot-button-tab-group',
    customPrefixCls,
  );
  const { hashId } = useStyle(prefixCls);

  // P0-1：受控判定一次确定，避免后续读取 props 时状态漂移
  const isControlled = activeKey !== undefined;

  const [internalActiveKey, setInternalActiveKey] = useState<
    string | undefined
  >(() => defaultActiveKey ?? items[0]?.key);

  // P0-1：非受控模式下，items 异步加载或动态变更时，若当前选中项不在新 items 中，
  // 回落到第一个有效项；这样首屏 items=[] 后 items 到达时也能默认选中第一项。
  useEffect(() => {
    if (isControlled) return;
    if (internalActiveKey && items.some((it) => it.key === internalActiveKey)) {
      return;
    }
    setInternalActiveKey(items[0]?.key);
  }, [items, isControlled, internalActiveKey]);

  const currentActiveKey = isControlled ? activeKey : internalActiveKey;

  const handleTabClick = useRefFunction((key: string, disabled?: boolean) => {
    if (disabled) return;
    if (!isControlled) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  });

  return (
    // P0-2：用 clsx 拼接 className，避免模板字符串产生连续空格与命名风格不一致
    // P1-9：testid 与 prefixCls 解耦
    <div
      className={classNames(prefixCls, className, hashId)}
      data-testid="agentic-chatboot-button-tab-group"
      role="group"
      aria-label="Tab group"
    >
      {items.map((item) => (
        <ButtonTab
          key={item.key}
          selected={currentActiveKey === item.key}
          // P0-3：disabled 显式下传，由 ButtonTab 走原生 disabled / aria-disabled / 键盘拦截
          disabled={item.disabled}
          onClick={() => handleTabClick(item.key, item.disabled)}
          onIconClick={item.onIconClick}
          icon={item.icon}
        >
          {item.label}
        </ButtonTab>
      ))}
    </div>
  );
};

ButtonTabGroupComponent.displayName = 'ButtonTabGroup';

// 使用 React.memo 优化性能，避免不必要的重新渲染
const ButtonTabGroup = memo(ButtonTabGroupComponent);

export default ButtonTabGroup;
