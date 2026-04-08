/**
 * 环境检测，便于 SSR 与单测 mock
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}
