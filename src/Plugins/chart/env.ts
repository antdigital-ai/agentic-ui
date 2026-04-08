/**
 * 环境检测，便于 SSR 与单测 mock
 */
export function isWindowDefined(): boolean {
  return typeof window !== 'undefined';
}
