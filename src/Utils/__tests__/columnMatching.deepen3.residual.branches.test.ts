/**
 * columnMatching deepen3：override 空串 alias 跳过。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveDocCardsFields } from '../columnMatching';

describe('columnMatching deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('override 空 title 时仍可按别名命中', () => {
    const r = resolveDocCardsFields(['标题', '描述'], {
      title: '',
    } as any);
    expect(r?.title).toBeTruthy();
  });
});
