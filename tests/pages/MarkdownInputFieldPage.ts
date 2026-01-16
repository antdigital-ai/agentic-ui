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

  get sendButton(): Locator {
    // 使用 .first() 确保只匹配第一个发送按钮，避免 strict mode 错误
    return this.page.getByTestId('send-button').first();
  }

  get enlargeButton(): Locator {
    return this.page.getByRole('button', { name: '放大' });
  }

  get shrinkButton(): Locator {
    return this.page.getByRole('button', { name: '缩小' });
  }

  /**
   * 导航到 demo 页面
   */
  async goto(demoPath: string = 'markdowninputfield-demo-1') {
    await this.page.goto(`/~demos/${demoPath}`);
    // 等待页面加载完成（DOMContentLoaded 和 networkidle）
    await this.page.waitForLoadState('networkidle');
    await this.waitForReady();
  }

  /**
   * 等待组件准备就绪
   * 增加超时时间，因为 Slate 编辑器需要时间初始化 contenteditable 元素
   */
  async waitForReady() {
    // 增加超时时间到 10 秒，给组件和 Slate 编辑器足够的初始化时间
    await expect(this.editableInput).toBeVisible({ timeout: 10000 });
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
   * 对于多行文本，正确处理换行符（\n）转换为实际的 Enter 键按下
   * 对于包含 Markdown 语法的文本，使用适当的延迟确保语法字符被正确输入
   */
  async typeText(text: string) {
    await this.focus();
    // 如果文本包含换行符，需要逐行输入并在行间按 Enter
    if (text.includes('\n')) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        // 先输入当前行的文本（如果有）
        if (lines[i]) {
          // 输入当前行的文本，对于包含 Markdown 语法的行使用较小的延迟
          const hasMarkdownSyntax = /[*_`#\u005B\u005D()]/.test(lines[i]);
          const isLineWhitespace = lines[i].trim().length === 0;
          const beforeType = await this.getText();
          const beforeLength = beforeType.length;
          await this.editableInput.type(lines[i], {
            delay: hasMarkdownSyntax ? 30 : 0,
          });
          // 等待当前行输入完成：等待文本长度增加或内容变化
          // 注意：对于 Markdown 语法，解析后的文本可能不包含原始语法字符
          // 对于只包含空白字符的行，getText() 会返回空字符串，所以跳过等待
          if (!isLineWhitespace) {
            await expect
              .poll(
                async () => {
                  const currentText = await this.getText();
                  const currentLength = currentText.length;
                  // 文本长度增加，或者内容变化（说明输入已生效）
                  return (
                    currentLength > beforeLength ||
                    currentText !== beforeType ||
                    // 对于纯文本行，也可以检查是否包含（去除 Markdown 语法后的文本）
                    (!hasMarkdownSyntax && currentText.includes(lines[i]))
                  );
                },
                {
                  timeout: 3000,
                  message: `等待行 "${lines[i]}" 输入完成`,
                },
              )
              .toBe(true);
          }
        }

        // 如果不是最后一行，按 Shift+Enter 创建新行（避免 Enter 触发发送）
        if (i < lines.length - 1) {
          // 获取按 Enter 前的段落数量或子元素数量
          const beforeCount = await this.editableInput.evaluate((el) => {
            const paragraphs = el.querySelectorAll('div[data-be="paragraph"]');
            return paragraphs.length || el.children.length;
          });

          // 使用 Shift+Enter 强制换行，避免 Enter 键触发发送消息
          await this.page.keyboard.press('Shift+Enter');

          // 等待换行完成：等待段落数量增加或结构变化
          // 在 Slate 编辑器中，换行通过块级元素表示，不依赖 \n 字符
          await expect
            .poll(
              async () => {
                const result = await this.editableInput.evaluate((el) => {
                  const paragraphs = el.querySelectorAll(
                    'div[data-be="paragraph"]',
                  );
                  const paragraphCount =
                    paragraphs.length || el.children.length;
                  // 检查是否有空段落（新创建的行通常是空的）
                  const hasEmptyParagraph = Array.from(paragraphs).some(
                    (p) => !p.textContent || p.textContent.trim() === '',
                  );
                  return {
                    count: paragraphCount,
                    hasEmpty: hasEmptyParagraph,
                  };
                });
                // 段落数量增加表示换行成功
                // 或者有多个段落且存在空段落（表示新行已创建）
                // 或者段落数量至少为 2（表示已经有多行）
                return (
                  result.count > beforeCount ||
                  (result.count > 1 && result.hasEmpty) ||
                  result.count >= 2
                );
              },
              {
                timeout: 5000,
                message: '等待换行完成',
              },
            )
            .toBe(true);
        }
      }
    } else {
      // 单行文本，直接使用 type()
      // 使用 type() 而不是 fill()，这样：
      // 1. 如果有选中文本，会替换选中部分
      // 2. 如果没有选中文本，会在光标位置插入
      const hasMarkdownSyntax = /[*_`#\u005B\u005D()]/.test(text);
      await this.editableInput.type(text, {
        delay: hasMarkdownSyntax ? 20 : 0,
      });
    }
    // 等待文本内容稳定，确保所有输入都被处理
    // 注意：如果输入只包含空白字符，getText() 会返回空字符串（这是预期的）
    // 所以对于只包含空白字符的输入，跳过等待文本不为空的逻辑
    const isOnlyWhitespace = text.trim().length === 0;
    if (!isOnlyWhitespace) {
      // 使用智能等待，等待文本实际出现
      await expect
        .poll(
          async () => {
            const currentText = await this.getText();
            return currentText;
          },
          {
            timeout: 3000,
            message: '等待文本输入完成',
          },
        )
        .not.toBe('');
    }
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
   * 在 Mac 上，Home/End 键需要使用 Meta+Left/Right 组合
   */
  async pressKey(key: string) {
    const isMac = process.platform === 'darwin';
    if (isMac && key === 'Home') {
      // Mac 上使用 Meta+Left 代替 Home
      await this.page.keyboard.press('Meta+ArrowLeft');
    } else if (isMac && key === 'End') {
      // Mac 上使用 Meta+Right 代替 End
      await this.page.keyboard.press('Meta+ArrowRight');
    } else {
      await this.page.keyboard.press(key);
    }
  }

  /**
   * 选中所有文本
   * 在 Mac 上使用 Meta+A，在其他平台使用 Ctrl+A
   * 全选后等待选中状态生效
   */
  async selectAll() {
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifierKey}+a`);
    // 等待选中状态生效，确保后续输入能够替换选中内容
    // Mac 上可能需要更长的等待时间
    await this.page.waitForTimeout(isMac ? 200 : 100);
    // 验证选中状态是否生效（通过检查是否有选中文本）
    await expect
      .poll(
        async () => {
          const hasSelection = await this.editableInput.evaluate(() => {
            const selection = window.getSelection();
            return (
              selection && selection.rangeCount > 0 && !selection.isCollapsed
            );
          });
          return hasSelection;
        },
        {
          timeout: 1000,
          message: '等待全选状态生效',
        },
      )
      .toBe(true);
  }

  /**
   * 复制文本到剪贴板
   * 注意：在 Playwright 中，剪贴板操作可能需要权限，但不保证立即可用
   * 建议在测试中通过粘贴操作来验证复制是否成功
   * 不验证剪贴板内容，因为 navigator.clipboard.readText() 在 Playwright 中可能不可靠
   */
  async copy() {
    const context = this.page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifierKey}+c`);
    // 等待一小段时间，确保复制操作完成
    // 注意：不验证剪贴板内容，因为 navigator.clipboard.readText() 可能不可靠
    // 复制是否成功应该通过后续的粘贴操作来验证
    await this.page.waitForTimeout(200);
  }

  /**
   * 从剪贴板粘贴
   * 添加等待文本变化的机制
   * 注意：不检查剪贴板内容，因为 navigator.clipboard.readText() 在 Playwright 中可能不可靠
   * 直接执行粘贴操作，然后等待文本变化来验证粘贴是否成功
   */
  async paste() {
    const context = this.page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const beforeText = await this.getText();
    const beforeLength = beforeText.trim().length;
    const isMac = process.platform === 'darwin';
    const modifierKey = isMac ? 'Meta' : 'Control';

    // 确保输入框已聚焦，准备好接收粘贴
    await this.focus();
    // 等待一小段时间，确保输入框已准备好接收粘贴
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
            timeout: 5000,
            message: '等待粘贴内容出现，如果超时可能是剪贴板为空或粘贴操作失败',
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
          { timeout: 5000 },
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
