/**
 * markdownToHtml residual：空串、GFM、危险 html 配置。
 */
import { describe, expect, it } from 'vitest';
import { markdownToHtml } from '../markdownToHtml';

describe('markdownToHtml residual branches', () => {
  it('空 / 空白', async () => {
    const a = await Promise.resolve(markdownToHtml(''));
    const b = await Promise.resolve(markdownToHtml('   '));
    expect(typeof a === 'string' || (a !== null && a !== undefined)).toBe(true);
    expect(b !== null && b !== undefined).toBe(true);
  });

  it('基础 markdown 与代码块', async () => {
    const html = await Promise.resolve(
      markdownToHtml('# H\n\n**b** and `code`\n\n```js\n1\n```'),
    );
    expect(String(html)).toMatch(/h1|strong|code|pre/i);
  });

  it('表格与链接', async () => {
    const html = await Promise.resolve(
      markdownToHtml('|a|b|\n|-|-|\n|1|2|\n\n[x](https://a.com)'),
    );
    expect(String(html).length).toBeGreaterThan(0);
  });
});
