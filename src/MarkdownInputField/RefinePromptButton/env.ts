/**
 * 环境检测，便于 SSR 与单测 mock
 */
export function isBrowserEnv(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    !!window.document
  );
}
