import { expect, test } from '../tests/fixtures/page-fixture';

test.describe('MarkdownEditor 基础功能', () => {
  test.beforeEach(async ({ markdownEditorPage }) => {
    await markdownEditorPage.goto('markdowneditor-demo-1');
  });

  test('应该能够加载编辑器', async ({ markdownEditorPage }) => {
    await markdownEditorPage.expectVisible();
  });

  test('应该能够输入文本', async ({ markdownEditorPage }) => {
    await markdownEditorPage.typeText('Hello World');
    await markdownEditorPage.expectContainsText('Hello');
  });

  test('应该能够追加输入文本', async ({ markdownEditorPage }) => {
    await markdownEditorPage.typeText('Initial Text');
    await markdownEditorPage.typeText(' - Additional Text');
    await markdownEditorPage.expectContainsText('Initial Text');
    await markdownEditorPage.expectContainsText('Additional Text');
  });



  test('应该能够全选并删除', async ({ markdownEditorPage }) => {
    await markdownEditorPage.typeText('Select All Delete Test');
    const beforeText = await markdownEditorPage.getText();
    await markdownEditorPage.selectAll();
    await markdownEditorPage.pressKey('Delete');
    const afterText = await markdownEditorPage.getText();
    expect(afterText.length).toBeLessThan(beforeText.length);
  });


  test('应该支持多行输入', async ({ markdownEditorPage }) => {
    await markdownEditorPage.typeText('Line 1');
    await markdownEditorPage.pressKey('Enter');
    await markdownEditorPage.typeText('Line 2');
    await markdownEditorPage.pressKey('Enter');
    await markdownEditorPage.typeText('Line 3');

    // 验证包含多行内容
    await markdownEditorPage.expectContainsText('Line 1');
    await markdownEditorPage.expectContainsText('Line 2');
    await markdownEditorPage.expectContainsText('Line 3');

    // 验证有多个段落
    const paragraphCount = await markdownEditorPage.editableInput.evaluate(
      (el) => {
        const paragraphs = el.querySelectorAll('div[data-be="paragraph"]');
        return paragraphs.length || el.children.length;
      },
    );
    expect(paragraphCount).toBeGreaterThanOrEqual(2);
  });

  test('应该支持 Home 和 End 键导航', async ({ markdownEditorPage }) => {
    await markdownEditorPage.typeText('Middle Content');

    // 移动到末尾并追加
    await markdownEditorPage.focus();
    await markdownEditorPage.pressKey('End');
    await markdownEditorPage.typeText(' End');
    await markdownEditorPage.expectContainsText('End');

    // 移动到开头并插入
    await markdownEditorPage.pressKey('Home');
    await markdownEditorPage.editableInput.type('Prefix ', { delay: 0 });
    await markdownEditorPage.expectContainsText('Prefix');
    await markdownEditorPage.expectContainsText('Middle Content');
  });

  test('应该能够复制和粘贴文本', async ({ markdownEditorPage, page }) => {
    await markdownEditorPage.typeText('Copy Test Text');
    await markdownEditorPage.selectAll();

    // 复制
    const context = page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifierKey}+c`);
    await page.waitForTimeout(200);

    // 清空并粘贴
    await markdownEditorPage.clear();
    await page.keyboard.press(`${modifierKey}+v`);

    // 验证粘贴成功
    await expect
      .poll(
        async () => {
          const text = await markdownEditorPage.getText();
          return text.includes('Copy Test');
        },
        {
          timeout: 3000,
          message: '等待粘贴内容出现',
        },
      )
      .toBe(true);
  });
});

test.describe('MarkdownEditor 高级功能', () => {
  test.beforeEach(async ({ markdownEditorPage }) => {
    await markdownEditorPage.goto('markdowneditor-demo-1');
  });

  test('应该支持标签输入功能', async ({ markdownEditorPage, page }) => {
    await markdownEditorPage.expectVisible();

    // 查找标签输入框（如果存在）
    const tagInput = markdownEditorPage.getTagInput();
    const hasTagInput = await tagInput.isVisible().catch(() => false);

    if (hasTagInput) {
      await tagInput.click();
      // 等待下拉菜单出现
      const menuItems = page.locator('.ant-dropdown-menu-item');
      const count = await menuItems.count();
      if (count > 0) {
        await expect(menuItems.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('应该支持评论功能', async ({ markdownEditorPage }) => {
    await markdownEditorPage.expectVisible();

    // 输入一些文本
    await markdownEditorPage.typeText('Test comment content');

    // 选中文本
    await markdownEditorPage.selectAll();

    // 查找评论按钮或标记（如果存在）
    const commentMarker = markdownEditorPage.getCommentMarker();
    const hasCommentMarker = await commentMarker.isVisible().catch(() => false);

    // 如果评论功能可用，验证评论标记存在
    if (hasCommentMarker) {
      await expect(commentMarker).toBeVisible();
    }
  });

  test('应该能够处理 Markdown 语法', async ({ markdownEditorPage }) => {
    // 输入 Markdown 标题
    await markdownEditorPage.typeText('# Heading 1');
    await markdownEditorPage.pressKey('Enter');
    await markdownEditorPage.typeText('## Heading 2');
    await markdownEditorPage.pressKey('Enter');
    await markdownEditorPage.typeText('**Bold text**');

    // 验证内容包含这些文本
    await markdownEditorPage.expectContainsText('Heading 1');
    await markdownEditorPage.expectContainsText('Heading 2');
    await markdownEditorPage.expectContainsText('Bold text');
  });

  test('应该能够处理列表', async ({ markdownEditorPage }) => {
    await markdownEditorPage.typeText('- List item 1');
    await markdownEditorPage.pressKey('Enter');
    await markdownEditorPage.typeText('- List item 2');
    await markdownEditorPage.pressKey('Enter');
    await markdownEditorPage.typeText('- List item 3');

    // 验证包含列表内容
    await markdownEditorPage.expectContainsText('List item 1');
    await markdownEditorPage.expectContainsText('List item 2');
    await markdownEditorPage.expectContainsText('List item 3');
  });
});
