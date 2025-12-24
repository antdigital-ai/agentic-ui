import classnames from 'classnames';
import { useMergedState } from 'rc-util';
import React, { memo, useMemo } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import {
  ToolContent,
  ToolExpand,
  ToolHeaderRight,
  ToolImage,
  ToolTime,
} from './Content';

export interface ToolCall {
  id: string;
  toolName: React.ReactNode;
  toolTarget: React.ReactNode;
  time?: React.ReactNode;
  icon?: React.ReactNode;
  errorMessage?: string;
  type?: 'summary' | 'normal' | string;
  content?: React.ReactNode;
  status?: 'idle' | 'loading' | 'success' | 'error';
  testId?: string;
}

export interface ToolUseBarItemProps {
  tool: ToolCall;
  prefixCls: string;
  hashId: string;
  onClick?: (id: string) => void;
  isActive?: boolean;
  onActiveChange?: (id: string, active: boolean) => void;
  isExpanded?: boolean;
  onExpandedChange?: (id: string, expanded: boolean) => void;
  defaultExpanded?: boolean;
  light?: boolean;
}

const ToolUseBarItemComponent: React.FC<ToolUseBarItemProps> = ({
  tool,
  prefixCls,
  hashId,
  onClick,
  isActive,
  onActiveChange,
  isExpanded,
  onExpandedChange,
  defaultExpanded,
  light = false,
}) => {
  // 使用 useMergedState 来管理展开状态
  const [expanded, setExpanded] = useMergedState(defaultExpanded ?? false, {
    value: isExpanded,
    onChange: onExpandedChange
      ? (value) => onExpandedChange(tool.id, value)
      : undefined,
  });

  const showContent = useMemo(() => {
    return !!(tool.status === 'error' && tool.errorMessage) || !!tool.content;
  }, [tool.status, tool.errorMessage, tool.content]);

  // 使用 useMemo 优化样式类名
  const toolClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool ${hashId}`, {
      [`${prefixCls}-tool-success`]: tool.status === 'success',
      [`${prefixCls}-tool-loading`]: tool.status === 'loading',
      [`${prefixCls}-tool-loading-light`]: tool.status === 'loading' && light,
      [`${prefixCls}-tool-error`]: tool.status === 'error',
      [`${prefixCls}-tool-idle`]: tool.status === 'idle',
      [`${prefixCls}-tool-active`]: isActive && !expanded,
      [`${prefixCls}-tool-expanded`]: expanded,
      [`${prefixCls}-tool-light`]: light,
    });
  }, [prefixCls, hashId, tool.status, light, isActive, expanded]);

  const toolBarClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-bar`, hashId);
  }, [prefixCls, hashId]);

  const toolHeaderClassName = useMemo(() => {
    return classnames(`${prefixCls}-tool-header`, hashId);
  }, [prefixCls, hashId]);

  const handleClick = useRefFunction((e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(tool.id);
    if (onActiveChange && !showContent) {
      onActiveChange(tool.id, !isActive);
    }

    // 如果没有内容需要展示，则早返回
    if (!showContent) return;

    // 避免在交互性子元素上误触发折叠
    if (e.target instanceof Element) {
      const tag = e.target.tagName.toLowerCase();
      if (['a', 'button', 'input', 'textarea', 'select', 'label'].includes(tag))
        return;
    }

    // 使用函数式更新避免闭包陈旧值问题
    setExpanded((prev) => !prev);
  });

  const handleExpandClick = useRefFunction(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation(); // 阻止事件冒泡到父元素
      setExpanded((prev) => !prev);
    },
  );

  if (tool.type === 'summary') {
    return (
      <ToolContent
        tool={tool}
        prefixCls={prefixCls}
        hashId={hashId}
        light={light}
        showContent={true}
        expanded={true}
      />
    );
  }

  return (
    <div
      key={tool.id}
      data-testid="ToolUserItem"
      className={classnames(toolClassName, {
        [`${prefixCls}-tool-collapsed`]: !showContent,
      })}
    >
      <div
        className={classnames(toolBarClassName, {
          [`${prefixCls}-tool-bar-collapsed`]: !showContent,
        })}
        data-testid="tool-user-item-tool-bar"
        onClick={handleClick}
      >
        <div
          className={toolHeaderClassName}
          data-testid="tool-user-item-tool-header"
        >
          <ToolImage tool={tool} prefixCls={prefixCls} hashId={hashId} />
        </div>
        <ToolHeaderRight
          tool={tool}
          prefixCls={prefixCls}
          hashId={hashId}
          light={light}
        />
        <div className={classnames(`${prefixCls}-tool-time-expand`, hashId)}>
          <ToolTime tool={tool} prefixCls={prefixCls} hashId={hashId} />
          <ToolExpand
            showContent={showContent}
            expanded={expanded}
            prefixCls={prefixCls}
            hashId={hashId}
            onExpandClick={handleExpandClick}
          />
        </div>
      </div>
      <ToolContent
        tool={tool}
        prefixCls={prefixCls}
        hashId={hashId}
        light={light}
        showContent={showContent}
        expanded={expanded}
      />
    </div>
  );
};

// 使用 memo 优化组件，避免不必要的重新渲染
export const ToolUseBarItem = memo(ToolUseBarItemComponent);
