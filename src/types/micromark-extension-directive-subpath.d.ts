/**
 * micromark-extension-directive 未在 package exports 中声明子路径；运行时由 bundler 解析至 lib/
 */
declare module 'micromark-extension-directive/lib/directive-container.js' {
  import type { Construct } from 'micromark-util-types';

  export const directiveContainer: Construct;
}
