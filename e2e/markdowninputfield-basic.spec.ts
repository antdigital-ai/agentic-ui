import { expect, test } from '../tests/fixtures/page-fixture';

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

  test('应该能够使用 Backspace 删除字符', async ({
    markdownInputFieldPage,
  }) => {
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
    await expect
      .poll(
        async () => {
          const text = await markdownInputFieldPage.getText();
          return text.trim().length;
        },
        {
          message: '等待文本长度减少',
          timeout: 5000,
        },
      )
      .toBeLessThan(beforeLength);

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
    await markdownInputFieldPage.goto('markdowninputfield-demo-8');
    await markdownInputFieldPage.typeText('Copy Test Text');
    await markdownInputFieldPage.focus();

    // 使用鼠标选择前 4 个字符 "Copy"
    // 获取输入框的位置
    const editableInput = markdownInputFieldPage.editableInput;
    const boundingBox = await editableInput.boundingBox();
    if (!boundingBox) {
      throw new Error('无法获取输入框的位置');
    }

    // 计算文本的起始位置（在输入框左侧，稍微偏移以选择文本）
    const startX = boundingBox.x + 5;
    const startY = boundingBox.y + boundingBox.height / 2;

    // 使用 evaluate 获取前 4 个字符的实际宽度
    const textWidth = await editableInput.evaluate((el) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return 0;
      }

      // 创建临时 range 来测量文本宽度
      const range = document.createRange();
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);

      let textNode = walker.nextNode();
      if (!textNode || !textNode.textContent) {
        return 0;
      }

      range.setStart(textNode, 0);
      range.setEnd(textNode, Math.min(4, textNode.textContent.length));
      const rect = range.getBoundingClientRect();
      return rect.width;
    });

    const endX = startX + textWidth;
    const endY = startY;

    // 使用鼠标拖拽选择文本
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();

    // 等待一小段时间，确保选择完成
    await page.waitForTimeout(100);

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

test.describe('MarkdownInputField 快捷键功能', () => {
  test('应该支持 Home 键移动到文档开头', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Middle Text');
    const beforeText = await markdownInputFieldPage.getText();

    // 按 Home 键移动到开头
    await markdownInputFieldPage.focus();
    await markdownInputFieldPage.pressKey('Home');

    // 在开头插入文本
    await markdownInputFieldPage.typeText('Start: ');
    const afterText = await markdownInputFieldPage.getText();

    // 验证文本包含新插入的内容
    expect(afterText).toContain('Start:');
    expect(afterText.length).toBeGreaterThan(beforeText.length);
    // 验证文本包含原始内容
    expect(afterText).toContain('Middle Text');
  });

  test('应该支持 End 键移动到文档末尾', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Initial Text');
    const beforeText = await markdownInputFieldPage.getText();

    // 按 End 键移动到末尾
    await markdownInputFieldPage.focus();
    await markdownInputFieldPage.pressKey('End');

    // 在末尾追加文本
    await markdownInputFieldPage.typeText(' End Text');
    const afterText = await markdownInputFieldPage.getText();

    // 验证文本包含追加的内容
    expect(afterText).toContain('End Text');
    expect(afterText.length).toBeGreaterThan(beforeText.length);
    // 验证新文本在末尾
    expect(afterText.trim().endsWith('End Text')).toBe(true);
  });

  test('应该支持 Ctrl+A / Cmd+A 全选功能', async ({
    markdownInputFieldPage,
  }) => {
    await markdownInputFieldPage.goto();
    const originalText = 'Select All Test Text';
    await markdownInputFieldPage.typeText(originalText);

    // 使用 Ctrl+A / Cmd+A 全选
    await markdownInputFieldPage.selectAll();

    // 输入新文本替换选中的内容
    await markdownInputFieldPage.typeText('Replaced Text');
    const afterText = await markdownInputFieldPage.getText();

    // 验证原始文本被替换
    expect(afterText).toContain('Replaced Text');
    expect(afterText).not.toContain(originalText);
  });

  test('应该支持 Home 键在空文档中工作', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.clear();
    await markdownInputFieldPage.focus();

    // 在空文档中按 Home 键
    await markdownInputFieldPage.pressKey('Home');

    // 输入文本
    await markdownInputFieldPage.typeText('New Text');
    const text = await markdownInputFieldPage.getText();

    // 验证文本已输入
    expect(text).toContain('New Text');
  });

  test('应该支持 End 键在空文档中工作', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.clear();
    await markdownInputFieldPage.focus();

    // 在空文档中按 End 键
    await markdownInputFieldPage.pressKey('End');

    // 输入文本
    await markdownInputFieldPage.typeText('New Text');
    const text = await markdownInputFieldPage.getText();

    // 验证文本已输入
    expect(text).toContain('New Text');
  });

  test('应该支持 Home 和 End 键组合使用', async ({
    markdownInputFieldPage,
  }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Middle Content');

    // 移动到末尾并追加
    await markdownInputFieldPage.focus();
    await markdownInputFieldPage.pressKey('End');
    await markdownInputFieldPage.typeText(' End');
    const afterEnd = await markdownInputFieldPage.getText();
    expect(afterEnd.trim().endsWith('End')).toBe(true);

    // 移动到开头并插入
    await markdownInputFieldPage.pressKey('Home');
    // 等待光标移动到开头
    await markdownInputFieldPage.page.waitForTimeout(100);
    await markdownInputFieldPage.typeText('Prefix ');
    const afterHome = await markdownInputFieldPage.getText();
    // 验证文本包含新插入的内容
    expect(afterHome).toContain('Prefix');
    // 验证文本包含之前的内容
    expect(afterHome).toContain('Middle Content');
    // 验证文本长度增加
    expect(afterHome.length).toBeGreaterThan(afterEnd.length);
  });

  test('应该支持 Ctrl+A 后删除所有内容', async ({ markdownInputFieldPage }) => {
    await markdownInputFieldPage.goto();
    const originalText = 'Text to be deleted';
    await markdownInputFieldPage.typeText(originalText);

    // 全选并删除
    await markdownInputFieldPage.selectAll();
    await markdownInputFieldPage.pressKey('Delete');
    const afterDelete = await markdownInputFieldPage.getText();

    // 验证内容被删除
    expect(afterDelete.trim().length).toBeLessThan(originalText.length);
    expect(afterDelete.trim().length).toBeLessThan(3);
  });

  test('应该支持 Ctrl+A 后输入新内容替换', async ({
    markdownInputFieldPage,
  }) => {
    await markdownInputFieldPage.goto();
    await markdownInputFieldPage.typeText('Old Content');

    // 全选并输入新内容
    await markdownInputFieldPage.selectAll();
    await markdownInputFieldPage.typeText('New Content');
    const text = await markdownInputFieldPage.getText();

    // 验证内容被替换
    expect(text).toContain('New Content');
    expect(text).not.toContain('Old Content');
  });
});
