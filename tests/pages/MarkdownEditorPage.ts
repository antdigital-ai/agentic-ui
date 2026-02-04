import { Locator, Page, expect } from '@playwright/test';

/**
 * MarkdownEditor Page Object Model
 * 封装 MarkdownEditor 组件的所有交互操作
 */
export class MarkdownEditorPage {
  readonly page: Page;
  readonly editableInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // MarkdownEditor 使用 Slate 的 Editable 组件，通过 contenteditable 定位
    this.editableInput = page.locator('[contenteditable="true"]').first();
  }

  /**
   * 导航到 demo 页面
   */
  async goto(demoPath: string = 'markdowneditor-demo-1') {
    await this.page.goto(`/~demos/${demoPath}`);
    // 等待页面加载完成
    await this.page.waitForLoadState('networkidle');
    await this.waitForReady();
  }

  /**
   * 等待组件准备就绪
   * 增加超时时间，因为 Slate 编辑器需要时间初始化
   */
  async waitForReady() {
    // 增加超时时间到 10 秒，给组件和 Slate 编辑器足够的初始化时间
    await expect(this.editableInput).toBeVisible({ timeout: 10000 });
  }

  /**
   * 点击编辑器以聚焦
   */
  async focus() {
    await this.editableInput.click();
  }

  /**
   * 输入文本
   */
  async typeText(text: string) {
    await this.focus();
    await this.editableInput.type(text, { delay: 0 });
    // 等待文本输入完成
    await expect
      .poll(
        async () => {
          const content = await this.getText();
          return content.length > 0;
        },
        {
          timeout: 3000,
          message: '等待文本输入完成',
        },
      )
      .toBe(true);
  }

  /**
   * 获取编辑器文本内容
   */
  async getText(): Promise<string> {
    const text = await this.editableInput.evaluate((el) => {
      return el.textContent || '';
    });
    return text.trim();
  }

  /**
   * 清空编辑器内容
   */
  async clear() {
    await this.focus();
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifierKey}+a`);
    await this.page.waitForTimeout(100); // 等待全选操作完成
    await this.page.keyboard.press('Delete');
    await this.page.waitForTimeout(200); // 等待删除操作完成
  }

  /**
   * 使用键盘快捷键
   */
  async pressKey(key: string) {
    const isMac = process.platform === 'darwin';
    if (isMac && key === 'Home') {
      await this.page.keyboard.press('Meta+ArrowLeft');
    } else if (isMac && key === 'End') {
      await this.page.keyboard.press('Meta+ArrowRight');
    } else {
      await this.page.keyboard.press(key);
    }
  }

  /**
   * 选中所有文本
   */
  async selectAll() {
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifierKey}+a`);
    await this.page.waitForTimeout(100);
  }

  /**
   * 验证编辑器是否可见
   */
  async expectVisible() {
    await expect(this.editableInput).toBeVisible();
  }

  /**
   * 验证编辑器是否包含指定文本
   */
  async expectContainsText(text: string) {
    await expect
      .poll(
        async () => {
          const content = await this.getText();
          return content.includes(text);
        },
        {
          timeout: 3000,
          message: `等待文本 "${text}" 出现`,
        },
      )
      .toBe(true);
  }

  /**
   * 查找工具栏按钮
   */
  getToolbarButton(name: string): Locator {
    return this.page.getByRole('button', { name }).first();
  }

  /**
   * 查找标签输入框
   */
  getTagInput(): Locator {
    return this.page.locator('[data-tag-popup-input]').first();
  }

  /**
   * 查找评论按钮或标记
   */
  getCommentMarker(): Locator {
    return this.page.locator('[data-comment-marker]').first();
  }
}
