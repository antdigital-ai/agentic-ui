import { CircleDashed, SuccessFill, X } from '@sofa-design/icons';
import classNames from 'clsx';
import React, { memo, useMemo } from 'react';
import { Loading } from '../../Components/Loading';
import { LOADING_SIZE } from '../constants';
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
  const statusContent = useMemo(() => {
    const contentMap: Record<TaskStatus, React.ReactNode> = {
      success: <SuccessFill />,
      loading: <Loading size={LOADING_SIZE} />,
      pending: (
        <div className={classNames(`${prefixCls}-status-idle`, hashId)}>
          <CircleDashed />
        </div>
      ),
      error: <X />,
    };
    return contentMap[status];
  }, [status, prefixCls, hashId]);

  return (
    <div
      className={classNames(
        `${prefixCls}-status`,
        `${prefixCls}-status-${status}`,
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
