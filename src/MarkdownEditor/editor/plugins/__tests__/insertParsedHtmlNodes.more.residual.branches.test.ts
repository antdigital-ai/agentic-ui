/**
 * insertParsedHtmlNodes residual：htmlToFragmentList / deserialize 边界。
 */
import { describe, expect, it } from 'vitest';
import { deserialize, htmlToFragmentList } from '../insertParsedHtmlNodes';

describe('insertParsedHtmlNodes residual branches', () => {
  it('htmlToFragmentList：空串 / 简单段落', () => {
    expect(htmlToFragmentList('', 'ltr')).toEqual([]);
    const nodes = htmlToFragmentList('<p>hello</p>', 'ltr');
    expect(Array.isArray(nodes)).toBe(true);
  });

  it('deserialize：文本 / BR / script 过滤', () => {
    const text = document.createTextNode('abc');
    expect(deserialize(text)).toBe('abc');
    const br = document.createElement('br');
    expect(deserialize(br)).toBe('\n');
    const script = document.createElement('script');
    expect(deserialize(script)).toEqual([]);
  });

  it('deserialize：段落元素', () => {
    const p = document.createElement('p');
    p.textContent = 'x';
    const result = deserialize(p);
    expect(result).toBeTruthy();
  });
});
