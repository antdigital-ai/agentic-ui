import React from 'react';
import type { TaskItem } from './types';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' &&
  v !== null &&
  !Array.isArray(v) &&
  !React.isValidElement(v);

const extractTextFromUnknown = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((part) => extractTextFromUnknown(part))
      .filter((part) => part.length > 0)
      .join('\n');
  }
  if (React.isValidElement(value)) {
    return '';
  }
  if (isPlainObject(value) && 'props' in value) {
    const props = value.props;
    if (isPlainObject(props) && 'children' in props) {
      return extractTextFromUnknown(props.children);
    }
  }
  return '';
};

const isContentEmpty = (content: TaskItem['content']): boolean => {
  if (content === null || content === undefined) return true;
  if (typeof content === 'string') return content.trim().length === 0;
  if (typeof content === 'number' || typeof content === 'boolean') {
    return false;
  }
  if (Array.isArray(content)) {
    return content.length === 0;
  }
  if (React.isValidElement(content)) {
    return false;
  }
  return true;
};

const resolveFallbackTitle = (
  fallbackTitle?: React.ReactNode,
): TaskItem['content'] => {
  if (fallbackTitle === null || fallbackTitle === undefined) return '';
  if (typeof fallbackTitle === 'string') {
    const trimmed = fallbackTitle.trim();
    return trimmed.length > 0 ? trimmed : '';
  }
  if (typeof fallbackTitle === 'number') {
    return String(fallbackTitle);
  }
  if (React.isValidElement(fallbackTitle)) {
    return fallbackTitle;
  }
  return fallbackTitle;
};

/**
 * 规范化任务正文：支持字符串、序列化 React 元素描述、数组；正文为空时回退 title。
 */
export function normalizeTaskContent(
  content: unknown,
  fallbackTitle?: React.ReactNode,
): TaskItem['content'] {
  if (React.isValidElement(content)) {
    return content;
  }

  if (Array.isArray(content)) {
    if (
      content.length > 0 &&
      content.every((part) => React.isValidElement(part))
    ) {
      return content;
    }
    const text = extractTextFromUnknown(content);
    if (text.trim().length > 0) {
      return text;
    }
    return resolveFallbackTitle(fallbackTitle);
  }

  const text = extractTextFromUnknown(content);
  if (text.trim().length > 0) {
    return text;
  }

  return resolveFallbackTitle(fallbackTitle);
}

/** 判断规范化后的 content 是否有可展示正文（供 TaskListItem 展开箭头） */
export const hasNormalizedTaskContent = (
  content: unknown,
  fallbackTitle?: React.ReactNode,
): boolean => !isContentEmpty(normalizeTaskContent(content, fallbackTitle));
