import { describe, expect, it } from 'vitest';
import {
  preprocessNormalizeLeafToContainerDirective,
  preprocessProtectTimeFromDirective,
} from '../constants';

describe('preprocessNormalizeLeafToContainerDirective', () => {
  // ── 开启行规范化 ──────────────────────────────────────────────────────────
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

  it('支持单字母类型名（如 ::a）', () => {
    const result = preprocessNormalizeLeafToContainerDirective('::a\ncontent\n:::');
    expect(result.startsWith(':::a')).toBe(true);
  });

  it('支持大写类型名（::WARNING → :::WARNING）', () => {
    const result = preprocessNormalizeLeafToContainerDirective('::WARNING\ncontent\n:::');
    expect(result.startsWith(':::WARNING')).toBe(true);
  });

  // ── 关闭行规范化 ──────────────────────────────────────────────────────────
  it('将行首 :: 单独一行规范化为 :::', () => {
    const md = '::warning\nSome content\n::';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(':::warning\nSome content\n:::');
  });

  it(':: 行首后有空白也视为关闭符', () => {
    const result = preprocessNormalizeLeafToContainerDirective('::warning\ncontent\n::  ');
    expect(result).toBe(':::warning\ncontent\n:::');
  });

  it(':: 关闭符与 ::: 关闭符混用时各自处理正确', () => {
    const md = '::info\ncontent-a\n::\n\n::warning\ncontent-b\n:::';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(':::info\ncontent-a\n:::\n\n:::warning\ncontent-b\n:::');
  });

  // ── 连续多块 ──────────────────────────────────────────────────────────────
  it('同一文档中多个 :: 块均被规范化', () => {
    const md = '::info\n内容A\n::\n\n::error\n内容B\n::';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(':::info\n内容A\n:::\n\n:::error\n内容B\n:::');
  });

  it(':: 块与 ::: 块混合时各自正确处理', () => {
    const md = '::warning\n警告\n::\n\n:::info\n信息\n:::';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(':::warning\n警告\n:::\n\n:::info\n信息\n:::');
  });

  // ── 空内容块 ──────────────────────────────────────────────────────────────
  it('空内容块（开启行与关闭行相邻）被正确规范化', () => {
    const result = preprocessNormalizeLeafToContainerDirective('::warning\n::');
    expect(result).toBe(':::warning\n:::');
  });

  // ── 不应修改的场景 ────────────────────────────────────────────────────────
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

  it('不修改行内的 :: 关闭符（不在行首）', () => {
    const md = 'text :: text';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(md);
  });

  it('不修改时间格式 02:20:31', () => {
    const md = '时间 02:20:31';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(md);
  });

  it('不修改 URL 路径（如 /home/node/.openclaw）', () => {
    const md = '配置路径 /home/node/.openclaw/agents/main/agent/auth-profiles.json';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toBe(md);
  });

  // ── 代码围栏保护 ──────────────────────────────────────────────────────────
  it('围栏代码块内不规范化开启行', () => {
    const md = '```bash\n::warning inside fence\n```\n::warning outside fence\n:::';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    expect(result).toContain('::warning inside fence');
    expect(result).toContain(':::warning outside fence');
  });

  it('围栏代码块内不规范化关闭行', () => {
    const md = '```\n::\n```\n::warning\ncontent\n::';
    const result = preprocessNormalizeLeafToContainerDirective(md);
    // 围栏内的 :: 不动，围栏外的 :: 关闭符被规范化
    expect(result).toContain('```\n::\n```');
    expect(result).toContain(':::warning\ncontent\n:::');
  });

  // ── 边界 ──────────────────────────────────────────────────────────────────
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
