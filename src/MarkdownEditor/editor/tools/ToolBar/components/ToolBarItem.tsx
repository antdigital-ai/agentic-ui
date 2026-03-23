import { Tooltip } from 'antd';
import React from 'react';

export interface ToolBarItemProps {
  title?: string;
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  tabIndex?: number;
  children?: React.ReactNode;
}

export const ToolBarItem = React.memo<ToolBarItemProps>(
  ({
    title,
    icon,
    onClick,
    onMouseDown,
    onMouseEnter,
    className,
    style,
    role = 'button',
    tabIndex,
    children,
  }) => {
    const handleClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(e);
      },
      [onClick],
    );

    const handleMouseDown = React.useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        onMouseDown?.(e);
      },
      [onMouseDown],
    );

    const content = (
      <div
        role={role}
        className={className}
        style={style}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={onMouseEnter}
        tabIndex={tabIndex}
      >
        {children || icon}
      </div>
    );

    // 仅在有 title 时使用 Tooltip，避免 rc-resize-observer 的 findDOMNode 弃用警告
    return title ? <Tooltip title={title}>{content}</Tooltip> : content;
  },
);

ToolBarItem.displayName = 'ToolBarItem';
