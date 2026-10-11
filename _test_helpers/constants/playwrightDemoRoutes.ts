/**
 * Rspress `~demos/<id>` 路由，与 docs/demos-pages/playwright-fixtures.md 中
 * `<code id="...">` 的显式 id 一致。
 * 勿改用组件文档里的 demo 序号（如 markdowneditor-demo-1），以免文档调整顺序后 E2E 失效。
 */
export const PLAYWRIGHT_FIXTURE_DEMOS = {
  markdownEditor: 'e2e-markdown-editor-editable',
  markdownEditorDefault: 'e2e-markdown-editor-default',
  sandboxRenderer: 'e2e-sandbox-renderer-basic',
  markdownInputFieldTags: 'e2e-markdown-input-field-tags',
  markdownInputFieldOnFocus: 'e2e-markdown-input-field-on-focus',
  markdownInputFieldEnlarge: 'e2e-markdown-input-field-enlarge',
  markdownInputFieldUploadResponse: 'e2e-markdown-input-field-upload-response',
  markdownInputFieldPasteConfig: 'e2e-markdown-input-field-paste-config',
  toolUseBarBasic: 'e2e-tool-use-bar-basic',
  toolUseBarActiveKeys: 'e2e-tool-use-bar-active-keys',
} as const;
