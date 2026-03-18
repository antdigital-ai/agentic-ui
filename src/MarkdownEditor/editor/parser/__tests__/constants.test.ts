import { describe, expect, it } from 'vitest';
import { preprocessProtectTimeFromDirective } from '../constants';

describe('preprocessProtectTimeFromDirective', () => {
  it('应将时间中的冒号转义，避免被 directive 误解析', () => {
    const markdown = '创建时间 2026-03-18 02:20:31';
    const result = preprocessProtectTimeFromDirective(markdown);

    expect(result).toContain('02\\:20\\:31');
  });

  it('应保留 URL 协议分隔符，不破坏 https://', () => {
    const markdown = '访问链接 https://example.com/docs';
    const result = preprocessProtectTimeFromDirective(markdown);

    expect(result).toContain('https://example.com/docs');
  });

  it('空字符串应原样返回', () => {
    expect(preprocessProtectTimeFromDirective('')).toBe('');
  });
});
