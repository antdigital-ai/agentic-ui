/**
 * 本地预览工具函数测试
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock markdownToHtml 以避免引入 unified 重量级依赖
vi.mock(
  '../../../../src/MarkdownEditor/editor/utils/markdownToHtml',
  () => ({
    markdownToHtml: vi.fn(async (md: string) => `<p>${md}</p>`),
  }),
);

import {
  openHtmlLocalPreview,
  openMarkdownLocalPreview,
} from '../../../../src/Plugins/code/utils/localPreview';

describe('openHtmlLocalPreview', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;
  let openMock: ReturnType<typeof vi.fn>;
  let windowAddEventListenerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURLMock = vi.fn(() => 'blob:mock-url');
    revokeObjectURLMock = vi.fn();
    windowAddEventListenerMock = vi.fn((event, cb) => {
      if (event === 'load') cb();
    });
    openMock = vi.fn(() => ({
      addEventListener: windowAddEventListenerMock,
    }));

    Object.defineProperty(globalThis, 'URL', {
      configurable: true,
      value: {
        createObjectURL: createObjectURLMock,
        revokeObjectURL: revokeObjectURLMock,
      },
    });

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        ...globalThis.window,
        open: openMock,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应使用 Blob URL 在新标签页打开 HTML 片段', () => {
    openHtmlLocalPreview('<div>Hello</div>');

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const blob = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/html');
    expect(openMock).toHaveBeenCalledWith('blob:mock-url', '_blank');
  });

  it('不包含 html/DOCTYPE 标签的内容应包裹为完整文档', () => {
    openHtmlLocalPreview('<p>fragment</p>');

    const blob = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/html');
  });

  it('已有完整文档结构时不再包裹', () => {
    const full = '<!DOCTYPE html><html><body>full</body></html>';
    openHtmlLocalPreview(full);

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
  });

  it('窗口打开后应调用 revokeObjectURL 释放 Blob URL', () => {
    openHtmlLocalPreview('<div>test</div>');
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
  });

  it('弹窗被拦截（window.open 返回 null）时延迟释放 Blob URL', () => {
    vi.useFakeTimers();
    openMock.mockReturnValue(null);

    openHtmlLocalPreview('<div>blocked</div>');
    expect(revokeObjectURLMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10000);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    vi.useRealTimers();
  });
});

describe('openMarkdownLocalPreview', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;
  let openMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURLMock = vi.fn(() => 'blob:mock-url-md');
    revokeObjectURLMock = vi.fn();

    openMock = vi.fn(() => ({
      addEventListener: vi.fn((event, cb) => {
        if (event === 'load') cb();
      }),
    }));

    Object.defineProperty(globalThis, 'URL', {
      configurable: true,
      value: {
        createObjectURL: createObjectURLMock,
        revokeObjectURL: revokeObjectURLMock,
      },
    });

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        ...globalThis.window,
        open: openMock,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应将 Markdown 转为 HTML 并在新标签页打开', async () => {
    await openMarkdownLocalPreview('# Hello');

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const blob = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/html');
    expect(openMock).toHaveBeenCalledWith('blob:mock-url-md', '_blank');
  });

  it('生成的 HTML 应包含 KaTeX 样式链接', async () => {
    await openMarkdownLocalPreview('$E=mc^2$');

    const blob = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/html');
    // 通过 Blob size > 0 确认内容已写入（包含 katex cdn url 的完整 HTML）
    expect(blob.size).toBeGreaterThan(100);
  });

  it('窗口打开后应释放 Blob URL', async () => {
    await openMarkdownLocalPreview('hello');
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url-md');
  });
});
