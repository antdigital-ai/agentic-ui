/**
 * remarkParse deepen3：formula 开启 parserKey `1-`、禁用回落 `0`、
 * fixStrong/protect 假值臂。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMarkdownParser,
  fixStrongWithSpecialChars,
  getMarkdownParser,
  protectJinjaDollarInText,
} from '../remarkParse';

describe('remarkParse deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('getMarkdownParser：formula enable → key 1-true/false；再取缓存', () => {
    const a = getMarkdownParser({ enable: true, singleDollarTextMath: true });
    const b = getMarkdownParser({ enable: true, singleDollarTextMath: true });
    expect(a).toBe(b);

    const c = getMarkdownParser({ enable: true, singleDollarTextMath: false });
    expect(c).toBeTruthy();

    const d = getMarkdownParser({ enable: false });
    expect(d).toBeTruthy();

    const e = getMarkdownParser(undefined);
    expect(e).toBeTruthy();
  });

  it('createMarkdownParser 直接构造', () => {
    expect(
      createMarkdownParser({ enable: true, singleDollarTextMath: true }),
    ).toBeTruthy();
  });

  it('fixStrong / protectJinja：假值分支不抛', () => {
    const strong = fixStrongWithSpecialChars();
    const protect = protectJinjaDollarInText();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: '**$1**' },
            { type: 'text', value: null },
          ],
        },
        { type: 'code', value: 'x = $y', lang: 'jinja2' },
        { type: 'code', value: '', lang: 'js' },
      ],
    };
    expect(() => strong(tree)).not.toThrow();
    expect(() => protect(tree)).not.toThrow();
  });
});
