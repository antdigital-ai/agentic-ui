import { searchResults } from './searchDataFormatted';
import { SearchResultItem } from './types';

/**
 * 重组 searchData，提取需要的数据
 * 现在直接使用预生成的数据，避免运行时处理
 */
export const transformSearchData = (): SearchResultItem[] => {
  return searchResults;
};

/**
 * 根据搜索关键词过滤数据
 */
export const filterSearchResults = (
  searchValue: string,
  allResults: SearchResultItem[],
): SearchResultItem[] => {
  if (!searchValue.trim()) {
    return [];
  }

  const lowerSearchValue = searchValue.toLowerCase().trim();

  return allResults.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(lowerSearchValue);
    const descriptionMatch = item.description
      .toLowerCase()
      .includes(lowerSearchValue);
    return titleMatch || descriptionMatch;
  });
};
