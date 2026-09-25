import { describe, expect, it } from 'vitest';
import { MarkdownFormatter } from '..';

describe('MarkdownFormatter residual branches', () => {
  it('normalizes Windows line endings', () => {
    expect(MarkdownFormatter.normalizeParagraphs(' first\r\n\r\n second\r')).toBe(
      'first\n\nsecond',
    );
  });

  it('keeps adjacent table rows separated by one newline', () => {
    expect(
      MarkdownFormatter.normalizeParagraphs('| A |\n| --- |\n| B |'),
    ).toBe('| A |\n| --- |\n| B |');
  });
});
