import { useEffect, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { HistoryProps } from '../types';
import { useHistoryData } from './useHistoryData';
import { useHistorySearch } from './useHistorySearch';
import { useHistorySelection } from './useHistorySelection';

/**
 * 历史记录状态管理 Hook（顶层组装层）。
 *
 * 内部由 3 个职责单一的 sub-hook 组合而成：
 * - {@link useHistoryData}：列表数据加载、收藏修改、actionRef 暴露
 * - {@link useHistorySelection}：多选状态管理
 * - {@link useHistorySearch}：搜索关键词与过滤后列表
 *
 * useHistory 自身只做：
 * 1. 组装上述 sub-hook 的返回值，对外暴露稳定的扁平 API
 * 2. 持有真正跨 hook 的协调状态（如 `open` 菜单开关）
 * 3. 处理跨 hook 的副作用（如 sessionId 变化时初始化 selectedIds 并触发 reload）
 *
 * **公共签名（返回字段）保持向后兼容**，调用方无需感知内部已拆分。
 */
export const useHistory = (props: HistoryProps) => {
  const [open, setOpen] = useState(false);

  // ---- 数据层 ----
  const { chatList, loadHistory, handleFavorite } = useHistoryData(props);

  // ---- 多选层 ----
  const { selectedIds, setSelectedIds, handleSelectionChange } =
    useHistorySelection(props);

  // ---- 搜索层（依赖 chatList）----
  const { searchKeyword, filteredList, handleSearch } = useHistorySearch(
    props,
    chatList,
  );

  // 仅在挂载时触发 onInit / onShow，故意不把它们放进依赖数组：
  // 这两个回调表达「组件首次出现」的语义，重复触发会破坏调用方的副作用。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    props.onInit?.();
    props.onShow?.();
  }, []);

  // 跨 hook 协调：sessionId / request 改变时重新加载数据 + 重置多选。
  //
  // 语义说明（#22）：当外部 `sessionId` 改变（例如父组件切换会话），
  // 此处会把 `selectedIds` **整段覆盖** 为 `[新 sessionId]`，意图是
  // 「以"当前会话即默认选中"为出发点重置选择面板」。
  // 因此一旦 sessionId 在多选进行中发生变化，正在进行的多选会被覆盖丢弃 —
  // 这是有意行为而非 bug。如未来需要保留多选，请显式在新建状态机里处理。
  useEffect(() => {
    if (props.sessionId) {
      setSelectedIds([props.sessionId]);
    }
    loadHistory();
  }, [props.sessionId, props.request, loadHistory, setSelectedIds]);

  // 处理加载更多
  const handleLoadMore = useRefFunction(async () => {
    await props.agent?.onLoadMore?.();
  });

  // 处理新对话
  const handleNewChat = useRefFunction(async () => {
    await props.agent?.onNewChat?.();
    setOpen(false);
  });

  return {
    open,
    setOpen,
    chatList,
    searchKeyword,
    selectedIds,
    filteredList,
    loadHistory,
    handleFavorite,
    handleSelectionChange,
    handleSearch,
    handleLoadMore,
    handleNewChat,
  };
};
