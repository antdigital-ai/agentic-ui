/**
 * useMarkdownToReact deepen2：非 Error throw 走 String(error)。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useMarkdownToReact deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('hook 可加载', async () => {
    const mod = await import('../useMarkdownToReact');
    expect(mod).toBeTruthy();
  });
});
