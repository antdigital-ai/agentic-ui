/**
 * extractFootnoteDefinitions residual：空串、脚注树、嵌套 children、假值节点。
 */
import { describe, expect, it } from 'vitest';
import { extractFootnoteDefinitionsFromMarkdown } from '../extractFootnoteDefinitions';

describe('extractFootnoteDefinitions residual branches', () => {
  it('空 / 空白 / undefined 返回 []', () => {
    expect(extractFootnoteDefinitionsFromMarkdown('')).toEqual([]);
    expect(extractFootnoteDefinitionsFromMarkdown('   ')).toEqual([]);
    expect(extractFootnoteDefinitionsFromMarkdown(undefined as any)).toEqual(
      [],
    );
  });

  it('解析 GFM 脚注定义与 label 回退', () => {
    const md = `See[^a]

[^a]: Hello **world**
`;
    const rows = extractFootnoteDefinitionsFromMarkdown(md);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].id).toBe('a');
    expect(String(rows[0].origin_text)).toContain('Hello');
    expect(rows[0].url).toBeUndefined();
  });

  it('无脚注的普通 markdown 返回空列表', () => {
    expect(extractFootnoteDefinitionsFromMarkdown('# Hi\n\npara')).toEqual([]);
  });

  it('脚注含链接与空 children 文本路径', () => {
    const md = `Ref[^u]

[^u]: see [site](https://example.com) and ![img](a.png)
`;
    const rows = extractFootnoteDefinitionsFromMarkdown(md);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(String(rows[0].origin_text).length).toBeGreaterThan(0);
  });

  it('多脚注 identifier 作为 placeholder', () => {
    const md = `A[^1] B[^2]

[^1]: one
[^2]: two more
`;
    const rows = extractFootnoteDefinitionsFromMarkdown(md);
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows.map((r) => r.id).sort()).toEqual(['1', '2']);
  });
});
