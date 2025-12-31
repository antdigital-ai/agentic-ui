import { Locator, Page, expect } from '@playwright/test';

/**
 * MarkdownInputField Page Object Model
 * 封装 MarkdownInputField 组件的所有交互操作
 */
export class MarkdownInputFieldPage {
  readonly page: Page;
  readonly inputField: Locator;
  readonly editableInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // 使用 data-testid 作为后备，优先使用语义化选择器
    this.inputField = page
      .getByTestId('markdown-input-field')
      .or(page.locator('[contenteditable="true"]').first().locator('..'));
    this.editableInput = page.locator('[contenteditable="true"]').first();
  }

  /**
   * 导航到 demo 页面
   */
  async goto(demoPath: string = 'markdowninputfield-demo-1') {
    await this.page.goto(`/~demos/${demoPath}`);
    await this.waitForReady();
  }

  /**
   * 等待组件准备就绪
   */
  async waitForReady() {
    await expect(this.editableInput).toBeVisible();
  }

  /**
   * 点击输入框以聚焦
   */
  async focus() {
    await this.editableInput.click();
  }

  /**
   * 输入文本
   * 使用 type() 而不是 fill()，以便在有选中文本时替换选中部分
   */
  async typeText(text: string) {
    await this.focus();
    // 使用 type() 而不是 fill()，这样：
    // 1. 如果有选中文本，会替换选中部分
    // 2. 如果没有选中文本，会在光标位置插入
    await this.editableInput.type(text, { delay: 0 });
  }

  /**
   * 获取输入框文本内容
   * 排除占位符文本，只返回实际输入的内容
   * 使用 textContent 获取完整的多行文本
   */
  async getText(): Promise<string> {
    // 使用 evaluate 获取完整的 textContent，这样可以获取所有文本包括换行
    const text = await this.editableInput.evaluate((el) => {
      // 直接使用 textContent 获取所有文本（包括隐藏文本）
      // textContent 会获取所有子节点的文本内容，包括换行
      return el.textContent || '';
    });

    // 排除占位符文本（如 "请输入内容..."）和特殊字符（如 "·"）
    const placeholderText = '请输入内容';
    const trimmedText = text.trim();
    if (
      text.includes(placeholderText) ||
      trimmedText === '·' ||
      trimmedText === ''
    ) {
      return '';
    }
    return text;
  }

  /**
   * 清空输入框
   */
  async clear() {
    await this.focus();
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifierKey}+a`);
    await this.page.keyboard.press('Delete');
  }

  /**
   * 验证占位符是否显示
   * 使用 empty 类判断（符合实现逻辑），而不是依赖属性值
   */
  async expectPlaceholderVisible() {
    // 检查是否有 empty 类的段落元素，且占位符属性存在
    const hasPlaceholder = await this.page.evaluate(() => {
      const emptyParagraph = document.querySelector(
        '.empty[data-slate-placeholder]',
      );
      return (
        emptyParagraph !== null &&
        emptyParagraph.getAttribute('data-slate-placeholder') !== null
      );
    });
    expect(hasPlaceholder).toBe(true);
  }

  /**
   * 验证占位符是否隐藏
   * 使用 Playwright locator 和断言，更高效稳定
   */
  async expectPlaceholderHidden() {
    // 使用 Playwright locator 查找 empty 类的占位符元素
    const emptyPlaceholder = this.page.locator(
      '.empty[data-slate-placeholder]',
    );

    // 等待占位符消失（使用 not.toBeVisible 会自动重试）
    await expect(emptyPlaceholder).not.toBeVisible({ timeout: 3000 });

    // 验证输入框有实际内容
    const text = await this.getText();
    expect(text.trim().length).toBeGreaterThan(0);
  }

  /**
   * 验证输入框是否聚焦
   * 使用 Playwright 原生方法，不依赖 CSS 类名（符合规范）
   */
  async expectFocused() {
    // 使用 Playwright 的原生 toBeFocused() 方法，更稳定可靠
    await expect(this.editableInput).toBeFocused();
  }

  /**
   * 使用键盘快捷键
   */
  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  /**
   * 选中所有文本
   */
  async selectAll() {
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifierKey}+a`);
  }

  /**
   * 复制文本到剪贴板
   * 注意：在 Playwright 中，剪贴板操作可能需要权限，但不保证立即可用
   * 建议在测试中通过粘贴操作来验证复制是否成功
   */
  async copy() {
    const context = this.page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifierKey}+c`);
    // 等待剪贴板操作完成（使用稍长的延迟，确保复制操作完成）
    // 注意：虽然使用了 waitForTimeout，但这是必要的，因为剪贴板操作是异步的
    await this.page.waitForTimeout(200);
  }

  /**
   * 从剪贴板粘贴
   * 添加等待文本变化的机制
   */
  async paste() {
    const context = this.page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const beforeText = await this.getText();
    const beforeLength = beforeText.trim().length;
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';

    // 先等待一小段时间，确保输入框已准备好接收粘贴
    await this.page.waitForTimeout(100);

    await this.page.keyboard.press(`${modifierKey}+v`);

    // 等待文本变化：如果之前是空的，等待文本变为非空；否则等待文本长度增加
    if (beforeLength === 0) {
      // 如果之前是空的，等待文本变为非空（增加超时时间，给剪贴板操作更多时间）
      await expect
        .poll(
          async () => {
            const text = await this.getText();
            return text.trim().length;
          },
          {
            timeout: 3000,
            message: '等待粘贴内容出现，如果超时可能是剪贴板为空',
          },
        )
        .toBeGreaterThan(0);
    } else {
      // 如果之前有文本，等待文本变化（长度或内容）
      await expect
        .poll(
          async () => {
            const text = await this.getText();
            return text.trim().length;
          },
          { timeout: 3000 },
        )
        .toBeGreaterThan(beforeLength);
    }
  }

  /**
   * 剪切文本
   */
  async cut() {
    await this.page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifierKey}+x`);
  }

  /**
   * 读取剪贴板内容
   * 使用 Playwright 原生 API，更稳定可靠
   */
  async getClipboardText(): Promise<string | null> {
    // 使用 Playwright 的原生剪贴板 API
    const context = this.page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    try {
      // 使用 evaluate 读取剪贴板，但添加超时控制
      const text = await this.page.evaluate(
        async () => {
          try {
            return await navigator.clipboard.readText();
          } catch {
            return null;
          }
        },
        { timeout: 2000 },
      );
      return text;
    } catch {
      return null;
    }
  }

  /**
   * 写入剪贴板内容
   * 使用 Playwright 原生 API，更稳定可靠
   */
  async setClipboardText(text: string) {
    const context = this.page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await this.page.evaluate(async (textToWrite) => {
      await navigator.clipboard.writeText(textToWrite);
    }, text);
  }
}
