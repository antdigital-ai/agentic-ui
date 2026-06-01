import { useEffect, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { HistoryProps } from '../types';
import { HistoryDataType } from '../types/HistoryData';

/**
 * 浅比较两个历史列表是否在「展示语义」上完全一致。
 *
 * 用于 loadHistory 后判断是否真的需要 setChatList：
 * 当 actionRef.reload() 拉到的新列表与现有列表内容相同（同 sessionId / gmtCreate / 收藏态）时，
 * 跳过 setState 即可保留 chatList 的引用稳定性，避免下游 useMemo / React.memo 大面积失效。
 *
 * 注意：故意只比较少量「会影响渲染」的字段，而不是 deep equal —— 整体 deep equal 在长列表下成本过高，
 * 收益却很小（同一 sessionId 的 displayTitle 等字段更新本来就该触发 re-render）。
 */
function isHistoryListVisuallyEqual(
  prev: HistoryDataType[],
  next: HistoryDataType[],
): boolean {
  if (prev === next) return true;
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i += 1) {
    const a = prev[i];
    const b = next[i];
    if (
      a.sessionId !== b.sessionId ||
      a.gmtCreate !== b.gmtCreate ||
      a.isFavorite !== b.isFavorite ||
      a.sessionTitle !== b.sessionTitle ||
      a.status !== b.status
    ) {
      return false;
    }
  }
  return true;
}

/**
 * 历史列表数据管理 sub-hook：负责 chatList 的加载、收藏修改、actionRef 暴露。
 *
 * 拆分自 useHistory，让数据加载逻辑与多选 / 搜索状态解耦：
 * - 保持单一职责（只关心「列表数据从哪来 / 怎么变」）
 * - 让上层 useHistory 仅做组装，便于单独测试本 hook
 *
 * @internal 仅供 useHistory 组合使用，不对外暴露
 */
export const useHistoryData = (props: HistoryProps) => {
  const [chatList, setChatList] = useState<HistoryDataType[]>([]);

  const loadHistory = useRefFunction(async () => {
    // 防御 props.request 为 undefined：之前 `props?.request?.(...).then(...)` 在 request 缺失时会
    // 对 undefined 调用 .then 抛 TypeError，再被 `as HistoryDataType[]` 强行掩盖。
    if (!props.request) return;
    try {
      const list = await props.request({ agentId: props.agentId });
      const safeList = Array.isArray(list) ? list : [];
      // referential equality 优化：当新列表在展示语义上与旧列表完全一致时，
      // 用函数式 setState 返回旧引用，让 React 的 bail-out 跳过下游所有重渲。
      // 之前每次 reload 都无脑 setChatList(list)，会让 GroupMenu / useMemo 全量失效。
      setChatList((prev) =>
        isHistoryListVisuallyEqual(prev, safeList) ? prev : safeList,
      );
    } catch (error) {
      // 失败时回退为空列表，并把错误打到控制台，避免在 React 树中抛出未捕获 Promise。
      // 不直接 throw，保证 actionRef.reload() 调用方不需要也包 try/catch。
      // 同样用函数式 setState 走 bail-out，避免空 → 空也触发重渲。
      // eslint-disable-next-line no-console
      console.error('[History] loadHistory failed:', error);
      setChatList((prev) => (prev.length === 0 ? prev : []));
    }
  });

  // 暴露 reload 方法给 actionRef
  useEffect(() => {
    if (props.actionRef) {
      props.actionRef.current = {
        reload: loadHistory,
      };
    }
  }, [props.actionRef, loadHistory]);

  // 处理收藏：先回调外部，再本地同步 isFavorite，避免外部失败导致 UI 不一致
  const handleFavorite = useRefFunction(
    async (sessionId: string, isFavorite: boolean) => {
      await props.agent?.onFavorite?.(sessionId, isFavorite);
      setChatList((prev) =>
        prev.map((item) =>
          item.sessionId === sessionId ? { ...item, isFavorite } : item,
        ),
      );
    },
  );

  return {
    chatList,
    loadHistory,
    handleFavorite,
  };
};
