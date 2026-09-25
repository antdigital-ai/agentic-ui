/**
 * bubblePropsAreEqual deepen：metaEqual 同引用 / 单侧 metadata 空。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bubblePropsAreEqual } from '../bubblePropsAreEqual';

const base = {
  id: '1',
  placement: 'left',
  pure: false,
  readonly: false,
  loading: false,
  originData: {
    id: '1',
    role: 'assistant',
    content: 'hi',
    meta: { title: 't' },
  },
} as any;

describe('bubblePropsAreEqual deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('相同 meta 引用命中 a===b', () => {
    const meta = { title: 't', metadata: { a: 1 } };
    const prev = {
      ...base,
      originData: { ...base.originData, meta },
    };
    const next = {
      ...base,
      originData: { ...base.originData, meta },
    };
    expect(bubblePropsAreEqual(prev, next)).toBe(true);
  });

  it('一侧 metadata 缺失时返回 false', () => {
    const prev = {
      ...base,
      originData: {
        ...base.originData,
        meta: { title: 't', metadata: { a: 1 } },
      },
    };
    const next = {
      ...base,
      originData: {
        ...base.originData,
        meta: { title: 't' },
      },
    };
    expect(bubblePropsAreEqual(prev, next)).toBe(false);
  });
});
