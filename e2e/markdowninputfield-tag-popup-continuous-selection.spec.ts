import { expect, test } from '../tests/fixtures/page-fixture';

/**
 * TagPopup 连续选择测试
 * 测试修复 #269: 修复连续选择下拉选项时抛出 'path' is null 错误
 */
test.describe('TagPopup 连续选择功能', () => {
  test('应该能够连续选择多个下拉选项而不抛出 path 错误', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待 tag popup 输入区域出现
    const popupInputs = page.locator(
      '[data-tag-popup-input].ant-agentic-md-editor-tag-popup-has-arrow',
    );
    await expect(popupInputs.first()).toBeVisible({ timeout: 5000 });

    // 获取所有可用的 tag popup 输入框
    const popupCount = await popupInputs.count();
    expect(popupCount).toBeGreaterThan(0);

    // 测试连续选择多个下拉选项
    for (let i = 0; i < Math.min(popupCount, 3); i++) {
      const popupInput = popupInputs.nth(i);
      await expect(popupInput).toBeVisible();

      // 记录选择前的文本内容
      const beforeText = await markdownInputFieldPage.getText();

      // 点击 popup 输入区域打开下拉菜单
      await popupInput.click();

      // 等待下拉菜单打开并等待菜单项实际出现
      const menuItems = page.locator('.ant-dropdown-menu-item');
      await expect
        .poll(
          async () => {
            const count = await menuItems.count();
            return count;
          },
          {
            timeout: 5000,
            message: `等待第 ${i + 1} 个下拉菜单项加载完成`,
          },
        )
        .toBeGreaterThan(0);

      // 等待第一个菜单项可见并可交互
      const firstMenuItem = menuItems.first();
      await expect(firstMenuItem).toBeVisible({ timeout: 3000 });
      await firstMenuItem.scrollIntoViewIfNeeded();

      // 点击第一个菜单项（连续选择）
      await firstMenuItem.click({ timeout: 2000 });

      // 等待输入框内容更新
      await expect
        .poll(
          async () => {
            const currentText = await markdownInputFieldPage.getText();
            return currentText;
          },
          {
            timeout: 3000,
            message: `等待第 ${i + 1} 次选择后内容更新`,
          },
        )
        .not.toBe(beforeText);

      // 验证内容已更新且没有错误
      const afterText = await markdownInputFieldPage.getText();
      expect(afterText).not.toBe(beforeText);

      // 检查控制台是否有错误（特别是 path 相关的错误）
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // 检查是否包含 path 相关的错误
          if (text.includes('path') || text.includes('null')) {
            errors.push(text);
          }
        }
      });

      // 等待内容稳定，确保没有异步错误
      await expect(popupInput).toBeVisible();

      // 验证没有 path 相关的错误
      expect(errors.length).toBe(0);
    }
  });

  test('应该在快速连续点击多个 tag popup 时正常工作', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待 tag popup 输入区域出现
    const popupInputs = page.locator(
      '[data-tag-popup-input].ant-agentic-md-editor-tag-popup-has-arrow',
    );
    await expect(popupInputs.first()).toBeVisible({ timeout: 5000 });

    const popupCount = await popupInputs.count();
    expect(popupCount).toBeGreaterThan(0);

    // 收集所有错误
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 快速连续点击多个 popup
    const clickPromises: Promise<void>[] = [];
    for (let i = 0; i < Math.min(popupCount, 2); i++) {
      const popupInput = popupInputs.nth(i);
      clickPromises.push(
        (async (): Promise<void> => {
          try {
            await popupInput.click({ timeout: 2000 });
            // 等待菜单出现
            const menuItems = page.locator('.ant-dropdown-menu-item');
            await expect(menuItems.first()).toBeVisible({ timeout: 3000 });
            const count = await menuItems.count();
            if (count > 0) {
              const firstMenuItem = menuItems.first();
              await firstMenuItem.click({ timeout: 2000 });
            }
          } catch (error) {
            // 忽略点击错误，因为可能菜单已经关闭
          }
        })(),
      );
    }

    // 等待所有点击完成
    await Promise.allSettled(clickPromises);

    // 等待所有异步操作完成（等待输入框稳定）
    await expect(markdownInputFieldPage.editableInput).toBeVisible();

    // 验证没有 path 相关的错误
    const pathErrors = errors.filter(
      (error) => error.includes('path') || error.includes('null'),
    );
    expect(pathErrors.length).toBe(0);
  });

  test('应该在选择后立即再次打开下拉菜单时正常工作', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待 tag popup 输入区域出现
    const popupInput = page
      .locator('[data-tag-popup-input].ant-agentic-md-editor-tag-popup-has-arrow')
      .first();
    await expect(popupInput).toBeVisible({ timeout: 5000 });

    // 收集错误
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 第一次选择
    await popupInput.click();
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

    const firstMenuItem = menuItems.first();
    await expect(firstMenuItem).toBeVisible({ timeout: 3000 });
    await firstMenuItem.click({ timeout: 2000 });

    // 等待菜单关闭（通过等待菜单项不可见来确认）
    await expect(menuItems.first()).not.toBeVisible({ timeout: 2000 });

    // 立即再次打开下拉菜单（连续操作）
    await popupInput.click();

    // 等待菜单再次打开
    await expect
      .poll(
        async () => {
          const count = await menuItems.count();
          return count;
        },
        {
          timeout: 5000,
          message: '等待下拉菜单再次打开',
        },
      )
      .toBeGreaterThan(0);

    // 再次选择
    const secondMenuItem = menuItems.first();
    await expect(secondMenuItem).toBeVisible({ timeout: 3000 });
    await secondMenuItem.click({ timeout: 2000 });

    // 等待所有异步操作完成（等待输入框稳定）
    await expect(markdownInputFieldPage.editableInput).toBeVisible();

    // 验证没有 path 相关的错误
    const pathErrors = errors.filter(
      (error) => error.includes('path') || error.includes('null'),
    );
    expect(pathErrors.length).toBe(0);
  });
});
