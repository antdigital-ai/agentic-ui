/**
 * normalizeTaskContent deepen2：props.children 对象抽取；空数组回退。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hasNormalizedTaskContent,
  normalizeTaskContent,
} from '../normalizeTaskContent';

describe('normalizeTaskContent deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('伪 React 描述对象走 props.children 抽取', () => {
    const fake = {
      props: { children: 'from-props' },
    };
    expect(normalizeTaskContent(fake)).toBe('from-props');
    expect(hasNormalizedTaskContent(fake)).toBe(true);
  });

  it('空数组回退到数字 title', () => {
    expect(normalizeTaskContent([], 42)).toBe('42');
    expect(hasNormalizedTaskContent([], 42)).toBe(true);
  });
});
