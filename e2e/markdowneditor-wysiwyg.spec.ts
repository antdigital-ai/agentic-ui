import { PLAYWRIGHT_FIXTURE_DEMOS } from '../_test_helpers/constants/playwrightDemoRoutes';
import { expect, test } from '../_test_helpers/fixtures/page-fixture';

/**
 * WYSIWYG 即时转换（#59）
 *
 * 默认配置（不传 matchInputToNode）下的转换矩阵：
 * - 正文段落（非首段）`# ` → 即时转标题
 * - 正文段落 `- ` → 即时转列表
 * - 首段 `- ` → 保持纯文本（聊天输入框保护）
 */
test.describe('MarkdownEditor WYSIWYG 即时转换（默认配置）', () => {
  test.beforeEach(async ({ markdownEditorPage }) => {
    await markdownEditorPage.goto(
      PLAYWRIGHT_FIXTURE_DEMOS.markdownEditorDefault,
    );
  });

  test('正文段落输入 "# " 应即时转为标题', async ({ markdownEditorPage }) => {
    // 先建首段占位，使后续输入位于正文段落
    await markdownEditorPage.typeText('Intro');
    await markdownEditorPage.pressKey('Enter');

    await markdownEditorPage.typeTextWithInputRuleDelay('#');
    await markdownEditorPage.pressKey('Space');
    await markdownEditorPage.typeText('Heading Body');

    // Slate 标题节点渲染为 h1~h5
    const headingText = await markdownEditorPage.editableInput.evaluate(
      (el) => {
        const heading = el.querySelector('h1, h2, h3, h4, h5');
        return heading?.textContent ?? '';
      },
    );
    expect(headingText).toContain('Heading Body');
  });

  test('正文段落输入 "- " 应即时转为列表', async ({ markdownEditorPage }) => {
    await markdownEditorPage.typeText('Intro');
    await markdownEditorPage.pressKey('Enter');

    await markdownEditorPage.typeTextWithInputRuleDelay('-');
    await markdownEditorPage.pressKey('Space');
    await markdownEditorPage.typeText('List Item');

    const listCount = await markdownEditorPage.editableInput.evaluate(
      (el) => el.querySelectorAll('ul, ol').length,
    );
    expect(listCount).toBeGreaterThanOrEqual(1);
  });

  test('首段输入 "- " 应保持纯文本（聊天输入框保护）', async ({
    markdownEditorPage,
  }) => {
    await markdownEditorPage.typeTextWithInputRuleDelay('-');
    await markdownEditorPage.pressKey('Space');
    await markdownEditorPage.typeText('Plain Text');

    // 不转列表：文档无 ul/ol，文本保留 "- " 字面
    const listCount = await markdownEditorPage.editableInput.evaluate(
      (el) => el.querySelectorAll('ul, ol').length,
    );
    expect(listCount).toBe(0);
    await markdownEditorPage.expectContainsText('-');
  });
});
