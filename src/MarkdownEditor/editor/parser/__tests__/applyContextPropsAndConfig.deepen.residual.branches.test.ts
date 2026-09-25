/**
 * applyContextPropsAndConfig deepen：align + type=head 命中 `|| head` 臂。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyContextPropsAndConfig } from '../parse/applyContextPropsAndConfig';

describe('applyContextPropsAndConfig deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('数组元素 type=head 且 config.align 写入 align', () => {
    const out = applyContextPropsAndConfig(
      [{ type: 'head', children: [{ text: 'H' }] }],
      {},
      { align: 'center' },
    ) as any[];
    expect(out[0].align).toBe('center');
    expect(out[0].otherProps).toEqual({ align: 'center' });
  });
});
