import React, { type FC } from 'react';
import { handleKeyboardEvent } from '../handlers';

export interface AccessibleButtonProps {
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  ariaLabel: string;
  id?: string;
}

/**
 * 可访问按钮：将任意内容包裹为带键盘 a11y 的 role="button" 容器
 */
export const AccessibleButton: FC<AccessibleButtonProps> = ({
  icon,
  onClick,
  className,
  ariaLabel,
  id,
}) => (
  <div
    id={id}
    className={className}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => handleKeyboardEvent(e, onClick as any)}
    aria-label={ariaLabel}
  >
    {icon}
  </div>
);
