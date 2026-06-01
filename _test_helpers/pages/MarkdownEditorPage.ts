import type { Frame } from '@playwright/test';
import { Locator, Page, expect } from '@playwright/test';

import { PLAYWRIGHT_FIXTURE_DEMOS } from '../constants/playwrightDemoRoutes';
import { getDumiDemoContentRoot } from '../utils/dumiDemoFrame';

/** 与 `markdown.matchInputToNode` 等输入规则联用时，逐字输入的默认间隔（ms） */
const DEFAULT_INPUT_RULE_TYPE_DELAY_MS = 25;

/**
 * MarkdownEditor Page Object Model
 * 封装 MarkdownEditor 组件的所有交互操作
 */
export class MarkdownEditorPage {
  readonly page: Page;
  /** Dumi demo 常在 iframe 内，键盘目标以该 root 为准 */
  root: Page | Frame;
  editableInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page;
    this.editableInput = page.locator('[contenteditable="true"]').first();
  }

  private async bindDemoRoot() {
    this.root = await getDumiDemoContentRoot(this.page);
    const slate = this.root.locator(
      '.ant-agentic-md-editor-content[contenteditable="true"]',
    );
    this.editableInput =
      (await slate.count()) > 0
        ? slate.first()
        : this.root.locator('[contenteditable="true"]').first();
  }

  /** 键盘事件发往 iframe 所在的主 Page */
  private get keyboardPage(): Page {
    return this.root === this.page ? this.page : (this.root as Frame).page;
  }

  /** E2E 中快捷键需发往该 Page（与 Slate 所在 iframe 同属一个顶层 document） */
  get keyboardTargetPage(): Page {
    return this.keyboardPage;
  }

  /** 鼠标坐标与 keyboardTargetPage 一致（iframe 内元素用主 Page 的 mouse） */
  get interactionTargetPage(): Page {
    return this.keyboardPage;
  }

  /**
   * 导航到 demo 页面
   */
  async goto(
    demoPath: string = PLAYWRIGHT_FIXTURE_DEMOS.markdownEditor,
  ) {
    await this.page.goto(`/~demos/${demoPath}`);
    // 等待页面加载完成
    await this.page.waitForLoadState('networkidle');
    await this.bindDemoRoot();
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

  private async typeTextWithDelay(text: string, delayMs: number) {
    await this.focus();
    await this.editableInput.type(text, { delay: delayMs });
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
   * 输入文本（最快路径，delay 0）
   */
  async typeText(text: string) {
    await this.typeTextWithDelay(text, 0);
  }

  /**
   * 逐字输入，降低与 Slate 输入规则（如行首 `- ` 转列表）的竞态
   */
  async typeTextWithInputRuleDelay(
    text: string,
    delayMs: number = DEFAULT_INPUT_RULE_TYPE_DELAY_MS,
  ) {
    await this.typeTextWithDelay(text, delayMs);
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
    await this.keyboardPage.keyboard.press(`${modifierKey}+a`);
    await this.keyboardPage.waitForTimeout(100); // 等待全选操作完成
    await this.keyboardPage.keyboard.press('Delete');
    await this.keyboardPage.waitForTimeout(200); // 等待删除操作完成
  }

  /**
   * 使用键盘快捷键
   */
  async pressKey(key: string) {
    const isMac = process.platform === 'darwin';
    const kb = this.keyboardPage.keyboard;
    if (isMac && key === 'Home') {
      await kb.press('Meta+ArrowLeft');
    } else if (isMac && key === 'End') {
      await kb.press('Meta+ArrowRight');
    } else if (key === 'Space') {
      // type 走文本输入路径，比 press 更接近真实 IME/浏览器对空格的 beforeinput 行为
      await kb.type(' ');
    } else {
      await kb.press(key);
    }
  }

  /**
   * 选中所有文本
   */
  async selectAll() {
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    await this.keyboardPage.keyboard.press(`${modifierKey}+a`);
    await this.keyboardPage.waitForTimeout(100);
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
    return this.root.getByRole('button', { name }).first();
  }

  /**
   * 查找标签输入框
   */
  getTagInput(): Locator {
    return this.root.locator('[data-tag-popup-input]').first();
  }

  /**
   * 查找评论按钮或标记
   */
  getCommentMarker(): Locator {
    return this.root.locator('[data-comment-marker]').first();
  }

  /**
   * 模拟粘贴 HTML 内容（用于 E2E 测试 handlePasteEvent 的 HTML 分支）
   * 通过派发带自定义 clipboardData 的 paste 事件实现
   */
  async pasteHtml(html: string, plainText?: string): Promise<void> {
    await this.focus();
    const text = plainText ?? (html.replace(/<[^>]+>/g, '').trim() || 'pasted');
    await this.editableInput.evaluate(
      (
        element: HTMLElement,
        { html: h, text: t }: { html: string; text: string },
      ) => {
        const dt = new DataTransfer();
        dt.setData('text/html', h);
        dt.setData('text/plain', t);
        const ev = new ClipboardEvent('paste', {
          clipboardData: dt,
          bubbles: true,
        });
        element.focus();
        element.dispatchEvent(ev);
      },
      { html, text },
    );
  }
}
