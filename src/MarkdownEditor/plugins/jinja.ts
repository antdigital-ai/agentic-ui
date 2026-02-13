import type { MarkdownEditorPlugin } from '../plugin';
import type { JinjaConfig } from '../types';

/** createJinjaPlugin 的配置：不含 enable，插件语义即“启用 Jinja”，内部始终 enable: true */
export type JinjaPluginOptions = Omit<Partial<JinjaConfig>, 'enable'>;

/**
 * 创建 Jinja 插件，启用模板面板（输入 `{}` 触发）与编辑器内 Jinja 语法高亮。
 * 可通过 props.jinja 配置，或仅通过插件启用并在此传入默认配置。
 * 不在 options 中接受 enable，插件即表示启用，产出配置始终 enable: true。
 *
 * @param options 可选，与 props.jinja 同结构（不含 enable），用于通过插件启用时提供默认配置
 * @returns MarkdownEditorPlugin & { jinja: true; jinjaConfig?: JinjaConfig }
 */
export function createJinjaPlugin(
  options?: JinjaPluginOptions,
): MarkdownEditorPlugin & { jinja: true; jinjaConfig?: JinjaConfig } {
  const jinjaConfig: JinjaConfig | undefined = options
    ? { ...options, enable: true }
    : undefined;
  return {
    jinja: true,
    ...(jinjaConfig ? { jinjaConfig } : {}),
  };
}

/** 默认 Jinja 插件实例，可直接用于 plugins={[jinjaPlugin]} */
export const jinjaPlugin = createJinjaPlugin();
