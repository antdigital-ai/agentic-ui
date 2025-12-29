/**
 * @fileoverview CSS 异步加载工具
 *
 * 提供动态加载 CSS 文件的功能，支持按需加载和缓存
 */

const loadedCSS = new Set<string>();

/**
 * 异步加载 CSS 文件
 *
 * 对于 webpack 处理的 CSS 文件，应该使用动态 import 函数形式
 * webpack 会自动处理 CSS 的提取和加载
 *
 * @param cssPath - CSS 文件路径（推荐使用函数形式的动态 import）
 * @returns Promise<void> 加载完成的 Promise
 *
 * @example
 * ```typescript
 * // 推荐：使用动态 import 加载 CSS 模块（webpack 会自动处理）
 * await loadCSS(() => import('./katex.min.css'));
 *
 * // 不推荐：直接使用字符串路径（仅适用于外部 URL）
 * await loadCSS('https://example.com/style.css');
 * ```
 */
export const loadCSS = async (
  cssPath: string | (() => Promise<unknown>),
): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  // 处理函数形式的动态 import（推荐方式）
  // webpack 会自动处理 CSS 的提取和加载
  if (typeof cssPath === 'function') {
    const pathKey = cssPath.toString();

    // 如果已经加载过，直接返回
    if (loadedCSS.has(pathKey)) {
      return;
    }

    try {
      // 执行动态 import，webpack 会自动处理 CSS
      await cssPath();
      loadedCSS.add(pathKey);
    } catch (error) {
      console.warn('Failed to load CSS:', error);
      // 即使加载失败也标记为已加载，避免重复尝试
      loadedCSS.add(pathKey);
    }
    return;
  }

  // 处理字符串路径（仅适用于外部 URL）
  // 如果已经加载过，直接返回
  if (loadedCSS.has(cssPath)) {
    return;
  }

  // 检查是否已经存在该 CSS 链接
  const existingLink = document.querySelector(
    `link[href*="${cssPath}"]`,
  ) as HTMLLinkElement;

  if (existingLink) {
    loadedCSS.add(cssPath);
    return;
  }

  // 创建 link 元素（仅用于外部 URL）
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = cssPath;

  return new Promise((resolve) => {
    link.onload = () => {
      loadedCSS.add(cssPath);
      resolve();
    };

    link.onerror = () => {
      console.warn(`Failed to load CSS: ${cssPath}`);
      // 即使加载失败也标记为已加载，避免重复尝试
      loadedCSS.add(cssPath);
      resolve(); // 不 reject，避免阻塞
    };

    // 添加到 head
    document.head.appendChild(link);
  });
};

/**
 * 预加载 CSS 文件
 * 使用低优先级加载，不阻塞当前执行
 *
 * @param cssPath - CSS 文件路径
 */
export const preloadCSS = (
  cssPath: string | (() => Promise<unknown>),
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // 如果已经加载过，直接返回
  if (typeof cssPath === 'string' && loadedCSS.has(cssPath)) {
    return;
  }

  // 触发加载但不等待结果
  loadCSS(cssPath).catch(() => {
    // 静默处理错误，预加载失败不影响后续使用
  });
};
