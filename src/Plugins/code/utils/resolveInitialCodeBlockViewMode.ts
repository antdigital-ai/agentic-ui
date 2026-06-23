export type CodeBlockViewMode = 'preview' | 'code';

/**
 * 可编辑场景默认「代码」视图（Ace 可输入）；只读场景对 html/markdown 默认预览。
 */
export function resolveInitialCodeBlockViewMode(options: {
  readonly: boolean;
  language?: string | null;
  shouldDisableHtmlPreview: boolean;
}): CodeBlockViewMode {
  const language = options.language?.toLowerCase();
  if (options.shouldDisableHtmlPreview && language === 'html') {
    return 'code';
  }
  if (!options.readonly) {
    return 'code';
  }
  return language === 'html' || language === 'markdown' ? 'preview' : 'code';
}
