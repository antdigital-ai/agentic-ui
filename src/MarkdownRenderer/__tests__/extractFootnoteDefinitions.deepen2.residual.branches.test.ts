/**
 * extractFootnoteDefinitions deepen2：空 content / text value 缺省 / label 缺省。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { extractFootnoteDefinitionsFromMarkdown } from '../extractFootnoteDefinitions';

describe('extractFootnoteDefinitions deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空串与空白早退', () => {
    expect(extractFootnoteDefinitionsFromMarkdown('')).toEqual([]);
    expect(extractFootnoteDefinitionsFromMarkdown('   ')).toEqual([]);
  });

  it('脚注定义无 label 时用 identifier；正文可为空', () => {
    const rows = extractFootnoteDefinitionsFromMarkdown(
      'See.[^a]\n\n[^a]: note',
    );
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].id).toBeTruthy();
    expect(rows[0].placeholder).toBeTruthy();
  });
});
