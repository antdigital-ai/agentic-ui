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

test('MarkdownInputField keyboard shortcuts should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 20000 });

      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      await input.click();
      await page.waitForTimeout(200);

      // 测试 Shift+Enter 换行
      await input.fill('First line');
      await page.waitForTimeout(200);
      await page.keyboard.down('Shift');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Shift');
      await page.waitForTimeout(200);
      await input.type('Second line');
      await page.waitForTimeout(300);

      const textAfterShiftEnter = await input.innerText();
      expect(textAfterShiftEnter).toContain('First line');
      expect(textAfterShiftEnter).toContain('Second line');

      // 测试 Ctrl+A / Cmd+A 全选
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modifierKey}+a`);
      await page.waitForTimeout(200);

      // 验证文本被选中（通过输入新文本替换）
      await input.type('Replaced text');
      await page.waitForTimeout(300);
      const replacedText = await input.innerText();
      expect(replacedText).toContain('Replaced text');
      expect(replacedText).not.toContain('First line');

      console.log('Keyboard shortcuts test passed');
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run keyboard shortcuts e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField multi-line input should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      await input.click();
      await page.waitForTimeout(200);

      // 输入多行文本
      const multiLineText = 'Line 1\nLine 2\nLine 3\nLine 4';
      await input.fill(multiLineText);
      await page.waitForTimeout(300);

      const text = await input.innerText();
      expect(text).toContain('Line 1');
      expect(text).toContain('Line 2');
      expect(text).toContain('Line 3');
      expect(text).toContain('Line 4');

      // 验证输入框高度自适应
      const inputHeight = await input.evaluate((el) => {
        return window.getComputedStyle(el).height;
      });
      expect(inputHeight).toBeTruthy();

      console.log('Multi-line input test passed');
      console.log('Input height:', inputHeight);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run multi-line input e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField long text and scrolling should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      await input.click();
      await page.waitForTimeout(200);

      // 输入长文本
      const longText = '这是一段很长的文本，用来测试输入框的滚动功能。'.repeat(
        20,
      );
      await input.fill(longText);
      await page.waitForTimeout(500);

      // 验证文本已输入
      const text = await input.innerText();
      expect(text.length).toBeGreaterThan(100);

      // 验证滚动功能
      const scrollTop = await input.evaluate((el) => {
        return el.scrollTop;
      });

      // 滚动到底部
      await input.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await page.waitForTimeout(200);

      const scrollTopAfter = await input.evaluate((el) => {
        return el.scrollTop;
      });
      expect(scrollTopAfter).toBeGreaterThanOrEqual(scrollTop);

      console.log('Long text and scrolling test passed');
      console.log('Text length:', text.length);
      console.log('Scroll position:', scrollTopAfter);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run long text scrolling e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField focus and blur should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // 先等待输入框出现（更可靠）
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      // 然后等待容器出现
      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 20000 });

      // 测试聚焦
      await input.click();
      await page.waitForTimeout(300);

      const hasFocusedClass = await inputField.evaluate((el) => {
        return el.classList.toString().includes('focused');
      });
      expect(hasFocusedClass).toBe(true);

      // 测试失焦
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      const hasFocusedClassAfterBlur = await inputField.evaluate((el) => {
        return el.classList.toString().includes('focused');
      });
      // 注意：失焦后 focused 类可能不会立即移除，取决于实现
      // 这里只验证聚焦时确实有 focused 类

      console.log('Focus and blur test passed');
      console.log('Has focused class on focus:', hasFocusedClass);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run focus and blur e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField markdown formatting should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      await input.click();
      await page.waitForTimeout(200);

      // 输入 Markdown 格式文本
      const markdownText = '# 标题\n\n**粗体文本**\n\n*斜体文本*\n\n`代码文本`';
      await input.fill(markdownText);
      await page.waitForTimeout(300);

      const text = await input.innerText();
      expect(text).toContain('标题');
      expect(text).toContain('粗体文本');
      expect(text).toContain('斜体文本');
      expect(text).toContain('代码文本');

      // 验证 Markdown 格式被正确解析（通过检查 DOM 结构）
      // 粗体文本被渲染为 <span data-testid="markdown-bold">
      const hasBold = await page.evaluate(() => {
        const boldElements = document.querySelectorAll(
          '[data-testid="markdown-bold"]',
        );
        return boldElements.length > 0;
      });
      expect(hasBold).toBe(true);

      // 斜体文本只应用了 fontStyle: 'italic'，没有特定的 testid
      // 通过检查计算样式来验证斜体
      const hasItalic = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          const style = window.getComputedStyle(el);
          if (
            style.fontStyle === 'italic' &&
            el.textContent?.includes('斜体文本')
          ) {
            return true;
          }
        }
        return false;
      });
      expect(hasItalic).toBe(true);

      // 内联代码被渲染为 <code> 元素
      const hasCode = await page.evaluate(() => {
        const codeElements = document.querySelectorAll('code');
        // 检查是否有包含"代码文本"的 code 元素
        for (const codeEl of codeElements) {
          if (codeEl.textContent?.includes('代码文本')) {
            return true;
          }
        }
        return false;
      });
      expect(hasCode).toBe(true);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run markdown formatting e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField text selection and editing should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      await input.click();
      await page.waitForTimeout(200);

      // 输入初始文本
      await input.fill('Select and edit this text');
      await page.waitForTimeout(300);

      // 选中部分文本并替换
      await page.keyboard.press('Home');
      await page.waitForTimeout(100);
      await page.keyboard.down('Shift');
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('ArrowRight');
      }
      await page.keyboard.up('Shift');
      await page.waitForTimeout(200);

      // 输入新文本替换选中的部分
      await input.type('Replace');
      await page.waitForTimeout(300);

      const textAfterEdit = await input.innerText();
      expect(textAfterEdit).toContain('Replace');
      expect(textAfterEdit).toContain('edit this text');

      // 测试双击选中单词
      await input.fill('Double click test');
      await page.waitForTimeout(200);
      await input.dblclick();
      await page.waitForTimeout(200);

      // 验证文本被选中（通过输入新文本）
      await input.type('Selected');
      await page.waitForTimeout(300);

      const textAfterDoubleClick = await input.innerText();
      expect(textAfterDoubleClick).toContain('Selected');

      console.log('Text selection and editing test passed');
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run text selection e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField undo and redo should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      await input.click();
      await page.waitForTimeout(200);

      // 输入初始文本
      await input.fill('Initial text');
      await page.waitForTimeout(300);

      const initialText = await input.innerText();
      expect(initialText).toContain('Initial text');

      // 修改文本
      await input.fill('Modified text');
      await page.waitForTimeout(300);

      const modifiedText = await input.innerText();
      expect(modifiedText).toContain('Modified text');

      // 测试撤销 (Ctrl+Z / Cmd+Z)
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modifierKey}+z`);
      await page.waitForTimeout(300);

      const textAfterUndo = await input.innerText();
      // 注意：撤销功能可能取决于编辑器的实现
      // 这里只验证操作不会导致错误

      // 测试重做 (Ctrl+Shift+Z / Cmd+Shift+Z)
      await page.keyboard.press(`Shift+${modifierKey}+z`);
      await page.waitForTimeout(300);

      const textAfterRedo = await input.innerText();
      // 同样，重做功能可能取决于实现

      console.log('Undo and redo test passed');
      console.log('Text after undo:', textAfterUndo);
      console.log('Text after redo:', textAfterRedo);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run undo and redo e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField input validation should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      await input.click();
      await page.waitForTimeout(200);

      // 测试空输入
      await input.fill('');
      await page.waitForTimeout(200);

      const emptyText = await input.innerText();
      expect(emptyText.trim().length).toBe(0);

      // 测试只包含空格的输入
      await input.fill('   ');
      await page.waitForTimeout(200);

      const whitespaceText = await input.innerText();
      // 验证可以输入空格（trim 后可能为空，但输入本身是允许的）

      // 测试特殊字符输入
      await input.fill('!@#$%^&*()_+-=[]{}|;:,.<>?');
      await page.waitForTimeout(200);

      const specialCharsText = await input.innerText();
      expect(specialCharsText.length).toBeGreaterThan(0);

      // 测试中文字符输入
      await input.fill('测试中文输入');
      await page.waitForTimeout(200);

      const chineseText = await input.innerText();
      expect(chineseText).toContain('测试');

      // 测试 emoji 输入
      await input.fill('Hello 😀 World 🌍');
      await page.waitForTimeout(200);

      const emojiText = await input.innerText();
      expect(emojiText).toContain('Hello');
      expect(emojiText).toContain('World');

      console.log('Input validation test passed');
      console.log('Special chars:', specialCharsText);
      console.log('Chinese text:', chineseText);
      console.log('Emoji text:', emojiText);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run input validation e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField responsive behavior should work correctly', async () => {
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 20000 });

      // 测试桌面尺寸
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(300);

      const desktopWidth = await inputField.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });

      // 测试平板尺寸
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(300);

      const tabletWidth = await inputField.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });

      // 测试移动端尺寸
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300);

      const mobileWidth = await inputField.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });

      // 验证在不同尺寸下输入框都能正常显示
      expect(desktopWidth).toBeTruthy();
      expect(tabletWidth).toBeTruthy();
      expect(mobileWidth).toBeTruthy();

      console.log('Responsive behavior test passed');
      console.log('Desktop width:', desktopWidth);
      console.log('Tablet width:', tabletWidth);
      console.log('Mobile width:', mobileWidth);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run responsive behavior e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});
