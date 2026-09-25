/**
 * codeBlockPlainText residual：空节点、placeholder、value/children 长短比较。
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('slate', () => ({
  Node: {
    string: (n: any) => {
      if (n?.__throw) throw new Error('bad');
      if (!n?.children) return '';
      return n.children.map((c: any) => c.text ?? '').join('');
    },
  },
}));

import {
  getCodeBlockPlainText,
  getSlateElementPlainText,
} from '../codeBlockPlainText';

describe('codeBlockPlainText residual branches', () => {
  it('getSlateElementPlainText：null / 无 children / value 回退 / throw', () => {
    expect(getSlateElementPlainText(null)).toBe('');
    expect(getSlateElementPlainText({ value: 'v' })).toBe('v');
    expect(
      getSlateElementPlainText({ children: [{ text: 'hi' }], value: 'v' }),
    ).toBe('hi');
    expect(
      getSlateElementPlainText({
        children: [{ text: '' }],
        value: 'fallback',
      } as any),
    ).toBe('fallback');
    expect(
      getSlateElementPlainText({ __throw: true, children: [], value: 'x' } as any),
    ).toBe('x');
    expect(getSlateElementPlainText({ value: 1 as any })).toBe('');
  });

  it('getCodeBlockPlainText：placeholder / 更长 children / 相等', () => {
    expect(getCodeBlockPlainText(null)).toBe('');
    expect(
      getCodeBlockPlainText({
        children: [{ text: '\u200B' }],
        value: 'body',
      } as any),
    ).toBe('body');
    expect(
      getCodeBlockPlainText({
        children: [{ text: 'longer-than-value' }],
        value: 'short',
      } as any),
    ).toBe('longer-than-value');
    expect(
      getCodeBlockPlainText({
        children: [{ text: 'ab' }],
        value: 'abcd',
      } as any),
    ).toBe('abcd');
    expect(
      getCodeBlockPlainText({
        children: [{ text: 'same' }],
        value: 'same',
      } as any),
    ).toBe('same');
  });
});
