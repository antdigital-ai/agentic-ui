import { RefreshCcw, SwapRight } from '@sofa-design/icons';
import { ConfigProvider, Tooltip } from 'antd';
import classNames from 'clsx';
import React, {
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAdaptiveTooltipProps } from '../../Hooks/useAdaptiveTooltipProps';
import { useRefFunction } from '../../Hooks/useRefFunction';
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

interface OverflowTooltipProps {
  children: React.ReactNode;
  title: string;
  prefixCls: string;
  hashId: string;
  forceShow?: boolean;
}

/**
 * 溢出检测 Tooltip：当文字被截断（或 forceShow=true）时才挂 Tooltip。
 *
 * 之前实现存在两处性能问题：
 * 1. 每次 render 都会注册一个 window resize 监听 + 一个 MutationObserver，
 *    且依赖项 `[children, checkOverflow]` 会随父节点 re-render 频繁触发。
 * 2. 直接在 render 中比较 scrollWidth/clientWidth 触发 setState，可能引起
 *    重复 layout。
 *
 * 这里收紧依赖：resize 监听仅注册一次；MutationObserver 在 mount 时挂一次；
 * children 变化通过单独 effect 触发一次 checkOverflow。
 */
const OverflowTooltip: React.FC<OverflowTooltipProps> = memo(
  ({ children, title, prefixCls, hashId, forceShow = false }) => {
    const textRef = useRef<HTMLSpanElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const adaptiveTooltip = useAdaptiveTooltipProps('informational');

    const checkOverflow = useRefFunction(() => {
      const node = textRef.current;
      if (!node) return;
      const overflowing = node.scrollWidth > node.clientWidth;
      setIsOverflowing((prev) => (prev === overflowing ? prev : overflowing));
    });

    // 仅在 children 内容变化时复检
    useEffect(() => {
      checkOverflow();
    }, [children, checkOverflow]);

    // resize 监听 + MutationObserver 仅挂一次
    useEffect(() => {
      const node = textRef.current;
      if (!node) return;

      const handleResize = () => checkOverflow();
      window.addEventListener('resize', handleResize);

      let observer: MutationObserver | undefined;
      if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(checkOverflow);
        observer.observe(node, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }

      return () => {
        window.removeEventListener('resize', handleResize);
        observer?.disconnect();
      };
    }, [checkOverflow]);

    const shouldShowTooltip = forceShow || isOverflowing;

    if (!shouldShowTooltip) {
      return (
        <span
          ref={textRef}
          className={classNames(`${prefixCls}-label`, hashId)}
        >
          {children}
        </span>
      );
    }

    return (
      <Tooltip
        mouseEnterDelay={0.3}
        title={title}
        placement="top"
        {...adaptiveTooltip}
      >
        <span
          ref={textRef}
          className={classNames(`${prefixCls}-label`, hashId)}
        >
          {children}
        </span>
      </Tooltip>
    );
  },
);

OverflowTooltip.displayName = 'OverflowTooltip';

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
      data-testid={prefixCls}
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
            <div className={classNames(`${prefixCls}-more`, hashId)}>
              <span className={classNames(`${prefixCls}-more-text`, hashId)}>
                {showMore?.text ||
                  locale?.['suggestion.searchMore'] ||
                  '搜索更多'}
              </span>
              {/*
                可点击的 icon 容器：role="button" 用于交互语义，
                之前同时设置了 aria-hidden（与 role=button 冲突，会被屏幕阅读器跳过点击区），
                这里改为 tabIndex=0 + aria-label，让其可被键盘聚焦与朗读。
              */}
              <span
                className={classNames(`${prefixCls}-more-icon`, hashId)}
                role="button"
                tabIndex={0}
                aria-label={
                  showMore?.text ||
                  locale?.['suggestion.searchMore'] ||
                  '搜索更多'
                }
                onClick={() => showMore?.onClick?.()}
                onKeyDown={(evt) => {
                  if (evt.key === 'Enter' || evt.key === ' ') {
                    evt.preventDefault();
                    showMore?.onClick?.();
                  }
                }}
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
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled || undefined}
                className={classNames(`${prefixCls}-suggestion`, hashId, {
                  [`${prefixCls}-suggestion-disabled`]: isDisabled,
                })}
                onClick={handleClick}
                onKeyDown={(evt) => {
                  if (isDisabled) return;
                  if (evt.key === 'Enter' || evt.key === ' ') {
                    evt.preventDefault();
                    void handleClick();
                  }
                }}
                aria-label={`${locale?.['suggestion.select'] || '选择建议'}：${label || locale?.['suggestion.followUp'] || '追问'}`}
              >
                {item?.icon ? (
                  <span
                    className={classNames(`${prefixCls}-icon`, hashId)}
                    aria-hidden
                  >
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
