import { HistoryOutlined } from '@ant-design/icons';
import { ConfigProvider, Popover } from 'antd';
import classNames from 'classnames';
import React, { memo, useContext, useMemo, useRef } from 'react';
import useClickAway from '../Hooks/useClickAway';
import { ActionIconBox, BubbleConfigContext } from '../index';
import {
  HistoryEmpty,
  HistoryLoadMore,
  HistoryNewChat,
  HistorySearch,
  generateHistoryItems,
} from './components';
import { useHistory } from './hooks/useHistory';
import GroupMenu from './menu';
import { useStyle } from './style';
import { HistoryProps } from './types';

export * from './components';
export * from './hooks/useHistory';
export * from './types';
export * from './types/HistoryData';
export * from './utils';

/**
 * History 组件 - 用于显示和管理聊天历史记录
 *
 * @component
 * @param {Object} props - 组件属性
 * @param {string} props.agentId - 代理ID，用于获取历史记录
 * @param {string} props.sessionId - 会话ID，变更时会触发数据重新获取
 * @param {Function} props.request - 请求函数，用于获取历史数据
 * @param {Function} [props.onInit] - 组件初始化时的回调函数
 * @param {Function} [props.onShow] - 组件显示时的回调函数
 * @param {Function} [props.onSelected] - (已废弃，请使用 onClick) 选择历史记录项时的回调函数
 * @param {Function} [props.onClick] - 点击历史记录项时的回调函数
 * @param {Function} [props.onDeleteItem] - 删除历史记录项时的回调函数
 * @param {Function} [props.customDateFormatter] - 日期格式化函数
 * @param {boolean} [props.standalone] - 是否以独立模式显示，为true时直接显示菜单，否则显示为下拉菜单
 * @param {Function} [props.emptyRender] - 空状态渲染函数，当历史记录为空时显示自定义内容
 * @param {Function} [props.loadMoreRender] - 加载更多渲染函数, 用于自定义加载更多按钮的显示内容
 * @param {boolean} [props.loading] - 加载状态，显示在 GroupMenu 区域
 *
 * @returns {React.ReactElement|null} 返回历史记录组件或null（当没有历史记录时）
 *
 * @description
 * 该组件提供两种显示模式：
 * 1. 独立模式 (standalone=true)：直接显示为菜单列表
 * 2. 下拉菜单模式 (standalone=false)：显示为一个可点击的图标，点击后显示下拉菜单
 *
 * 历史记录按日期分组显示，每组内按时间倒序排列。
 * 支持查看历史会话和删除历史记录。
 * 当历史记录为空时，可通过 emptyRender 自定义空状态显示。
 * 通过 loading 属性可以在 GroupMenu 区域显示加载动画。
 */
