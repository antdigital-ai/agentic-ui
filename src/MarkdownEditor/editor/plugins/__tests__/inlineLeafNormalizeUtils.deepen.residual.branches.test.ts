/**
 * inlineLeafNormalizeUtils deepen：leaf.text 缺省走 `?? ''`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hasOrphanMarkDecoration,
  hasOrphanTagDecoration,
} from '../../plugins/inlineLeafNormalizeUtils';

describe('inlineLeafNormalizeUtils deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('mark 叶无 text 字段视为 orphan', () => {
    expect(hasOrphanMarkDecoration({ mark: true } as any)).toBe(true);
  });

  it('tag+code 叶无 text 字段视为 orphan', () => {
    expect(
      hasOrphanTagDecoration({ tag: true, code: true } as any),
    ).toBe(true);
  });
});
