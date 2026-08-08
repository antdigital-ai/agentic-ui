/**
 * useStreaming 残留：表格管道不足、emphasis 下划线、html </、列表 *+、围栏行态。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming residual branches', () => {
  it('表格首行数据管道数不足时继续占位', () => {
    const md = '| A | B |\n| --- | --- |\n| 1';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current).toBe('...');
  });

  it('表格首行数据未以 | 结尾时继续占位', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 | 2';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current).toBe('...');
  });

  it('表格单元格数与表头不一致时继续占位', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 |';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current).toBe('...');
  });

  it('空表头管道行不视为表格', () => {
    const md = '||\n| --- |\n| 1 |';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('下划线 emphasis 未完成占位；完成后提交', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '_a' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '_a_' });
    expect(result.current).toContain('_a_');
  });

  it('html 闭合标签前缀 </ 暂缓', () => {
    const { result } = renderHook(() => useStreaming('</', true));
    expect(result.current).toBe('...');
  });

  it('+ 列表标记 + emphasis 前缀 commit', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '+ *' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '+ *x*' });
    expect(result.current).toContain('*x*');
  });

  it('* 列表仅空白时直接输出', () => {
    const { result } = renderHook(() => useStreaming('*  ', true));
    expect(result.current).toBe('*  ');
  });

  it('双反引号 inline-code 未完成占位', () => {
    const { result } = renderHook(() => useStreaming('``', true));
    expect(result.current).toBe('...');
  });

  it('图片半开括号暂缓', () => {
    const { result } = renderHook(() =>
      useStreaming('![alt](https://x', true),
    );
    expect(result.current).toBe('...');
  });

  it('链接半开括号直接输出', () => {
    const { result } = renderHook(() =>
      useStreaming('[lab](https://x', true),
    );
    expect(result.current).toBe('[lab](https://x');
  });

  it('脚注式 [^ 不走 link token', () => {
    const { result } = renderHook(() => useStreaming('[^note', true));
    expect(result.current).not.toBe('...');
  });

  it('CRLF 表格仍可按行解析', () => {
    const md = '| A |\r\n| --- |\r\n| 1 |';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current).toBe(md);
  });

  it('三重星号 emphasis 未完成', () => {
    const { result } = renderHook(() => useStreaming('***bold', true));
    expect(result.current).toBe('...');
  });
});
