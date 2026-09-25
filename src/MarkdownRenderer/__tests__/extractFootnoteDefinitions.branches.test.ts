/**
 * extractFootnoteDefinitions：placeholder / nested text 分支。
 */
import { describe, expect, it } from 'vitest';
import { extractFootnoteDefinitionsFromMarkdown } from '../extractFootnoteDefinitions';

describe('extractFootnoteDefinitions branches', () => {
  it('脚注正文含续行时拼出 origin_text', () => {
    const md = '[^note]: Line one\n\ncontinued paragraph';
    const rows = extractFootnoteDefinitionsFromMarkdown(md);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].id).toBe('note');
    expect(rows[0].placeholder).toBeTruthy();
    expect(String(rows[0].origin_text).length).toBeGreaterThan(0);
  });

  it('identifier 作为 placeholder 回退', () => {
    const md = '[^xyz]: only body';
    const rows = extractFootnoteDefinitionsFromMarkdown(md);
    expect(rows[0].placeholder).toBeTruthy();
    expect(rows[0].url).toBeUndefined();
    expect(rows[0].origin_url).toBeUndefined();
  });

  it('空/空白 content 返回 []；无脚注定义返回 []', () => {
    expect(extractFootnoteDefinitionsFromMarkdown('')).toEqual([]);
    expect(extractFootnoteDefinitionsFromMarkdown('   ')).toEqual([]);
    expect(extractFootnoteDefinitionsFromMarkdown('# hi\n\nno notes')).toEqual(
      [],
    );
  });

  it('多脚注与嵌套段落文本拼接', () => {
    const md = `[^a]: first

paragraph

[^b]: second`;
    const rows = extractFootnoteDefinitionsFromMarkdown(md);
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows.map((r) => r.id)).toEqual(expect.arrayContaining(['a', 'b']));
  });
});
