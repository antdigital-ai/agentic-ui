/**
 * Dumi `~demos/<id>` 路由，与 docs/demos-pages/playwright-fixtures.md 中 `<code id="...">` 对应。
 * 勿改用组件文档里的 demo 序号（如 markdowneditor-demo-1），以免文档调整顺序后 E2E 失效。
 */
export const PLAYWRIGHT_FIXTURE_DEMOS = {
  markdownEditor:
    'docs-demos-pages-playwright-fixtures-demo-e2e-markdown-editor',
  markdownInputFieldTags:
    'docs-demos-pages-playwright-fixtures-demo-e2e-markdown-input-field-tags',
  markdownInputFieldOnFocus:
    'docs-demos-pages-playwright-fixtures-demo-e2e-markdown-input-field-on-focus',
  markdownInputFieldEnlarge:
    'docs-demos-pages-playwright-fixtures-demo-e2e-markdown-input-field-enlarge',
  markdownInputFieldUploadResponse:
    'docs-demos-pages-playwright-fixtures-demo-e2e-markdown-input-field-upload-response',
  markdownInputFieldPasteConfig:
    'docs-demos-pages-playwright-fixtures-demo-e2e-markdown-input-field-paste-config',
  toolUseBarBasic:
    'docs-demos-pages-playwright-fixtures-demo-e2e-tool-use-bar-basic',
  toolUseBarActiveKeys:
    'docs-demos-pages-playwright-fixtures-demo-e2e-tool-use-bar-active-keys',
} as const;
