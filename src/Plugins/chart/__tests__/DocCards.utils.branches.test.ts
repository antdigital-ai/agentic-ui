/**
 * DocCards utils 分支：splitTags / isSafeHref / isExternalLink / formatDisplayUrl。
 */
import { describe, expect, it } from 'vitest';
import {
  formatDisplayUrl,
  isExternalLink,
  isSafeHref,
  splitTags,
} from '../DocCards/utils';

describe('DocCards utils 分支覆盖', () => {
  describe('splitTags', () => {
    it('null/undefined/空白返回 []', () => {
      expect(splitTags(null)).toEqual([]);
      expect(splitTags(undefined)).toEqual([]);
      expect(splitTags('   ')).toEqual([]);
    });

    it('按多分隔符拆分并去重', () => {
      expect(splitTags('a, b; a | c，d、e')).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('数字转字符串', () => {
      expect(splitTags(12 as any)).toEqual(['12']);
    });
  });

  describe('isSafeHref', () => {
    it('拒绝非字符串/空/protocol-relative/危险协议', () => {
      expect(isSafeHref(1)).toBe(false);
      expect(isSafeHref('')).toBe(false);
      expect(isSafeHref('  ')).toBe(false);
      expect(isSafeHref('//evil.com')).toBe(false);
      expect(isSafeHref('javascript:alert(1)')).toBe(false);
      expect(isSafeHref('data:text/html,x')).toBe(false);
    });

    it('放行站内路径与锚点', () => {
      expect(isSafeHref('/foo')).toBe(true);
      expect(isSafeHref('./foo')).toBe(true);
      expect(isSafeHref('../foo')).toBe(true);
      expect(isSafeHref('#sec')).toBe(true);
    });

    it('放行 http(s)/mailto/tel', () => {
      expect(isSafeHref('https://a.com')).toBe(true);
      expect(isSafeHref('http://a.com')).toBe(true);
      expect(isSafeHref('mailto:a@b.com')).toBe(true);
      expect(isSafeHref('tel:123')).toBe(true);
    });
  });

  describe('isExternalLink', () => {
    it('非字符串/空返回 false', () => {
      expect(isExternalLink(null)).toBe(false);
      expect(isExternalLink('')).toBe(false);
    });

    it('http/mailto/tel 为外部，站内为内部', () => {
      expect(isExternalLink('https://x.com')).toBe(true);
      expect(isExternalLink('mailto:a@b.c')).toBe(true);
      expect(isExternalLink('/local')).toBe(false);
      expect(isExternalLink('#a')).toBe(false);
    });
  });

  describe('formatDisplayUrl', () => {
    it('非字符串/空返回空串', () => {
      expect(formatDisplayUrl(1)).toBe('');
      expect(formatDisplayUrl('  ')).toBe('');
    });

    it('https 解析 host+path，根路径去斜杠', () => {
      expect(formatDisplayUrl('https://example.com/')).toBe('example.com');
      expect(formatDisplayUrl('https://example.com/a?q=1')).toBe(
        'example.com/a?q=1',
      );
    });

    it('非法 URL 回退去 protocol 前缀', () => {
      // `new URL('https://')` 抛错后走 catch：去掉协议前缀，结果为空串
      expect(formatDisplayUrl('https://')).toBe('');
    });

    it('mailto/tel 去 scheme', () => {
      expect(formatDisplayUrl('mailto:a@b.com')).toBe('a@b.com');
      expect(formatDisplayUrl('tel:10086')).toBe('10086');
    });

    it('超长截断', () => {
      const long = `https://example.com/${'x'.repeat(80)}`;
      const out = formatDisplayUrl(long, 20);
      expect(out.endsWith('…')).toBe(true);
      expect(out.length).toBeLessThanOrEqual(21);
    });

    it('相对路径原样返回', () => {
      expect(formatDisplayUrl('./docs')).toBe('./docs');
    });
  });
});
