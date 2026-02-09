import classNames from 'clsx';
import React from 'react';
import { useDotAniStyle } from './style';

/**
 * DotLoading 组件 - 点状加载动画组件
 *
 * 该组件显示一个点状加载动画，使用 CSS 动画实现。
 * 主要用于表示加载状态或处理中的 UI 元素。
 *
 * @component
 * @description 点状加载动画组件，使用 CSS 动画
 * @example
 * ```tsx
 * import { DotLoading } from './DotAni';
 *
 * // 基本用法
 * <DotLoading />
 * ```
 *
 * @returns {React.ReactElement} 渲染的点状加载动画组件
 *
 * @remarks
 * - 使用 CSS 动画实现
 * - 包含 data-testid="dot-loading" 用于测试
 * - 使用 role="progressbar" 提供无障碍支持
 * - 使用 aria-label="Loading" 提供屏幕阅读器支持
 * - 样式定义在 index.css 文件中
 */
export const DotLoading = () => {
  const { wrapSSR, hashId } = useDotAniStyle('agentic-md-editor-loader');

  return wrapSSR(
    <div
      data-testid="dot-loading"
      className={classNames('agentic-md-editor-loader', hashId)}
      role="progressbar"
      aria-label="Loading"
    />,
  );
};
