/**
 * 调试工具函数
 */

/**
 * 调试信息输出函数
 * @param message 调试信息
 * @param args 额外参数
 */
export const debugInfo = (message: string, ...args: any[]) => {
  if (
    typeof window !== 'undefined' &&
    (window as any).__DEBUG_AGENTIC__ === 1
  ) {
    console.log(`[Agentic Debug] ${message}`, ...args);
  }
};
