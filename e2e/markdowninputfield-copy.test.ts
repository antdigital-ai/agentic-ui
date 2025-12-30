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

test('MarkdownInputField copy functionality should work correctly', async () => {
  const page = await browser.newPage();

  try {
    // 授予剪贴板权限
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);

    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 10000,
        waitUntil: 'networkidle',
      },
    );

    if (response?.ok()) {
      // 等待页面加载完成
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 等待 MarkdownInputField 容器出现
      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 15000 });

      // 找到可编辑的输入框
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 15000 });

      // 点击输入框以聚焦
      await input.click();
      await page.waitForTimeout(200);

      // 清空输入框并输入测试文本
      await input.fill('');
      const testText =
        '测试复制功能 # 标题\n\n这是一段**粗体**文本和*斜体*文本。';
      await input.fill(testText);
      await page.waitForTimeout(300);

      // 选中所有文本（Ctrl+A 或 Cmd+A）
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modifierKey}+a`);
      await page.waitForTimeout(200);

      // 复制选中的文本（Ctrl+C 或 Cmd+C）
      await page.keyboard.press(`${modifierKey}+c`);
      await page.waitForTimeout(300);

      // 验证剪贴板内容
      const clipboardText = await page.evaluate(async () => {
        try {
          const text = await navigator.clipboard.readText();
          return text;
        } catch (error) {
          console.error('Failed to read clipboard:', error);
          return null;
        }
      });

      // 验证复制的内容不为空
      expect(clipboardText).toBeTruthy();
      expect(clipboardText).toContain('测试复制功能');

      // 测试部分选中复制
      await input.click();
      await page.waitForTimeout(200);

      // 选中部分文本（通过键盘操作）
      // 先移动到开头
      await page.keyboard.press('Home');
      await page.waitForTimeout(100);

      // 扩展选择到"测试复制功能"
      await page.keyboard.down('Shift');
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('ArrowRight');
      }
      await page.keyboard.up('Shift');
      await page.waitForTimeout(200);

      // 复制选中的部分文本
      await page.keyboard.press(`${modifierKey}+c`);
      await page.waitForTimeout(300);

      // 验证部分复制的内容
      const partialClipboardText = await page.evaluate(async () => {
        try {
          const text = await navigator.clipboard.readText();
          return text;
        } catch (error) {
          console.error('Failed to read clipboard:', error);
          return null;
        }
      });

      expect(partialClipboardText).toBeTruthy();
      if (partialClipboardText) {
        expect(partialClipboardText.length).toBeLessThan(testText.length);
      }

      console.log('Copy functionality test passed');
      console.log('Full text copy:', clipboardText?.substring(0, 50));
      console.log('Partial text copy:', partialClipboardText);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run copy functionality e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});
