/**
 * columnMatching deepen2：columnKey 空串 → trim 后早退。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { columnKeyMatchesConfiguredField } from '../columnMatching';

describe('columnMatching deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('columnKey 空 / null：返回 false', () => {
    expect(columnKeyMatchesConfiguredField('', 'title')).toBe(false);
    expect(columnKeyMatchesConfiguredField(null as any, 'title')).toBe(false);
  });
});
