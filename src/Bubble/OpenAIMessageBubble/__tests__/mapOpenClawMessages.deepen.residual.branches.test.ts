/**
 * mapOpenClawMessages deepen：preserve=false 时跳过 openclaw.raw 注入。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mapOpenClawMessagesToMessageBubbleData } from '../mapOpenClawMessages';

describe('mapOpenClawMessages deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('关闭 preserve 且开时间戳时不写 openclaw.raw', () => {
    const mapped = mapOpenClawMessagesToMessageBubbleData(
      [{ role: 'user', content: 'hi', timestamp: 123 }],
      { preserveOpenClawRawInExtra: false, useOpenClawTimestamps: true },
    );
    expect(mapped[0].createAt).toBe(123);
    expect((mapped[0].extra as any)?.openclaw).toBeUndefined();
  });
});
