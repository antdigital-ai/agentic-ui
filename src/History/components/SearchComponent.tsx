import { Input, Spin } from 'antd';
import React, { useContext, useRef, useState } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import useClickAway from '../../Hooks/useClickAway';
import { useDebounceFn } from '../../Hooks/useDebounceFn';
import { I18nContext } from '../../I18n';

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill="none"
      version="1.1"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      {...props}
    >
      <g clipPath="url(#master_svg0_645_36290/645_35767/1_00870)">
        <g>
          <path
            d="M9.693555458984376,10.518662270507813C8.795425458984376,11.237102270507812,7.656175458984375,11.666702270507812,6.416595458984375,11.666702270507812C3.517095458984375,11.666702270507812,1.166595458984375,9.316202270507812,1.166595458984375,6.4167022705078125C1.166595458984375,3.5172022705078123,3.517095458984375,1.1667022705078125,6.416595458984375,1.1667022705078125C9.316095458984375,1.1667022705078125,11.666595458984375,3.5172022705078123,11.666595458984375,6.4167022705078125C11.666595458984375,7.656302270507813,11.236995458984374,8.795562270507812,10.518515458984375,9.693702270507812L12.662395458984374,11.837602270507812C12.771795458984375,11.947002270507813,12.833195458984376,12.095302270507812,12.833195458984376,12.250002270507812C12.833195458984376,12.572202270507812,12.572095458984375,12.833402270507813,12.249895458984374,12.833402270507813C12.095195458984374,12.833402270507813,11.946795458984376,12.771902270507812,11.837395458984375,12.662502270507812L9.693555458984376,10.518662270507813ZM10.499925458984375,6.4167022705078125C10.499925458984375,4.1615422705078124,8.671755458984375,2.3333722705078124,6.416595458984375,2.3333722705078124C4.161435458984375,2.3333722705078124,2.333265458984375,4.1615422705078124,2.333265458984375,6.4167022705078125C2.333265458984375,8.671862270507813,4.161435458984375,10.500032270507813,6.416595458984375,10.500032270507813C8.671755458984375,10.500032270507813,10.499925458984375,8.671862270507813,10.499925458984375,6.4167022705078125Z"
            fillRule="evenodd"
            fill="currentColor"
          />
        </g>
      </g>
    </svg>
  );
}

/**
 * 历史记录搜索组件属性接口
 */
interface HistorySearchProps {
  /** 搜索关键词 */
  searchKeyword?: string;
  /** 搜索回调函数 */
  onSearch?: (value: string) => void;
  /** 历史记录类型 */
  type?: 'chat' | 'task';
  /** 搜索框配置 */
  searchOptions?: {
    /** 搜索输入框 placeholder 文案 */
    placeholder?: string;
    /** 未展开时的默认文本 */
    text?: string;
    /** 搜索触发方式: 'change' - 实时搜索(默认), 'enter' - 回车触发 */
    trigger?: 'change' | 'enter';
  };
}

/**
 * HistorySearch 组件 - 历史记录搜索组件
 *
 * 该组件提供一个搜索输入框，用于搜索历史记录。
 * 支持加载状态显示和错误处理。
 *
 * @component
 * @description 历史记录搜索组件，用于搜索历史对话记录
 * @param {HistorySearchProps} props - 组件属性
 * @param {string} props.searchKeyword - 搜索关键词
 * @param {(value: string) => void} props.onSearch - 搜索回调函数
 * @param {boolean} [props.enabled=false] - 是否启用搜索功能
 *
 * @example
 * ```tsx
 * <HistorySearch
 *   searchKeyword={keyword}
 *   onSearch={(value) => handleSearch(value)}
 *   enabled={true}
 * />
 * ```
 *
 * @returns {React.ReactElement|null} 渲染的搜索输入框组件，未启用时返回null
 *
 * @remarks
 * - 支持实时搜索
 * - 包含加载状态显示
 * - 支持清空输入
 * - 包含错误处理机制
 * - 响应式输入框设计
 * - 条件渲染支持
 * - 默认显示搜索图标，点击后展开搜索框
 */
export const HistorySearch: React.FC<HistorySearchProps> = ({
  onSearch,
  type,
  searchOptions,
}) => {
  const { locale } = useContext(I18nContext);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const trigger = searchOptions?.trigger || 'change';

  useClickAway(() => {
    if (!inputValue) {
      setIsExpanded(false);
    }
  }, ref);

  const handleSearchWithLoading = async (value: string) => {
    try {
      setLoading(true);
      await onSearch?.(value);
    } catch (error) {
      // 处理错误
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSearch = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSearchChange = useDebounceFn(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      handleSearchWithLoading(value);
    },
    360,
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (trigger === 'change') {
      handleSearchChange.run(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (trigger === 'enter' && e.key === 'Enter') {
      handleSearchWithLoading(inputValue);
    }
  };

  // 展开后显示搜索框
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 32, // 固定高度为32px
        padding: isExpanded ? 0 : '0 6px 0 12px', // 输入框状态下移除padding
      }}
    >
      {isExpanded ? (
        <Input
          placeholder={
            searchOptions?.placeholder ??
            (type === 'task'
              ? locale?.['chat.task.search.placeholder'] || '搜索任务'
              : locale?.['chat.history.search.placeholder'] || '搜索话题')
          }
          prefix={
            loading ? (
              <Spin size="small" />
            ) : (
              <SearchIcon
                style={{ color: 'var(--color-gray-text-secondary)' }}
              />
            )
          }
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: 32,
            background: 'var(--color-gray-bg-card-light)',
          }}
          onClear={() => {
            setInputValue('');
            handleSearchWithLoading('');
          }}
          allowClear
          variant="filled"
          autoFocus
        />
      ) : (
        <>
          <div
            style={{
              font: 'var(--font-text-body-emphasized-sm)',
              letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
              color: 'var(--color-gray-text-light)',
              flex: 1,
            }}
          >
            {searchOptions?.text ??
              (type === 'task'
                ? locale?.['chat.history.historyTasks'] || '历史任务'
                : locale?.['chat.history.historyChats'] || '历史对话')}
          </div>
          <ActionIconBox
            onClick={handleToggleSearch}
            title={locale?.['chat.history.search'] || '搜索'}
            style={{
              width: 28,
              height: 28,
              color: 'var(--color-gray-text-secondary)',
            }}
          >
            <SearchIcon />
          </ActionIconBox>
        </>
      )}
    </div>
  );
};

/**
 * @deprecated @since 2.29.0 请使用 HistorySearch 替代
 */
export const SearchComponent: React.FC<HistorySearchProps> = HistorySearch;
