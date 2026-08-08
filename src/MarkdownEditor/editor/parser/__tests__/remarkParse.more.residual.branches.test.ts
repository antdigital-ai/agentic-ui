/**
 * remarkParse residual extra：protectJinja / getMarkdownParser / create。
 */
import { describe, expect, it } from 'vitest';
import {
  createMarkdownParser,
  getMarkdownParser,
  protectJinjaDollarInText,
  fixStrongWithSpecialChars,
} from '../remarkParse';

describe('remarkParse more residual branches', () => {
  it('protectJinjaDollarInText：插件转换不抛', () => {
    const transform = protectJinjaDollarInText();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '{{ x }} $1' }],
        },
      ],
    };
    expect(() => transform(tree)).not.toThrow();
  });

  it('getMarkdownParser / createMarkdownParser 可 parse', () => {
    const p1 = getMarkdownParser();
    const p2 = createMarkdownParser();
    expect(p1.parse('# Hi')).toBeTruthy();
    expect(p2.parse('**b**')).toBeTruthy();
  });

  it('fixStrongWithSpecialChars 转换不抛', () => {
    const transform = fixStrongWithSpecialChars();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '**a_b**' }],
        },
      ],
    };
    expect(() => transform(tree)).not.toThrow();
  });
});
