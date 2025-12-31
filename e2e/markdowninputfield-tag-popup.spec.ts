import { test, expect } from '../tests/fixtures/page-fixture';

test.describe('MarkdownInputField Tag Popup', () => {
  test('应该能够通过 tag popup 选择更新输入内容', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待 tag popup 出现
    const popup = page.getByTestId('tag-popup').or(
      page.locator('.ant-agentic-tag-popup').first(),
    );
    await expect(popup).toBeVisible();

    // 读取初始内容
    const before = await markdownInputFieldPage.getText();

    // 点击 popup 打开下拉
    await popup.click();

    // 等待下拉菜单打开 - 使用多种方式检测
    const dropdownMenu = page.locator('.ant-dropdown').first();
    await expect(dropdownMenu).toBeAttached({ timeout: 3000 });
    
    // 等待菜单项出现（使用更宽松的条件）
    await page.waitForTimeout(500); // 给下拉菜单一些时间完全打开

    // 优先使用文本匹配查找选项（更可靠，不依赖 DOM 结构）
    // 尝试多种可能的文本选项
    const possibleOptions = [
      page.getByText('tag2', { exact: false }),
      page.getByText('选项2', { exact: false }),
      page.getByText('选项1', { exact: false }),
      page.getByText('tag1', { exact: false }),
      page.getByText('tag3', { exact: false }),
      // 尝试更通用的文本匹配
      page.locator('.ant-dropdown-menu-item').filter({ hasText: /tag|选项/ }).first(),
    ];

    let clicked = false;
    for (const option of possibleOptions) {
      try {
        const count = await option.count();
        if (count > 0) {
          // 尝试等待元素可见或可交互
          const firstOption = option.first();
          await firstOption.waitFor({ state: 'attached', timeout: 2000 });
          // 尝试滚动到视图
          await firstOption.scrollIntoViewIfNeeded();
          // 尝试点击
          await firstOption.click({ timeout: 2000 });
          clicked = true;
          break;
        }
      } catch {
        // 继续尝试下一个选项
        continue;
      }
    }

    // 如果文本匹配失败，尝试使用菜单项选择器
    if (!clicked) {
      // 尝试多种菜单项选择器
      const menuItemSelectors = [
        () => page.getByRole('menuitem').first(),
        () => page.locator('.ant-dropdown-menu-item').first(),
        () => page.locator('[role="menuitem"]').first(),
        () => page.locator('li.ant-dropdown-menu-item').first(),
        () => page.locator('.ant-dropdown-menu-item:not([style*="display: none"])').first(),
      ];

      for (const getSelector of menuItemSelectors) {
        try {
          const selector = getSelector();
          const count = await selector.count();
          if (count > 0) {
            await selector.waitFor({ state: 'attached', timeout: 2000 });
            await selector.scrollIntoViewIfNeeded();
            await selector.click({ timeout: 2000 });
            clicked = true;
            break;
          }
        } catch {
          // 继续尝试下一个选择器
          continue;
        }
      }
    }

    // 如果所有方法都失败，抛出清晰的错误
    if (!clicked) {
      // 尝试获取页面快照信息用于调试
      const dropdownHtml = await dropdownMenu.innerHTML().catch(() => '无法获取HTML');
      throw new Error(
        `无法找到可点击的菜单项。下拉菜单可能未正确打开，或菜单项选择器不正确。\n下拉菜单HTML: ${dropdownHtml.substring(0, 200)}`
      );
    }

    // 使用 expect.poll 等待输入框内容更新（避免固定等待）
    await expect
      .poll(
        async () => await markdownInputFieldPage.getText(),
        { timeout: 3000 }
      )
      .not.toBe(before);
    
    // 验证内容已更新
    const after = await markdownInputFieldPage.getText();
    expect(after).not.toBe(before);
  });
});
