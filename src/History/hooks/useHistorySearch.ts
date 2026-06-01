import { useMemo, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
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
 * 历史列表搜索状态管理 sub-hook。
 *
 * 拆分自 useHistory：
 * - 仅持有 searchKeyword 状态
 * - 由调用方传入 chatList 计算 filteredList，本 hook 不直接依赖列表来源
 * - 与 useHistoryData / useHistorySelection 完全解耦
 *
 * @internal 仅供 useHistory 组合使用，不对外暴露
 */
export const useHistorySearch = (
  props: HistoryProps,
  chatList: HistoryDataType[],
) => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredList = useMemo(
    () => filterListByKeyword(chatList, searchKeyword),
    [chatList, searchKeyword],
  );

  // 处理搜索：本地状态 + 同步通知 agent
  const handleSearch = useRefFunction((value: string) => {
    setSearchKeyword(value);
    props.agent?.onSearch?.(value);
  });

  return {
    searchKeyword,
    filteredList,
    handleSearch,
  };
};
