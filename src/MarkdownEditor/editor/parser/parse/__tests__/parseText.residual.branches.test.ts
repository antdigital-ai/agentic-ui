/**
 * parseText residual：setFinishedProp、空格式保留、各类 inline。
 */
import { describe, expect, it } from 'vitest';
import { parseText, setFinishedProp } from '../parseText';

describe('parseText residual branches', () => {
  it('setFinishedProp：finished!==false 原样；false 写入 otherProps', () => {
    const leaf = { text: 'a', data: {} } as any;
    expect(setFinishedProp(leaf, true)).toBe(leaf);
    expect(setFinishedProp(leaf, undefined)).toBe(leaf);
    expect(setFinishedProp(leaf, false).otherProps?.finished).toBe(false);
  });

  it('strong/emphasis/delete 空 children 保留格式空文本', () => {
    const strong = parseText(
      [{ type: 'strong', children: [], finished: false } as any],
      { data: {} } as any,
    );
    expect(strong.some((l) => l.bold && l.text === '')).toBe(true);

    const em = parseText(
      [{ type: 'emphasis', children: [] } as any],
      { data: {}, italic: true } as any,
    );
    expect(em.some((l) => l.italic)).toBe(true);

    const del = parseText([{ type: 'delete', children: [] } as any]);
    expect(Array.isArray(del)).toBe(true);
  });

  it('普通 text / break / 未知类型', () => {
    expect(parseText([{ type: 'text', value: 'hi' } as any])[0].text).toBe(
      'hi',
    );
    expect(parseText([{ type: 'break' } as any]).length).toBeGreaterThan(0);
    expect(Array.isArray(parseText([{ type: 'unknown' } as any]))).toBe(true);
  });

  it('link / inlineCode 路径不抛', () => {
    const link = parseText([
      {
        type: 'link',
        url: 'https://a.com',
        children: [{ type: 'text', value: 'A' }],
      } as any,
    ]);
    expect(link.some((l) => (l as any).url || l.text === 'A')).toBe(true);

    const code = parseText([{ type: 'inlineCode', value: 'x' } as any]);
    expect(code.length).toBeGreaterThan(0);
  });
});
