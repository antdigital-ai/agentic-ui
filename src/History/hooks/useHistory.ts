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

  // 仅在挂载时触发 onInit / onShow，故意不把它们放进依赖数组（#25）：
  //
  // 这两个回调语义虽然相近但不等价，约定如下：
  // - `onInit`：组件**首次实例化**完成时触发一次，调用方常用来做一次性初始化
  //   （如埋点上报、首次拉取依赖资源），不应在每次显示时重复触发。
  // - `onShow`：组件**首次出现在视图**时触发一次，调用方常用来做曝光埋点。
  //   当前实现把它和 `onInit` 一起在 mount 时触发是有意行为——下拉模式下
  //   `open` 状态切换并不会重新 mount 本 hook，所以这里只暴露「首次显示」语义；
  //   如果未来需要「每次展开都触发」，请新建独立 effect 监听 `open` 而非改本处。
  //
  // 依赖数组留空也是 #25 的一部分：把 `props.onInit / props.onShow` 放进去会因为
  // 每次渲染回调引用变化导致重复触发，这正是要避免的副作用风暴。
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

  /**
   * 透传到 `agent.onLoadMore` 的稳定 ref 包装（#30）。
   *
   * 之所以不直接把 `props.agent?.onLoadMore` 暴露出去：
   * - 调用方（HistoryLoadMore 等组件）通常 `React.memo` 包装，需要稳定的引用避免重渲。
   * - 通过 `useRefFunction` 的稳定 wrapper，每次渲染拿到的引用一致，但内部仍能读到最新的 `props.agent.onLoadMore`。
   *
   * 注意：本 wrapper 不做 loading / 防抖 / 错误兜底——这些应由调用方组件按场景决定。
   */
  const handleLoadMore = useRefFunction(async () => {
    await props.agent?.onLoadMore?.();
  });

  /**
   * 透传到 `agent.onNewChat` 的稳定 ref 包装，并在 await 完成后副作用关闭下拉菜单（#30）。
   *
   * 关闭 `open` 是有意行为：从用户视角看「点新对话 → 操作完成 → 历史下拉自动收起」是一致的体感。
   * 如果调用方 reject 或抛错，此处不会关闭菜单——这一点保留给 `useRefFunction` 的默认错误透传，
   * 调用方可在外层用 try/catch 决定是否回退 UI。
   */
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
