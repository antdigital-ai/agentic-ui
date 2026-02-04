import { expect, test } from '../tests/fixtures/page-fixture';

test.describe('ToolUseBar 组件', () => {
  test('应该正确渲染工具项', async ({ toolUseBarPage }) => {
    await toolUseBarPage.goto();
    await toolUseBarPage.expectHasTools();
    const toolCount = await toolUseBarPage.getToolItems().count();
    expect(toolCount).toBeGreaterThan(0);
  });

  test('应该正确显示工具状态', async ({ toolUseBarPage }) => {
    await toolUseBarPage.goto();
    const toolItems = toolUseBarPage.getToolItems();
    const toolCount = await toolItems.count();
    expect(toolCount).toBeGreaterThan(0);

    // 验证至少存在一种状态（success, loading, error, idle）
    let hasStatus = false;
    for (let i = 0; i < toolCount; i++) {
      const toolItem = toolUseBarPage.getToolItem(i);
      const className = await toolItem.getAttribute('class');
      if (
        className?.includes('success') ||
        className?.includes('loading') ||
        className?.includes('error') ||
        className?.includes('idle')
      ) {
        hasStatus = true;
        break;
      }
    }
    expect(hasStatus).toBe(true);
  });

  test('应该能够激活和取消激活工具项', async ({ toolUseBarPage }) => {
    await toolUseBarPage.goto('toolusebar-demo-tool-use-bar-active-keys');
    const firstTool = toolUseBarPage.getFirstToolItem();
    await firstTool.click();
    await expect(firstTool).toHaveClass(/active/);
    await firstTool.click();
    const className = await firstTool.getAttribute('class');
    expect(className).not.toContain('active');
  });

  test('应该能够点击工具项', async ({ toolUseBarPage }) => {
    await toolUseBarPage.goto();
    const firstTool = toolUseBarPage.getFirstToolItem();
    await firstTool.click();
    const toolText = await toolUseBarPage.getToolItemText(0);
    expect(toolText).toBeTruthy();
    expect(toolText.length).toBeGreaterThan(0);
  });

  test('应该能够展开工具项查看错误信息', async ({ toolUseBarPage }) => {
    await toolUseBarPage.goto();
    const toolItems = toolUseBarPage.getToolItems();
    const toolCount = await toolItems.count();

    // 查找错误状态的工具项
    for (let i = 0; i < toolCount; i++) {
      const toolItem = toolUseBarPage.getToolItem(i);
      const className = await toolItem.getAttribute('class');
      if (className?.includes('error')) {
        await toolUseBarPage.expandToolItem(i);
        const toolText = await toolUseBarPage.getToolItemText(i);
        expect(toolText).toBeTruthy();
        expect(toolText.length).toBeGreaterThan(0);
        break;
      }
    }
  });
});
