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

  it('非流式模式应直接透传输入', async () => {
    const { result } = renderHook(
      ({ input, enabled }: UseStreamingHookProps) =>
        useStreaming(input, enabled),
      {
        initialProps: {
          input: 'Hello [incomplete',
          enabled: false,
        },
      },
    );

    await waitFor(() => {
      expect(result.current).toBe('Hello [incomplete');
    });
  });
});
