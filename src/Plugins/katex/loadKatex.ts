/**
 * @fileoverview Katex 异步加载器
 *
 * 使用单例模式确保 katex 库和 CSS 只加载一次
 */

import './katex.min.css';

type KatexModule = typeof import('katex');

let katexLoader: Promise<KatexModule> | null = null;

/**
 * 加载 Katex 核心库
 * 使用单例模式确保只加载一次
 */
export const loadKatex = async (): Promise<KatexModule> => {
  if (typeof window === 'undefined') {
    throw new Error('Katex 仅在浏览器环境中可用');
  }

  if (!katexLoader) {
    // 使用 webpack 魔法注释确保正确代码分割
    katexLoader = import(
      /* webpackChunkName: "katex" */
      'katex'
    )
      .then(async (module) => {
        // 异步加载 CSS
        return module;
      })
      .catch((error) => {
        katexLoader = null;
        throw error;
      });
  }

  return katexLoader;
};

/**
 * 预加载 Katex 资源
 * 使用动态 import 提前开始加载，但不阻塞当前执行
 */
export const preloadKatex = (): void => {
  if (typeof window === 'undefined') return;

  // 使用动态 import 预加载，不等待结果
  if (!katexLoader) {
    loadKatex().catch(() => {
      // 静默处理错误，预加载失败不影响后续使用
    });
  }
};
