import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useCallback, useContext } from 'react';
import { useStyle } from './ButtonTabStyle';

export interface ButtonTabProps {
  /** 按钮文本 */
  children?: React.ReactNode;
  /** 是否选中 */
  selected?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击回调 */
  onClick?: () => void;
  /** 图标点击回调 */
  onIconClick?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 左侧图标 */
  icon?: React.ReactNode;
  /** 前缀类名 */
  prefixCls?: string;
}

const ButtonTabComponent: React.FC<ButtonTabProps> = ({
  children,
  selected = false,
  disabled = false,
  onClick,
  onIconClick,
  className,
  icon,
  prefixCls: customPrefixCls,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  // P0-4：走 ConfigProvider 体系，并将默认前缀从 'md-editor-button-tab' 改为
  // 'agentic-chatboot-button-tab'，使其归属于 ChatBootPage 命名空间，避免冒充
  // markdown-editor 的命名空间；同时支持外层 ConfigProvider 自定义 prefixCls。
  const prefixCls = getPrefixCls('agentic-chatboot-button-tab', customPrefixCls);
  const { wrapSSR, hashId } = useStyle(prefixCls);

  // P0-3：disabled 时统一短路，避免键盘 Enter/Space 仍能触发 onClick
  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.();
  }, [disabled, onClick]);

  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onIconClick?.();
    },
    [disabled, onIconClick],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    },
    [disabled, onClick],
  );

  const buttonClassName = classNames(
    prefixCls,
    {
      [`${prefixCls}-selected`]: selected,
      [`${prefixCls}-disabled`]: disabled,
    },
    className,
    hashId,
  );

  const iconClassName = classNames(
    `${prefixCls}-icon`,
    {
      [`${prefixCls}-icon-clickable`]: !!onIconClick && !disabled,
    },
    hashId,
  );

  // P1-5：当 icon 区域是独立可点的（onIconClick 存在）时，需要让键盘也能触发它。
  // 用 role="button" + tabIndex + 键盘 handler 让 icon span 成为独立 a11y 元素；
  // 同时阻止键盘事件冒泡到外层主按钮，避免一次按键触发两次 onClick。
  const handleIconKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || !onIconClick) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onIconClick();
      }
    },
    [disabled, onIconClick],
  );

  // P1-9：testid 与 prefixCls 解耦
  const testId = 'agentic-chatboot-button-tab';

  return wrapSSR(
    <button
      type="button"
      className={buttonClassName}
      data-testid={testId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
    >
      {children && (
        <span className={classNames(`${prefixCls}-text`, hashId)}>
          {children}
        </span>
      )}
      {icon && (
        <span
          className={iconClassName}
          onClick={onIconClick && !disabled ? handleIconClick : undefined}
          onKeyDown={onIconClick && !disabled ? handleIconKeyDown : undefined}
          role={onIconClick && !disabled ? 'button' : undefined}
          tabIndex={onIconClick && !disabled ? 0 : undefined}
          aria-label={
            onIconClick && !disabled ? 'tab icon action' : undefined
          }
        >
          {icon}
        </span>
      )}
    </button>,
  );
};

ButtonTabComponent.displayName = 'ButtonTab';

// 使用 React.memo 优化性能，避免不必要的重新渲染
const ButtonTab = memo(ButtonTabComponent);

export default ButtonTab;
