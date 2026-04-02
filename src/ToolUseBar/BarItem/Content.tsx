import {
  Api,
  ChevronUp,
  ChevronsDownUp,
  ChevronsUpDown,
  X,
} from '@sofa-design/icons';
import classNames from 'clsx';
import { motion } from 'framer-motion';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ToolCall } from '.';
import { useRefFunction } from '../../Hooks/useRefFunction';

/** 内容超出此高度时自动收起 */
const CONTENT_COLLAPSE_THRESHOLD = 200;
/** 工具详情收起动画时长（毫秒） */
const TOOL_CONTENT_COLLAPSE_DURATION_MS = 220;

interface ToolImageProps {
  tool: ToolCall;
  prefixCls: string;
  hashId: string;
  disableAnimation?: boolean;
}

const ToolImageComponent: React.FC<ToolImageProps> = ({
  tool,
  prefixCls,
  hashId,
  disableAnimation = false,
}) => {
  const toolImageWrapperClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-image-wrapper`, hashId, {
      [`${prefixCls}-tool-image-wrapper-rotating`]: tool.status === 'loading',
      [`${prefixCls}-tool-image-wrapper-loading`]: tool.status === 'loading',
    });
  }, [prefixCls, hashId, tool.status]);

  const toolImageClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-image`, hashId);
  }, [prefixCls, hashId]);

  // 缓存动画配置，避免重复创建对象
  const loadingAnimationConfig = useMemo(
    () => ({
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
    }),
    [],
  );

  const idleAnimationConfig = useMemo(
    () => ({
      style: {
        '--rotation': '0deg',
      } as React.CSSProperties,
    }),
    [],
  );

  const animationProps = useMemo(() => {
    if (disableAnimation) return {};
    return tool.status === 'loading'
      ? loadingAnimationConfig
      : idleAnimationConfig;
  }, [
    tool.status,
    loadingAnimationConfig,
    idleAnimationConfig,
    disableAnimation,
  ]);

  // 缓存图标渲染
  const iconElement = useMemo(() => {
    return tool.icon ? tool.icon : <Api />;
  }, [tool.icon]);

  if (disableAnimation) {
    return (
      <div className={toolImageWrapperClassName}>
        <div className={toolImageClassName}>{iconElement}</div>
      </div>
    );
  }

  return (
    <motion.div className={toolImageWrapperClassName} {...animationProps}>
      <div className={toolImageClassName}>{iconElement}</div>
    </motion.div>
  );
};

export const ToolImage = memo(ToolImageComponent);

interface ToolHeaderRightProps {
  tool: ToolCall;
  prefixCls: string;
  hashId: string;
  light: boolean;
  disableAnimation?: boolean;
}

const ToolHeaderRightComponent: React.FC<ToolHeaderRightProps> = ({
  tool,
  prefixCls,
  hashId,
  light,
  disableAnimation = false,
}) => {
  const toolHeaderRightClassName = useMemo(() => {
    return classNames(
      `${prefixCls}-tool-header-right`,
      {
        [`${prefixCls}-tool-header-right-light`]: light,
      },
      hashId,
    );
  }, [prefixCls, hashId, light]);

  const toolNameClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-name`, hashId, {
      [`${prefixCls}-tool-name-loading`]: tool.status === 'loading',
    });
  }, [prefixCls, hashId, tool.status]);

  const toolTargetClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-target`, hashId, {
      [`${prefixCls}-tool-target-loading`]: tool.status === 'loading',
      [`${prefixCls}-tool-target-light`]: light,
    });
  }, [prefixCls, hashId, tool.status, light]);

  // 缓存加载动画配置
  const loadingAnimationConfig = useMemo(
    () => ({
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
    }),
    [],
  );

  const animationProps = useMemo(() => {
    if (disableAnimation) return {};
    return tool.status === 'loading' ? loadingAnimationConfig : {};
  }, [tool.status, loadingAnimationConfig, disableAnimation]);

  // 缓存工具名称和目标渲染
  const toolNameElement = useMemo(() => {
    return tool.toolName ? (
      <div className={toolNameClassName}>{tool.toolName}</div>
    ) : null;
  }, [tool.toolName, toolNameClassName]);

  const toolTargetElement = useMemo(() => {
    return tool.toolTarget ? (
      <div
        className={toolTargetClassName}
        title={tool.toolTarget?.toString() ?? undefined}
      >
        {tool.toolTarget}
      </div>
    ) : null;
  }, [tool.toolTarget, toolTargetClassName]);

  if (disableAnimation) {
    return (
      <div className={toolHeaderRightClassName}>
        {toolNameElement}
        {toolTargetElement}
      </div>
    );
  }

  return (
    <motion.div className={toolHeaderRightClassName} {...animationProps}>
      {toolNameElement}
      {toolTargetElement}
    </motion.div>
  );
};

