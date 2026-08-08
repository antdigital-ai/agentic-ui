/**
 * exportHtml deepen：title/styles 默认参数。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateHtmlDocument } from '../exportHtml';

describe('exportHtml deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('仅传 content 时使用默认 title', () => {
    const html = generateHtmlDocument('<p>hi</p>');
    expect(html).toContain('<title>Markdown Export</title>');
    expect(html).toContain('<p>hi</p>');
  });
});
