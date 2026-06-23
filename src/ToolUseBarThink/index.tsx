import {
  Brain,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
} from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import { useMergedState } from 'rc-util';
import React, {
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  CARD_RESIZE_DURATION_MS,
  CARD_RESIZE_EASING,
} from '../Constants/cardResizeMotion';
import { useRefFunction } from '../Hooks/useRefFunction';
import { useLocale } from '../I18n';
import { useStyle } from './style';

if (typeof CSS !== 'undefined' && CSS.registerProperty) {
  try {
    CSS.registerProperty({
      name: '--think-rotate',
      syntax: '<angle>',
      inherits: true,
      initialValue: '0deg',
    });
  } catch {
    // already registered
  }
}

const FLOATING_ICON_STYLE: React.CSSProperties = {
  fontSize: 16,
  color: 'var(--color-gray-text-light)',
};

const CONTENT_COLLAPSE_THRESHOLD = 200;

const CHEVRON_EXPANDED: React.CSSProperties = {
  transform: 'rotate(0deg)',
  transition: `transform ${CARD_RESIZE_DURATION_MS}ms ${CARD_RESIZE_EASING}`,
};
const CHEVRON_COLLAPSED: React.CSSProperties = {
  transform: 'rotate(-90deg)',
  transition: `transform ${CARD_RESIZE_DURATION_MS}ms ${CARD_RESIZE_EASING}`,
};

const CONTENT_CLAMPED_STYLE: React.CSSProperties = {
  maxHeight: CONTENT_COLLAPSE_THRESHOLD,
  overflow: 'hidden',
};

const CONTAINER_STYLE: React.CSSProperties = { overflow: 'hidden' };
// 内容完全展开时移除所有高度限制，允许滚动查看全部内容
const CONTAINER_CONTENT_EXPANDED_STYLE: React.CSSProperties = {
  overflowY: 'auto',
  maxHeight: 'none',
};

export interface ToolUseBarThinkProps {
  toolName: React.ReactNode;
  toolTarget?: React.ReactNode;
  time?: React.ReactNode;
  icon?: React.ReactNode;
  thinkContent?: React.ReactNode;
  testId?: string;
  status?: 'loading' | 'success' | 'error';
  expanded?: boolean;
  light?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  floatingExpanded?: boolean;
  defaultFloatingExpanded?: boolean;
  onFloatingExpandedChange?: (floatingExpanded: boolean) => void;
  /**
   * 展开时是否将组件滚动到视窗内。
   * 传入 `true` 时使用默认参数 `{ behavior: 'smooth', block: 'nearest' }`，
   * 也可直接传入 `ScrollIntoViewOptions` 自定义滚动行为。初次挂载不触发。
   */
  scrollIntoViewOnExpand?: boolean | ScrollIntoViewOptions;
  classNames?: {
    root?: string;
    bar?: string;
    header?: string;
    imageWrapper?: string;
    name?: string;
    target?: string;
    time?: string;
    expand?: string;
    container?: string;
    content?: string;
    floatingExpand?: string;
  };
  styles?: {
    root?: React.CSSProperties;
    bar?: React.CSSProperties;
    header?: React.CSSProperties;
    imageWrapper?: React.CSSProperties;
    name?: React.CSSProperties;
    target?: React.CSSProperties;
    time?: React.CSSProperties;
    expand?: React.CSSProperties;
    container?: React.CSSProperties;
    content?: React.CSSProperties;
    floatingExpand?: React.CSSProperties;
  };
}

