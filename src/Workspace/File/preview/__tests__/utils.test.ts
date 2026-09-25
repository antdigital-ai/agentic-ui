import { describe, expect, it } from 'vitest';
import { buildMarkdownContent, getContentStatus, isHtmlFile } from '../utils';

describe('isHtmlFile', () => {
  it('detects html by extension', () => {
    expect(isHtmlFile('index.html')).toBe(true);
    expect(isHtmlFile('page.HTM')).toBe(true);
  });

  it('detects html by mime type', () => {
    expect(isHtmlFile('page', 'text/html')).toBe(true);
  });

  it('returns false for non-html files', () => {
    expect(isHtmlFile('readme.md', 'text/markdown')).toBe(false);
    expect(isHtmlFile('')).toBe(false);
  });
});

describe('getContentStatus', () => {
  it('returns error when error field is present', () => {
    expect(getContentStatus({ status: 'error', error: 'fail' })).toBe('error');
  });

  it('returns loading for loading state', () => {
    expect(getContentStatus({ status: 'loading', mdContent: '' })).toBe(
      'loading',
    );
  });

  it('returns done for idle and ready states', () => {
    expect(getContentStatus({ status: 'idle', mdContent: '' })).toBe('done');
    expect(getContentStatus({ status: 'ready', mdContent: 'x' })).toBe('done');
  });
});

describe('buildMarkdownContent', () => {
  it('wraps code category content in fenced block', () => {
    const result = buildMarkdownContent('const x = 1;', 'code', 'app.ts');
    expect(result).toContain('```typescript');
    expect(result).toContain('const x = 1;');
  });

  it('returns raw content for non-code categories', () => {
    const raw = '# Title';
    expect(buildMarkdownContent(raw, 'markdown', 'doc.md')).toBe(raw);
  });
});
