import { describe, expect, it } from 'vitest';
import {
  buildMarkdownContent,
  getContentStatus,
  isHtmlFile,
} from '../utils';

describe('preview utils residual branches', () => {
  it('recognizes HTML by case-insensitive extension or MIME type', () => {
    expect(isHtmlFile('PAGE.HTML')).toBe(true);
    expect(isHtmlFile('notes.txt', 'text/html')).toBe(true);
    expect(isHtmlFile('notes.txt')).toBe(false);
  });

  it('maps loading, error, and completed states', () => {
    expect(getContentStatus({ status: 'loading' } as any)).toBe('loading');
    expect(getContentStatus({ error: new Error('failed') } as any)).toBe('error');
    expect(getContentStatus({ status: 'success' } as any)).toBe('done');
  });

  it('keeps non-code content unchanged', () => {
    expect(buildMarkdownContent('plain text', 'text', 'a.txt')).toBe(
      'plain text',
    );
  });
});
