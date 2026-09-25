import { expect, test } from '../_test_helpers/fixtures/page-fixture';

test.describe('SandboxRenderer 沙箱渲染（#330）', () => {
  test('应将 agent 生成的 DOM 代码渲染到 Shadow DOM 容器', async ({
    sandboxRendererPage,
  }) => {
    await sandboxRendererPage.goto();

    // 沙箱代码创建的标题真实渲染（穿透 Shadow DOM）
    await expect(sandboxRendererPage.renderedTitle()).toHaveText(
      'Sandbox Rendered',
    );
    await expect(sandboxRendererPage.renderedButton()).toHaveText('Click 0');
  });

  test('沙箱内事件交互应正常工作', async ({ sandboxRendererPage }) => {
    await sandboxRendererPage.goto();

    const button = sandboxRendererPage.renderedButton();
    await button.click();
    await expect(button).toHaveText('Click 1');
    await button.click();
    await expect(button).toHaveText('Click 2');
  });

  test('onExecute 应把沙箱返回值回传宿主', async ({ sandboxRendererPage }) => {
    await sandboxRendererPage.goto();

    // 沙箱 return 'rendered:{...}' → 宿主 <p> 展示作用域探测结果
    await expect(sandboxRendererPage.resultText()).toHaveText(
      /rendered:.*bodyBlocked.:true.*titleInScope.:true/,
    );
  });

  test('沙箱查询应限定在容器内，document.body 被拦截', async ({
    sandboxRendererPage,
  }) => {
    await sandboxRendererPage.goto();
    await expect(sandboxRendererPage.renderedTitle()).toBeVisible();

    const resultText = await sandboxRendererPage.resultText().textContent();
    const probe = JSON.parse(resultText.replace(/^rendered:/, '')) as {
      bodyBlocked: boolean;
      titleInScope: boolean;
    };

    // 作用域 document：body/head 属性被拦截，查询限定在容器内
    expect(probe.bodyBlocked).toBe(true);
    expect(probe.titleInScope).toBe(true);
  });
});
