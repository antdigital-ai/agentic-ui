/**
 * extractFootnoteDefinitions deepen：text value 缺省、无 children、parse 异常。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { extractFootnoteDefinitionsFromMarkdown } from '../extractFootnoteDefinitions';

describe('extractFootnoteDefinitions deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('脚注纯文本与空定义仍返回行', () => {
    const md = `X[^z]

[^z]:
`;
    const rows = extractFootnoteDefinitionsFromMarkdown(md);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].id).toBe('z');
  });

  it('脚注含 emphasis 嵌套 children', () => {
    const md = `A[^n]

[^n]: *italic* and plain
`;
    const rows = extractFootnoteDefinitionsFromMarkdown(md);
    expect(String(rows[0]?.origin_text || '')).toMatch(/italic|plain/);
  });

  it('非字符串空值与仅空白', () => {
    expect(extractFootnoteDefinitionsFromMarkdown(null as any)).toEqual([]);
    expect(extractFootnoteDefinitionsFromMarkdown('\n\t  ')).toEqual([]);
  });
});
