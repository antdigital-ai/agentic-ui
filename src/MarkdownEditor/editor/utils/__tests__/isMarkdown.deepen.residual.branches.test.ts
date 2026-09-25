/**
 * isMarkdown deepen residual：逐类模式命中与全否定。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isMarkdown } from '../isMarkdown';

describe('isMarkdown deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 / 空白 false', () => {
    expect(isMarkdown('')).toBe(false);
    expect(isMarkdown('   ')).toBe(false);
    expect(isMarkdown(null as any)).toBe(false);
  });

  it('headers / tables / images / links', () => {
    expect(isMarkdown('# Title')).toBe(true);
    expect(isMarkdown('|a|b|\n|-|-|\n|1|2|')).toBe(true);
    expect(isMarkdown('![alt](http://x)')).toBe(true);
    expect(isMarkdown('[t](http://y)')).toBe(true);
  });

  it('code blocks / inline / quote / bold / italic', () => {
    expect(isMarkdown('```\ncode\n```')).toBe(true);
    expect(isMarkdown('use `x` here')).toBe(true);
    expect(isMarkdown('> quote line')).toBe(true);
    expect(isMarkdown('**bold**')).toBe(true);
    expect(isMarkdown('__bold2__')).toBe(true);
    expect(isMarkdown('*italic*')).toBe(true);
  });

  it('strikethrough / hr / simplified table', () => {
    expect(isMarkdown('~~gone~~')).toBe(true);
    expect(isMarkdown('---')).toBe(true);
    expect(isMarkdown('===\n')).toBe(true);
    expect(isMarkdown('***')).toBe(true);
    expect(isMarkdown('a|b\n---|---\nc|d')).toBe(true);
  });

  it('纯文本与孤立 * 为 false', () => {
    expect(isMarkdown('hello world plain')).toBe(false);
    expect(isMarkdown('*')).toBe(false);
  });
});
