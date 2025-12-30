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

test('MarkdownInputField styles should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 10000,
        waitUntil: 'networkidle',
      },
    );

    if (response?.ok()) {
      // 先等待页面加载完成
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 先找到可编辑的输入框
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 15000 });

      // 直接查找 MarkdownInputField 容器
      const inputFieldElement = page
        .locator('.ant-agentic-md-input-field')
        .first();
      await inputFieldElement.waitFor({ state: 'visible', timeout: 15000 });

      // 测试默认状态的 boxShadow
      const defaultBoxShadow = await inputFieldElement.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      expect(defaultBoxShadow).toContain('rgba(10, 48, 104, 0.15)');
      expect(defaultBoxShadow).toContain('rgba(10, 48, 104, 0.04)');

      // 测试 hover 状态的 boxShadow
      await inputFieldElement.hover();
      await page.waitForTimeout(300); // 等待 transition 完成

      const hoverBoxShadow = await inputFieldElement.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      expect(hoverBoxShadow).toContain('rgba(10, 48, 104, 0.25)');
      expect(hoverBoxShadow).toContain('rgba(10, 48, 104, 0.05)');
      expect(hoverBoxShadow).toContain('rgba(10, 48, 104, 0.06)');

      // 测试 focused 状态的 boxShadow
      await input.click();
      await page.waitForTimeout(300); // 等待 transition 完成

      const focusedBoxShadow = await inputFieldElement.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      expect(focusedBoxShadow).toContain('rgba(10, 48, 104, 0.25)');
      expect(focusedBoxShadow).toContain('rgba(10, 48, 104, 0.05)');
      expect(focusedBoxShadow).toContain('rgba(10, 48, 104, 0.06)');

      // 验证 focused className 已添加
      const hasFocusedClass = await inputFieldElement.evaluate((el) => {
        return el.classList.toString().includes('focused');
      });
      expect(hasFocusedClass).toBe(true);

      // 测试其他基础样式
      const padding = await inputFieldElement.evaluate((el) => {
        return window.getComputedStyle(el).padding;
      });
      expect(padding).toBeTruthy();

      const borderRadius = await inputFieldElement.evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });
      expect(borderRadius).toBeTruthy();

      const backgroundColor = await inputFieldElement.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(backgroundColor).toBeTruthy();

      const overflow = await inputFieldElement.evaluate((el) => {
        return window.getComputedStyle(el).overflow;
      });

      const transition = await inputFieldElement.evaluate((el) => {
        return window.getComputedStyle(el).transition;
      });
      expect(transition).toContain('box-shadow');

      console.log('MarkdownInputField styles test passed');
      console.log('Default boxShadow:', defaultBoxShadow.substring(0, 80));
      console.log('Hover boxShadow:', hoverBoxShadow.substring(0, 80));
      console.log('Focused boxShadow:', focusedBoxShadow.substring(0, 80));
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run styles e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField disabled styles should work correctly', async () => {
  const page = await browser.newPage();

  try {
    // 创建一个包含 disabled 状态的测试页面
    // 由于 demo 页面可能没有 disabled 状态，我们需要通过 JavaScript 来模拟
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      // 先等待页面加载完成
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // 先找到可编辑的输入框
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 15000 });

      // 直接查找 MarkdownInputField 容器
      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 15000 });

      // 通过 JavaScript 添加 disabled className
      await inputField.evaluate((el) => {
        el.classList.add('ant-agentic-md-input-field-disabled');
      });
      await page.waitForTimeout(200);

      // 验证 disabled className 已添加
      const hasDisabledClass = await inputField.evaluate((el) => {
        return el.classList.toString().includes('disabled');
      });
      expect(hasDisabledClass).toBe(true);

      // 测试 disabled 状态的样式
      const opacity = await inputField.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      expect(parseFloat(opacity)).toBe(0.5);

      const cursor = await inputField.evaluate((el) => {
        return window.getComputedStyle(el).cursor;
      });
      expect(cursor).toBe('not-allowed');

      const backgroundColor = await inputField.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(backgroundColor).toBeTruthy();

      console.log('MarkdownInputField disabled styles test passed');
      console.log('Disabled opacity:', opacity);
      console.log('Disabled cursor:', cursor);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run disabled styles e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField loading styles should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 10000,
        waitUntil: 'networkidle',
      },
    );

    if (response?.ok()) {
      // 先等待页面加载完成
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 先找到可编辑的输入框
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 15000 });

      // 直接查找 MarkdownInputField 容器
      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 15000 });

      // 通过 JavaScript 添加 loading className
      await inputField.evaluate((el) => {
        el.classList.add('ant-agentic-md-input-field-loading');
      });
      await page.waitForTimeout(200);

      // 验证 loading className 已添加
      const hasLoadingClass = await inputField.evaluate((el) => {
        return el.classList.toString().includes('loading');
      });
      expect(hasLoadingClass).toBe(true);

      // 测试 loading 状态的 cursor
      const cursor = await inputField.evaluate((el) => {
        return window.getComputedStyle(el).cursor;
      });
      expect(cursor).toBe('not-allowed');

      console.log('MarkdownInputField loading styles test passed');
      console.log('Loading cursor:', cursor);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run loading styles e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});
