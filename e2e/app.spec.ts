import { test, expect } from '@playwright/test';

test.describe('应用基础功能', () => {
  test('应该能够加载首页', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
