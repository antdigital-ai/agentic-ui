import { Locator, Page, expect } from '@playwright/test';

/**
 * ToolUseBar Page Object Model
 * 封装 ToolUseBar 组件的所有交互操作
 */
export class ToolUseBarPage {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('ToolUse');
  }

  /**
   * 导航到 demo 页面
   */
  async goto(demoPath: string = 'toolusebar-demo-tool-use-bar-basic') {
    await this.page.goto(`/~demos/${demoPath}`);
    await this.waitForReady();
  }

  /**
   * 等待组件准备就绪
   * 优先等待工具项出现（更可靠），如果没有工具项则等待容器
   */
  async waitForReady() {
    // 先等待页面加载完成
    await this.page.waitForLoadState('domcontentloaded');
    
    // 优先等待工具项出现（使用 test-id）
    const toolItems = this.page.getByTestId('ToolUserItem');
    const toolItemsCount = await toolItems.count();
    
    if (toolItemsCount > 0) {
      // 如果有工具项，等待第一个工具项可见
      await expect(toolItems.first()).toBeVisible({ timeout: 10000 });
    } else {
      // 如果没有工具项，至少等待容器存在
      await expect(this.container).toBeAttached({ timeout: 10000 });
    }
  }

  /**
   * 获取所有工具项
   * 优先使用 test-id，如果没有则使用容器子元素
   */
  getToolItems(): Locator {
    return this.page
      .getByTestId('ToolUserItem')
      .or(this.container.locator('> *').first());
  }

  /**
   * 获取第一个工具项
   */
  getFirstToolItem(): Locator {
    return this.getToolItems().first();
  }

  /**
   * 获取指定索引的工具项
   */
  getToolItem(index: number): Locator {
    return this.getToolItems().nth(index);
  }

  /**
   * 点击工具项
   */
  async clickToolItem(index: number = 0) {
    const toolItem = index === 0 ? this.getFirstToolItem() : this.getToolItem(index);
    await toolItem.click();
  }

  /**
   * 验证工具项数量
   */
  async expectToolCount(count: number) {
    const toolCount = await this.getToolItems().count();
    expect(toolCount).toBe(count);
  }

  /**
   * 验证至少有一个工具项
   */
  async expectHasTools() {
    const toolCount = await this.getToolItems().count();
    expect(toolCount).toBeGreaterThan(0);
  }

  /**
   * 验证工具项处于成功状态
   */
  async expectToolSuccess(index: number = 0) {
    const toolItem = index === 0 ? this.getFirstToolItem() : this.getToolItem(index);
    await expect(toolItem).toHaveClass(/success/);
  }

  /**
   * 验证工具项处于加载状态
   */
  async expectToolLoading(index: number = 0) {
    const toolItem = index === 0 ? this.getFirstToolItem() : this.getToolItem(index);
    await expect(toolItem).toHaveClass(/loading/);
  }

  /**
   * 验证工具项处于错误状态
   */
  async expectToolError(index: number = 0) {
    const toolItem = index === 0 ? this.getFirstToolItem() : this.getToolItem(index);
    await expect(toolItem).toHaveClass(/error/);
  }

  /**
   * 验证工具项处于空闲状态
   */
  async expectToolIdle(index: number = 0) {
    const toolItem = index === 0 ? this.getFirstToolItem() : this.getToolItem(index);
    await expect(toolItem).toHaveClass(/idle/);
  }

  /**
   * 验证工具项处于激活状态
   */
  async expectToolActive(index: number = 0) {
    const toolItem = index === 0 ? this.getFirstToolItem() : this.getToolItem(index);
    await expect(toolItem).toHaveClass(/active/);
  }

  /**
   * 展开工具项
   */
  async expandToolItem(index: number = 0) {
    const toolItem = index === 0 ? this.getFirstToolItem() : this.getToolItem(index);
    const expandButton = toolItem.locator('button').or(
      toolItem.locator('[role="button"]'),
    );
    if ((await expandButton.count()) > 0) {
      await expandButton.first().click();
    }
  }

  /**
   * 获取工具项文本内容
   */
  async getToolItemText(index: number = 0): Promise<string> {
    const toolItem = index === 0 ? this.getFirstToolItem() : this.getToolItem(index);
    return await toolItem.textContent() || '';
  }
}
