/**
 * extractFilemapBlocks 分支：多块、空内容、仅 filemap、CRLF、尾部空白。
 */
import { describe, expect, it } from 'vitest';
import { extractFilemapBlocks } from '../extractFilemapBlocks';

describe('extractFilemapBlocks 分支覆盖', () => {
  it('无 filemap 时 blocks 为空且 stripped 原样 trim', () => {
    const r = extractFilemapBlocks('  hello world  ');
    expect(r.blocks).toEqual([]);
    expect(r.stripped).toBe('hello world');
  });

  it('提取单个 filemap 并剥离', () => {
    const md = 'before\n```agentic-ui-filemap\n{"a":1}\n```\nafter';
    const r = extractFilemapBlocks(md);
    expect(r.blocks).toHaveLength(1);
    expect(r.blocks[0].body).toBe('{"a":1}');
    expect(r.stripped).toBe('before\n\nafter');
  });

  it('提取多个 filemap', () => {
    const md = [
      '```agentic-ui-filemap',
      '{"x":1}',
      '```',
      'mid',
      '```agentic-ui-filemap',
      '{"y":2}',
      '```',
    ].join('\n');
    const r = extractFilemapBlocks(md);
    expect(r.blocks).toHaveLength(2);
    expect(r.blocks[0].body).toBe('{"x":1}');
    expect(r.blocks[1].body).toBe('{"y":2}');
    expect(r.stripped).toBe('mid');
  });

  it('仅含 filemap 时 stripped 为空串', () => {
    const md = '```agentic-ui-filemap\n{}\n```';
    const r = extractFilemapBlocks(md);
    expect(r.blocks).toHaveLength(1);
    expect(r.stripped).toBe('');
  });

  it('支持 CRLF 与围栏尾部空格', () => {
    const md = '```agentic-ui-filemap  \r\n{"z":3}\r\n```  \r\n';
    const r = extractFilemapBlocks(md);
    expect(r.blocks).toHaveLength(1);
    expect(r.blocks[0].body).toBe('{"z":3}');
  });

  it('空字符串', () => {
    const r = extractFilemapBlocks('');
    expect(r.blocks).toEqual([]);
    expect(r.stripped).toBe('');
  });
});
