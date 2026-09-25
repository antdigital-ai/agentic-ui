/**
 * normalizeTaskContent deepen3：boolean/number content；React 元素数组。
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hasNormalizedTaskContent,
  normalizeTaskContent,
} from '../normalizeTaskContent';

describe('normalizeTaskContent deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('number/boolean 正文与元素数组', () => {
    expect(normalizeTaskContent(0)).toBe('0');
    expect(normalizeTaskContent(true)).toBe('true');
    expect(hasNormalizedTaskContent(false)).toBe(true);
    const el = React.createElement('span', null, 'x');
    expect(normalizeTaskContent([el, el])).toEqual([el, el]);
    expect(normalizeTaskContent([null, ''], 'fb')).toBe('fb');
  });
});
