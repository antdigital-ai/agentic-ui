import React from 'react';

/**
 * 从只读块 children 中抽取纯文本，用于 code fence / 懒加载兜底展示。
 */
export const extractBlockTextContent = (children: React.ReactNode): string => {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractBlockTextContent).join('');
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return extractBlockTextContent(children.props.children);
  }
  return '';
};
