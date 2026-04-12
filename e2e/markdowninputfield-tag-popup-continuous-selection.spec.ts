import { PLAYWRIGHT_FIXTURE_DEMOS } from '../tests/constants/playwrightDemoRoutes';
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
    await markdownInputFieldPage.goto(
      PLAYWRIGHT_FIXTURE_DEMOS.markdownInputFieldTags,
    );

    // 等待 tag popup 输入区域出现
    const popupInputs = markdownInputFieldPage.root.locator(
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

      const menuItem = markdownInputFieldPage.keyboardTargetPage
        .locator('.ant-dropdown-menu-item')
        .last();
      await expect
        .poll(async () => menuItem.count(), {
          timeout: 5000,
          message: `等待第 ${i + 1} 个下拉菜单项加载完成`,
        })
        .toBeGreaterThan(0);
      await expect(menuItem).toBeVisible({ timeout: 5000 });
      await menuItem.click();

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
    await markdownInputFieldPage.goto(
      PLAYWRIGHT_FIXTURE_DEMOS.markdownInputFieldTags,
    );

    // 等待 tag popup 输入区域出现
    const popupInputs = markdownInputFieldPage.root.locator(
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

    // 顺序操作：并行点击两个 popup 易导致下拉未挂载就点菜单、或 iframe 焦点错乱
    const n = Math.min(popupCount, 2);
    for (let i = 0; i < n; i++) {
      const popupInput = popupInputs.nth(i);
      await popupInput.click({ timeout: 5000 });
      const item = markdownInputFieldPage.keyboardTargetPage
        .locator('.ant-dropdown-menu-item')
        .last();
      await expect
        .poll(async () => item.count(), { timeout: 5000 })
        .toBeGreaterThan(0);
      await expect(item).toBeVisible({ timeout: 5000 });
      await item.click();
    }

    await expect(markdownInputFieldPage.editableInput).toBeVisible({
      timeout: 10000,
    });

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
    await markdownInputFieldPage.goto(
      PLAYWRIGHT_FIXTURE_DEMOS.markdownInputFieldTags,
    );

    // 等待 tag popup 输入区域出现
    const popupInput = markdownInputFieldPage.root
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

    const before = await markdownInputFieldPage.getText();

    // 第一次选择
    await popupInput.click();
    const firstItem = markdownInputFieldPage.keyboardTargetPage
      .locator('.ant-dropdown-menu-item')
      .last();
    await expect
      .poll(async () => firstItem.count(), {
        timeout: 5000,
        message: '等待下拉菜单项加载完成',
      })
      .toBeGreaterThan(0);
    await expect(firstItem).toBeVisible({ timeout: 5000 });
    await firstItem.click();

    await expect
      .poll(async () => await markdownInputFieldPage.getText(), {
        timeout: 5000,
        message: '等待第一次选择写入编辑器',
      })
      .not.toBe(before);

    // 立即再次打开下拉菜单（连续操作）
    await popupInput.click();
    const secondItem = markdownInputFieldPage.keyboardTargetPage
      .locator('.ant-dropdown-menu-item')
      .last();
    await expect
      .poll(async () => secondItem.count(), {
        timeout: 5000,
        message: '等待下拉菜单再次打开',
      })
      .toBeGreaterThan(0);
    await expect(secondItem).toBeVisible({ timeout: 5000 });
    await secondItem.click();

    // 等待所有异步操作完成（等待输入框稳定）
    await expect(markdownInputFieldPage.editableInput).toBeVisible();

    // 验证没有 path 相关的错误
    const pathErrors = errors.filter(
      (error) => error.includes('path') || error.includes('null'),
    );
    expect(pathErrors.length).toBe(0);
  });
});
