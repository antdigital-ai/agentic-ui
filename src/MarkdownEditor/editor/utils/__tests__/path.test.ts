import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { isLink, parsePath, toUnixPath } from '../../@ant-design/agentic-ui/MarkdownEditor/editor/utils/path';

describe('Path Utils', () => {
  describe('isLink', () => {
    it('应该识别有效的 URL', () => {
      expect(isLink('https://example.com')).toBe(true);
      expect(isLink('http://example.com')).toBe(true);
      expect(isLink('ftp://example.com')).toBe(true);
      expect(isLink('mailto:user@example.com')).toBe(true);
      expect(isLink('tel:+1234567890')).toBe(true);
    });

    it('应该识别无效的 URL', () => {
      expect(isLink('example.com')).toBe(false);
      expect(isLink('www.example.com')).toBe(false);
      expect(isLink('/relative/path')).toBe(false);
      expect(isLink('')).toBe(false);
      expect(isLink()).toBe(false);
    });

    it('应该处理大小写不敏感的协议', () => {
      expect(isLink('HTTPS://example.com')).toBe(true);
      expect(isLink('Http://example.com')).toBe(true);
      expect(isLink('FTP://example.com')).toBe(true);
    });

    it('应该处理带端口和参数的 URL', () => {
      expect(isLink('https://example.com:8080')).toBe(true);
      expect(isLink('https://example.com/path?param=value')).toBe(true);
      expect(isLink('https://example.com/path#fragment')).toBe(true);
    });
  });

  describe('parsePath', () => {
    it('应该解析带哈希的路径', () => {
      const result = parsePath('/path/to/file#section');
      expect(result.path).toBe('/path/to/file');
      expect(result.hash).toBe('section');
    });

    it('应该解析带空哈希的路径', () => {
      const result = parsePath('/path/to/file#');
      expect(result.path).toBe('/path/to/file');
      expect(result.hash).toBe('');
    });

    it('应该解析不带哈希的路径', () => {
      const result = parsePath('/path/to/file');
      expect(result.path).toBe('/path/to/file');
      expect(result.hash).toBe(null);
    });

    it('应该处理复杂的哈希值', () => {
      const result = parsePath('/path/to/file#section-with-hyphens');
      expect(result.path).toBe('/path/to/file');
      expect(result.hash).toBe('section-with-hyphens');
    });

    it('应该处理包含换行符的路径', () => {
      const result = parsePath('/path/to/file#section\nwith-newline');
      expect(result.path).toBe('/path/to/file');
      expect(result.hash).toBe('section');
    });

    it('应该处理包含斜杠的哈希', () => {
      const result = parsePath('/path/to/file#section/subsection');
      expect(result.path).toBe('/path/to/file');
      expect(result.hash).toBe('section/subsection');
    });

    it('应该处理空字符串', () => {
      const result = parsePath('');
      expect(result.path).toBe('');
      expect(result.hash).toBe(null);
    });

    it('应该处理只有哈希的路径', () => {
      const result = parsePath('#section');
      expect(result.path).toBe('');
      expect(result.hash).toBe('section');
    });

    it('应该处理只有哈希符号的路径', () => {
      const result = parsePath('#');
      expect(result.path).toBe('');
      expect(result.hash).toBe('');
    });
  });

  describe('toUnixPath', () => {
    it('应该将 Windows 路径转换为 Unix 路径', () => {
      expect(toUnixPath('C:\\path\\to\\file')).toBe('C:/path/to/file');
      expect(toUnixPath('D:\\folder\\subfolder\\file.txt')).toBe('D:/folder/subfolder/file.txt');
    });

    it('应该保持 Unix 路径不变', () => {
      expect(toUnixPath('/path/to/file')).toBe('/path/to/file');
      expect(toUnixPath('/folder/subfolder/file.txt')).toBe('/folder/subfolder/file.txt');
    });

    it('应该处理相对路径', () => {
      expect(toUnixPath('.\\relative\\path')).toBe('./relative/path');
      expect(toUnixPath('..\\parent\\folder')).toBe('../parent/folder');
    });

    it('应该处理空字符串', () => {
      expect(toUnixPath('')).toBe('');
    });

    it('应该处理只有反斜杠的路径', () => {
      expect(toUnixPath('\\')).toBe('/');
    });

    it('应该处理只有正斜杠的路径', () => {
      expect(toUnixPath('/')).toBe('/');
    });

    it('应该处理混合路径', () => {
      expect(toUnixPath('C:\\path/to\\mixed/file')).toBe('C:/path/to/mixed/file');
    });

    it('应该处理包含特殊字符的路径', () => {
      expect(toUnixPath('C:\\path with spaces\\file.txt')).toBe('C:/path with spaces/file.txt');
      expect(toUnixPath('C:\\path-with-dashes\\file.txt')).toBe('C:/path-with-dashes/file.txt');
    });
  });

  describe('边界情况', () => {
    it('应该处理 null 和 undefined 值', () => {
      expect(isLink(null as any)).toBe(false);
      expect(isLink(undefined as any)).toBe(false);
    });

    it('应该处理非常长的路径', () => {
      const longPath = '/'.repeat(1000) + 'file';
      const result = parsePath(longPath);
      expect(result.path).toBe(longPath);
      expect(result.hash).toBe(null);
    });

    it('应该处理包含特殊字符的 URL', () => {
      expect(isLink('https://example.com/path with spaces')).toBe(true);
      expect(isLink('https://example.com/path-with-dashes')).toBe(true);
      expect(isLink('https://example.com/path_with_underscores')).toBe(true);
    });
  });

  describe('性能测试', () => {
    it('应该能够快速处理大量路径', () => {
      const paths = Array.from({ length: 1000 }, (_, i) => `/path${i}/file#section${i}`);
      
      const startTime = performance.now();
      paths.forEach(path => parsePath(path));
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该能够快速处理大量 URL', () => {
      const urls = Array.from({ length: 1000 }, (_, i) => `https://example${i}.com`);
      
      const startTime = performance.now();
      urls.forEach(url => isLink(url));
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });
}); 