import { test as base } from '@playwright/test';
import { MarkdownEditorPage } from '../pages/MarkdownEditorPage';
import { MarkdownInputFieldPage } from '../pages/MarkdownInputFieldPage';
import { ToolUseBarPage } from '../pages/ToolUseBarPage';

/**
 * 扩展 Playwright 的 test fixture
 * 自动注入 Page Object Models
 */
type TestFixtures = {
  markdownEditorPage: MarkdownEditorPage;
  markdownInputFieldPage: MarkdownInputFieldPage;
  toolUseBarPage: ToolUseBarPage;
};

export const test = base.extend<TestFixtures>({
  page: async ({ page, baseURL }, use) => {
    const origin = baseURL ?? 'http://localhost:4172';
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
    await use(page);
  },

  markdownEditorPage: async ({ page }, use) => {
    const markdownEditorPage = new MarkdownEditorPage(page);
    await use(markdownEditorPage);
  },

  markdownInputFieldPage: async ({ page }, use) => {
    const markdownInputFieldPage = new MarkdownInputFieldPage(page);
    await use(markdownInputFieldPage);
  },

  toolUseBarPage: async ({ page }, use) => {
    const toolUseBarPage = new ToolUseBarPage(page);
    await use(toolUseBarPage);
  },
});

export { expect } from '@playwright/test';
