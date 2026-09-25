import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  hasNormalizedTaskContent,
  normalizeTaskContent,
} from '../normalizeTaskContent';

describe('normalizeTaskContent 分支覆盖', () => {
  it('数组全为 React 元素时原样返回', () => {
    const nodes = [
      React.createElement('span', { key: '1' }, 'a'),
      React.createElement('span', { key: '2' }, 'b'),
    ];
    expect(normalizeTaskContent(nodes)).toBe(nodes);
  });

  it('空数组回退 title；混合数组提取文本', () => {
    expect(normalizeTaskContent([], 'fallback')).toBe('fallback');
    expect(normalizeTaskContent(['', 'line'], 'x')).toBe('line');
  });

  it('React 元素 content 原样返回；嵌套 props.children 提取', () => {
    const el = React.createElement('div', null, 'inner');
    expect(normalizeTaskContent(el)).toBe(el);
    expect(
      normalizeTaskContent({
        type: 'div',
        props: { children: { type: 'span', props: { children: 'nested' } } },
      }),
    ).toBe('nested');
  });

  it('resolveFallbackTitle：空白串 / 元素 / 其它节点', () => {
    expect(normalizeTaskContent('', '   ')).toBe('');
    const titleEl = React.createElement('b', null, 'T');
    expect(normalizeTaskContent(null, titleEl)).toBe(titleEl);
    expect(normalizeTaskContent(undefined, true as any)).toBe(true);
  });

  it('数组内 React 元素在 extract 时被跳过', () => {
    const el = React.createElement('i', null, 'x');
    expect(normalizeTaskContent([el, 'keep'], 'fb')).toBe('keep');
  });

  it('hasNormalizedTaskContent 对空数组无 fallback 为 false', () => {
    expect(hasNormalizedTaskContent([])).toBe(false);
    expect(hasNormalizedTaskContent([1, 2])).toBe(true);
  });

  it('number/boolean content 与 fallback；空串 content 回退数字 title', () => {
    expect(normalizeTaskContent(42)).toBe('42');
    expect(normalizeTaskContent(true)).toBe('true');
    expect(normalizeTaskContent('   ', 9)).toBe('9');
    expect(hasNormalizedTaskContent(0)).toBe(true);
    expect(hasNormalizedTaskContent(false)).toBe(true);
    expect(hasNormalizedTaskContent('   ')).toBe(false);
    expect(hasNormalizedTaskContent(null, 'title')).toBe(true);
  });

  it('数组混合空串与数字；props 无 children 回退', () => {
    expect(normalizeTaskContent(['', 3, null], 'fb')).toBe('3');
    expect(normalizeTaskContent({ type: 'div', props: {} }, 'fb')).toBe('fb');
    expect(normalizeTaskContent({ type: 'div' }, 'fb')).toBe('fb');
  });
});