export const ToolHeaderRight = memo(ToolHeaderRightComponent);

interface ToolTimeProps {
  tool: ToolCall;
  prefixCls: string;
  hashId: string;
}

const ToolTimeComponent: React.FC<ToolTimeProps> = ({
  tool,
  prefixCls,
  hashId,
}) => {
  const toolTimeClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-time`, hashId);
  }, [prefixCls, hashId]);

  // 缓存时间元素渲染
  const timeElement = useMemo(() => {
    return tool.time ? (
      <div className={toolTimeClassName}>{tool.time}</div>
    ) : null;
  }, [tool.time, toolTimeClassName]);

  return timeElement;
};

export const ToolTime = memo(ToolTimeComponent);

interface ToolExpandProps {
  showContent: boolean;
  expanded: boolean;
  prefixCls: string;
  hashId: string;
  onExpandClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  disableAnimation?: boolean;
}

const ToolExpandComponent: React.FC<ToolExpandProps> = ({
  showContent,
  expanded,
  prefixCls,
  hashId,
  onExpandClick,
  disableAnimation = false,
}) => {
  const toolExpandClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-expand`, hashId);
  }, [prefixCls, hashId]);

  // 缓存样式对象，避免重复创建
  const chevronStyle = useMemo(() => {
    return {
      ...(disableAnimation ? {} : { transition: 'transform 0.3s ease-in-out' }),
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    };
  }, [expanded, disableAnimation]);

  // 使用 useRefFunction 优化点击处理函数
  const handleClick = useRefFunction((e: React.MouseEvent<HTMLDivElement>) => {
    onExpandClick(e);
  });

  // 缓存展开按钮元素
  const expandElement = useMemo(() => {
    if (!showContent) return null;

    return (
      <div className={toolExpandClassName} onClick={handleClick}>
        <ChevronUp style={chevronStyle} />
      </div>
    );
  }, [showContent, toolExpandClassName, handleClick, chevronStyle]);

  return expandElement;
};

export const ToolExpand = memo(ToolExpandComponent);

interface ToolContentProps {
  tool: ToolCall;
  prefixCls: string;
  hashId: string;
  light: boolean;
  showContent: boolean;
  expanded: boolean;
  disableAnimation?: boolean;
}

