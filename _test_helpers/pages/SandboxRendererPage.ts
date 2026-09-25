import type { Frame } from '@playwright/test';
import { Locator, Page, expect } from '@playwright/test';

import { PLAYWRIGHT_FIXTURE_DEMOS } from '../constants/playwrightDemoRoutes';
import { gotoDumiDemo } from '../utils/e2eNavigation';

const CONTAINER_SELECTOR = '[class*="sandbox-renderer"]';

/**
 * SandboxRenderer Page Object Model
 *
 * 组件内容渲染在 Shadow DOM 内，Playwright 的 CSS 选择器默认可穿透
 * open shadow root，因此直接用后代选择器定位内部节点。
 */
export class SandboxRendererPage {
  readonly page: Page;
  root: Page | Frame;
  container: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page;
    this.container = page.locator(CONTAINER_SELECTOR).first();
  }

  /**
   * SandboxRenderer 无 contenteditable / slate 根，getDumiDemoContentRoot
   * 的 Slate 启发式不适用：直接在主页面与各 iframe frame 中定位容器。
   */
  private async bindDemoRoot() {
    const mainCount = await this.page
      .locator(CONTAINER_SELECTOR)
      .count()
      .catch(() => 0);
    if (mainCount > 0) {
      this.root = this.page;
      this.container = this.page.locator(CONTAINER_SELECTOR).first();
      return;
    }

    for (const frame of this.page.frames()) {
      const count = await frame
        .locator(CONTAINER_SELECTOR)
        .count()
        .catch(() => 0);
      if (count > 0) {
        this.root = frame;
        this.container = frame.locator(CONTAINER_SELECTOR).first();
        return;
      }
    }
  }

  async goto(demoPath: string = PLAYWRIGHT_FIXTURE_DEMOS.sandboxRenderer) {
    await gotoDumiDemo(this.page, demoPath);
    await this.bindDemoRoot();
    await this.waitForReady();
  }

  async waitForReady() {
    await expect(this.container).toBeVisible({ timeout: 15_000 });
  }

  /** 沙箱内渲染的标题（穿透 Shadow DOM） */
  renderedTitle(): Locator {
    return this.container.locator('#e2e-title');
  }

  /** 沙箱内渲染的交互按钮 */
  renderedButton(): Locator {
    return this.container.locator('#e2e-btn');
  }

  /** 宿主侧拿到的 onExecute 结果文本 */
  resultText(): Locator {
    return this.root.getByTestId('e2e-sandbox-result');
  }
}
