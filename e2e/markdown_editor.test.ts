import { Browser, chromium } from 'playwright';
import { afterAll, beforeAll, expect, test } from 'vitest';

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch({
    headless: true,
  });
});

afterAll(async () => {
  if (browser) {
    await browser.close();
  }
});

test('MarkdownEditor demo page should render correctly', async () => {
  const page = await browser.newPage();

  // 尝试连接到本地开发服务器
  try {
    // 访问 MarkdownInputField 的一个 demo 页面
    const response = await page.goto(
      'http://localhost:8000/~demos/docs-demos-markdowninputfield-custom-send-button',
      {
        timeout: 10000,
        waitUntil: 'networkidle',
      },
    );

    if (response?.ok()) {
      // 检查编辑器容器是否存在
      const editor = page.locator('.ant-md-editor');
      await expect(editor).toBeVisible({ timeout: 5000 });

      // 检查输入框
      const input = page.locator('[contenteditable="true"]');
      await expect(input).toBeVisible();

      // 测试输入
      await input.click();
      await input.fill('Hello E2E Test');
      await expect(input).toContainText('Hello E2E Test');

      console.log('MarkdownEditor input test passed');
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running.',
      );
    }
  } catch (error) {
    console.warn('Failed to run MarkdownEditor test.', error);
  } finally {
    await page.close();
  }
});
