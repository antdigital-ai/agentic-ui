/**
 * 环境检测兼容层（保留导出名以避免破坏 RefinePromptButton 内部既有引用）。
 *
 * 实现已迁移至 `src/Utils/env.ts` 的 `isBrowser`。
 * 如果你正在编写新代码，请直接 `import { isBrowser } from '../../Utils/env'`。
 */
export { isBrowser as isBrowserEnv } from '../../Utils/env';
