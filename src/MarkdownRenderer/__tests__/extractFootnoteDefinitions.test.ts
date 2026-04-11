import { describe, expect, it } from 'vitest';
import { extractFootnoteDefinitionsFromMarkdown } from '../extractFootnoteDefinitions';

describe('extractFootnoteDefinitionsFromMarkdown', () => {
  it('returns empty for empty string', () => {
    expect(extractFootnoteDefinitionsFromMarkdown('')).toEqual([]);
  });

  it('returns empty for whitespace', () => {
    expect(extractFootnoteDefinitionsFromMarkdown('   ')).toEqual([]);
  });

  it('returns empty for null/undefined', () => {
    expect(extractFootnoteDefinitionsFromMarkdown(null as any)).toEqual([]);
  });

  it('extracts GFM footnote definitions', () => {
    const md = 'text [^1]\n\n[^1]: This is a footnote';
    const result = extractFootnoteDefinitionsFromMarkdown(md);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
    expect(result[0].origin_text).toContain('This is a footnote');
  });

  it('extracts multiple footnote definitions', () => {
    const md =
      '[^a]: First note\n\n[^b]: Second note';
    const result = extractFootnoteDefinitionsFromMarkdown(md);
    expect(result.length).toBe(2);
  });

  it('returns empty for text without footnotes', () => {
    const md = 'Just plain text without footnotes';
    const result = extractFootnoteDefinitionsFromMarkdown(md);
    expect(result.length).toBe(0);
  });
});
