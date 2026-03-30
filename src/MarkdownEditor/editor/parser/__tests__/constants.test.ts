import { describe, expect, it } from 'vitest';
import {
  preprocessNormalizeLeafToContainerDirective,
  preprocessProtectTimeFromDirective,
} from '../constants';

describe('preprocessNormalizeLeafToContainerDirective', () => {
  it('将行首 ::warning 规范化为 :::warning', () => {
    const md = '::warning\nSome content\n:::';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(':::warning\nSome content\n:::');
  });

  it('支持所有常见指令名称', () => {
    const types = ['info', 'warning', 'error', 'success', 'tip', 'note'];
    for (const type of types) {
      const result = preprocessNormalizeLeafToContainerDirective(`::${type}\ncontent\n:::`);
      expect(result.startsWith(`:::${type}`)).toBe(true);
    }
  });

  it('不修改已是三冒号的容器指令', () => {
    const md = ':::warning\nSome content\n:::';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(md);
  });

  it('不修改四冒号或更多冒号', () => {
    const md = '::::warning\nSome content\n:::';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(md);
  });

  it('不修改行内的双冒号（不在行首）', () => {
    const md = 'text ::warning text';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(md);
  });

  it('不修改时间格式 02:20:31', () => {
    const md = '时间 02:20:31';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(md);
  });

  it('围栏代码块内不规范化', () => {
    const md = '```bash\n::warning inside fence\n```\n::warning outside fence\n:::';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toContain('::warning inside fence');
    expect(result).toContain(':::warning outside fence');
  });

  it('空字符串原样返回', () => {
    expect(preprocessNormalizeLeafToContainerDirective('')).toBe('');
  });
});

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

  it('围栏代码块内不应转义冒号（如 bash）', () => {
    const markdown =
      '说明见下\n\n```bash\nexport PATH=/usr/bin:20:/sbin\n```\n\n正文时间 01:02:03';
    const result = preprocessProtectTimeFromDirective(markdown);

    expect(result).toContain('export PATH=/usr/bin:20:/sbin');
    expect(result).toContain('01\\:02\\:03');
  });

  it('行内反引号内不应转义冒号', () => {
    const markdown = '执行 `export PATH=/bin:20:/sbin` 后，时间 03:04:05';
    const result = preprocessProtectTimeFromDirective(markdown);

    expect(result).toContain('export PATH=/bin:20:/sbin');
    expect(result).toContain('03\\:04\\:05');
  });

  it('空字符串应原样返回', () => {
    expect(preprocessProtectTimeFromDirective('')).toBe('');
  });
});
