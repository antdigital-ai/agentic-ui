/**
 * mapOllamaMessages deepen：preserve=false 仍走 mapMessage 时跳过 raw 注入。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mapOllamaMessagesToMessageBubbleData } from '../mapOllamaMessages';

describe('mapOllamaMessages deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('关闭 preserve 且提供 mapMessage 时不写 ollama.raw', () => {
    const mapped = mapOllamaMessagesToMessageBubbleData(
      [{ role: 'user', content: 'hi' }],
      { preserveOllamaRawInExtra: false },
      (msg, _i, draft) => ({ ...draft, content: `x:${String(msg.content)}` }),
    );
    expect(mapped[0].content).toContain('x:');
    expect((mapped[0].extra as any)?.ollama).toBeUndefined();
  });
});
