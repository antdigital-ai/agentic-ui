import { test as base } from '@playwright/test';
import { MarkdownInputFieldPage } from '../pages/MarkdownInputFieldPage';
import { ToolUseBarPage } from '../pages/ToolUseBarPage';

/**
 * 扩展 Playwright 的 test fixture
 * 自动注入 Page Object Models
 */
type TestFixtures = {
  markdownInputFieldPage: MarkdownInputFieldPage;
  toolUseBarPage: ToolUseBarPage;
};

export const test = base.extend<TestFixtures>({
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
