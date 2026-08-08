import { describe, expect, it } from 'vitest';
import { shouldReparseLastBlock } from '../lastBlockThrottle';

describe('shouldReparseLastBlock', () => {
  it('流式末块在未闭合围栏内应每帧重 parse', () => {
    const prev = '```json\n{"value":1';
    const next = '```json\n{"value":12';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('流式末块围栏外仍可按字符节流', () => {
    const prev = 'hello';
    const next = 'hello world';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('流式末块缩短时立即重新 parse', () => {
    const prev = 'answer continued';
    const next = 'answer';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('流式末块被非前缀内容替换时立即重新 parse', () => {
    const prev = 'first answer';
    const next = 'regenerated answer';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('围栏闭合后恢复节流', () => {
    const prev = '```js\nx\n```\n';
    const next = '```js\nx\n```\nmore';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('流式末块在 GFM 表格内不因 | 或 - 立即重 parse', () => {
    const prev = '| a | b |\n| - | - |\n| 1';
    const next = '| a | b |\n| - | - |\n| 1 |';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('流式末块在无边框 GFM 表格内不因 | 或 - 立即重 parse', () => {
    const prev = 'a | b\n- | -\n1';
    const next = 'a | b\n- | -\n1 |';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('流式末块在 GFM 表格内换行仍立即重 parse', () => {
    const prev = '| a | b |';
    const next = '| a | b |\n| - | - |';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('流式末块在 GFM 表格内新增行内语法起点时立即重 parse', () => {
    const prev = '| a | b |\n| - | - |\n| 1 |';
    const next = '| a | b |\n| - | - |\n| 1 | [link';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('非流式始终重 parse', () => {
    expect(shouldReparseLastBlock('a', 'ab', false)).toBe(true);
  });

  it('无 prev 时重 parse', () => {
    expect(shouldReparseLastBlock(undefined, 'hello', true)).toBe(true);
  });

  it('内容缩短时重 parse', () => {
    expect(shouldReparseLastBlock('hello world', 'hello', true)).toBe(true);
  });

  it('非前缀改写时重 parse', () => {
    expect(shouldReparseLastBlock('abc', 'xbc', true)).toBe(true);
  });

  it('增量达到阈值字符时重 parse', () => {
    const prev = 'start';
    const next = `start${'x'.repeat(20)}`;
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('普通边界符触发重 parse', () => {
    expect(shouldReparseLastBlock('hi', 'hi\n', true)).toBe(true);
    expect(shouldReparseLastBlock('hi', 'hi`', true)).toBe(true);
  });

  it('行内起点触发重 parse', () => {
    expect(shouldReparseLastBlock('hi ', 'hi [', true)).toBe(true);
  });

  it('未闭合 think 内换行应立即重 parse', () => {
    const prev = '<think>\nreasoning';
    const next = '<think>\nreasoning\nmore';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('未闭合 think 闭合标签出现时应立即重 parse', () => {
    const prev = '<think>\nreasoning';
    const next = '<think>\nreasoning</think>';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('未闭合 think 内小增量字母仍按字符节流', () => {
    const prev = '<think>\nreasoning';
    const next = '<think>\nreasoningx';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('thinking 别名闭合时也应立即重 parse', () => {
    const prev = '<thinking>\nstep';
    const next = '<thinking>\nstep</thinking>';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });
});
