/**
 * columnMatching deepen：override 空别名走 `if (!alias) continue`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveDocCardsFields } from '../columnMatching';

describe('columnMatching deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('title override 为空串时跳过并回退别名表', () => {
    const resolved = resolveDocCardsFields(['标题', '链接'], {
      title: '',
    });
    expect(resolved?.title).toBe('标题');
  });
});
