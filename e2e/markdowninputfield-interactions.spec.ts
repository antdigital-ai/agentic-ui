import { expect, test } from '../tests/fixtures/page-fixture';

test.describe('MarkdownInputField 交互功能', () => {
  test.describe('发送消息', () => {
    test.beforeEach(async ({ markdownInputFieldPage }) => {
      // 使用基础 Demo
      await markdownInputFieldPage.goto('markdowninputfield-demo-1');
    });

    test('按 Enter 键应该发送消息并清空输入框', async ({ markdownInputFieldPage }) => {
      await markdownInputFieldPage.typeText('Message to send');
      
      // 验证输入框不为空
      let text = await markdownInputFieldPage.getText();
      expect(text).toContain('Message to send');

      // 按 Enter 发送
      await markdownInputFieldPage.pressKey('Enter');

      // 验证输入框被清空 (sendMessage 会清空内容)
      await expect.poll(async () => {
        return await markdownInputFieldPage.getText();
      }, { timeout: 5000 }).toBe('');
    });

    test('按 Shift+Enter 应该换行而不是发送', async ({ markdownInputFieldPage }) => {
      await markdownInputFieldPage.typeText('Line 1');
      
      // 按 Shift+Enter
      await markdownInputFieldPage.page.keyboard.press('Shift+Enter');
      
      // 输入第二行
      await markdownInputFieldPage.typeText('Line 2');

      // 验证内容包含两行且未被清空
      const text = await markdownInputFieldPage.getText();
      expect(text).toContain('Line 1');
      expect(text).toContain('Line 2');
      
      // 验证换行：检查是否有多个段落元素（Slate 使用块级元素表示换行）
      const paragraphCount = await markdownInputFieldPage.editableInput.evaluate((el) => {
        const paragraphs = el.querySelectorAll('div[data-be="paragraph"]');
        return paragraphs.length || el.children.length;
      });
      expect(paragraphCount).toBeGreaterThanOrEqual(2);
    });

    test('点击发送按钮应该发送消息', async ({ markdownInputFieldPage }) => {
      await markdownInputFieldPage.typeText('Message via button');

      // 确保发送按钮可用 (输入内容后应变为可用)
      const sendBtn = markdownInputFieldPage.sendButton;
      await expect(sendBtn).toBeVisible();
      // 某些实现可能没有 disabled 属性，而是通过样式控制，或者图标变色
      // 这里主要测试点击能否触发发送
      
      await sendBtn.click();

      // 验证输入框被清空
      await expect.poll(async () => {
        return await markdownInputFieldPage.getText();
      }, { timeout: 5000 }).toBe('');
    });
  });

  test.describe('放大/缩小功能', () => {
    test.beforeEach(async ({ markdownInputFieldPage }) => {
      // 使用支持放大的 Demo (根据分析是 demo-6)
      await markdownInputFieldPage.goto('markdowninputfield-demo-6');
    });

    test('点击放大按钮应该切换放大状态', async ({ markdownInputFieldPage }) => {
      // 检查放大按钮是否存在
      const enlargeBtn = markdownInputFieldPage.enlargeButton;
      await expect(enlargeBtn).toBeVisible();

      // 获取初始状态 (未放大)
      // 检查容器类名
      const container = markdownInputFieldPage.page.locator('.ant-agentic-md-input-field');
      await expect(container).not.toHaveClass(/ant-agentic-md-input-field-enlarged/);

      // 点击放大
      await enlargeBtn.click();

      // 验证已放大
      await expect(container).toHaveClass(/ant-agentic-md-input-field-enlarged/);

      // 验证按钮变为"缩小"
      const shrinkBtn = markdownInputFieldPage.shrinkButton;
      await expect(shrinkBtn).toBeVisible();

      // 点击缩小
      await shrinkBtn.click();

      // 验证恢复未放大
      await expect(container).not.toHaveClass(/ant-agentic-md-input-field-enlarged/);
    });
  });
});