const HistoryComponent: React.FC<HistoryProps> = (props) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const menuPrefixCls = getPrefixCls('agentic-chat-history-menu');
  const { locale } = useContext(BubbleConfigContext) || {};
  const containerRef = useRef<HTMLDivElement>(null);
  // 注册样式
  const { wrapSSR, hashId } = useStyle(menuPrefixCls);

  const {
    open,
    setOpen,
    searchKeyword,
    selectedIds,
    filteredList,
    loadHistory,
    handleSelectionChange,
    handleSearch,
    handleLoadMore,
    handleFavorite,
    handleNewChat,
  } = useHistory(props);

  useClickAway(() => {
    setOpen(false);
  }, containerRef);

  const items = generateHistoryItems({
    filteredList,
    selectedIds,
    onSelectionChange: handleSelectionChange,
    onClick: (sessionId, item) => {
      props.onClick?.(sessionId, item);
      props.onSelected?.(item);
      setOpen(false);
    },
    groupLabelRender: props.groupLabelRender,
    customOperationExtra: props.customOperationExtra || [],
    onDeleteItem: props.onDeleteItem
      ? async (sessionId) => {
          await props.onDeleteItem?.(sessionId);
          loadHistory();
        }
      : undefined,
    onFavorite: handleFavorite,
    agent: props.agent,
    extra: props.extra,
    customDateFormatter: props.customDateFormatter,
    itemDateFormatter: props.itemDateFormatter,
    groupBy: props.groupBy,
    sessionSort: props.sessionSort,
    type: props.type,
    runningId: props.agent?.runningId,
  });

  // 使用 useMemo 优化空组件渲染
  // 注意：只有在 items 为空时才需要渲染空组件
  const shouldShowEmpty = items?.length === 0 && !props.loading;
  const EmptyComponent = useMemo(() => {
    if (!shouldShowEmpty) {
      return null;
    }
    if (searchKeyword) {
      return <HistoryEmpty />;
    }
    if (props.emptyRender) {
      return props.emptyRender();
    }
    return null;
  }, [shouldShowEmpty, searchKeyword, props.emptyRender]);

  // 使用 useMemo 优化加载更多组件渲染
  const LoadMoreComponent = useMemo(() => {
    if (props.loadMoreRender) {
      return props.loadMoreRender();
    }

    const shouldRender =
      props.agent?.enabled && !!props.agent?.onLoadMore && !props.loading;

    if (!shouldRender) {
      return null;
    }

    return (
      <HistoryLoadMore
        onLoadMore={handleLoadMore}
        type={props.type}
        className={classNames(`${menuPrefixCls}-load-more`, hashId, {
          chat: props.type !== 'task',
        })}
      />
    );
  }, [
    props.loadMoreRender,
    props.agent?.enabled,
    props.agent?.onLoadMore,
    props.loading,
    handleLoadMore,
    props.type,
    menuPrefixCls,
    hashId,
  ]);

  if (props.standalone) {
    return wrapSSR(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* 新对话按钮 - 固定位置 */}
        {props.agent?.enabled && !!props.agent?.onNewChat && (
          <div style={{ flexShrink: 0, marginBottom: 12 }}>
            <HistoryNewChat onNewChat={handleNewChat} />
          </div>
        )}

        {/* 搜索框 - 固定位置 */}
        {props.agent?.enabled && !!props.agent?.onSearch && (
          <div style={{ flexShrink: 0 }}>
            <HistorySearch
              searchKeyword={searchKeyword}
              onSearch={handleSearch}
              type={props.type}
              searchOptions={props.agent?.searchOptions}
            />
          </div>
        )}

        {/* 列表内容 - 可滚动区域 */}
        <div
          className={classNames(`${menuPrefixCls}-scroll-container`, hashId)}
          style={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
          }}
        >
          {props.slots?.beforeHistoryList?.(filteredList)}

          {shouldShowEmpty ? (
            EmptyComponent
          ) : (
            <>
              <GroupMenu
                selectedKeys={[props.sessionId]}
                inlineIndent={20}
                items={items}
                className={menuPrefixCls}
                loading={props.loading}
              />
              {LoadMoreComponent}
            </>
          )}
        </div>
      </div>,
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      className={menuPrefixCls}
      style={{
        maxHeight: 'min(480px,100%)',
        overflow: 'auto',
        maxWidth: 'min(480px,100%)',
        borderRadius: 'inherit',
        border: '1px solid var(--color-gray-border-light)',
      }}
      getPopupContainer={(p) => p.parentElement || document.body}
      content={
        <>
          {shouldShowEmpty ? (
            <div data-testid="empty-state-popover">{EmptyComponent}</div>
          ) : (
            <GroupMenu
              selectedKeys={[props.sessionId]}
              inlineIndent={20}
              items={items}
              className={menuPrefixCls}
              loading={props.loading}
            />
          )}
          {LoadMoreComponent}
        </>
      }
    >
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 'max-content',
          maxWidth: 'min(860px,100%)',
        }}
        data-testid="history-button"
      >
        <ActionIconBox
          key="history"
          title={locale?.['chat.history'] || '历史记录'}
        >
          <HistoryOutlined />
        </ActionIconBox>
      </div>
    </Popover>
  );
};

HistoryComponent.displayName = 'History';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const History = memo(HistoryComponent);
