/**
 * parseHtml residual：think 别名归一、decodeURI、空 markdown。
 */
import { describe, expect, it, vi } from 'vitest';
import {
  decodeURIComponentUrl,
  normalizeThinkTagAliases,
} from '../parseHtml';

describe('parseHtml residual branches', () => {
  it('normalizeThinkTagAliases：空串早退；别名成对替换', () => {
    expect(normalizeThinkTagAliases('')).toBe('');
    expect(normalizeThinkTagAliases(undefined as any)).toBeUndefined();

    const redacted = normalizeThinkTagAliases(
      '<' + 'redacted_thinking' + '>abc</' + 'redacted_thinking' + '>',
    );
    expect(redacted).toContain('<think>');
    expect(redacted).toContain('abc');
    expect(redacted).toContain('</think>');

    const thinking = normalizeThinkTagAliases(
      '<' + 'thinking' + '>xyz</' + 'thinking' + '>',
    );
    expect(thinking).toContain('<think>');
    expect(thinking).toContain('xyz');
  });

  it('normalizeThinkTagAliases：无别名原文返回', () => {
    expect(normalizeThinkTagAliases('plain')).toBe('plain');
    expect(normalizeThinkTagAliases('<think>ok</think>')).toBe(
      '<think>ok</think>',
    );
  });

  it('decodeURIComponentUrl：合法解码；非法回退原串', () => {
    expect(decodeURIComponentUrl('%20')).toBe(' ');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(decodeURIComponentUrl('%E0%A4%A')).toBe('%E0%A4%A');
    spy.mockRestore();
  });
});
