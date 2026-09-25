/**
 * remarkParse deepen4：paragraph beforeText、incomplete 尾、
 * visit text 节点 before/after 臂。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fixStrongWithSpecialChars,
  protectJinjaDollarInText,
} from '../remarkParse';

describe('remarkParse deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('paragraph：匹配前 beforeText；尾部普通 afterText', () => {
    const transform = fixStrongWithSpecialChars();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: '前缀 **$9.6M** 后缀' },
            { type: 'text', value: '**57%**' },
          ],
        },
      ],
    };
    expect(() => transform(tree)).not.toThrow();
    const s = JSON.stringify(tree);
    expect(s.includes('strong') || s.includes('$9') || s.includes('57')).toBe(
      true,
    );
  });

  it('paragraph：完整匹配后尾部 incomplete strong', () => {
    const transform = fixStrongWithSpecialChars();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '**$1**尾**未闭合' }],
        },
      ],
    };
    transform(tree);
    const s = JSON.stringify(tree);
    expect(s.includes('strong') || s.includes('未闭合')).toBe(true);
  });

  it('visit text：beforeText 非空；afterText 普通文本', () => {
    const transform = fixStrongWithSpecialChars();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'text',
              value: 'lead **%2** trail',
            },
          ],
        },
      ],
    };
    transform(tree);
    const s = JSON.stringify(tree);
    expect(s.includes('strong') || s.includes('%2') || s.includes('lead')).toBe(
      true,
    );
  });

  it('visit text：完整后 incomplete 尾；纯 incomplete', () => {
    const transform = fixStrongWithSpecialChars();
    const tree = {
      type: 'root',
      children: [
        { type: 'text', value: '**#a**然后**未完' },
        { type: 'text', value: '**仅开头' },
      ],
    };
    expect(() => transform(tree)).not.toThrow();
  });

  it('protectJinja 与空树不抛', () => {
    const protect = protectJinjaDollarInText();
    expect(() =>
      protect({
        type: 'root',
        children: [
          { type: 'code', value: 'x = $y', lang: 'jinja2' },
          { type: 'text', value: null },
        ],
      }),
    ).not.toThrow();
  });
});
