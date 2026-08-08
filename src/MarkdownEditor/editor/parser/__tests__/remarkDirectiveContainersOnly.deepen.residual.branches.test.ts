/**
 * remarkDirectiveContainersOnly deepen：插件向 data 写入三类 extensions。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import remarkDirectiveContainersOnly from '../remarkDirectiveContainersOnly';

describe('remarkDirectiveContainersOnly deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('作为 remark 插件写入 micromark/from/to 扩展', () => {
    const dataStore: Record<string, unknown[]> = {};
    const fakeThis = {
      data: () => dataStore,
    };
    (remarkDirectiveContainersOnly as any).call(fakeThis);
    expect(dataStore.micromarkExtensions?.length).toBeGreaterThan(0);
    expect(dataStore.fromMarkdownExtensions?.length).toBeGreaterThan(0);
    expect(dataStore.toMarkdownExtensions?.length).toBeGreaterThan(0);
  });
});
