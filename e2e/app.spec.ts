import { expect, test } from '@playwright/test';

test.describe('应用基础功能', () => {
  test('应该能够加载首页', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('首页底部 footer 应可见且不被内容遮挡（#397）', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('.rc-footer').first();
    await expect(footer).toBeVisible({ timeout: 30_000 });

    // footer 必须位于页面内容（Showroom/HomePage）之后，且在视口内可滚动到达
    const footerBox = await footer.boundingBox();
    expect(footerBox).not.toBeNull();

    await footer.scrollIntoViewIfNeeded();

    const visible = await footer.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.width > 0
      );
    });
    expect(visible).toBe(true);
  });
});