const ToolContentComponent: React.FC<ToolContentProps> = ({
  tool,
  prefixCls,
  hashId,
  light,
  showContent,
  expanded,
  disableAnimation = false,
}) => {
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const [isContentOverflowing, setIsContentOverflowing] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);
  const [shouldRenderContent, setShouldRenderContent] = useState(expanded);

  const toolContainerClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-container`, hashId, {
      [`${prefixCls}-tool-container-light`]: light,
    });
  }, [prefixCls, hashId, light]);

  const contentExpandClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-content-expand`, hashId);
  }, [prefixCls, hashId]);

  // 缓存错误样式类名
  const errorClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-content-error`, hashId);
  }, [prefixCls, hashId]);

  const errorIconClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-content-error-icon`, hashId);
  }, [prefixCls, hashId]);

  const errorTextClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-content-error-text`, hashId);
  }, [prefixCls, hashId]);

  const contentClassName = useMemo(() => {
    return classNames(`${prefixCls}-tool-content`, hashId);
  }, [prefixCls, hashId]);

  const errorDom = useMemo(() => {
    return tool.status === 'error' && tool.errorMessage ? (
      <div className={errorClassName}>
        <div className={errorIconClassName}>
          <X />
        </div>
        <div className={errorTextClassName}>{tool.errorMessage}</div>
      </div>
    ) : null;
  }, [
    tool.status,
    tool.errorMessage,
    errorClassName,
    errorIconClassName,
    errorTextClassName,
  ]);

  const contentDom = useMemo(() => {
    return tool.content ? (
      <div className={contentClassName}>{tool.content}</div>
    ) : null;
  }, [tool.content, contentClassName]);

  const checkOverflow = useCallback(() => {
    const el = contentInnerRef.current;
    if (!el) return;
    const { scrollHeight } = el;
    setIsContentOverflowing(scrollHeight > CONTENT_COLLAPSE_THRESHOLD);
  }, []);

  useEffect(() => {
    if (!showContent || !expanded) return;
    checkOverflow();
    const el = contentInnerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [showContent, expanded, tool.content, tool.errorMessage, checkOverflow]);

  useEffect(() => {
    if (!showContent) {
      setShouldRenderContent(false);
      return;
    }

    if (expanded) {
      setShouldRenderContent(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setShouldRenderContent(false);
    }, TOOL_CONTENT_COLLAPSE_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [expanded, showContent]);

  const handleContentExpandToggle = useRefFunction(() => {
    setContentExpanded((prev) => !prev);
  });

  const showContentExpandButton =
    showContent && expanded && isContentOverflowing;

  const contentInnerStyle = useMemo((): React.CSSProperties | undefined => {
    if (!showContentExpandButton) return undefined;
    if (contentExpanded) return undefined;
    return {
      maxHeight: CONTENT_COLLAPSE_THRESHOLD,
      overflow: 'hidden',
    };
  }, [showContentExpandButton, contentExpanded]);

  const contentExpandButton = useMemo(() => {
    if (!showContentExpandButton) return null;
    const expandIcon = contentExpanded ? (
      <ChevronsDownUp />
    ) : (
      <ChevronsUpDown />
    );
    const expandText = contentExpanded ? '收起' : '展开';
    return (
      <div
        className={contentExpandClassName}
        onClick={handleContentExpandToggle}
        data-testid="tool-content-expand"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleContentExpandToggle();
          }
        }}
      >
        {expandIcon}
        {expandText}
      </div>
    );
  }, [
    showContentExpandButton,
    contentExpanded,
    contentExpandClassName,
    handleContentExpandToggle,
  ]);

  const innerContent = (
    <>
      <div ref={contentInnerRef} style={contentInnerStyle}>
        {contentDom}
        {errorDom}
      </div>
      {contentExpandButton}
    </>
  );

  // 禁用动画时使用简单的显示/隐藏
  if (disableAnimation) {
    return showContent && expanded ? (
      <div
        className={classNames(toolContainerClassName, {
          [`${prefixCls}-tool-container-expanded`]: true,
        })}
        data-testid="tool-user-item-tool-container"
        style={{ overflow: 'hidden' }}
      >
        {innerContent}
      </div>
    ) : null;
  }

  return (
    <>
      {showContent && shouldRenderContent ? (
        <div
          className={classNames(toolContainerClassName, {
            [`${prefixCls}-tool-container-expanded`]: expanded,
          })}
          data-testid="tool-user-item-tool-container"
          aria-hidden={!expanded}
        >
          {innerContent}
        </div>
      ) : null}

      {!showContent ? (
        <div
          style={{
            overflow: 'hidden',
            height: 1,
            opacity: 0,
            visibility: 'hidden',
          }}
          role="presentation"
          aria-hidden="true"
        >
          {contentDom}
          {errorDom}
        </div>
      ) : null}
    </>
  );
};

export const ToolContent = memo(ToolContentComponent);
