import { ArrowLeft, Search } from '@sofa-design/icons';
import {
  Avatar,
  Button,
  ConfigProvider,
  Empty,
  Image,
  List,
  Spin,
  Tag,
  Tooltip,
} from 'antd';
import classNames from 'classnames';
import React, { useContext, useMemo, useState } from 'react';
import { I18nContext, compileTemplate } from '../../I18n';
import { useBrowserStyle } from './style';

export type BrowserItem = {
  id: string;
  title: string;
  site: string;
  url: string;
  icon?: string;
  description?: string;
};

export type BrowserSuggestion = {
  id: string;
  label: string;
  count: number;
};

export const RESULT_COUNT_TAG_STYLE: React.CSSProperties = {
  height: 20,
  background: 'var(--color-gray-control-fill-active)',
  borderRadius: 200,
  display: 'flex',
  alignItems: 'center',
  font: 'var(--font-text-number-xs)',
  color: 'var(--color-gray-text-secondary)',
};

export const SUGGESTION_ITEM_STYLE: React.CSSProperties = {
  padding: 4,
  margin: 4,
  cursor: 'pointer',
};

const renderSiteAvatar = (site: string, icon?: string) => {
  if (icon) {
    return (
      <Image
        src={icon}
        width={20}
        height={20}
        preview={false}
        style={{ borderRadius: 4 }}
        alt={site}
      />
    );
  }
  const letter = (site[0] || 'W').toUpperCase();
  return <Avatar size={20}>{letter}</Avatar>;
};

const useBrowserContext = () => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('browser');
  const { wrapSSR, hashId } = useBrowserStyle(prefixCls);
  return { prefixCls, wrapSSR, hashId };
};

export interface BrowserItemProps {
  item: BrowserItem;
  itemStyle?: React.CSSProperties;
  className?: string;
}

export const BrowserItemComponent: React.FC<BrowserItemProps> = ({
  item,
  itemStyle = SUGGESTION_ITEM_STYLE,
  className,
}) => {
  const { prefixCls, wrapSSR, hashId } = useBrowserContext();

  const handleSiteClick = () => {
    window.open(item.url);
  };

  return wrapSSR(
    <List.Item className={className} style={itemStyle}>
      <div style={{ width: '100%' }}>
        <div
          className={classNames(
            `${prefixCls}-result-item-title-wrapper`,
            hashId,
          )}
        >
          <Tooltip title={item.title} mouseEnterDelay={0.5}>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'inherit' }}
            >
              <div
                className={classNames(`${prefixCls}-result-item-title`, hashId)}
              >
                {item.title}
              </div>
            </a>
          </Tooltip>
        </div>
        <div
          className={classNames(`${prefixCls}-result-item-site`, hashId)}
          onClick={handleSiteClick}
        >
          {renderSiteAvatar(item.site, item.icon)}
          <Tooltip title={item.site} mouseEnterDelay={1}>
            <div
              className={classNames(
                `${prefixCls}-result-item-site-text`,
                hashId,
              )}
            >
              {item.site}
            </div>
          </Tooltip>
        </div>
      </div>
    </List.Item>,
  );
};

export interface BrowserHeaderProps {
  activeLabel: string;
  onBack?: () => void;
}

export const BrowserHeader: React.FC<BrowserHeaderProps> = ({
  activeLabel,
  onBack,
}) => {
  const { prefixCls, wrapSSR, hashId } = useBrowserContext();

  return wrapSSR(
    <div className={classNames(`${prefixCls}-header-left`, hashId)}>
      {onBack && (
        <Button
          type="text"
          icon={
            <ArrowLeft style={{ color: 'var(--color-gray-text-quaternary)' }} />
          }
          onClick={onBack}
        />
      )}
      <Tooltip title={activeLabel} mouseEnterDelay={0.5}>
        <div className={classNames(`${prefixCls}-header-title`, hashId)}>
          {activeLabel}
        </div>
      </Tooltip>
    </div>,
  );
};

export interface BrowserListProps {
  items: BrowserItem[];
  activeLabel: string;
  onBack?: () => void;
  customHeader?: React.ReactNode;
  showHeader?: boolean;
  countFormatter?: (count: number) => string;
  emptyText?: string;
  loading?: boolean;
  loadingText?: string;
}

