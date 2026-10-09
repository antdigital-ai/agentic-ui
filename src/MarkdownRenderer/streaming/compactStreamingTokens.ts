import React from 'react';

interface MarkdownElementProps {
  children?: React.ReactNode;
  node?: { data?: { streamingToken?: boolean } };
}

/**
 * 封版块不再需要逐词动画。复用已有 React 树，仅移除内部标记的动画 span，
 * 保留格式元素、组件类型及 key，避免重新解析或重挂代码、图表等有状态组件。
 */
export const compactStreamingTokens = (
  node: React.ReactNode,
): React.ReactNode => {
  if (Array.isArray(node)) {
    let changed = false;
    const children = node.map((child) => {
      const compacted = compactStreamingTokens(child);
      changed ||= compacted !== child;
      return compacted;
    });
    if (!changed) return node;

    // span 去除后合并相邻文本，避免每个词仍对应独立的 DOM Text 节点。
    const merged: React.ReactNode[] = [];
    children.forEach((child) => {
      const lastIndex = merged.length - 1;
      const previous = merged[lastIndex];
      if (typeof previous === 'string' && typeof child === 'string') {
        merged[lastIndex] = previous + child;
      } else {
        merged.push(child);
      }
    });
    return merged;
  }

  if (!React.isValidElement<MarkdownElementProps>(node)) return node;

  const children = compactStreamingTokens(node.props.children);
  if (node.props.node?.data?.streamingToken) return children;
  if (children === node.props.children) return node;

  return React.cloneElement(node, undefined, children);
};
