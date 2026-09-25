/**
 * htmlUrlSafety deepen：text 子节点 value 缺省走 `?? ''`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { serializeHastElement } from '../htmlUrlSafety';

describe('htmlUrlSafety deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('text child 无 value 时序列化为空串', () => {
    const html = serializeHastElement({
      tagName: 'span',
      properties: {},
      children: [{ type: 'text' } as any],
    });
    expect(html).toBe('<span></span>');
  });
});
