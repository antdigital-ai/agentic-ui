import { RefreshCcw, SwapRight } from '@sofa-design/icons';
import { ConfigProvider, Tooltip } from 'antd';
import classNames from 'classnames';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { I18nContext } from '../../I18n';
import { useStyle } from './style';

export interface SuggestionItem {
  key?: React.Key;
  text: string;
  icon?: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
  onClick?: (text: string) => void | Promise<void>;
  actionIcon?: React.ReactNode;
}

export interface SuggestionListProps {
  className?: string;
  style?: React.CSSProperties;
  items?: SuggestionItem[];
  onItemClick?: (value: string) => void | Promise<void>;
  /** 最大显示数量 */
  maxItems?: number;
  /** 布局类型：垂直布局、水平布局 */
  layout?: 'vertical' | 'horizontal';
  /** 样式类型：基础版、透明版、白色版 */
  type?: 'basic' | 'transparent' | 'white';
  /** 是否展示左上角"搜索更多"入口 */
  showMore?: {
    enable: boolean;
    onClick?: () => void;
    text?: string;
    icon?: React.ReactNode;
  };
}

const OverflowTooltip: React.FC<{
  children: React.ReactNode;
  title: string;
  prefixCls: string;
  hashId: string;
  forceShow?: boolean;
}> = ({ children, title, prefixCls, hashId, forceShow = false }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    if (textRef.current) {
      const { scrollWidth, clientWidth } = textRef.current;
      const overflowing = scrollWidth > clientWidth;
      setIsOverflowing(overflowing);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [children, checkOverflow]);

  useEffect(() => {
    if (!textRef.current) return;
    if (typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(checkOverflow);

    observer.observe(textRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [checkOverflow]);

  const shouldShowTooltip = forceShow || isOverflowing;

  if (!shouldShowTooltip) {
    return (
      <span ref={textRef} className={classNames(`${prefixCls}-label`, hashId)}>
        {children}
      </span>
    );
  }

  return (
    <Tooltip mouseEnterDelay={0.3} title={title} placement="top">
      <span ref={textRef} className={classNames(`${prefixCls}-label`, hashId)}>
        {children}
      </span>
    </Tooltip>
  );
};

export const SuggestionList: React.FC<SuggestionListProps> = ({
  className,
  style,
  items,
  onItemClick,
  layout = 'vertical',
  maxItems = 6,
  type = 'basic',
  showMore,
}) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const prefixCls = context?.getPrefixCls('follow-up');

  const { wrapSSR, hashId } = useStyle(prefixCls);
  const [submitting, setSubmitting] = useState(false);

  const derivedItems: SuggestionItem[] = useMemo(() => {
    if (Array.isArray(items) && items.length > 0)
      return items.slice(0, maxItems);
    return [];
  }, [items, maxItems]);

  const rootCls = classNames(
    prefixCls,
    className,
    hashId,
    `${prefixCls}-${layout}`,
    `${prefixCls}-${type}`,
  );

  return wrapSSR(
    <div
      className={rootCls}
      style={style}
      role="group"
      aria-label={locale?.['suggestion.area'] || '追问区域'}
    >
      {derivedItems?.length > 0 ? (
        <div
          className={classNames(`${prefixCls}-suggestions`, hashId, {
            [`${prefixCls}-suggestions-${layout}`]: layout,
          })}
          aria-label={locale?.['suggestion.label'] || '追问建议'}
        >
          {showMore?.enable ? (
            <div
              className={classNames(`${prefixCls}-more`, hashId)}
              aria-label={
                showMore?.text ||
                locale?.['suggestion.searchMore'] ||
                '搜索更多'
              }
            >
              <span className={classNames(`${prefixCls}-more-text`, hashId)}>
                {showMore?.text ||
                  locale?.['suggestion.searchMore'] ||
                  '搜索更多'}
              </span>
              <span
                className={classNames(`${prefixCls}-more-icon`, hashId)}
                role="button"
                onClick={() => showMore?.onClick?.()}
                aria-hidden
              >
                {showMore?.icon || <RefreshCcw width={14} height={14} />}
              </span>
            </div>
          ) : null}
          {derivedItems?.map((item) => {
            const label =
              typeof item?.text === 'string' ? item?.text : undefined;
            const isDisabled = submitting || item?.disabled;
            const handleClick = async () => {
              if (isDisabled) return;
              try {
                setSubmitting(true);
                if (item?.onClick) {
                  await item?.onClick(label ?? '');
                } else {
                  await onItemClick?.(label ?? '');
                }
              } finally {
                setSubmitting(false);
              }
            };
            return (
              <div
                key={item?.key ?? label}
                role="button"
                className={classNames(`${prefixCls}-suggestion`, hashId, {
                  [`${prefixCls}-suggestion-disabled`]: isDisabled,
                })}
                onClick={handleClick}
                aria-label={`${locale?.['suggestion.select'] || '选择建议'}：${label || locale?.['suggestion.followUp'] || '追问'}`}
              >
                {item?.icon ? (
                  <span className={classNames(`${prefixCls}-icon`, hashId)}>
                    {item?.icon}
                  </span>
                ) : null}
                <OverflowTooltip
                  title={item?.tooltip ?? label ?? ''}
                  prefixCls={prefixCls}
                  hashId={hashId}
                  forceShow={!!item?.tooltip}
                >
                  {item?.text}
                </OverflowTooltip>
                <span
                  className={classNames(`${prefixCls}-arrow`, hashId, {
                    [`${prefixCls}-arrow-action`]: item.actionIcon,
                  })}
                  aria-hidden
                >
                  {item.actionIcon ? (
                    item.actionIcon
                  ) : (
                    <SwapRight width={16} height={16} />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>,
  );
};

export default SuggestionList;
