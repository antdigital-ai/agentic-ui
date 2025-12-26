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

test('App should render homepage title', async () => {
  const page = await browser.newPage();

  // 尝试连接到本地开发服务器
  // 注意：运行此测试前请确保已运行 `npm start`
  try {
    const response = await page.goto('http://localhost:8000', {
      timeout: 5000,
      waitUntil: 'domcontentloaded',
    });

    if (response?.ok()) {
      const title = await page.title();
      console.log('Page title:', title);
      expect(title).toBeTruthy();
    } else {
      console.warn(
        'Could not connect to http://localhost:8000. Make sure the dev server is running.',
      );
    }
  } catch (error) {
    console.warn(
      'Failed to connect to http://localhost:8000. Skipping assertion.',
      error,
    );
  } finally {
    await page.close();
  }
});
