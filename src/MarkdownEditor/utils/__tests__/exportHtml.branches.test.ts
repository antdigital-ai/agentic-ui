import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportHtml, generateHtmlDocument } from '../exportHtml';

describe('exportHtml 默认参数分支', () => {
  const mockCreateObjectURL = vi.fn(() => 'blob:url');
  const mockClick = vi.fn();

  beforeEach(() => {
    global.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: vi.fn(),
    } as any;
    global.document = {
      createElement: vi.fn(() => ({
        href: '',
        download: '',
        click: mockClick,
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    } as any;
    global.Blob = vi.fn(function BlobMock(content: unknown, options?: object) {
      return { content, options };
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generateHtmlDocument 省略 title 与 styles 使用默认值', () => {
    const html = generateHtmlDocument('<p>x</p>');
    expect(html).toContain('<title>Markdown Export</title>');
    expect(html).not.toContain('.custom');
  });

  it('generateHtmlDocument 省略 styles', () => {
    const html = generateHtmlDocument('<p>x</p>', 'Custom Title');
    expect(html).toContain('<title>Custom Title</title>');
  });

  it('exportHtml 省略 filename 使用 export.html', () => {
    const link = { href: '', download: '', click: mockClick };
    (global.document.createElement as any).mockReturnValue(link);
    exportHtml('<h1>x</h1>');
    expect(link.download).toBe('export.html');
  });

  it('istanbul residual：generateHtmlDocument 带 styles；exportHtml 自定义名', () => {
    const html = generateHtmlDocument('<p>y</p>', 'T', '.x{color:red}');
    expect(html).toContain('.x{color:red}');
    expect(html).toContain('<title>T</title>');

    const link = { href: '', download: '', click: mockClick };
    (global.document.createElement as any).mockReturnValue(link);
    exportHtml('<p>z</p>', 'custom.html');
    expect(link.download).toBe('custom.html');
  });
});
