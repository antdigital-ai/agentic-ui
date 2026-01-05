import { expect, test } from '../tests/fixtures/page-fixture';

test.describe('MarkdownInputField Tag Popup', () => {
  test('应该能够通过 tag popup 选择更新输入内容', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待 tag popup 输入区域出现（这是实际可点击的元素）
    // 选择有下拉箭头的 tag popup（有可选项的那个），使用 .first() 确保唯一匹配
    const popupInput = page
      .locator('[data-tag-popup-input].ant-agentic-tag-popup-has-arrow')
      .first();
    await expect(popupInput).toBeVisible();

    // 读取初始内容
    const before = await markdownInputFieldPage.getText();

    // 点击 popup 输入区域打开下拉菜单
    await popupInput.click();

    // 等待下拉菜单打开并等待菜单项实际出现
    // 使用智能等待，等待菜单项数量大于 0（符合 Playwright 最佳实践）
    const menuItems = page.locator('.ant-dropdown-menu-item');
    await expect
      .poll(
        async () => {
          const count = await menuItems.count();
          return count;
        },
        {
          timeout: 5000,
          message: '等待下拉菜单项加载完成',
        },
      )
      .toBeGreaterThan(0);

    // 等待第一个菜单项可见并可交互
    const firstMenuItem = menuItems.first();
    await expect(firstMenuItem).toBeVisible({ timeout: 3000 });
    await firstMenuItem.scrollIntoViewIfNeeded();

    // 点击第一个菜单项
    await firstMenuItem.click({ timeout: 2000 });

    // 使用 expect.poll 等待输入框内容更新（避免固定等待）
    await expect
      .poll(async () => await markdownInputFieldPage.getText(), {
        timeout: 3000,
      })
      .not.toBe(before);

    // 验证内容已更新
    const after = await markdownInputFieldPage.getText();
    expect(after).not.toBe(before);
  });
});
