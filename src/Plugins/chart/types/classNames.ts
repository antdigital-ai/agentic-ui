import React from 'react';

/**
 * 类名类型
 * 支持字符串、字符串数组或对象格式（classnames 格式）
 */
export type ClassNameType =
  | string
  | string[]
  | Record<string, boolean | undefined>;

/**
 * 图表组件的层级类名配置
 * 用于为图表的不同 DOM 层级设置类名
 */
export interface ChartClassNames {
  /** 根容器类名 */
  root?: ClassNameType;
  /** 工具栏类名 */
  toolbar?: ClassNameType;
  /** 统计容器类名 */
  statisticContainer?: ClassNameType;
  /** 过滤器类名 */
  filter?: ClassNameType;
  /** 图表包装器类名 */
  wrapper?: ClassNameType;
  /** 图表本身类名 */
  chart?: ClassNameType;
}

/**
 * 图表组件的层级样式配置
 * 用于为图表的不同 DOM 层级设置样式
 */
export interface ChartStyles {
  /** 根容器样式 */
  root?: React.CSSProperties;
  /** 工具栏样式 */
  toolbar?: React.CSSProperties;
  /** 统计容器样式 */
  statisticContainer?: React.CSSProperties;
  /** 过滤器样式 */
  filter?: React.CSSProperties;
  /** 图表包装器样式 */
  wrapper?: React.CSSProperties;
  /** 图表本身样式 */
  chart?: React.CSSProperties;
}
