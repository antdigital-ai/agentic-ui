import { Search } from '@sofa-design/icons';
import { Input, type InputRef } from 'antd';
import classNames from 'clsx';
import React, { type FC, useRef } from 'react';

export interface SearchInputProps {
  keyword?: string;
  onChange?: (keyword: string) => void;
  searchPlaceholder?: string;
  prefixCls: string;
  hashId: string;
  locale?: Record<string, any>;
}

/**
 * 文件搜索输入框：受控关键词，自带 allowClear
 */
const SearchInputComponent: FC<SearchInputProps> = ({
  keyword,
  onChange,
  searchPlaceholder,
  prefixCls,
  hashId,
  locale,
}) => {
  const inputRef = useRef<InputRef>(null);

  return (
    <div className={classNames(`${prefixCls}-search`, hashId)}>
      <Input
        ref={inputRef}
        key="file-search-input"
        allowClear
        placeholder={
          searchPlaceholder ||
          locale?.['workspace.searchPlaceholder'] ||
          '搜索文件名'
        }
        prefix={<Search />}
        value={keyword ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};

SearchInputComponent.displayName = 'SearchInput';

export const SearchInput = SearchInputComponent;
