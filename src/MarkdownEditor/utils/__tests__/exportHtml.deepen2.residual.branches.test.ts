/**
 * exportHtml deepen：title 缺省 → 'Markdown Export'。
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

  it('省略 title：默认 Markdown Export', () => {
    const html = generateHtmlDocument('<p>hi</p>');
    expect(html).toContain('<title>Markdown Export</title>');
    expect(html).toContain('<p>hi</p>');
  });
});
