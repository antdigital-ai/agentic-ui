/**
 * normalizeTaskContent deepen：isContentEmpty number/boolean/元素/任意对象。
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hasNormalizedTaskContent,
  normalizeTaskContent,
} from '../normalizeTaskContent';

describe('normalizeTaskContent deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('hasNormalized：number/boolean content 视为有正文', () => {
    expect(hasNormalizedTaskContent(0)).toBe(true);
    expect(hasNormalizedTaskContent(false)).toBe(true);
    expect(hasNormalizedTaskContent(true)).toBe(true);
  });

  it('fallback 为任意对象时 isContentEmpty 走默认 true', () => {
    expect(hasNormalizedTaskContent('', { odd: 1 } as any)).toBe(false);
    expect(normalizeTaskContent(null, { odd: 1 } as any)).toEqual({ odd: 1 });
  });

  it('React 元素 content 非空；null/undefined 无 fallback 为空', () => {
    const el = React.createElement('span', null, 'x');
    expect(hasNormalizedTaskContent(el)).toBe(true);
    expect(hasNormalizedTaskContent(null)).toBe(false);
    expect(hasNormalizedTaskContent(undefined)).toBe(false);
  });
});
