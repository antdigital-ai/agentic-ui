/**
 * 站内导航辅助：Rspress SPA 路由跳转。
 *
 * `home/` 组件同时跑在 Rspress 文档站与独立环境（demo iframe）里，
 * 统一从这里拿跳转实现，避免散落的 window.open / location.href：
 * - 站内相对路径走 Rspress 的 SPA 导航（history.pushState，无整页刷新）
 * - 外部 http(s) 链接保持新窗口打开
 */
export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export function navigateToSiteUrl(url: string): void {
  if (!url || url === '#') {
    return;
  }

  if (isExternalUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  window.history.pushState({}, '', url);
  // Rspress 监听 popstate 完成路由切换；手动 pushState 后需补发一次
  window.dispatchEvent(new PopStateEvent('popstate'));
}