export const BrowserList: React.FC<BrowserListProps> = ({
  items,
  activeLabel,
  onBack,
  customHeader,
  showHeader = true,
  countFormatter,
  emptyText,
  loading = false,
  loadingText,
}) => {
  const { prefixCls, wrapSSR, hashId } = useBrowserContext();
  const { locale } = useContext(I18nContext);

  const safeItems = Array.isArray(items) ? items : [];

  const mergedEmptyText =
    emptyText || locale['browser.noResults'] || 'No results found';
  const mergedLoadingText =
    loadingText || locale['browser.searching'] || 'Searching...';
  const totalResultsTemplate =
    locale['browser.totalResults'] || 'Total ${count} results';

  return wrapSSR(
    <div data-testid="browser-list">
      <header
        className={classNames(`${prefixCls}-header-wrapper`, hashId)}
        style={{
          borderBottom: showHeader
            ? '1px solid rgba(20, 22, 28, 0.1)'
            : ('none' as any),
        }}
      >
        {showHeader &&
          (customHeader || (
            <div className={classNames(`${prefixCls}-header`, hashId)}>
              <BrowserHeader
                activeLabel={activeLabel}
                onBack={onBack || (() => {})}
              />

              <Tag style={RESULT_COUNT_TAG_STYLE}>
                {typeof countFormatter === 'function'
                  ? countFormatter(safeItems.length)
                  : compileTemplate(totalResultsTemplate, {
                      count: String(safeItems.length),
                    })}
              </Tag>
            </div>
          ))}
      </header>
      <List
        dataSource={safeItems}
        split={false}
        loading={false}
        locale={{
          emptyText:
            loading && safeItems.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <Spin />
                <div style={{ marginTop: 8 }}>{mergedLoadingText}</div>
              </div>
            ) : (
              <Empty description={mergedEmptyText} />
            ),
        }}
        renderItem={(item: BrowserItem) => (
          <BrowserItemComponent
            key={item.id}
            item={item}
            className={classNames(`${prefixCls}-result-item`, hashId)}
            itemStyle={SUGGESTION_ITEM_STYLE}
          />
        )}
        footer={null}
      />
    </div>,
  );
};

export type BrowserProps = {
  /**
   * 搜索建议列表
   */
  suggestions: BrowserSuggestion[];
  /**
   * 根据选中的搜索建议请求对应的结果列表
   */
  request: (suggestion: BrowserSuggestion) => {
    items: BrowserItem[];
    loading?: boolean;
  };
  suggestionIcon?: React.ReactNode;
  countFormatter?: (count: number) => string;
  emptyText?: string;
  loadingText?: string;
};

const Browser: React.FC<BrowserProps> = ({
  suggestions,
  request,
  suggestionIcon,
  countFormatter,
  emptyText,
  loadingText,
}) => {
  const [currentView, setCurrentView] = useState<'suggestions' | 'results'>(
    'suggestions',
  );
  const [activeSuggestion, setActiveSuggestion] =
    useState<BrowserSuggestion | null>(null);
  const [activeLabel, setActiveLabel] = useState<string>('');
  const { locale } = useContext(I18nContext);

  const { prefixCls, wrapSSR, hashId } = useBrowserContext();

  const { items: results, loading } = useMemo(() => {
    if (!activeSuggestion) {
      return { items: [], loading: false };
    }
    const result = request(activeSuggestion);
    return {
      items: result.items || [],
      loading: result.loading || false,
    };
  }, [activeSuggestion, request]);

  const handleExecuteSearch = (suggestion: BrowserSuggestion) => {
    setActiveSuggestion(suggestion);
    setActiveLabel(suggestion.label);
    setCurrentView('results');
  };

  const totalResultsTemplate =
    locale['browser.totalResults'] || 'Total ${count} results';

  return wrapSSR(
    <div>
      {currentView === 'suggestions' && (
        <div>
          <List
            dataSource={suggestions}
            split={false}
            renderItem={(item: BrowserSuggestion) => (
              <List.Item
                style={SUGGESTION_ITEM_STYLE}
                onClick={() => handleExecuteSearch(item)}
                className={classNames(`${prefixCls}-suggestion`, hashId)}
                actions={[
                  <div key="count" style={{ marginInlineStart: '-8px' }}>
                    <Tag
                      style={{ ...RESULT_COUNT_TAG_STYLE, marginRight: '-8px' }}
                    >
                      {typeof countFormatter === 'function'
                        ? countFormatter(item.count)
                        : compileTemplate(totalResultsTemplate, {
                            count: String(item.count),
                          })}
                    </Tag>
                  </div>,
                ]}
              >
                <div
                  className={classNames(
                    `${prefixCls}-suggestion-content`,
                    hashId,
                  )}
                >
                  <div
                    className={classNames(
                      `${prefixCls}-suggestion-icon`,
                      hashId,
                    )}
                  >
                    {suggestionIcon || <Search />}
                  </div>
                  <Tooltip title={item.label} mouseEnterDelay={0.5}>
                    <div
                      className={classNames(
                        `${prefixCls}-suggestion-text`,
                        hashId,
                      )}
                    >
                      {item.label}
                    </div>
                  </Tooltip>
                </div>
              </List.Item>
            )}
          />
        </div>
      )}

      {currentView === 'results' && (
        <BrowserList
          items={results}
          activeLabel={activeLabel}
          onBack={() => setCurrentView('suggestions')}
          countFormatter={countFormatter}
          emptyText={emptyText}
          loading={loading}
          loadingText={loadingText}
        />
      )}
    </div>,
  );
};

export default Browser;
