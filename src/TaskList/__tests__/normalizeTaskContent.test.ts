import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  hasNormalizedTaskContent,
  normalizeTaskContent,
} from '../normalizeTaskContent';

describe('normalizeTaskContent', () => {
  it('保留非空字符串', () => {
    expect(normalizeTaskContent('hello')).toBe('hello');
  });

  it('从序列化 pre 元素提取 children 文本', () => {
    const serialized = {
      type: 'pre',
      props: {
        children: 'Validation failed for tool "web_search"',
      },
    };
    expect(normalizeTaskContent(serialized)).toBe(
      'Validation failed for tool "web_search"',
    );
  });

  it('正文为空时回退 title', () => {
    expect(normalizeTaskContent('', 'web_search · query')).toBe(
      'web_search · query',
    );
    expect(normalizeTaskContent(null, 'web_fetch · url')).toBe(
      'web_fetch · url',
    );
    expect(normalizeTaskContent({}, 'exec · bash')).toBe('exec · bash');
    expect(normalizeTaskContent('', 0)).toBe('0');
  });

  it('空白字符串正文回退 title', () => {
    expect(normalizeTaskContent('   ', 'fallback title')).toBe(
      'fallback title',
    );
  });

  it('保留 falsy 但有效的正文值', () => {
    expect(normalizeTaskContent(0, 'fallback title')).toBe('0');
    expect(normalizeTaskContent(false, 'fallback title')).toBe('false');
    expect(hasNormalizedTaskContent(0)).toBe(true);
    expect(hasNormalizedTaskContent(false)).toBe(true);
  });

  it('数组 content join 为多行', () => {
    expect(normalizeTaskContent(['line1', 'line2'])).toBe('line1\nline2');
  });

  it('保留合法 React 元素', () => {
    const el = React.createElement('span', null, 'ok');
    expect(normalizeTaskContent(el)).toBe(el);
  });

  it('hasNormalizedTaskContent 在仅 title 回退时为 true', () => {
    expect(hasNormalizedTaskContent('', 'tool title')).toBe(true);
    expect(hasNormalizedTaskContent(null, undefined)).toBe(false);
  });
});
