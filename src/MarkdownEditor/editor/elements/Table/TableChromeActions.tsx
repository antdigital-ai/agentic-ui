import React from 'react';
import { useClickAway } from '../../../../Hooks/useClickAway';

interface TableChromeActionsProps {
  targetRef: React.RefObject<HTMLElement | null>;
  onDismiss: () => void;
  children: React.ReactNode;
}

/** 只在行/列操作激活时订阅外部点击，不为每个索引注册全局事件。 */
export function TableChromeActions({
  targetRef,
  onDismiss,
  children,
}: TableChromeActionsProps) {
  useClickAway(() => onDismiss(), targetRef);
  return <>{children}</>;
}
