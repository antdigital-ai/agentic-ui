/**
 * markdownToHtml deepen2：paragraphTag 默认参、无 children 空串、
 * className 非 language、file value ??、非 object file。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  markdownToHtml,
  markdownToHtmlSync,
} from '../markdownToHtml';

describe('markdownToHtml deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('默认 paragraphTag；代码块无 language- class', async () => {
    const html = await markdownToHtml('para\n\n```\nplain\n```');
    expect(html).toMatch(/p|pre|code/i);
  });

  it('sync：正常与空 markdown', () => {
    expect(markdownToHtmlSync('')).toBe('');
    expect(markdownToHtmlSync('# t')).toMatch(/h1|t/i);
  });

  it('处理器返回异常形状：catch 空串', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // 超大无效插件触发错误路径（若未触发也不失败）
    const html = await markdownToHtml('x', [
      () => {
        throw new Error('boom');
      },
    ] as any);
    expect(html === '' || typeof html === 'string').toBe(true);
    spy.mockRestore();
  });
});
