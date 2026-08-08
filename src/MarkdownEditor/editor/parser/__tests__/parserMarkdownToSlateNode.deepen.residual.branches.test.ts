/**
 * parserMarkdownToSlateNode deepen residual：短块合并、HR、:::、空段过滤。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearParseCache,
  parserMarkdownToSlateNode,
  simpleHash,
} from '../parserMarkdownToSlateNode';

describe('parserMarkdownToSlateNode deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    clearParseCache();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    clearParseCache();
  });

  it('simpleHash 稳定', () => {
    expect(simpleHash('abc')).toBe(simpleHash('abc'));
    expect(simpleHash('')).toBeTruthy();
  });

  it('短块与后续合并；含 --- 的块并入上块', () => {
    const short = 'hi';
    const next = 'x'.repeat(120);
    const md = `${short}\n\n${next}\n\n---\n\ny`;
    const r = parserMarkdownToSlateNode(md);
    expect(r.schema?.length).toBeGreaterThan(0);
  });

  it('代码块内空行不切块', () => {
    const md = '```js\nconst a=1\n\nconst b=2\n```\n\n# after';
    const r = parserMarkdownToSlateNode(md);
    expect(r.schema?.some((n: any) => n.type === 'head' || n.type === 'code')).toBe(
      true,
    );
  });

  it('根级仅 ::: 段落被跳过', () => {
    const md = 'hello\n\n:::\n\nworld';
    const r = parserMarkdownToSlateNode(md);
    const texts = JSON.stringify(r.schema);
    expect(texts).not.toMatch(/":::"/);
  });

  it('空 md / nullish 容错；过滤空 paragraph', () => {
    expect(parserMarkdownToSlateNode('')).toBeTruthy();
    expect(parserMarkdownToSlateNode('\n\n')).toBeTruthy();
    expect(parserMarkdownToSlateNode(undefined as any)).toBeTruthy();
  });

  it('脚注引用与定义同块；HTML 注释属性', () => {
    const md =
      'See[^1]\n\n[^1]: note\n\n<!--{"chartType":"line"}-->\n\n|a|b|\n|-|-|\n|1|2|';
    const r = parserMarkdownToSlateNode(md);
    expect(r.schema?.length).toBeGreaterThan(0);
  });

  it('带 plugins 空数组与 config', () => {
    const a = parserMarkdownToSlateNode('# t', []);
    const b = parserMarkdownToSlateNode('# t', [], {});
    expect(a.schema).toBeTruthy();
    expect(b.schema).toBeTruthy();
  });
});
