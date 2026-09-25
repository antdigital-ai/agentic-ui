/**
 * buildFileNodeRelativePathIndex deepen：nodes 空值走 `|| []`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildFileNodeRelativePathIndex } from '../buildFileNodeRelativePathIndex';

describe('buildFileNodeRelativePathIndex deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('null / undefined nodes 得到空索引', () => {
    expect(buildFileNodeRelativePathIndex(null).size).toBe(0);
    expect(buildFileNodeRelativePathIndex(undefined).size).toBe(0);
  });
});
