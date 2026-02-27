import { expect, test } from '../tests/fixtures/page-fixture';

/**
 * 粘贴 HTML 时 handlePasteEvent 应只插入一次文本（避免与浏览器默认粘贴行为重复插入）
 */
test.describe('MarkdownEditor 粘贴 HTML 只插入一次', () => {
  const PASTED_UNIQUE_TEXT = 'E2E paste once unique';

  test.beforeEach(async ({ markdownEditorPage }) => {
    await markdownEditorPage.goto('markdowneditor-demo-1');
  });

  test('粘贴 HTML 时 handlePasteEvent 应只插入一次文本', async ({
    markdownEditorPage,
  }) => {
    await markdownEditorPage.expectVisible();
    const html = `<p>${PASTED_UNIQUE_TEXT}</p>`;

    await markdownEditorPage.pasteHtml(html, PASTED_UNIQUE_TEXT);

    await markdownEditorPage.expectContainsText(PASTED_UNIQUE_TEXT);

    const fullText = await markdownEditorPage.getText();
    const count = (fullText.match(new RegExp(PASTED_UNIQUE_TEXT, 'g')) ?? [])
      .length;
    expect(
      count,
      `粘贴 HTML 后文本 "${PASTED_UNIQUE_TEXT}" 应只出现 1 次，实际出现 ${count} 次`,
    ).toBe(1);
  });
});
