import {
  Brain,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
} from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useMergedState } from 'rc-util';
import React, { memo, useContext, useEffect, useMemo } from 'react';
import { useRefFunction } from '../Hooks/useRefFunction';
import { useStyle } from './style';

const getChevronStyle = (expanded: boolean): React.CSSProperties => ({
  transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
  transition: 'transform 0.2s',
});

const FLOATING_ICON_STYLE: React.CSSProperties = {
  fontSize: 16,
  color: 'var(--color-gray-text-light)',
};

const LOADING_ANIMATION = {
  animate: {
    '--rotate': ['0deg', '360deg'],
  },
  transition: {
    '--rotate': {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  style: {
    '--rotation': '360deg',
  } as React.CSSProperties,
};

const IDLE_ANIMATION = {
  animate: {},
  transition: {},
  style: {
    '--rotation': '0deg',
  } as React.CSSProperties,
};

const HEADER_RIGHT_LOADING_ANIMATION = {
  animate: {
    maskImage: [
      'linear-gradient(to right, rgba(0,0,0,0.99)  -50%, rgba(0,0,0,0.15)   -50%,rgba(0,0,0,0.99)  150%)',
      'linear-gradient(to right, rgba(0,0,0,0.99)  -50%,  rgba(0,0,0,0.15)  150%,rgba(0,0,0,0.99)  150%)',
    ],
  },
  transition: {
    maskImage: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  style: {
    maskImage:
      'linear-gradient(to right, rgba(0,0,0,0.99) -30%, rgba(0,0,0,0.15) -50%, rgba(0,0,0,0.99) 120%)',
  } as React.CSSProperties,
};

const buildClassName = (...args: Parameters<typeof classNames>) =>
  classNames(...args);

interface LightModeIconProps {
  prefixCls: string;
  hashId: string;
  hover: boolean;
  expandedState: boolean;
}

const LightModeIcon: React.FC<LightModeIconProps> = ({
  prefixCls,
  hashId,
  hover,
  expandedState,
}) => {
  const iconClassName = buildClassName(
    `${prefixCls}-header-left-icon`,
    `${prefixCls}-header-left-icon-light`,
    hashId,
  );

  const chevronStyle = getChevronStyle(expandedState);
  const icon = hover ? <ChevronDown style={chevronStyle} /> : <Brain />;

  return <div className={iconClassName}>{icon}</div>;
};

interface HeaderContentProps {
  toolName: React.ReactNode;
  toolTarget?: React.ReactNode;
  prefixCls: string;
  hashId: string;
  light: boolean;
  classNames?: ToolUseBarThinkProps['classNames'];
  styles?: ToolUseBarThinkProps['styles'];
}

const HeaderContent: React.FC<HeaderContentProps> = ({
  toolName,
  toolTarget,
  prefixCls,
  hashId,
  light,
  classNames: customClassNames,
  styles,
}) => {
  const nameClassName = buildClassName(
    `${prefixCls}-name`,
    { [`${prefixCls}-name-light`]: light },
    hashId,
    customClassNames?.name,
  );

  const targetClassName = buildClassName(
    `${prefixCls}-target`,
    hashId,
    customClassNames?.target,
  );

  return (
    <>
      {toolName && (
        <div className={nameClassName} style={styles?.name}>
          {toolName}
        </div>
      )}
      {toolTarget ? (
        <div className={targetClassName} style={styles?.target}>
          {toolTarget}
        </div>
      ) : (
        <div />
      )}
    </>
  );
};

interface TimeElementProps {
  time?: React.ReactNode;
  prefixCls: string;
  hashId: string;
  classNames?: ToolUseBarThinkProps['classNames'];
  styles?: ToolUseBarThinkProps['styles'];
}

const TimeElement: React.FC<TimeElementProps> = ({
  time,
  prefixCls,
  hashId,
  classNames: customClassNames,
  styles,
}) => {
  if (!time) return null;

  const timeClassName = buildClassName(
    `${prefixCls}-time`,
    hashId,
    customClassNames?.time,
  );

  return (
    <div className={timeClassName} style={styles?.time}>
      {time}
    </div>
  );
};

interface ExpandButtonProps {
  thinkContent?: React.ReactNode;
  light: boolean;
  expandedState: boolean;
  prefixCls: string;
  hashId: string;
  classNames?: ToolUseBarThinkProps['classNames'];
  styles?: ToolUseBarThinkProps['styles'];
  onToggleExpand: () => void;
}

const ExpandButton: React.FC<ExpandButtonProps> = ({
  thinkContent,
  light,
  expandedState,
  prefixCls,
  hashId,
  classNames: customClassNames,
  styles,
  onToggleExpand,
}) => {
  if (!thinkContent || light) return null;

  const expandClassName = buildClassName(
    `${prefixCls}-expand`,
    hashId,
    customClassNames?.expand,
  );

  const expandIcon = expandedState ? <ChevronsDownUp /> : <ChevronsUpDown />;

  return (
    <div
      className={expandClassName}
      onClick={onToggleExpand}
      style={styles?.expand}
    >
      {expandIcon}
    </div>
  );
};

interface ThinkContainerProps {
  thinkContent?: React.ReactNode;
  expandedState: boolean;
  floatingExpandedState: boolean;
  status?: 'loading' | 'success' | 'error';
  light: boolean;
  prefixCls: string;
  hashId: string;
  classNames?: ToolUseBarThinkProps['classNames'];
  styles?: ToolUseBarThinkProps['styles'];
  onToggleFloatingExpand: () => void;
}

const ThinkContainer: React.FC<ThinkContainerProps> = ({
  thinkContent,
  expandedState,
  floatingExpandedState,
  status,
  light,
  prefixCls,
  hashId,
  classNames: customClassNames,
  styles,
  onToggleFloatingExpand,
}) => {
  const containerClassName = buildClassName(
    `${prefixCls}-container`,
    hashId,
    customClassNames?.container,
    {
      [`${prefixCls}-container-expanded`]: expandedState,
      [`${prefixCls}-container-loading`]:
        status === 'loading' && !floatingExpandedState,
      [`${prefixCls}-container-light`]: light,
      [`${prefixCls}-container-floating-expanded`]: floatingExpandedState,
    },
  );

  const contentClassName = buildClassName(
    `${prefixCls}-content`,
    hashId,
    customClassNames?.content,
  );

  const floatingExpandClassName = buildClassName(
    `${prefixCls}-floating-expand`,
    hashId,
    customClassNames?.floatingExpand,
  );

  const floatingIcon = floatingExpandedState ? (
    <ChevronsDownUp style={FLOATING_ICON_STYLE} />
  ) : (
    <ChevronsUpDown style={FLOATING_ICON_STYLE} />
  );

  const floatingText = floatingExpandedState ? '收起' : '展开';

  const showFloatingExpand = status === 'loading' && !light;

  // 缓存容器元素
  const contentVariants = useMemo(
    () => ({
      expanded: {
        height: 'auto',
        opacity: 1,
      },
      collapsed: {
        height: 0,
        opacity: 0,
      },
    }),
    [],
  );

  const contentTransition = useMemo(
    () => ({
      height: {
        duration: 0.26,
        ease: [0.4, 0, 0.2, 1],
      },
      opacity: {
        duration: 0.2,
        ease: 'linear',
      },
    }),
    [],
  );

  return (
    <AnimatePresence initial={false} mode="sync">
      {expandedState ? (
        <motion.div
          variants={contentVariants}
          initial="collapsed"
          key="think-container"
          animate="expanded"
          exit="collapsed"
          transition={contentTransition}
          className={containerClassName}
          data-testid="tool-use-bar-think-container"
        >
          <div className={contentClassName} style={styles?.content}>
            {thinkContent}
          </div>
          {showFloatingExpand ? (
            <div
              className={floatingExpandClassName}
              onClick={onToggleFloatingExpand}
              data-testid="tool-use-bar-think-floating-expand"
              style={styles?.floatingExpand}
            >
              {floatingIcon}
              {floatingText}
            </div>
          ) : null}
        </motion.div>
      ) : null}
      {!expandedState ? (
        <div
          style={{
            visibility: 'hidden',
            height: 1,
            overflow: 'hidden',
            opacity: 0,
          }}
        >
          <div className={contentClassName} style={styles?.content}>
            {thinkContent}
          </div>
          {showFloatingExpand ? (
            <div
              className={floatingExpandClassName}
              onClick={onToggleFloatingExpand}
              data-testid="tool-use-bar-think-floating-expand"
              style={styles?.floatingExpand}
            >
              {floatingIcon}
              {floatingText}
            </div>
          ) : null}
        </div>
      ) : null}
    </AnimatePresence>
  );
};

/**
 * ToolUseBarThink 组件属性
 */
export interface ToolUseBarThinkProps {
  /** 工具名称 */
  toolName: React.ReactNode;
  /** 工具目标 */
  toolTarget?: React.ReactNode;
  /** 时间显示 */
  time?: React.ReactNode;
  /** 自定义图标 */
  icon?: React.ReactNode;
  /** 思考内容 */
  thinkContent?: React.ReactNode;
  /** 测试ID */
  testId?: string;
  /** 状态 */
  status?: 'loading' | 'success' | 'error';
  /** 是否展开 */
  expanded?: boolean;
  /** 轻量模式 */
  light?: boolean;
  /** 默认展开状态 */
  defaultExpanded?: boolean;
  /** 展开状态变更回调 */
  onExpandedChange?: (expanded: boolean) => void;
  /** 浮动展开状态 */
  floatingExpanded?: boolean;
  /** 默认浮动展开状态 */
  defaultFloatingExpanded?: boolean;
  /** 浮动展开状态变更回调 */
  onFloatingExpandedChange?: (floatingExpanded: boolean) => void;
  /** 自定义类名 */
  classNames?: {
    root?: string;
    bar?: string;
    header?: string;
    headerLeft?: string;
    imageWrapper?: string;
    image?: string;
    name?: string;
    target?: string;
    time?: string;
    expand?: string;
    container?: string;
    content?: string;
    floatingExpand?: string;
  };
  /** 自定义样式 */
  styles?: {
    root?: React.CSSProperties;
    bar?: React.CSSProperties;
    header?: React.CSSProperties;
    headerLeft?: React.CSSProperties;
    imageWrapper?: React.CSSProperties;
    image?: React.CSSProperties;
    name?: React.CSSProperties;
    target?: React.CSSProperties;
    time?: React.CSSProperties;
    expand?: React.CSSProperties;
    container?: React.CSSProperties;
    content?: React.CSSProperties;
    floatingExpand?: React.CSSProperties;
  };
}

/**
 * ToolUseBarThink 组件
 *
 * 用于显示工具使用过程中的思考内容和状态
 *
 * @example
 * ```tsx
 * <ToolUseBarThink
 *   toolName="思考"
 *   toolTarget="分析问题"
 *   status="loading"
 *   thinkContent={<div>思考内容...</div>}
 * />
 * ```
 */
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
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-tool-use-bar-think');
  const { wrapSSR, hashId } = useStyle(prefixCls);

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

  const [hover, setHover] = React.useState(false);

  const handleToggleExpand = useRefFunction(() => {
    setExpandedState(!expandedState);
  });

  const handleToggleFloatingExpand = useRefFunction(() => {
    setFloatingExpandedState(!floatingExpandedState);
  });

  useEffect(() => {
    if (status === 'loading') {
      setExpandedState(true);
    }
  }, [status, setExpandedState]);

  const rootClassName = buildClassName(
    prefixCls,
    hashId,
    customClassNames?.root,
    {
      [`${prefixCls}-expanded`]: !expandedState,
      [`${prefixCls}-loading`]: status === 'loading',
      [`${prefixCls}-active`]: expandedState,
      [`${prefixCls}-success`]: status === 'success',
      [`${prefixCls}-light`]: light,
    },
  );

  const barClassName = buildClassName(
    `${prefixCls}-bar`,
    hashId,
    customClassNames?.bar,
  );

  const headerClassName = buildClassName(
    `${prefixCls}-header`,
    hashId,
    customClassNames?.header,
    { [`${prefixCls}-header-light`]: light },
  );

  const headerLeftClassName = buildClassName(
    `${prefixCls}-header-left`,
    hashId,
    customClassNames?.headerLeft,
  );

  const imageAnimationProps =
    status === 'loading' ? LOADING_ANIMATION : IDLE_ANIMATION;
  const headerRightAnimation =
    status === 'loading' ? HEADER_RIGHT_LOADING_ANIMATION : {};

  const imageWrapperClassName = buildClassName(
    `${prefixCls}-image-wrapper`,
    hashId,
    customClassNames?.imageWrapper,
    {
      [`${prefixCls}-image-wrapper-rotating`]: status === 'loading',
      [`${prefixCls}-image-wrapper-loading`]: status === 'loading',
    },
  );

  const imageClassName = buildClassName(
    `${prefixCls}-image`,
    hashId,
    customClassNames?.image,
  );

  const headerRightClassName = buildClassName(
    `${prefixCls}-header-right`,
    hashId,
  );

  return wrapSSR(
    <div
      data-testid={testId || 'ToolUseBarThink'}
      className={rootClassName}
      style={styles?.root}
    >
      <div
        className={barClassName}
        data-testid="tool-use-bar-think-bar"
        style={styles?.bar}
        onClick={handleToggleExpand}
      >
        <div
          className={headerClassName}
          data-testid="tool-use-bar-think-header"
          style={styles?.header}
          onMouseMove={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div className={headerLeftClassName} style={styles?.headerLeft}>
            {light ? (
              <LightModeIcon
                prefixCls={prefixCls}
                hashId={hashId}
                hover={hover}
                expandedState={expandedState}
              />
            ) : (
              <motion.div
                className={imageWrapperClassName}
                {...imageAnimationProps}
              >
                {icon || (
                  <div className={imageClassName} style={styles?.image}>
                    <Brain />
                  </div>
                )}
              </motion.div>
            )}
          </div>
          <motion.div
            className={headerRightClassName}
            {...headerRightAnimation}
          >
            <HeaderContent
              toolName={toolName}
              toolTarget={toolTarget}
              prefixCls={prefixCls}
              hashId={hashId}
              light={light}
              classNames={customClassNames}
              styles={styles}
            />
          </motion.div>
        </div>
        <TimeElement
          time={time}
          prefixCls={prefixCls}
          hashId={hashId}
          classNames={customClassNames}
          styles={styles}
        />
        <ExpandButton
          thinkContent={thinkContent}
          light={light}
          expandedState={expandedState}
          prefixCls={prefixCls}
          hashId={hashId}
          classNames={customClassNames}
          styles={styles}
          onToggleExpand={handleToggleExpand}
        />
      </div>
      {thinkContent ? (
        <ThinkContainer
          thinkContent={thinkContent}
          expandedState={expandedState}
          floatingExpandedState={floatingExpandedState}
          status={status}
          light={light}
          prefixCls={prefixCls}
          hashId={hashId}
          classNames={customClassNames}
          styles={styles}
          onToggleFloatingExpand={handleToggleFloatingExpand}
        />
      ) : null}
    </div>,
  );
};

export const ToolUseBarThink = memo(ToolUseBarThinkComponent);
