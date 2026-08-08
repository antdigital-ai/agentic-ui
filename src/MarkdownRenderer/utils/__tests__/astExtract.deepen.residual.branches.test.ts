/**
 * astExtract deepen：百分比 Infinity 与 compact 无效倍率。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { coerceTableCellValue } from '../astExtract';

describe('astExtract deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('百分比解析为 Infinity 时不返回数字', () => {
    const out = coerceTableCellValue('1e999%', () => null);
    expect(out).toBe('1e999%');
  });

  it('compact 底数为 Infinity 时回退原串', () => {
    const out = coerceTableCellValue('1e999k', () => null);
    expect(out).toBe('1e999k');
  });
});
