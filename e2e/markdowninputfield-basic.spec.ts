import { test, expect } from '../tests/fixtures/page-fixture';

test.describe('MarkdownInputField 基础功能', () => {
  test('应该能够正确输入文本', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Hello World');
    const text = await markdownInputFieldPage.getText();
    expect(text).toContain('Hello');
  });

  test('应该能够追加输入文本', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Hello World - Test');
    const text = await markdownInputFieldPage.getText();
    expect(text).toContain('Test');
  });

  test('应该能够使用 Backspace 删除字符', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Backspace Test');
    const beforeText = await markdownInputFieldPage.getText();
    await markdownInputFieldPage.focus();
    await markdownInputFieldPage.pressKey('End');
    await markdownInputFieldPage.pressKey('Backspace');
    const afterText = await markdownInputFieldPage.getText();
    expect(afterText.length).toBeLessThan(beforeText.length);
    expect(afterText.length).toBe(beforeText.length - 1);
  });

  test('应该能够使用 Delete 键删除字符', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Delete Test');
    const beforeText = await markdownInputFieldPage.getText();
    const beforeLength = beforeText.trim().length;
    await markdownInputFieldPage.focus();
    
    // 移动到开头
    await markdownInputFieldPage.pressKey('Home');
    
    // 按 Delete 键删除字符
    await markdownInputFieldPage.pressKey('Delete');
    
    // 使用 expect.poll 等待文本长度减少（符合 Playwright 最佳实践，避免 waitForTimeout）
    await expect.poll(
      async () => {
        const text = await markdownInputFieldPage.getText();
        return text.trim().length;
      },
      {
        message: '等待文本长度减少',
        timeout: 5000,
      }
    ).toBeLessThan(beforeLength);
    
    // 验证删除结果（Playwright 的 expect 会自动重试）
    const afterText = await markdownInputFieldPage.getText();
    expect(afterText.length).toBeLessThan(beforeText.length);
    expect(afterText.length).toBe(beforeText.length - 1);
    expect(afterText.trim().startsWith('e')).toBe(true);
  });

  test('应该能够全选并删除', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Select All Delete Test');
    const beforeText = await markdownInputFieldPage.getText();
    await markdownInputFieldPage.selectAll();
    await markdownInputFieldPage.pressKey('Delete');
    const afterText = await markdownInputFieldPage.getText();
    const trimmedAfterDelete = afterText.trim();
    expect(trimmedAfterDelete.length).toBeLessThan(beforeText.trim().length);
    expect(trimmedAfterDelete.length).toBeLessThan(3);
  });

  test('应该能够复制文本', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Copy Test Text');
    await markdownInputFieldPage.selectAll();
    await markdownInputFieldPage.copy();
    
    // 验证复制是否成功：通过粘贴操作来验证
    await markdownInputFieldPage.clear();
    await markdownInputFieldPage.paste();
    
    const pastedText = await markdownInputFieldPage.getText();
    expect(pastedText).toContain('Copy Test');
  });

  test('应该能够部分选中并复制', async ({ markdownInputFieldPage, page }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Copy Test Text');
    await markdownInputFieldPage.focus();
    
    // 移动到开头
    await markdownInputFieldPage.pressKey('Home');
    
    // 使用 Shift+End 或 Shift+ArrowRight 选中文本（更高效）
    // 先选中前 4 个字符
    await page.keyboard.down('Shift');
    for (let i = 0; i < 4; i++) {
      await markdownInputFieldPage.pressKey('ArrowRight');
    }
    await page.keyboard.up('Shift');
    
    // 复制操作（copy() 方法内部已处理权限）
    await markdownInputFieldPage.copy();
    
    // 验证复制是否成功：通过粘贴操作来验证
    // 先清空输入框，然后粘贴，验证内容是否正确
    await markdownInputFieldPage.clear();
    
    // 等待一小段时间，确保清空操作完成，避免影响粘贴
    await markdownInputFieldPage.page.waitForTimeout(100);
    
    await markdownInputFieldPage.paste();
    
    // 验证粘贴的内容长度小于原始文本（因为我们只复制了部分）
    const pastedText = await markdownInputFieldPage.getText();
    expect(pastedText.length).toBeLessThan('Copy Test Text'.length);
    expect(pastedText.length).toBeGreaterThan(0);
  });

  test('应该能够剪切文本', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Cut Test Text');
    const beforeCut = await markdownInputFieldPage.getText();
    await markdownInputFieldPage.selectAll();
    await markdownInputFieldPage.cut();
    
    // 验证剪切后文本长度减少
    const afterCut = await markdownInputFieldPage.getText();
    expect(afterCut.length).toBeLessThan(beforeCut.length);
    
    // 验证剪切是否成功：通过粘贴操作来验证
    await markdownInputFieldPage.paste();
    const pastedText = await markdownInputFieldPage.getText();
    expect(pastedText).toContain('Cut Test');
  });

  test('应该能够粘贴文本', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.clear();
    const pasteText = 'Pasted Text';
    await markdownInputFieldPage.setClipboardText(pasteText);
    
    // paste() 方法内部已经等待文本变化
    await markdownInputFieldPage.paste();
    
    // 验证文本包含粘贴内容（paste() 已等待，直接获取文本即可）
    const afterPaste = await markdownInputFieldPage.getText();
    expect(afterPaste).toContain('Pasted');
  });

  test('应该能够在已有文本中粘贴', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Initial Text');
    const beforePaste = await markdownInputFieldPage.getText();
    await markdownInputFieldPage.pressKey('End');
    await markdownInputFieldPage.pressKey('Space');
    const pasteText = 'Pasted Text';
    await markdownInputFieldPage.setClipboardText(pasteText);
    
    // paste() 方法内部已经等待文本变化
    await markdownInputFieldPage.paste();
    
    // 验证文本包含粘贴内容（paste() 已等待，直接获取文本即可）
    const afterPaste = await markdownInputFieldPage.getText();
    expect(afterPaste).toContain('Pasted');
    expect(afterPaste.length).toBeGreaterThan(beforePaste.length);
  });

  test('应该显示占位符当只输入空格时', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.clear();
    await markdownInputFieldPage.expectPlaceholderVisible();
    await markdownInputFieldPage.typeText('   ');
    await markdownInputFieldPage.expectPlaceholderVisible();
  });

  test('应该隐藏占位符当输入实际文本时', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.clear();
    await markdownInputFieldPage.typeText('Actual text');
    
    // expectPlaceholderHidden 内部已经使用 expect.poll 等待，这里直接调用
    await markdownInputFieldPage.expectPlaceholderHidden();
  });

  test('应该能够正确导航光标位置', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Test cursor navigation');
    await markdownInputFieldPage.pressKey('Home');
    await markdownInputFieldPage.typeText('Start: ');
    const textAfterHome = await markdownInputFieldPage.getText();
    expect(textAfterHome).toContain('Start:');
  });

  test('应该能够清空输入', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Text to be cleared');
    await markdownInputFieldPage.clear();
    const textAfterClear = await markdownInputFieldPage.getText();
    expect(textAfterClear.trim().length).toBe(0);
    await markdownInputFieldPage.expectPlaceholderVisible();
  });

  test('应该能够快速输入', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    const rapidText = 'Rapid input test: ';
    await markdownInputFieldPage.typeText(rapidText);
    const text = await markdownInputFieldPage.getText();
    expect(text).toContain('Rapid input test');
    expect(text.length).toBeGreaterThanOrEqual(rapidText.length);
  });
});
