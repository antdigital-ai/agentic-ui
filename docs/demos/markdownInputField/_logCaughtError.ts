/** Demo 内与业务侧 `logCaughtError` 对齐的轻量实现 */
export function logCaughtError(scope: string, error: unknown): void {
  // eslint-disable-next-line no-console
  console.warn(`[ime-compose-enter-demo] ${scope}`, error);
}
