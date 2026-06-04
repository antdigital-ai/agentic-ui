import type { Page } from '@playwright/test';

import { E2E_NAVIGATION_TIMEOUT_MS } from './e2eTimeouts';

/**
 * 打开 Dumi ~demos 页。避免 networkidle（preview 站点长连接会导致挂起/超时）。
 */
export async function gotoDumiDemo(page: Page, demoPath: string): Promise<void> {
  await page.goto(`/~demos/${demoPath}`, {
    waitUntil: 'domcontentloaded',
    timeout: E2E_NAVIGATION_TIMEOUT_MS,
  });

  await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => undefined);

  const demoShell = page
    .locator(
      'iframe, [data-testid="markdown-input-field"], .ant-agentic-md-editor-content[contenteditable="true"]',
    )
    .first();

  await demoShell.waitFor({ state: 'attached', timeout: 30_000 }).catch(() => undefined);
}
