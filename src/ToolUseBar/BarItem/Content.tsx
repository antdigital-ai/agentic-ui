import { Api, ChevronUp, X } from '@sofa-design/icons';
import classnames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import React, { memo, useMemo } from 'react';
import { ToolCall } from '.';
import { useRefFunction } from '../../Hooks/useRefFunction';

interface ToolImageProps {
  tool: ToolCall;
  prefixCls: string;
  hashId: string;
}

const ToolImageComponent: React.FC<ToolImageProps> = ({
  tool,
  prefixCls,
  hashId,
}) => {
  const toolImageWrapperClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-image-wrapper`, hashId, {
      [`${prefixCls}-tool-image-wrapper-rotating`]: tool.status === 'loading',
      [`${prefixCls}-tool-image-wrapper-loading`]: tool.status === 'loading',
    });
  }, [prefixCls, hashId, tool.status]);

  const toolImageClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-image`, hashId);
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
    return tool.status === 'loading'
      ? loadingAnimationConfig
      : idleAnimationConfig;
  }, [tool.status, loadingAnimationConfig, idleAnimationConfig]);

  // 缓存图标渲染
  const iconElement = useMemo(() => {
    return tool.icon ? tool.icon : <Api />;
  }, [tool.icon]);

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
}

const ToolHeaderRightComponent: React.FC<ToolHeaderRightProps> = ({
  tool,
  prefixCls,
  hashId,
  light,
}) => {
  const toolHeaderRightClassName = useMemo(() => {
    return classnames(
      `${prefixCls}-tool-header-right`,
      {
        [`${prefixCls}-tool-header-right-light`]: light,
      },
      hashId,
    );
  }, [prefixCls, hashId, light]);

  const toolNameClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-name`, hashId, {
      [`${prefixCls}-tool-name-loading`]: tool.status === 'loading',
    });
  }, [prefixCls, hashId, tool.status]);

  const toolTargetClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-target`, hashId, {
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
    return tool.status === 'loading' ? loadingAnimationConfig : {};
  }, [tool.status, loadingAnimationConfig]);

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
    return classnames(`${prefixCls}-tool-time`, hashId);
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
}

const ToolExpandComponent: React.FC<ToolExpandProps> = ({
  showContent,
  expanded,
  prefixCls,
  hashId,
  onExpandClick,
}) => {
  const toolExpandClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-expand`, hashId);
  }, [prefixCls, hashId]);

  // 缓存样式对象，避免重复创建
  const chevronStyle = useMemo(() => {
    return {
      transition: 'transform 0.3s ease-in-out',
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    };
  }, [expanded]);

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
}

const ToolContentComponent: React.FC<ToolContentProps> = ({
  tool,
  prefixCls,
  hashId,
  light,
  showContent,
  expanded,
}) => {
  const toolContainerClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-container`, hashId, {
      [`${prefixCls}-tool-container-light`]: light,
    });
  }, [prefixCls, hashId, light]);

  // 缓存错误样式类名
  const errorClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-content-error`, hashId);
  }, [prefixCls, hashId]);

  const errorIconClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-content-error-icon`, hashId);
  }, [prefixCls, hashId]);

  const errorTextClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-content-error-text`, hashId);
  }, [prefixCls, hashId]);

  const contentClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-content`, hashId);
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

  // 缓存样式对象
  const containerStyle = useMemo(
    () => ({
      overflow: 'hidden',
      willChange: 'height, opacity',
    }),
    [],
  );

  return (
    <AnimatePresence initial={false} mode="sync">
      {expanded ? (
        <motion.div
          key="tool-content"
          className={toolContainerClassName}
          data-testid="tool-user-item-tool-container"
          variants={contentVariants}
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          transition={contentTransition}
          style={containerStyle}
        >
          {contentDom}
          {errorDom}
        </motion.div>
      ) : null}

      {!showContent || !expanded ? (
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
    </AnimatePresence>
  );
};

export const ToolContent = memo(ToolContentComponent);
