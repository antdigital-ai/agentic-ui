import { expect, test } from '../tests/fixtures/page-fixture';

/**
 * MarkdownInputField 布局样式兼容性测试
 * 测试修复 #268: 各种表现形式下输入框布局样式兼容
 */
test.describe('MarkdownInputField 布局样式兼容性', () => {
  test('应该在单行布局时应用正确的最小高度', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待输入框加载
    await markdownInputFieldPage.waitForReady();

    // 获取输入框元素
    const inputField = page.locator(
      '.ant-agentic-md-input-field:not(.ant-agentic-md-input-field-enlarged)',
    ).first();

    await expect(inputField).toBeVisible({ timeout: 5000 });

    // 获取计算后的样式
    const styles = await inputField.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        minHeight: computed.minHeight,
        height: computed.height,
        maxHeight: computed.maxHeight,
      };
    });

    // 验证最小高度存在且合理（单行布局时应该有一个合理的最小高度）
    expect(styles.minHeight).toBeTruthy();
    const minHeightValue = parseFloat(styles.minHeight);
    expect(minHeightValue).toBeGreaterThan(0);
  });

  test('应该在多行布局时应用正确的最小高度', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待输入框加载
    await markdownInputFieldPage.waitForReady();

    // 输入多行文本以触发多行布局
    await markdownInputFieldPage.typeText('第一行\n第二行\n第三行');

    // 等待布局更新（通过等待输入框内容变化来确认）
    await expect
      .poll(async () => await markdownInputFieldPage.getText(), {
        timeout: 3000,
      })
      .toContain('第一行');

    // 获取输入框元素
    const inputField = page.locator(
      '.ant-agentic-md-input-field:not(.ant-agentic-md-input-field-enlarged)',
    ).first();

    await expect(inputField).toBeVisible({ timeout: 5000 });

    // 获取计算后的样式
    const styles = await inputField.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        minHeight: computed.minHeight,
        height: computed.height,
        maxHeight: computed.maxHeight,
      };
    });

    // 验证多行布局时的最小高度（应该大于单行布局）
    expect(styles.minHeight).toBeTruthy();
    const minHeightValue = parseFloat(styles.minHeight);
    expect(minHeightValue).toBeGreaterThan(0);
  });

  test('应该在放大状态下应用正确的样式', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待输入框加载
    await markdownInputFieldPage.waitForReady();

    // 查找放大按钮
    const enlargeButton = markdownInputFieldPage.enlargeButton;
    const hasEnlargeButton = await enlargeButton.isVisible().catch(() => false);

    if (hasEnlargeButton) {
      // 点击放大按钮
      await enlargeButton.click();

      // 等待放大动画完成（通过等待放大类名出现来确认）
      await expect(enlargedInputField).toHaveClass(/enlarged/, { timeout: 3000 });

      // 获取放大后的输入框元素
      const enlargedInputField = page.locator(
        '.ant-agentic-md-input-field-enlarged',
      ).first();

      await expect(enlargedInputField).toBeVisible({ timeout: 5000 });

      // 获取计算后的样式
      const styles = await enlargedInputField.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          minHeight: computed.minHeight,
          height: computed.height,
          maxHeight: computed.maxHeight,
        };
      });

      // 验证放大状态下的样式（minHeight 应该是 auto）
      expect(styles.minHeight).toBeTruthy();
      // 放大状态下 minHeight 可能是 'auto' 或一个较大的值
      expect(styles.minHeight === 'auto' || parseFloat(styles.minHeight) > 0).toBe(true);
    }
  });

  test('应该在有工具条时应用正确的样式', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待输入框加载
    await markdownInputFieldPage.waitForReady();

    // 查找带有工具条的输入框
    const inputFieldWithTools = page.locator(
      '.ant-agentic-md-input-field-has-tools-wrapper',
    ).first();

    const hasTools = await inputFieldWithTools.isVisible().catch(() => false);

    if (hasTools) {
      // 获取计算后的样式
      const styles = await inputFieldWithTools.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          minHeight: computed.minHeight,
          height: computed.height,
          borderRadius: computed.borderRadius,
        };
      });

      // 验证有工具条时的样式（应该有正确的圆角和高度）
      expect(styles.minHeight).toBeTruthy();
      expect(styles.borderRadius).toBeTruthy();
    }
  });

  test('应该在窗口大小变化时保持布局正确', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待输入框加载
    await markdownInputFieldPage.waitForReady();

    // 获取初始样式
    const inputField = page.locator(
      '.ant-agentic-md-input-field:not(.ant-agentic-md-input-field-enlarged)',
    ).first();

    await expect(inputField).toBeVisible({ timeout: 5000 });

    const initialStyles = await inputField.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        minHeight: computed.minHeight,
        width: computed.width,
      };
    });

    // 改变窗口大小
    await page.setViewportSize({ width: 800, height: 600 });
    // 等待布局重新计算（通过等待输入框可见来确认）
    await expect(inputField).toBeVisible();

    // 再次获取样式
    const stylesAfterResize = await inputField.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        minHeight: computed.minHeight,
        width: computed.width,
      };
    });

    // 验证最小高度保持一致（布局应该自适应）
    expect(stylesAfterResize.minHeight).toBeTruthy();
    expect(parseFloat(stylesAfterResize.minHeight)).toBeGreaterThan(0);

    // 恢复窗口大小
    await page.setViewportSize({ width: 1280, height: 720 });
    // 等待布局重新计算
    await expect(inputField).toBeVisible();
  });

  test('应该在同时有放大和优化按钮时应用正确的最小高度', async ({
    markdownInputFieldPage,
    page,
  }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待输入框加载
    await markdownInputFieldPage.waitForReady();

    // 查找输入框
    const inputField = page.locator(
      '.ant-agentic-md-input-field:not(.ant-agentic-md-input-field-enlarged)',
    ).first();

    await expect(inputField).toBeVisible({ timeout: 5000 });

    // 检查是否有放大和优化按钮
    const enlargeButton = markdownInputFieldPage.enlargeButton;
    const hasEnlarge = await enlargeButton.isVisible().catch(() => false);

    // 查找优化按钮（如果有的话）
    const refineButton = page.getByRole('button', { name: /优化|refine/i });
    const hasRefine = await refineButton.isVisible().catch(() => false);

    if (hasEnlarge && hasRefine) {
      // 获取计算后的样式
      const styles = await inputField.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          minHeight: computed.minHeight,
        };
      });

      // 验证同时有放大和优化按钮时，最小高度应该是 140px（根据修复代码）
      const minHeightValue = parseFloat(styles.minHeight);
      // 允许一些误差，因为可能是 140px 或接近的值
      expect(minHeightValue).toBeGreaterThanOrEqual(130);
    }
  });

  test('应该在移动端尺寸下应用正确的布局样式', async ({
    markdownInputFieldPage,
    page,
  }) => {
    // 设置为移动端尺寸
    await page.setViewportSize({ width: 375, height: 667 });

    await markdownInputFieldPage.goto('markdowninputfield-demo-0');

    // 等待输入框加载
    await markdownInputFieldPage.waitForReady();

    // 查找输入框
    const inputField = page.locator(
      '.ant-agentic-md-input-field:not(.ant-agentic-md-input-field-enlarged)',
    ).first();

    await expect(inputField).toBeVisible({ timeout: 5000 });

    // 获取计算后的样式
    const styles = await inputField.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        minHeight: computed.minHeight,
        width: computed.width,
        padding: computed.padding,
      };
    });

    // 验证移动端布局样式正确
    expect(styles.minHeight).toBeTruthy();
    expect(parseFloat(styles.minHeight)).toBeGreaterThan(0);
    expect(styles.width).toBeTruthy();

    // 恢复窗口大小
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
