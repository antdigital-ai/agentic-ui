/**
 * normalizeTaskContent residual：number/boolean、空 content、hasNormalized。
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  hasNormalizedTaskContent,
  normalizeTaskContent,
} from '../normalizeTaskContent';

describe('normalizeTaskContent residual branches', () => {
  it('number / boolean content 转为字符串', () => {
    expect(normalizeTaskContent(0)).toBe('0');
    expect(normalizeTaskContent(false)).toBe('false');
    expect(normalizeTaskContent(true)).toBe('true');
  });

  it('空白字符串回退 title；title 空白回退空串', () => {
    expect(normalizeTaskContent('   ', 'Title')).toBe('Title');
    expect(normalizeTaskContent('', 0)).toBe('0');
    expect(normalizeTaskContent(null, undefined)).toBe('');
  });

  it('非 plain object / React 元素数组路径', () => {
    expect(normalizeTaskContent({ foo: 1 } as any, 'fb')).toBe('fb');
    const el = React.createElement('span', null, 'x');
    expect(hasNormalizedTaskContent(el)).toBe(true);
    expect(hasNormalizedTaskContent('')).toBe(false);
    expect(hasNormalizedTaskContent('', 'Hi')).toBe(true);
    expect(hasNormalizedTaskContent([1, 2])).toBe(true);
  });

  it('props.children 伪元素、空数组、空白 title、混合数组', () => {
    const fake = {
      props: { children: ['line-a', null, 'line-b'] },
    };
    expect(normalizeTaskContent(fake as any)).toBe('line-a\nline-b');
    expect(normalizeTaskContent([], '  ')).toBe('');
    expect(
      normalizeTaskContent([], React.createElement('b', null, 't')),
    ).toBeTruthy();
    expect(
      normalizeTaskContent(['', 3, React.createElement('i')], 'fb' as any),
    ).toContain('3');
    expect(normalizeTaskContent(['', '  '], 'fallback')).toBe('fallback');
  });

  it('hasNormalizedTaskContent：空数组无 fallback 为 false', () => {
    expect(hasNormalizedTaskContent([])).toBe(false);
    expect(hasNormalizedTaskContent([], '')).toBe(false);
    expect(hasNormalizedTaskContent(null, 'x')).toBe(true);
  });
});
