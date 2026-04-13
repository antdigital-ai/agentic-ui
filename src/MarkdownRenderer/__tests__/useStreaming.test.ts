import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useStreaming } from '../useStreaming';

interface UseStreamingHookProps {
  input: string;
  enabled: boolean;
}

describe('useStreaming', () => {
  it('流式输入未形成完整 token 时应返回占位符', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '[Example',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('token 完整后应返回可解析内容', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '[Example',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });

    rerender({
      input: '[Example](https://example.com)',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toBe('[Example](https://example.com)');
    });
  });

  it('已有可提交内容时不应被占位符覆盖', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: 'prefix [Example',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('prefix ');
    });
  });

  it('表格流式输入时，首行未闭合前不应提前提交 header', async () => {
    const tablePrefix = '| Name |\n| --- |\n| Al';
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: tablePrefix,
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('表格首行闭合后应一次性提交 header 与首行', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| Name |\n| --- |\n| Al',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });

    rerender({
      input: '| Name |\n| --- |\n| Alice |',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toBe('| Name |\n| --- |\n| Alice |');
    });
  });

  it('enabled 从 false 恢复为 true 时应重置缓存，正确处理新一轮流式', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: 'Hello World',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('Hello World');
    });

    rerender({ input: 'Hello World', enabled: false });

    await waitFor(() => {
      expect(result.current).toBe('Hello World');
    });

    rerender({ input: 'New', enabled: true });

    await waitFor(() => {
      expect(result.current).toBe('New');
    });

    rerender({ input: 'New content', enabled: true });

    await waitFor(() => {
      expect(result.current).toBe('New content');
    });
  });

  it('disabled 时应直接透传 input', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '[incomplete',
          enabled: false,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('[incomplete');
    });
  });

  it('非 string 输入时应输出空字符串', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: 123 as any,
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('');
    });
  });

  it('空字符串输入时应输出空字符串', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('');
    });
  });

  it('image token 未闭合时应缓存', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '![alt text',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('image token 闭合后应提交', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '![alt',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });

    rerender({
      input: '![alt](img.png)',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toBe('![alt](img.png)');
    });
  });

  it('HTML token 未闭合时应缓存', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '<div class="test"',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('HTML token 闭合后应提交', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '<div',
          enabled: true,
        },
      },
    );

    rerender({
      input: '<div>hello</div>',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toBe('<div>hello</div>');
    });
  });

  it('emphasis token 未闭合时应缓存', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '*bold text',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('emphasis token 闭合后应提交', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '*bold',
          enabled: true,
        },
      },
    );

    rerender({
      input: '*bold*',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toBe('*bold*');
    });
  });

  it('inline-code token 未闭合时应缓存', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '`code',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('inline-code token 闭合后应提交', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '`code',
          enabled: true,
        },
      },
    );

    rerender({
      input: '`code`',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toBe('`code`');
    });
  });

  it('code block (fenced) 闭合后加新内容应提交', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '```js\nconst x = 1;\n```',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });

    rerender({
      input: '```js\nconst x = 1;\n```\nafter',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toBe('```js\nconst x = 1;\n```\nafter');
    });
  });

  it('code block 打开但未关闭时应缓存', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '```\nsome code',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('list token 加 inline-code 应切换并提交 list 前缀', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '- `code',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('- ');
    });
  });

  it('cache prefix mismatch should reset cache', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: 'hello',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('hello');
    });

    rerender({
      input: 'completely different',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toBe('completely different');
    });
  });

  it('table with header-only followed by non-table row should commit', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| Name |\n| --- |\nsome text',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('| Name |\n| --- |\nsome text');
    });
  });

  it('table header line only (1 line) should stay pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| Name |',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('table with double newline should commit', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| Name |\n\nsome text',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('| Name |\n\nsome text');
    });
  });

  it('table with 2 lines (header + separator) should stay pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| A |\n| --- |',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('tilde fenced code block commits chars before fence detection', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '~~~\ncode',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('~~');
    });
  });

  it('underscore emphasis should be recognized', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '_italic text',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('multiple backtick inline-code should be recognized', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '``',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('closing HTML tag should be recognized', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '</',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('table with less than 3 lines should stay pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| A |\n| --- |',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('plain text without special tokens should commit directly', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: 'hello world',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('hello world');
    });
  });

  it('link with bracket only phase should stay pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '[text',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('image with partial paren should remain pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '![alt](partial',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('footnote link starting with [^ should not be treated as link', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '[^1]',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('[^1]');
    });
  });

  it('list item with just marker should stay pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '- ',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('table first data row not starting with pipe should commit', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| H |\n| --- |\nplain text',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('| H |\n| --- |\nplain text');
    });
  });

  it('pipe-only cell without closing pipe should remain pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| single',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('table data row with insufficient pipe count should remain pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| A | B |\n| --- | --- |\n| da',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('table data row not ending with pipe should remain pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| A |\n| --- |\n| data',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('table with mismatched data columns should remain pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| A | B |\n| --- | --- |\n| only one |',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('table header not starting with pipe is not a table', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: 'not a table',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('not a table');
    });
  });

  it('table with separator not matching header col count commits', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| A | B |\n| --- |\n| data |',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toContain('| A | B |');
    });
  });

  it('table with invalid separator cells commits', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| A |\n| abc |\n| data |',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toContain('| A |');
    });
  });

  it('table with third row not starting with pipe commits', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| A |\n| --- |\nnot a table row',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toContain('| A |');
    });
  });

  it('table with empty third row stays pending', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| A |\n| --- |\n',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('table with double newline commits immediately', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| A |\n\n| B |',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toContain('| A |');
    });
  });

  it('list with inline code commits list prefix', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '- `incomplete code',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toContain('- ');
    });
  });

  it('parsePipeRowCells returns null for line not ending with pipe', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '| incomplete',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });
  });

  it('table with header row having empty cells parsed', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '|||\n| --- | --- |\n| a | b |',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toContain('||');
    });
  });

  it('non-prefix reset when input changes non-monotonically', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: 'hello world',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('hello world');
    });

    rerender({
      input: 'different content',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toBe('different content');
    });
  });

  it('code block with 4 backticks', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: '````\ncode here',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('...');
    });

    rerender({
      input: '````\ncode here\n````\nafter code',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toContain('````');
    });
  });

  it('handles empty input resetting cache', async () => {
    const { result, rerender } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: 'some text',
          enabled: true,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('some text');
    });

    rerender({
      input: '',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current).toBe('');
    });
  });
});
