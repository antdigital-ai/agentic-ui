import type { JinjaConfig } from '../types';
import type { MarkdownEditorPlugin } from '../plugin';

/**
 * 创建 Jinja 插件，启用模板面板（输入 `{}` 触发）与编辑器内 Jinja 语法高亮。
 * 可通过 props.jinja 配置，或仅通过插件启用并在此传入默认配置。
 *
 * @param options 可选，与 props.jinja 同结构，用于通过插件启用时提供默认配置
 * @returns MarkdownEditorPlugin & { jinja: true; jinjaConfig?: JinjaConfig }
 */
export function createJinjaPlugin(
  options?: Partial<JinjaConfig>,
): MarkdownEditorPlugin & { jinja: true; jinjaConfig?: JinjaConfig } {
  const jinjaConfig: JinjaConfig | undefined = options
    ? { enable: true, ...options }
    : undefined;
  return {
    jinja: true,
    ...(jinjaConfig ? { jinjaConfig } : {}),
  };
}

/** 默认 Jinja 插件实例，可直接用于 plugins={[jinjaPlugin]} */
export const jinjaPlugin = createJinjaPlugin();
