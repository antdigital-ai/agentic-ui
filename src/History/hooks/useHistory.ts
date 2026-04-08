import { useEffect, useMemo, useRef, useState } from 'react';
import { useRefFunction } from '../../index';
import { HistoryProps } from '../types';
import { HistoryDataType } from '../types/HistoryData';

/**
 * 根据关键词从列表中过滤
 */
function filterListByKeyword(
  list: HistoryDataType[],
  keyword: string,
): HistoryDataType[] {
  if (!keyword.trim()) return list;
  const lower = keyword.toLowerCase();
  return list.filter((item) => {
    const title =
      typeof item.sessionTitle === 'string'
        ? item.sessionTitle
        : String(item.sessionTitle || '');
    return title.toLowerCase().includes(lower);
  });
}

/**
 * 历史记录状态管理 Hook
 */
export const useHistory = (props: HistoryProps) => {
  const [open, setOpen] = useState(false);
  const chatListRef = useRef<HistoryDataType[]>([]);
  const [listVersion, setListVersion] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredList = useMemo(
    () => filterListByKeyword(chatListRef.current, searchKeyword),
    [searchKeyword, listVersion],
  );

  const loadHistory = useRefFunction(async () => {
    const msg = (await props
      ?.request?.({
        agentId: props.agentId,
      })
      .then((m) => m)) as HistoryDataType[];
    chatListRef.current = msg || [];
    setListVersion((v) => v + 1);
  });

  // 暴露 reload 方法给 actionRef
  useEffect(() => {
    if (props.actionRef) {
      props.actionRef.current = {
        reload: loadHistory,
      };
    }
  }, [props.actionRef, loadHistory]);

  useEffect(() => {
    props.onInit?.();
    props.onShow?.();
  }, []);

  // 当 sessionId 或 request 改变时重新加载数据
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props.sessionId && setSelectedIds([props.sessionId]);
    loadHistory();
  }, [props.sessionId, props.request, loadHistory]);

  // 处理收藏
  const handleFavorite = useRefFunction(
    async (sessionId: string, isFavorite: boolean) => {
      await props.agent?.onFavorite?.(sessionId, isFavorite);
      chatListRef.current = chatListRef.current.map((item) =>
        item.sessionId === sessionId ? { ...item, isFavorite } : item,
      );
      setListVersion((v) => v + 1);
    },
  );

  // 处理多选
  const handleSelectionChange = useRefFunction(
    (sessionId: string, checked: boolean) => {
      const newSelectedIds = checked
        ? [...selectedIds, sessionId]
        : selectedIds.filter((id) => id !== sessionId);

      setSelectedIds(newSelectedIds);
      props.agent?.onSelectionChange?.(newSelectedIds);
    },
  );

  // 处理搜索
  const handleSearch = useRefFunction((value: string) => {
    setSearchKeyword(value);
    props.agent?.onSearch?.(value);
  });

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
    chatList: chatListRef.current,
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
