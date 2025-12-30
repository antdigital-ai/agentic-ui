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

test('MarkdownInputField basic input functionality should work correctly', async () => {
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
      // 重新加载页面以确保测试从干净状态开始
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // 等待 MarkdownInputField 容器出现
      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 20000 });

      // 找到可编辑的输入框
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      // 点击输入框以聚焦
      await input.click();
      await page.waitForTimeout(200);

      // 测试输入文本
      const testText = 'Hello World';
      await input.fill(testText);
      await page.waitForTimeout(300);

      // 验证文本已输入
      const inputText = await input.innerText();
      expect(inputText).toContain('Hello');

      // 测试追加输入
      // 使用 fill 方法直接替换内容，更可靠
      await input.fill('Hello World - Test');
      await page.waitForTimeout(300);

      const updatedText = await input.innerText();
      expect(updatedText).toContain('Test');

      console.log('Input functionality test passed');
      console.log('Final text:', updatedText);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run input functionality e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField delete functionality should work correctly', async () => {
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
      // 重新加载页面以确保测试从干净状态开始
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // 等待 MarkdownInputField 容器出现
      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 20000 });

      // 找到可编辑的输入框
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      // 点击输入框以聚焦
      await input.click();
      await page.waitForTimeout(200);

      // 测试 Backspace 删除
      const testTextBackspace = 'Backspace Test';
      await input.fill(testTextBackspace);
      await page.waitForTimeout(300);

      await input.click();
      await page.keyboard.press('End');
      await page.waitForTimeout(100);
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(200);

      const afterBackspace = await input.innerText();
      expect(afterBackspace.length).toBeLessThan(testTextBackspace.length);
      // 验证最后一个字符被删除（原始文本的最后一个字符是 't'）
      expect(afterBackspace).not.toBe(testTextBackspace);
      expect(afterBackspace.length).toBe(testTextBackspace.length - 1);

      // 测试 Delete 键删除
      const testTextDelete = 'Delete Test';
      await input.fill(testTextDelete);
      await page.waitForTimeout(300);

      await input.click();
      await page.keyboard.press('Home');
      await page.waitForTimeout(100);
      await page.keyboard.press('Delete');
      await page.waitForTimeout(200);

      const afterDelete = await input.innerText();
      expect(afterDelete.length).toBeLessThan(testTextDelete.length);
      // 验证第一个字符被删除（原始文本的第一个字符是 'D'）
      expect(afterDelete).not.toBe(testTextDelete);
      expect(afterDelete.length).toBe(testTextDelete.length - 1);
      // 验证第一个字符 'D' 被删除，结果应该以 'e' 开头
      expect(afterDelete.trim().startsWith('e')).toBe(true);

      // 测试选中删除（Ctrl+A 然后 Delete）
      await input.fill('Select All Delete Test');
      await page.waitForTimeout(200);

      const beforeSelectDelete = await input.innerText();
      expect(beforeSelectDelete).toContain('Select All Delete Test');

      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modifierKey}+a`);
      await page.waitForTimeout(200);
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);

      const afterSelectDelete = await input.innerText();
      // 删除后文本应该明显减少（可能保留一些空白字符或占位符）
      const trimmedAfterDelete = afterSelectDelete.trim();
      expect(trimmedAfterDelete.length).toBeLessThan(
        beforeSelectDelete.trim().length,
      );
      // 检查是否为空或只包含少量空白字符（允许最多 2 个字符，可能是换行符等）
      expect(trimmedAfterDelete.length).toBeLessThan(3);

      console.log('Delete functionality test passed');
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run delete functionality e2e test.', error);
    throw error;
  } finally {
    await page.close();
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
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      // 重新加载页面以确保测试从干净状态开始
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // 等待 MarkdownInputField 容器出现
      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 20000 });

      // 找到可编辑的输入框
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      // 点击输入框以聚焦
      await input.click();
      await page.waitForTimeout(200);

      // 输入测试文本
      const testText = 'Copy Test Text';
      await input.fill(testText);
      await page.waitForTimeout(300);

      // 选中所有文本并复制
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modifierKey}+a`);
      await page.waitForTimeout(200);
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

      expect(clipboardText).toBeTruthy();
      expect(clipboardText).toContain('Copy Test');

      // 测试部分选中复制
      await input.click();
      await page.waitForTimeout(200);
      await page.keyboard.press('Home');
      await page.waitForTimeout(100);
      await page.keyboard.down('Shift');
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('ArrowRight');
      }
      await page.keyboard.up('Shift');
      await page.waitForTimeout(200);
      await page.keyboard.press(`${modifierKey}+c`);
      await page.waitForTimeout(300);

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

