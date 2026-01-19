import { expect, test } from '../tests/fixtures/page-fixture';

test.describe('MarkdownInputField 高级功能', () => {
  test('应该支持多行输入', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto('markdowninputfield-demo-8');
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

  test('应该支持文本选择和编辑', async ({ markdownInputFieldPage, page }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Select and edit this text');
    await markdownInputFieldPage.pressKey('Home');
    await page.waitForTimeout(100); // 等待光标移动到开头

    // 选中前 6 个字符 "Select"
    // 使用 Shift+ArrowRight 6次来选中
    await page.keyboard.down('Shift');
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.up('Shift');
    await page.waitForTimeout(200); // 等待选择完成

    // 验证选择是否正确
    const selectedText = await markdownInputFieldPage.editableInput.evaluate(
      (el) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          return '';
        }
        return selection.toString();
      },
    );
    // 验证选中了文本
    expect(selectedText.length).toBeGreaterThan(0);

    // 输入替换文本（type() 在有选中文本时会替换选中部分）
    // 直接使用 editableInput.type() 确保替换行为
    await markdownInputFieldPage.editableInput.type('Replace', { delay: 0 });
    await page.waitForTimeout(300); // 等待替换完成

    // 使用轮询等待替换完成
    await expect
      .poll(
        async () => {
          const textAfterEdit = await markdownInputFieldPage.getText();
          return textAfterEdit.includes('Replace') && textAfterEdit.includes('edit this text');
        },
        {
          timeout: 3000,
          message: '等待文本替换完成',
        },
      )
      .toBe(true);

    // 验证替换结果
    const textAfterEdit = await markdownInputFieldPage.getText();
    expect(textAfterEdit).toContain('Replace');
    expect(textAfterEdit).toContain('edit this text');
    // 验证 "Select" 已被替换
    expect(textAfterEdit).not.toContain('Select and');
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
