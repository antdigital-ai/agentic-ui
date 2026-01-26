import { expect, test } from '../tests/fixtures/page-fixture';

test.describe('MarkdownEditor 输入规则测试', () => {
  test.beforeEach(async ({ markdownEditorPage }) => {
    await markdownEditorPage.goto('markdowneditor-demo-1');
  });

  test('应该通过空格触发代码块 (``` + Space)', async ({ markdownEditorPage }) => {
    // 输入 ``` 后按空格
    await markdownEditorPage.typeText('```');
    await markdownEditorPage.pressKey('Space');

    // 验证是否转换为代码块
    const codeBlockCount = await markdownEditorPage.editableInput.evaluate((el) => {
      return el.querySelectorAll('div[data-be="code"]').length;
    });
    expect(codeBlockCount).toBe(1);
  });

  test('应该通过空格触发指定语言代码块 (```javascript + Space)', async ({ markdownEditorPage }) => {
    // 输入 ```javascript 后按空格
    await markdownEditorPage.typeText('```javascript');
    await markdownEditorPage.pressKey('Space');

    // 验证是否转换为代码块
    const codeBlockCount = await markdownEditorPage.editableInput.evaluate((el) => {
      return el.querySelectorAll('div[data-be="code"]').length;
    });
    expect(codeBlockCount).toBe(1);

    // 验证语言是否正确 (假设 Code 组件会将语言显示在某处或者作为属性)
    // 这里仅验证结构转换
  });

  test('应该通过空格触发分割线 (--- + Space)', async ({ markdownEditorPage }) => {
    // 输入 --- 后按空格
    await markdownEditorPage.typeText('---');
    await markdownEditorPage.pressKey('Space');

    // 验证是否转换为分割线
    const hrCount = await markdownEditorPage.editableInput.evaluate((el) => {
      return el.querySelectorAll('div[data-be="hr"]').length;
    });
    expect(hrCount).toBe(1);
  });

  test('应该保留 Enter 触发代码块 (``` + Enter)', async ({ markdownEditorPage }) => {
    // 输入 ``` 后按 Enter
    await markdownEditorPage.typeText('```');
    await markdownEditorPage.pressKey('Enter');

    // 验证是否转换为代码块
    const codeBlockCount = await markdownEditorPage.editableInput.evaluate((el) => {
      return el.querySelectorAll('div[data-be="code"]').length;
    });
    expect(codeBlockCount).toBe(1);
  });

  test('应该保留 Enter 触发分割线 (--- + Enter)', async ({ markdownEditorPage }) => {
    // 输入 --- 后按 Enter
    await markdownEditorPage.typeText('---');
    await markdownEditorPage.pressKey('Enter');

    // 验证是否转换为分割线
    const hrCount = await markdownEditorPage.editableInput.evaluate((el) => {
      return el.querySelectorAll('div[data-be="hr"]').length;
    });
    expect(hrCount).toBe(1);
  });

  test('当 matchInputToNode 开启且无匹配时，不应阻止 Enter/Tab', async ({ markdownEditorPage }) => {
    // 确保 matchInputToNode 默认可能是开启的，或者我们需要在测试中开启它
    // 在 demo 页面中通常默认配置比较全。
    // 我们测试一个不匹配的情况，例如普通文本

    await markdownEditorPage.typeText('Normal text');
    await markdownEditorPage.pressKey('Enter');

    // 验证是否产生了新行 (段落数增加)
    const paragraphCount = await markdownEditorPage.editableInput.evaluate((el) => {
      return el.querySelectorAll('div[data-be="paragraph"]').length;
    });
    // 初始1个段落，输入Enter后应该有2个
    expect(paragraphCount).toBeGreaterThanOrEqual(2);

    // 测试 Tab (在列表外 Tab 可能不缩进，但在编辑器中通常有行为)
    // 这里主要验证没有 crash 或者被拦截导致无反应 (虽然 e2e 很难测"无反应", 但可以测预期反应)
  });
});
