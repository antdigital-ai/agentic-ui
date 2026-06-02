import { SuccessFill, X } from '@sofa-design/icons';
import classNames from 'clsx';
import React, { memo, useMemo } from 'react';
import { Loading } from '../../Components/Loading';
import { getTaskStatusStyleKey, LOADING_SIZE } from '../constants';
import type { TaskStatus } from '../types';

interface StatusIconProps {
  status: TaskStatus;
  prefixCls: string;
  hashId: string;
  /**
   * 覆盖根节点 `data-testid`（默认 `task-list-status-${status}`）
   * @description simple 汇总条与列表项都会渲染状态图标，需区分时可传入独立 testid
   */
  statusTestId?: string;
}

const StatusIconComponent: React.FC<StatusIconProps> = ({
  status,
  prefixCls,
  hashId,
  statusTestId,
}) => {
  const styleKey = getTaskStatusStyleKey(status);

  const statusContent = useMemo(() => {
    if (styleKey === 'loading') {
      return <Loading size={LOADING_SIZE} />;
    }
    const contentMap: Record<'success' | 'error', React.ReactNode> = {
      success: <SuccessFill />,
      error: <X />,
    };
    return contentMap[styleKey as 'success' | 'error'];
  }, [styleKey]);

  return (
    <div
      className={classNames(
        `${prefixCls}-status`,
        `${prefixCls}-status-${styleKey}`,
        hashId,
      )}
      data-testid={statusTestId ?? `task-list-status-${status}`}
    >
      {statusContent}
    </div>
  );
};

StatusIconComponent.displayName = 'StatusIcon';

export const StatusIcon = memo(StatusIconComponent);
