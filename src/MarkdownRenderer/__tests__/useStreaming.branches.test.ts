/**
 * useStreaming 分支覆盖：token 识别、围栏、表格与 disabled 路径。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming branches', () => {
  it('enabled=false 时直接透传 input', () => {
    const { result } = renderHook(() =>
      useStreaming('hello **world**', false),
    );
    expect(result.current).toBe('hello **world**');
  });

  it('非 string input 清空输出', () => {
    const { result } = renderHook(() =>
      useStreaming(null as unknown as string, true),
    );
    expect(result.current).toBe('');
  });

  it('空字符串输出空', () => {
    const { result } = renderHook(() => useStreaming('', true));
    expect(result.current).toBe('');
  });

  it('未完成 link 暂缓提交', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '[label' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '[label](https://a.com)' });
    expect(result.current).toBe('[label](https://a.com)');
  });

  it('未完成 image 暂缓提交', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '![alt' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '![alt](https://img.png)' });
    expect(result.current).toContain('![alt](https://img.png)');
  });

  it('未完成 inline-code 暂缓', () => {
    const { result } = renderHook(() => useStreaming('`code', true));
    expect(result.current).toBe('...');
  });

  it('未完成 html 标签暂缓', () => {
    const { result } = renderHook(() => useStreaming('<div', true));
    expect(result.current).toBe('...');
  });

  it('emphasis 未完成时暂缓', () => {
    const { result } = renderHook(() => useStreaming('**bold', true));
    expect(result.current).toBe('...');
  });

  it('list + inline code 前缀 commit', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '- `' } },
    );
    expect(result.current).toBe('- ');
    rerender({ text: '- `x`' });
    expect(result.current).toContain('`x`');
  });

  it('表格 header+separator 未完成时暂缓', () => {
    const table = '| A | B |\n| --- | --- |';
    const { result } = renderHook(() => useStreaming(table, true));
    expect(result.current).toBe('...');
  });

  it('表格完整三行后提交', () => {
    const table = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    const { result } = renderHook(() => useStreaming(table, true));
    expect(result.current).toBe(table);
  });

  it('表格第三行非管道行视为完成', () => {
    const md = '| A |\n| - |\nplain text';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current).toBe(md);
  });

  it('围栏代码块内字符不触发 token 识别', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '```\n[' } },
    );
    expect(result.current).toContain('[');
    rerender({ text: '```\n[link]\n```' });
    expect(result.current).toContain('[link]');
  });

  it('围栏闭合后 commit pending', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '```\nx' } },
    );
    rerender({ text: '```\nx\n```\nhi' });
    expect(result.current).toContain('hi');
  });

  it('input 非前缀时重置缓存', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: 'abc' } },
    );
    expect(result.current).toBe('abc');
    rerender({ text: 'xyz' });
    expect(result.current).toBe('xyz');
  });

  it('双换行表格视为完整', () => {
    const md = '| A |\n| - |\n\nnext';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current).toBe(md);
  });

  it('普通文本逐字 commit', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: 'a' } },
    );
    rerender({ text: 'ab' });
    expect(result.current).toBe('ab');
  });

  it('表格分隔行无效时不暂缓永久', () => {
    const md = '| A | B |\n| xxx | yyy |\n| 1 | 2 |';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('表格数据行缺少前导管道仍可完成', () => {
    const md = '| A |\n| - |\n1 |';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current).toContain('A');
  });

  it('有序列表 + 反引号前缀 commit', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '1. `' } },
    );
    expect(result.current).toBe('1. ');
    rerender({ text: '1. `code`' });
    expect(result.current).toContain('`code`');
  });

  it('前缀增长时追加 chunk（processedLength>0）', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: 'hello' } },
    );
    expect(result.current).toBe('hello');
    rerender({ text: 'hello world' });
    expect(result.current).toBe('hello world');
  });

  it('仅 pending token 时输出占位', () => {
    const { result } = renderHook(() => useStreaming('[', true));
    expect(result.current).toBe('...');
  });

  it('emphasis 完成后续 commit', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '*a' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '*a*' });
    expect(result.current).toContain('*a*');
  });

  it('html 标签完成后提交', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '<span' } },
    );
    rerender({ text: '<span>x</span>' });
    expect(result.current).toContain('<span>');
  });
});