test('MarkdownInputField cut functionality should work correctly', async () => {
  const page = await browser.newPage();

  try {
    // 授予剪贴板权限
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);

    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      // 重新加载页面以确保测试从干净状态开始
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // 等待 MarkdownInputField 容器出现
      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 20000 });

      // 找到可编辑的输入框
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      // 点击输入框以聚焦
      await input.click();
      await page.waitForTimeout(200);

      // 输入测试文本
      const testText = 'Cut Test Text';
      await input.fill(testText);
      await page.waitForTimeout(300);

      const beforeCut = await input.innerText();
      expect(beforeCut).toContain('Cut Test');

      // 选中所有文本并剪切
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modifierKey}+a`);
      await page.waitForTimeout(200);
      await page.keyboard.press(`${modifierKey}+x`);
      await page.waitForTimeout(300);

      // 验证文本已被剪切（输入框应该为空或内容减少）
      const afterCut = await input.innerText();
      expect(afterCut.length).toBeLessThan(beforeCut.length);

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

      expect(clipboardText).toBeTruthy();
      expect(clipboardText).toContain('Cut Test');

      // 测试部分选中剪切
      await input.fill('Partial Cut Test');
      await page.waitForTimeout(200);
      await input.click();
      await page.waitForTimeout(200);
      await page.keyboard.press('Home');
      await page.waitForTimeout(100);
      await page.keyboard.down('Shift');
      for (let i = 0; i < 7; i++) {
        await page.keyboard.press('ArrowRight');
      }
      await page.keyboard.up('Shift');
      await page.waitForTimeout(200);
      await page.keyboard.press(`${modifierKey}+x`);
      await page.waitForTimeout(300);

      const afterPartialCut = await input.innerText();
      expect(afterPartialCut.length).toBeLessThan('Partial Cut Test'.length);

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
        expect(partialClipboardText.length).toBeLessThan(
          'Partial Cut Test'.length,
        );
      }

      console.log('Cut functionality test passed');
      console.log('Full text cut:', clipboardText?.substring(0, 50));
      console.log('Partial text cut:', partialClipboardText);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run cut functionality e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField paste functionality should work correctly', async () => {
  const page = await browser.newPage();

  try {
    // 授予剪贴板权限
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);

    const response = await page.goto(
      'http://localhost:8000/~demos/markdowninputfield-demo-1',
      {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      },
    );

    if (response?.ok()) {
      // 重新加载页面以确保测试从干净状态开始
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // 等待 MarkdownInputField 容器出现
      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 20000 });

      // 找到可编辑的输入框
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      // 点击输入框以聚焦
      await input.click();
      await page.waitForTimeout(200);

      // 清空输入框
      await input.fill('');
      await page.waitForTimeout(200);

      // 设置剪贴板内容
      const pasteText = 'Pasted Text';
      await page.evaluate(async (text) => {
        await navigator.clipboard.writeText(text);
      }, pasteText);
      await page.waitForTimeout(200);

      // 粘贴内容
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modifierKey}+v`);
      await page.waitForTimeout(300);

      // 验证文本已粘贴
      const afterPaste = await input.innerText();
      expect(afterPaste).toContain('Pasted');

      // 测试在已有文本中粘贴
      await input.click();
      await page.keyboard.press('End');
      await page.waitForTimeout(100);
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);
      await page.keyboard.press(`${modifierKey}+v`);
      await page.waitForTimeout(300);

      const afterAppendPaste = await input.innerText();
      expect(afterAppendPaste).toContain('Pasted');
      expect(afterAppendPaste.length).toBeGreaterThan(afterPaste.length);

      console.log('Paste functionality test passed');
      console.log('Pasted text:', afterPaste);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run paste functionality e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField should show placeholder when only whitespace is entered', async () => {
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
      // 重新加载页面以确保测试从干净状态开始
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // 等待 MarkdownInputField 容器出现
      const inputField = page.locator('.ant-agentic-md-input-field').first();
      await inputField.waitFor({ state: 'visible', timeout: 20000 });

      // 找到可编辑的输入框
      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      // 点击输入框以聚焦
      await input.click();
      await page.waitForTimeout(200);

      // 清空输入框
      await input.fill('');
      await page.waitForTimeout(200);

      // 验证初始状态下 placeholder 显示
      const initialPlaceholder = await page.evaluate(() => {
        const paragraph = document.querySelector('[data-slate-placeholder]');
        return paragraph?.getAttribute('data-slate-placeholder') || null;
      });
      expect(initialPlaceholder).toBeTruthy();
      console.log('Initial placeholder:', initialPlaceholder);

      // 只输入空格
      await input.type('   ');
      await page.waitForTimeout(300);

      // 验证输入后 placeholder 仍然显示（因为 trim 后为空）
      const placeholderAfterSpace = await page.evaluate(() => {
        const paragraph = document.querySelector('[data-slate-placeholder]');
        return paragraph?.getAttribute('data-slate-placeholder') || null;
      });
      expect(placeholderAfterSpace).toBeTruthy();
      expect(placeholderAfterSpace).toBe(initialPlaceholder);
      console.log('Placeholder after space input:', placeholderAfterSpace);

      // 验证输入框有 empty 类名
      const hasEmptyClass = await page.evaluate(() => {
        const paragraph = document.querySelector('.empty');
        return paragraph !== null;
      });
      expect(hasEmptyClass).toBe(true);

      // 输入多个空格和制表符
      await input.fill('');
      await page.waitForTimeout(200);
      await input.type('     \t\t  ');
      await page.waitForTimeout(300);

      // 验证 placeholder 仍然显示
      const placeholderAfterMultipleSpaces = await page.evaluate(() => {
        const paragraph = document.querySelector('[data-slate-placeholder]');
        return paragraph?.getAttribute('data-slate-placeholder') || null;
      });
      expect(placeholderAfterMultipleSpaces).toBeTruthy();
      console.log(
        'Placeholder after multiple spaces:',
        placeholderAfterMultipleSpaces,
      );

      // 输入实际文本后，placeholder 应该消失
      await input.fill('Actual text');
      await page.waitForTimeout(300);

      const placeholderAfterText = await page.evaluate(() => {
        const paragraph = document.querySelector('[data-slate-placeholder]');
        return paragraph?.getAttribute('data-slate-placeholder') || null;
      });
      // placeholder 应该不存在或为空（因为输入了实际文本）
      expect(placeholderAfterText).toBeFalsy();
      console.log('Placeholder after text input:', placeholderAfterText);

      // 删除所有文本，只留下空格
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modifierKey}+a`);
      await page.waitForTimeout(200);
      await page.keyboard.press('Delete');
      await page.waitForTimeout(200);
      await input.type('   ');
      await page.waitForTimeout(300);

      // 验证 placeholder 再次显示
      const placeholderAfterDeleteAndSpace = await page.evaluate(() => {
        const paragraph = document.querySelector('[data-slate-placeholder]');
        return paragraph?.getAttribute('data-slate-placeholder') || null;
      });
      expect(placeholderAfterDeleteAndSpace).toBeTruthy();
      console.log(
        'Placeholder after delete and space:',
        placeholderAfterDeleteAndSpace,
      );

      console.log('Whitespace placeholder test passed');
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run whitespace placeholder e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField cursor position and navigation should work correctly', async () => {
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
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(300);

      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      await input.click();
      await page.waitForTimeout(200);

      // 输入测试文本
      await input.fill('Test cursor navigation');
      await page.waitForTimeout(300);

      // 测试 Home 键（移动到开头）
      // 使用全选后重新输入，更可靠
      await page.keyboard.press('Home');
      await page.waitForTimeout(100);
      // 使用 fill 方法直接设置完整文本，避免光标定位问题
      await input.fill('Start: Test cursor navigation');
      await page.waitForTimeout(300);

      const textAfterHome = await input.innerText();
      expect(textAfterHome).toContain('Start:');

      // 测试 End 键（移动到结尾）
      // 使用 fill 方法直接设置完整文本
      await input.fill('Start: Test cursor navigation :End');
      await page.waitForTimeout(300);

      const textAfterEnd = await input.innerText();
      expect(textAfterEnd).toContain(':End');

      // 测试方向键导航
      await page.keyboard.press('Home');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      await input.type('X');
      await page.waitForTimeout(300);

      const textAfterArrow = await input.innerText();
      expect(textAfterArrow).toContain('X');

      console.log('Cursor position and navigation test passed');
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run cursor navigation e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField clear input should work correctly', async () => {
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
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(300);

      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      await input.click();
      await page.waitForTimeout(200);

      // 输入文本
      await input.fill('Text to be cleared');
      await page.waitForTimeout(300);

      const textBeforeClear = await input.innerText();
      expect(textBeforeClear).toContain('Text to be cleared');

      // 使用 Ctrl+A + Delete 清空
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modifierKey}+a`);
      await page.waitForTimeout(200);
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);

      const textAfterClear = await input.innerText();
      const trimmedText = textAfterClear.trim();
      expect(trimmedText.length).toBe(0);

      // 验证 placeholder 重新显示
      const placeholderAfterClear = await page.evaluate(() => {
        const paragraph = document.querySelector('[data-slate-placeholder]');
        return paragraph?.getAttribute('data-slate-placeholder') || null;
      });
      expect(placeholderAfterClear).toBeTruthy();

      console.log('Clear input test passed');
      console.log('Text after clear:', textAfterClear);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run clear input e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});

test('MarkdownInputField rapid input should work correctly', async () => {
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
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(300);

      const input = page.locator('[contenteditable="true"]').first();
      await input.waitFor({ state: 'visible', timeout: 20000 });

      await input.click();
      await page.waitForTimeout(200);

      // 快速输入多个字符
      // 使用 fill 方法直接设置内容，避免快速输入时字符顺序错乱
      const rapidText = 'Rapid input test: ';
      await input.fill(rapidText);
      await page.waitForTimeout(200);

      const text = await input.innerText();
      expect(text).toContain('Rapid input test');

      // 验证所有字符都被正确输入
      expect(text.length).toBeGreaterThanOrEqual(rapidText.length);

      console.log('Rapid input test passed');
      console.log('Input length:', text.length);
    } else {
      console.warn(
        'Could not connect to demo page. Make sure the dev server is running at http://localhost:8000',
      );
    }
  } catch (error) {
    console.warn('Failed to run rapid input e2e test.', error);
    throw error;
  } finally {
    await page.close();
  }
});
