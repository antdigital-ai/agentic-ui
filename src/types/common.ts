import React from 'react';

/**
 * 基础样式属性
 * @description 用于需要自定义样式和类名的组件
 */
export interface BaseStyleProps {
  /**
   * 自定义 CSS 类名
   */
  className?: string;

  /**
   * 自定义 CSS 样式
   */
  style?: React.CSSProperties;
}

/**
 * 多层级样式属性
 * @description 用于支持多个子元素自定义样式的组件
 */
export interface MultiStyleProps<T> {
  /**
   * 多个子元素的样式配置
   */
  styles?: T;
}

/**
 * 多层级类名属性
 * @description 用于支持多个子元素自定义类名的组件
 */
export interface MultiClassNameProps<T> {
  /**
   * 多个子元素的类名配置
   */
  classNames?: T;
}

/**
 * 工具类型：表示值可以是 T 或 false
 * @description 用于条件渲染函数，false 表示不渲染
 */
export type WithFalse<T> = T | false;

/**
 * 角色类型
 * @description 消息发送者的角色类型
 */
export type RoleType = 'user' | 'system' | 'assistant' | 'agent' | 'bot';

/**
 * 反馈类型
 * @description 用户对消息的评价反馈类型
 */
export type FeedbackType = 'thumbsUp' | 'thumbsDown' | 'none';

/**
 * 基础状态属性
 * @description 组件的常用状态属性
 */
export interface BaseStateProps {
  /**
   * 加载状态
   */
  isLoading?: boolean;

  /**
   * 禁用状态
   */
  isDisabled?: boolean;

  /**
   * 只读状态
   */
  readonly?: boolean;
}
