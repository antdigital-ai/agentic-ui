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
});
