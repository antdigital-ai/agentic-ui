import { CircleDashed, SuccessFill, X } from '@sofa-design/icons';
import classNames from 'clsx';
import React, { memo } from 'react';
import { Loading } from '../../Components/Loading';
import { LOADING_SIZE } from '../constants';
import type { TaskStatus } from '../types';

interface StatusIconProps {
  status: TaskStatus;
  prefixCls: string;
  hashId: string;
}

export const StatusIcon: React.FC<StatusIconProps> = memo(
  ({ status, prefixCls, hashId }) => {
    const statusMap: Record<TaskStatus, React.ReactNode> = {
      success: <SuccessFill />,
      loading: <Loading size={LOADING_SIZE} />,
      pending: (
        <div className={classNames(`${prefixCls}-status-idle`, hashId)}>
          <CircleDashed />
        </div>
      ),
      error: <X />,
    };

    return (
      <div
        className={classNames(
          `${prefixCls}-status`,
          `${prefixCls}-status-${status}`,
          hashId,
        )}
        data-testid={`task-list-status-${status}`}
      >
        {statusMap[status]}
      </div>
    );
  },
);

StatusIcon.displayName = 'StatusIcon';
