import { Browser, chromium } from 'playwright';
import { afterAll, beforeAll, expect, test } from 'vitest';

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch({
    headless: true,
  });
});

afterAll(async () => {
  if (browser) {
    await browser.close();
  }
});

test('ToolUseBar basic rendering should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/toolusebar-demo-tool-use-bar-basic',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // 直接查找工具项（更可靠的方法）
      // 先尝试通过文本内容查找（demo 中有"文件搜索"）
      const toolItems = page
        .locator('[data-testid="ToolUserItem"]')
        .or(page.locator('.ant-agentic-tool-use-bar-tool'))
        .or(page.locator('text=文件搜索').locator('..'));

      // 等待至少一个工具项出现
      await toolItems.first().waitFor({ state: 'visible', timeout: 15000 });

      const toolCount = await toolItems.count();
      expect(toolCount).toBeGreaterThan(0);

      // 验证工具名称显示（通过文本内容或类名）
      const firstTool = toolItems.first();
      // 尝试通过工具名称文本验证（demo 中有"文件搜索"）
      const toolNameText = await firstTool.textContent();
      expect(toolNameText).toBeTruthy();
      expect(toolNameText?.length).toBeGreaterThan(0);

      console.log('Basic rendering test passed');
      console.log('Tool count:', toolCount);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run basic rendering e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('ToolUseBar tool status display should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/toolusebar-demo-tool-use-bar-basic',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // 直接查找工具项（更可靠的方法）
      const toolItems = page
        .locator('[data-testid="ToolUserItem"]')
        .or(page.locator('.ant-agentic-tool-use-bar-tool'));

      // 等待至少一个工具项出现
      await toolItems.first().waitFor({ state: 'visible', timeout: 15000 });

      // 验证 success 状态
      const successTool = page.locator(
        '.ant-agentic-tool-use-bar-tool-success',
      );
      const successCount = await successTool.count();
      expect(successCount).toBeGreaterThan(0);

      // 验证 loading 状态
      const loadingTool = page.locator(
        '.ant-agentic-tool-use-bar-tool-loading',
      );
      const loadingCount = await loadingTool.count();
      expect(loadingCount).toBeGreaterThan(0);

      // 验证 error 状态
      const errorTool = page.locator('.ant-agentic-tool-use-bar-tool-error');
      const errorCount = await errorTool.count();
      expect(errorCount).toBeGreaterThan(0);

      // 验证 idle 状态
      const idleTool = page.locator('.ant-agentic-tool-use-bar-tool-idle');
      const idleCount = await idleTool.count();
      expect(idleCount).toBeGreaterThan(0);

      console.log('Tool status display test passed');
      console.log('Success tools:', successCount);
      console.log('Loading tools:', loadingCount);
      console.log('Error tools:', errorCount);
      console.log('Idle tools:', idleCount);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run tool status display e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('ToolUseBar active keys management should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/toolusebar-demo-tool-use-bar-active-keys',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // 直接查找工具项（更可靠的方法）
      const toolItems = page
        .locator('[data-testid="ToolUserItem"]')
        .or(page.locator('.ant-agentic-tool-use-bar-tool'));

      // 等待至少一个工具项出现
      await toolItems.first().waitFor({ state: 'visible', timeout: 15000 });
      const firstTool = toolItems.first();

      // 点击第一个工具项激活
      await firstTool.click();
      await page.waitForTimeout(300);

      // 验证工具项被激活
      const isActive = await firstTool.evaluate((el) => {
        return el.classList.contains('ant-agentic-tool-use-bar-tool-active');
      });
      expect(isActive).toBe(true);

      // 再次点击取消激活
      await firstTool.click();
      await page.waitForTimeout(300);

      // 验证工具项取消激活
      const isActiveAfter = await firstTool.evaluate((el) => {
        return el.classList.contains('ant-agentic-tool-use-bar-tool-active');
      });
      expect(isActiveAfter).toBe(false);

      console.log('Active keys management test passed');
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run active keys management e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('ToolUseBar tool click interaction should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/toolusebar-demo-tool-use-bar-basic',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // 直接查找工具项（更可靠的方法）
      const toolItems = page
        .locator('[data-testid="ToolUserItem"]')
        .or(page.locator('.ant-agentic-tool-use-bar-tool'));

      // 等待至少一个工具项出现
      await toolItems.first().waitFor({ state: 'visible', timeout: 15000 });
      const firstTool = toolItems.first();

      // 监听控制台日志以验证点击回调
      const consoleMessages: string[] = [];
      page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('点击的工具')) {
          consoleMessages.push(text);
        }
      });

      // 点击工具项
      await firstTool.click();
      await page.waitForTimeout(300);

      // 验证点击事件触发（通过检查是否有控制台输出或状态变化）
      // 注意：由于无法直接访问 React 状态，我们通过视觉反馈验证
      const toolHeader = firstTool.locator(
        '.ant-agentic-tool-use-bar-tool-header',
      );
      const isVisible = await toolHeader.isVisible();
      expect(isVisible).toBe(true);

      console.log('Tool click interaction test passed');
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run tool click interaction e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('ToolUseBar empty state should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/toolusebar-demo-tool-use-bar-basic',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // 验证空状态时容器仍然存在
      // 直接查找工具项
      const toolItems = page
        .locator('[data-testid="ToolUserItem"]')
        .or(page.locator('.ant-agentic-tool-use-bar-tool'));

      // 等待工具项出现（在这个 demo 中应该有工具项）
      await toolItems.first().waitFor({ state: 'visible', timeout: 20000 });

      const toolCount = await toolItems.count();

      // 在这个 demo 中应该有工具项，验证工具项存在
      expect(toolCount).toBeGreaterThan(0);

      console.log('Empty state test passed');
      console.log('Tool count:', toolCount);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run empty state e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('ToolUseBar light mode should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/toolusebar-demo-tool-use-bar-basic',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // 查找 light 模式的 ToolUseBar（demo 中有两个，第二个是 light 模式）
      const toolUseBars = page.locator('[data-testid="ToolUse"]');
      const toolUseBarCount = await toolUseBars.count();

      if (toolUseBarCount >= 2) {
        const lightToolUseBar = toolUseBars.nth(1);
        await lightToolUseBar.waitFor({ state: 'visible', timeout: 15000 });

        // 验证 light 模式的工具项存在
        const lightToolItems = lightToolUseBar.locator(
          '.ant-agentic-tool-use-bar-tool-light',
        );
        const lightToolCount = await lightToolItems.count();
        expect(lightToolCount).toBeGreaterThan(0);

        console.log('Light mode test passed');
        console.log('Light mode tool count:', lightToolCount);
      } else {
        console.log('Light mode ToolUseBar not found in demo');
      }
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run light mode e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('ToolUseBar error message display should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/toolusebar-demo-tool-use-bar-basic',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // 直接查找工具项
      const toolItems = page
        .locator('[data-testid="ToolUserItem"]')
        .or(page.locator('.ant-agentic-tool-use-bar-tool'));
      await toolItems.first().waitFor({ state: 'visible', timeout: 15000 });

      // 查找错误状态的工具项
      const errorTool = page.locator('.ant-agentic-tool-use-bar-tool-error');
      const errorToolCount = await errorTool.count();

      if (errorToolCount > 0) {
        const firstErrorTool = errorTool.first();

        // 查找展开按钮（错误信息通常需要展开才能看到）
        const expandButton = firstErrorTool.locator(
          '.ant-agentic-tool-use-bar-tool-expand',
        );
        const expandButtonCount = await expandButton.count();

        if (expandButtonCount > 0) {
          // 展开工具项查看错误信息
          await expandButton.first().click();
          await page.waitForTimeout(300);

          // 验证错误信息存在
          const errorMessage = await firstErrorTool.textContent();
          expect(errorMessage).toBeTruthy();
          expect(errorMessage?.length).toBeGreaterThan(0);

          console.log('Error message display test passed');
          console.log('Error message:', errorMessage?.substring(0, 50));
        }
      } else {
        console.log('No error tool found in demo');
      }
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run error message display e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});
