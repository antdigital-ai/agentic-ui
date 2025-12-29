/**
 * @fileoverview Ace Editor 异步加载器
 *
 * 使用单例模式确保 ace-builds 库只加载一次
 * 支持动态导入主题和语言模式，实现代码分割
 * CSS 文件也会异步加载
 */

type AceEditorModule = typeof import('ace-builds');

let aceEditorLoader: Promise<AceEditorModule> | null = null;

/**
 * 加载 Ace Editor 核心库
 * 使用单例模式确保只加载一次
 */
export const loadAceEditor = async (): Promise<AceEditorModule> => {
  if (typeof window === 'undefined') {
    throw new Error('Ace Editor 仅在浏览器环境中可用');
  }

  if (!aceEditorLoader) {
    // 使用 webpack 魔法注释确保正确代码分割
    aceEditorLoader = import(
      /* webpackChunkName: "ace-editor" */
      'ace-builds'
    )
      .then((module) => {
        return module;
      })
      .catch((error) => {
        aceEditorLoader = null;
        throw error;
      });
  }

  return aceEditorLoader;
};

/**
 * 加载 Ace Editor 主题
 * 支持按需加载主题和对应的 CSS，减少初始 bundle 大小
 */
export const loadAceTheme = async (themeName: string): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    // 动态导入主题文件（JS 模块）
    switch (themeName) {
      case 'github':
        await import(
          /* webpackChunkName: "ace-theme-github" */
          'ace-builds/src-noconflict/theme-github'
        );
        // 注意：Ace Editor 的主题 CSS 通常包含在主 CSS 中
        // 如果需要单独加载，可以在这里添加
        break;
      case 'chaos':
        await import(
          /* webpackChunkName: "ace-theme-chaos" */
          'ace-builds/src-noconflict/theme-chaos'
        );
        break;
      default:
        // 默认加载 github 主题
        await import(
          /* webpackChunkName: "ace-theme-github" */
          'ace-builds/src-noconflict/theme-github'
        );
    }
  } catch (error) {
    console.warn(`Failed to load Ace theme: ${themeName}`, error);
  }
};

/**
 * 预加载 Ace Editor 资源
 * 使用动态 import 提前开始加载，但不阻塞当前执行
 * 可以在用户可能使用代码编辑器之前调用此函数
 */
export const preloadAceEditor = (): void => {
  if (typeof window === 'undefined') return;

  // 使用动态 import 预加载，不等待结果
  // 浏览器会自动缓存已加载的模块
  if (!aceEditorLoader) {
    // 触发加载但不阻塞
    loadAceEditor().catch(() => {
      // 静默处理错误，预加载失败不影响后续使用
    });
  }
};
