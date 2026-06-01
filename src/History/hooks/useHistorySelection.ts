import { useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { HistoryProps } from '../types';

/**
 * 历史多选状态管理 sub-hook。
 *
 * 拆分自 useHistory：
 * - 仅持有 selectedIds 状态与变更回调
 * - 不感知列表数据（与 useHistoryData 完全解耦）
 *
 * @internal 仅供 useHistory 组合使用，不对外暴露
 */
export const useHistorySelection = (props: HistoryProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 处理多选 —— 用函数式 setState 避免 selectedIds 闭包陈旧（连续 toggle 会丢更新）
  const handleSelectionChange = useRefFunction(
    (sessionId: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const next = checked
          ? [...prev, sessionId]
          : prev.filter((id) => id !== sessionId);
        props.agent?.onSelectionChange?.(next);
        return next;
      });
    },
  );

  return {
    selectedIds,
    setSelectedIds,
    handleSelectionChange,
  };
};
