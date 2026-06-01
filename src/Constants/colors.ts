/**
 * 项目统一的颜色配置
 * 集中管理所有颜色值，避免重复定义
 */

export const COLORS = {
  // 蓝色系
  blue: {
    primary: '#1677ff',
    light: '#D6EEFF',
    border: '#E6ECF4',
    dark: '#19213D',
    contrast: '#FFFFFF',
  },

  // 灰色系
  gray: {
    text: '#343A45',
    light: '#FBFCFD',
    border: '#E6ECF4',
    background: '#f0f0f0',
    card: '#FFFFFF',
  },

  // 红色系
  red: {
    error: '#FF4141',
    light: '#FFEDEC',
    border: '#f97583',
    background: '#ffeaea',
  },

  // 绿色系
  green: {
    success: '#52c41a',
    light: '#f6ffed',
    dark: '#00B341',
  },

  // 橙色系
  orange: {
    warning: '#faad14',
    light: '#fff7e6',
    border: '#ffd591',
  },

  // 状态颜色
  status: {
    info: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    processing: '#1890ff',
  },

  // 边框颜色
  border: {
    light: '#E6ECF4',
    default: '#d9d9d9',
    dark: '#bfbfbf',
  },

  // 背景颜色
  background: {
    light: '#FBFCFD',
    default: '#FFFFFF',
    dark: '#f5f5f5',
    error: '#FFEDEC',
    success: '#f6ffed',
    warning: '#fff7e6',
  },
} as const;
