import { expect, test } from '../tests/fixtures/page-fixture';

test.describe('MarkdownInputField 高级功能', () => {
  test('应该支持多行输入', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    const multiLineText = 'Line 1\nLine 2\nLine 3\nLine 4';
    await markdownInputFieldPage.typeText(multiLineText);
    const text = await markdownInputFieldPage.getText();
    expect(text).toContain('Line 1');
    expect(text).toContain('Line 2');
    expect(text).toContain('Line 3');
    expect(text).toContain('Line 4');
  });

  test('应该支持长文本和滚动', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    const longText = '这是一段很长的文本，用来测试输入框的滚动功能。'.repeat(
      20,
    );
    await markdownInputFieldPage.typeText(longText);
    const text = await markdownInputFieldPage.getText();
    expect(text.length).toBeGreaterThan(100);
  });

  test('应该支持聚焦和失焦', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.focus();
    await markdownInputFieldPage.expectFocused();
  });

  test('应该支持 Markdown 格式化', async ({ markdownInputFieldPage, page }) => {
    await markdownInputFieldPage.goto();
    const markdownText = '# 标题\n\n**粗体文本**\n\n*斜体文本*\n\n`代码文本`';
    await markdownInputFieldPage.typeText(markdownText);
    const text = await markdownInputFieldPage.getText();
    expect(text).toContain('标题');
    expect(text).toContain('粗体文本');
    expect(text).toContain('斜体文本');
    expect(text).toContain('代码文本');

    // 验证 Markdown 格式被正确解析
    const hasBold = await page.evaluate(() => {
      const boldElements = document.querySelectorAll(
        '[data-testid="markdown-bold"]',
      );
      return boldElements.length > 0;
    });
    expect(hasBold).toBe(true);
  });

  test('应该支持文本选择和编辑', async ({ markdownInputFieldPage, page }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Select and edit this text');
    await markdownInputFieldPage.pressKey('Home');

    // 选中前 6 个字符
    await page.keyboard.down('Shift');
    for (let i = 0; i < 6; i++) {
      await markdownInputFieldPage.pressKey('ArrowRight');
    }
    await page.keyboard.up('Shift');

    // 输入替换文本（typeText 是同步的，文本会立即更新）
    await markdownInputFieldPage.typeText('Replace');

    // 直接获取文本并验证（typeText 已同步完成，无需等待）
    const textAfterEdit = await markdownInputFieldPage.getText();
    expect(textAfterEdit).toContain('Replace');
    expect(textAfterEdit).toContain('edit this text');
  });

  test('应该支持输入验证', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.clear();
    const emptyText = await markdownInputFieldPage.getText();
    expect(emptyText.trim().length).toBe(0);

    await markdownInputFieldPage.typeText('!@#$%^&*()_+-=[]{}|;:,.<>?');
    const specialCharsText = await markdownInputFieldPage.getText();
    expect(specialCharsText.length).toBeGreaterThan(0);

    await markdownInputFieldPage.typeText('测试中文输入');
    const chineseText = await markdownInputFieldPage.getText();
    expect(chineseText).toContain('测试');

    await markdownInputFieldPage.typeText('Hello 😀 World 🌍');
    const emojiText = await markdownInputFieldPage.getText();
    expect(emojiText).toContain('Hello');
    expect(emojiText).toContain('World');
  });

  test('应该支持响应式行为', async ({ markdownInputFieldPage, page }) => {
    await markdownInputFieldPage.goto();
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopWidth = await markdownInputFieldPage.inputField.evaluate(
      (el) => window.getComputedStyle(el).width,
    );

    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletWidth = await markdownInputFieldPage.inputField.evaluate(
      (el) => window.getComputedStyle(el).width,
    );

    await page.setViewportSize({ width: 375, height: 667 });
    const mobileWidth = await markdownInputFieldPage.inputField.evaluate(
      (el) => window.getComputedStyle(el).width,
    );

    expect(desktopWidth).toBeTruthy();
    expect(tabletWidth).toBeTruthy();
    expect(mobileWidth).toBeTruthy();
  });
});