const ToolUseBarThinkComponent: React.FC<ToolUseBarThinkProps> = ({
  toolName,
  toolTarget,
  time,
  icon,
  thinkContent,
  status,
  testId,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  floatingExpanded,
  defaultFloatingExpanded = false,
  onFloatingExpandedChange,
  classNames: customClassNames,
  styles,
  light = false,
  scrollIntoViewOnExpand = false,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-tool-use-bar-think');
  const { hashId } = useStyle(prefixCls);
  const locale = useLocale();

  const [expandedState, setExpandedState] = useMergedState(defaultExpanded, {
    value: expanded,
    onChange: onExpandedChange,
  });

  const [floatingExpandedState, setFloatingExpandedState] = useMergedState(
    defaultFloatingExpanded,
    {
      value: floatingExpanded,
      onChange: onFloatingExpandedChange,
    },
  );

  const [hover, setHover] = useState(false);
  const onMouseMove = useRefFunction(() => setHover(true));
  const onMouseLeave = useRefFunction(() => setHover(false));

  const contentInnerRef = useRef<HTMLDivElement>(null);

  const handleToggleExpand = useRefFunction(() => {
    setExpandedState(!expandedState);
  });

  const handleToggleFloatingExpand = useRefFunction(() => {
    setFloatingExpandedState(!floatingExpandedState);
  });

  const isLoading = status === 'loading';

  useEffect(() => {
    if (isLoading) {
      setExpandedState(true);
    }
  }, [isLoading, setExpandedState]);

  const rootRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (!expandedState || !scrollIntoViewOnExpand) return;

    const options: ScrollIntoViewOptions =
      typeof scrollIntoViewOnExpand === 'object'
        ? scrollIntoViewOnExpand
        : { behavior: 'smooth', block: 'nearest' };

    const timer = window.setTimeout(() => {
      rootRef.current?.scrollIntoView(options);
    }, CARD_RESIZE_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [expandedState, scrollIntoViewOnExpand]);

  // --- Container overflow detection ---
  // Only active when expanded AND not loading (overflow UI is hidden during loading)
  const [isContentOverflowing, setIsContentOverflowing] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);

  const needOverflowCheck = expandedState && !isLoading && !!thinkContent;

  const checkOverflow = useRefFunction(() => {
    const el = contentInnerRef.current;
    if (!el) return;
    setIsContentOverflowing(el.scrollHeight > CONTENT_COLLAPSE_THRESHOLD);
  });

  useEffect(() => {
    if (!needOverflowCheck) return;
    checkOverflow();
    const el = contentInnerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [needOverflowCheck, checkOverflow]);

  const handleContentExpandToggle = useRefFunction(() => {
    setContentExpanded((prev) => !prev);
  });

  const showContentExpand = needOverflowCheck && isContentOverflowing;
  const showFloatingExpand = isLoading && !light;

  const contentInnerStyle = useMemo(
    (): React.CSSProperties | undefined =>
      showContentExpand && !contentExpanded ? CONTENT_CLAMPED_STYLE : undefined,
    [showContentExpand, contentExpanded],
  );

  const isContentFullyExpanded = contentExpanded || floatingExpandedState;

  // --- Class names (memoized) ---
  const cls = useMemo(() => {
    const root = classNames(prefixCls, hashId, customClassNames?.root, {
      [`${prefixCls}-expanded`]: !expandedState,
      [`${prefixCls}-loading`]: isLoading,
      [`${prefixCls}-active`]: expandedState,
      [`${prefixCls}-success`]: status === 'success',
      [`${prefixCls}-light`]: light,
    });
    const bar = classNames(`${prefixCls}-bar`, hashId, customClassNames?.bar);
    const header = classNames(
      `${prefixCls}-header`,
      hashId,
      customClassNames?.header,
      { [`${prefixCls}-header-light`]: light },
    );
    const imageWrapper = classNames(
      `${prefixCls}-image-wrapper`,
      hashId,
      customClassNames?.imageWrapper,
      { [`${prefixCls}-image-wrapper-loading`]: isLoading },
    );
    const headerRight = classNames(`${prefixCls}-header-right`, hashId, {
      [`${prefixCls}-header-right-loading`]: isLoading,
    });
    const name = classNames(
      `${prefixCls}-name`,
      hashId,
      customClassNames?.name,
      {
        [`${prefixCls}-name-light`]: light,
      },
    );
    const container = classNames(
      `${prefixCls}-container`,
      hashId,
      customClassNames?.container,
      {
        [`${prefixCls}-container-expanded`]: expandedState,
        [`${prefixCls}-container-loading`]: isLoading && !floatingExpandedState,
        [`${prefixCls}-container-light`]: light,
        [`${prefixCls}-container-floating-expanded`]: floatingExpandedState,
      },
    );
    const content = classNames(
      `${prefixCls}-content`,
      hashId,
      customClassNames?.content,
      { [`${prefixCls}-content-light`]: light },
    );
    const floatingExpand = classNames(
      `${prefixCls}-floating-expand`,
      hashId,
      customClassNames?.floatingExpand,
    );
    const target = classNames(
      `${prefixCls}-target`,
      hashId,
      customClassNames?.target,
    );
    const timeEl = classNames(
      `${prefixCls}-time`,
      hashId,
      customClassNames?.time,
    );
    const expand = classNames(
      `${prefixCls}-expand`,
      hashId,
      customClassNames?.expand,
    );
    const contentExpand = classNames(`${prefixCls}-content-expand`, hashId);
    const lightIcon = classNames(
      `${prefixCls}-header-left-icon`,
      `${prefixCls}-header-left-icon-light`,
      hashId,
    );
    return {
      root,
      bar,
      header,
      imageWrapper,
      headerRight,
      name,
      container,
      content,
      floatingExpand,
      target,
      time: timeEl,
      expand,
      contentExpand,
      lightIcon,
    };
  }, [
    prefixCls,
    hashId,
    customClassNames,
    expandedState,
    isLoading,
    status,
    light,
    floatingExpandedState,
  ]);

  return (
    <div
      ref={rootRef}
      data-testid={testId || 'ToolUseBarThink'}
      className={classNames(cls.root, {
        [`${prefixCls}-root-think-collapsed`]:
          Boolean(thinkContent) && !expandedState,
      })}
      style={styles?.root}
    >
      {/* Bar */}
      <div
        className={cls.bar}
        data-testid="tool-use-bar-think-bar"
        style={styles?.bar}
        onClick={handleToggleExpand}
      >
        <div
          className={cls.header}
          data-testid="tool-use-bar-think-header"
          style={styles?.header}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {light ? (
            <div className={cls.lightIcon}>
              {hover ? (
                <ChevronDown
                  style={expandedState ? CHEVRON_EXPANDED : CHEVRON_COLLAPSED}
                />
              ) : (
                <Brain />
              )}
            </div>
          ) : (
            <div className={cls.imageWrapper} style={styles?.imageWrapper}>
              {icon || <Brain />}
            </div>
          )}
          <div className={cls.headerRight}>
            {toolName && (
              <div className={cls.name} style={styles?.name}>
                {toolName}
              </div>
            )}
            {toolTarget && (
              <div className={cls.target} style={styles?.target}>
                {toolTarget}
              </div>
            )}
          </div>
        </div>
        {time && (
          <div className={cls.time} style={styles?.time}>
            {time}
          </div>
        )}
        {thinkContent && !light && (
          <div
            className={cls.expand}
            onClick={handleToggleExpand}
            style={styles?.expand}
          >
            {expandedState ? <ChevronsDownUp /> : <ChevronsUpDown />}
          </div>
        )}
      </div>

      {/* Container：grid 折叠 + Card resize 时长，与工具条一致 */}
      {thinkContent && (
        <div
          className={classNames(`${prefixCls}-think-collapse`, hashId, {
            [`${prefixCls}-think-collapse-open`]: expandedState,
            // 内容展开时解除父级 maxHeight 限制，使长内容可完整展示
            [`${prefixCls}-think-collapse-content-expanded`]:
              isContentFullyExpanded,
          })}
        >
          <div
            className={classNames(`${prefixCls}-think-collapse-inner`, hashId)}
          >
            <div
              className={cls.container}
              data-testid="tool-use-bar-think-container"
              // 展开时切换为无高度限制的样式，覆盖 CSS 中 maxHeight: 700 的约束
              style={
                isContentFullyExpanded
                  ? CONTAINER_CONTENT_EXPANDED_STYLE
                  : CONTAINER_STYLE
              }
            >
              <div ref={contentInnerRef} style={contentInnerStyle}>
                <div className={cls.content} style={styles?.content}>
                  {thinkContent}
                </div>
              </div>
              {showContentExpand && (
                <div
                  className={cls.contentExpand}
                  onClick={handleContentExpandToggle}
                  data-testid="tool-use-bar-think-content-expand"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleContentExpandToggle();
                    }
                  }}
                >
                  {contentExpanded ? <ChevronsDownUp /> : <ChevronsUpDown />}
                  {contentExpanded ? locale.collapse : locale.expand}
                </div>
              )}
              {showFloatingExpand && (
                <div
                  className={cls.floatingExpand}
                  onClick={handleToggleFloatingExpand}
                  data-testid="tool-use-bar-think-floating-expand"
                  style={styles?.floatingExpand}
                >
                  {floatingExpandedState ? (
                    <ChevronsDownUp style={FLOATING_ICON_STYLE} />
                  ) : (
                    <ChevronsUpDown style={FLOATING_ICON_STYLE} />
                  )}
                  {floatingExpandedState ? locale.collapse : locale.expand}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standalone floating button when collapsed + loading */}
      {thinkContent && !expandedState && showFloatingExpand && (
        <div
          className={cls.floatingExpand}
          onClick={handleToggleFloatingExpand}
          data-testid="tool-use-bar-think-floating-expand"
          style={styles?.floatingExpand}
        >
          {floatingExpandedState ? (
            <ChevronsDownUp style={FLOATING_ICON_STYLE} />
          ) : (
            <ChevronsUpDown style={FLOATING_ICON_STYLE} />
          )}
          {floatingExpandedState ? locale.collapse : locale.expand}
        </div>
      )}
    </div>
  );
};

export const ToolUseBarThink = memo(ToolUseBarThinkComponent);
