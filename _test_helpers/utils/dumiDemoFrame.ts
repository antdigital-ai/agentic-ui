import type { Frame, Page } from '@playwright/test';

const SLATE_EDITABLE_SELECTOR = '.ant-agentic-md-editor-content';
const MARKDOWN_INPUT_ROOT = '[data-testid="markdown-input-field"]';

async function scoreDemoFrame(frame: Frame): Promise<number> {
  const slateRoots = await frame
    .locator(SLATE_EDITABLE_SELECTOR)
    .count()
    .catch(() => 0);
  if (slateRoots > 0) {
    return 1_000_000 + slateRoots;
  }
  const inputRoots = await frame
    .locator(MARKDOWN_INPUT_ROOT)
    .count()
    .catch(() => 0);
  if (inputRoots > 0) {
    return 500_000 + inputRoots;
  }
  return await frame
    .locator('[contenteditable="true"]')
    .count()
    .catch(() => 0);
}

/**
 * Dumi `~demos/*` 常有多个 iframe。不能只看 `contenteditable` 数量（工具栏等也会带），
 * 应优先命中 Slate 主编辑区 `.ant-agentic-md-editor-content`。
 */
export async function getDumiDemoContentRoot(page: Page): Promise<Page | Frame> {
  const mainSlate = await page
    .locator(SLATE_EDITABLE_SELECTOR)
    .count()
    .catch(() => 0);
  if (mainSlate > 0) {
    return page;
  }

  const mainInput = await page
    .locator(MARKDOWN_INPUT_ROOT)
    .count()
    .catch(() => 0);
  if (mainInput > 0) {
    return page;
  }

  const mainEditable = await page
    .locator('[contenteditable="true"]')
    .count()
    .catch(() => 0);
  if (mainEditable > 0) {
    return page;
  }

  await page.waitForFunction(
    () => {
      const iframes = document.querySelectorAll('iframe');
      for (let i = 0; i < iframes.length; i++) {
        try {
          const doc = (iframes[i] as HTMLIFrameElement).contentDocument;
          if (
            doc?.querySelector(SLATE_EDITABLE_SELECTOR) ||
            doc?.querySelector(MARKDOWN_INPUT_ROOT) ||
            doc?.querySelector('[contenteditable="true"]')
          ) {
            return true;
          }
        } catch {
          /* cross-origin */
        }
      }
      return false;
    },
    { timeout: 20_000 },
  );

  const n = await page.locator('iframe').count();
  let best: Frame | null = null;
  let bestScore = 0;

  for (let i = 0; i < n; i++) {
    const handle = await page.locator('iframe').nth(i).elementHandle();
    const frame = handle ? await handle.contentFrame() : null;
    if (!frame) {
      continue;
    }
    const score = await scoreDemoFrame(frame);
    if (score >= bestScore) {
      bestScore = score;
      best = frame;
    }
  }

  return best && bestScore > 0 ? best : page;
}
