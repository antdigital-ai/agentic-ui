import classNames from 'classnames';
import React, { memo, useCallback } from 'react';
import { useStyle } from './ButtonTabStyle';

export interface ButtonTabProps {
  /** 按钮文本 */
  children?: React.ReactNode;
  /** 是否选中 */
  selected?: boolean;
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
  onClick,
  onIconClick,
  className,
  icon,
  prefixCls = 'md-editor-button-tab',
}) => {
  const { wrapSSR, hashId } = useStyle(prefixCls);

  // 使用 useCallback 优化事件处理函数
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onIconClick?.();
    },
    [onIconClick],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    },
    [onClick],
  );

  const buttonClassName = classNames(
    prefixCls,
    {
      [`${prefixCls}-selected`]: selected,
    },
    className,
    hashId,
  );

  const iconClassName = classNames(
    `${prefixCls}-icon`,
    {
      [`${prefixCls}-icon-clickable`]: !!onIconClick,
    },
    hashId,
  );

  return wrapSSR(
    <button
      type="button"
      className={buttonClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {children && (
        <span className={classNames(`${prefixCls}-text`, hashId)}>
          {children}
        </span>
      )}
      {icon && (
        <span
          className={iconClassName}
          onClick={onIconClick ? handleIconClick : undefined}
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
