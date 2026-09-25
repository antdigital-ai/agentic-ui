import type React from 'react';

/** 沙箱执行状态 */
export type SandboxRendererStatus = 'idle' | 'running' | 'success' | 'error';

export interface SandboxRendererProps {
  /** 要执行的 JavaScript 代码（常为 coding agent 生成），可通过 document/shadowRoot 操作渲染容器 */
  code: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义内联样式 */
  style?: React.CSSProperties;
  /** 注入到沙箱的额外全局变量（代码内可直接访问） */
  globals?: Record<string, unknown>;
  /** 代码执行超时时间（毫秒） */
  timeout?: number;
  /** 渲染容器高度 */
  height?: number | string;
  /** 是否展示执行状态（加载中 / 错误提示） */
  showStatus?: boolean;
  /** 执行成功回调，参数为代码 return 的值 */
  onExecute?: (result: unknown) => void;
  /** 执行失败回调 */
  onError?: (error: Error) => void;
}
