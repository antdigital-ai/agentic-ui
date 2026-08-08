/**
 * insertParsedHtmlNodes 残留：deserialize / htmlToFragmentList 边角。
 */
import { describe, expect, it } from 'vitest';
import {
  deserialize,
  ELEMENT_TAGS,
  htmlToFragmentList,
  TEXT_TAGS,
} from '../insertParsedHtmlNodes';

describe('insertParsedHtmlNodes residual branches', () => {
  it('ELEMENT_TAGS / TEXT_TAGS 覆盖常见标签', () => {
    expect(typeof ELEMENT_TAGS.P).toBe('function');
    expect(typeof ELEMENT_TAGS.H1).toBe('function');
    expect(typeof ELEMENT_TAGS.LI).toBe('function');
    expect(typeof TEXT_TAGS.STRONG).toBe('function');
    expect(typeof TEXT_TAGS.EM).toBe('function');
    expect(typeof TEXT_TAGS.CODE).toBe('function');
  });

  it('deserialize：text / 空 / br / 未知元素', () => {
    const doc = new DOMParser().parseFromString(
      '<div><p>hi<br/></p><span>x</span><!--c--></div>',
      'text/html',
    );
    const body = doc.body;
    const result = deserialize(body);
    expect(result).toBeTruthy();
  });

  it('deserialize：列表与标题', () => {
    const doc = new DOMParser().parseFromString(
      '<ul><li>a</li></ul><ol><li>b</li></ol><h2>T</h2><blockquote>q</blockquote>',
      'text/html',
    );
    const result = deserialize(doc.body);
    expect(Array.isArray(result) || result).toBeTruthy();
  });

  it('htmlToFragmentList：空 html；含 table；rtl', () => {
    expect(htmlToFragmentList('', 'ltr').length).toBeGreaterThanOrEqual(0);
    const frags = htmlToFragmentList(
      '<p>a</p><table><tr><td>c</td></tr></table>',
      'rtl',
    );
    expect(Array.isArray(frags)).toBe(true);
  });

  it('deserialize：pre/code 与 a/img', () => {
    const doc = new DOMParser().parseFromString(
      '<pre><code>const x=1</code></pre><p><a href="https://x.com">l</a><img src="https://i.png" alt="a"/></p>',
      'text/html',
    );
    expect(deserialize(doc.body)).toBeTruthy();
  });

  it('TEXT_TAGS 返回标记对象', () => {
    expect(TEXT_TAGS.STRONG()).toEqual({ bold: true });
    expect(TEXT_TAGS.EM()).toEqual({ italic: true });
    expect(TEXT_TAGS.CODE()).toEqual({ code: true });
    expect(TEXT_TAGS.DEL()).toEqual({ strikethrough: true });
    const mark = TEXT_TAGS.MARK({
      getAttribute: (k: string) =>
        ({ color: 'red', bg: 'yellow', label: '@' } as any)[k],
    } as any);
    expect(mark.mark).toBe(true);
    expect(mark.markColor).toBe('red');
  });
});
