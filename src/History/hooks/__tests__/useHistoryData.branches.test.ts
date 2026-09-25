/**
 * useHistoryData 残留：浅比较相等跳过 setState、字段差异、request 缺失、失败回退。
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHistoryData } from '../useHistoryData';

describe('useHistoryData residual branches', () => {
  it('无 request 时 loadHistory 直接返回', async () => {
    const { result } = renderHook(() => useHistoryData({ agentId: 'a' } as any));
    await act(async () => {
      await result.current.loadHistory();
    });
    expect(result.current.chatList).toEqual([]);
  });

  it('相同视觉字段时保留引用；字段差异时更新', async () => {
    const list = [
      {
        sessionId: 's1',
        gmtCreate: 1,
        isFavorite: false,
        sessionTitle: 'T',
        status: 'done',
      },
    ];
    const request = vi
      .fn()
      .mockResolvedValueOnce(list)
      .mockResolvedValueOnce([...list])
      .mockResolvedValueOnce([
        { ...list[0], sessionTitle: 'T2', status: 'running' },
      ]);

    const { result } = renderHook(() =>
      useHistoryData({ agentId: 'a', request } as any),
    );

    await act(async () => {
      await result.current.loadHistory();
    });
    const first = result.current.chatList;

    await act(async () => {
      await result.current.loadHistory();
    });
    expect(result.current.chatList).toBe(first);

    await act(async () => {
      await result.current.loadHistory();
    });
    expect(result.current.chatList[0].sessionTitle).toBe('T2');
  });

  it('request 非数组回退 []；失败清空且 catch', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const request = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() =>
      useHistoryData({ agentId: 'a', request } as any),
    );

    await act(async () => {
      await result.current.loadHistory();
    });
    expect(result.current.chatList).toEqual([]);

    await act(async () => {
      await result.current.loadHistory().catch(() => undefined);
    });
    await waitFor(() => expect(errSpy).toHaveBeenCalled());
    errSpy.mockRestore();
  });

  it('handleFavorite 更新本地 isFavorite；actionRef.reload', async () => {
    const onFavorite = vi.fn(async () => undefined);
    const actionRef = { current: null as any };
    const request = vi.fn().mockResolvedValue([
      {
        sessionId: 's1',
        gmtCreate: 1,
        isFavorite: false,
        sessionTitle: 'T',
        status: 'done',
      },
    ]);

    const { result } = renderHook(() =>
      useHistoryData({
        agentId: 'a',
        request,
        actionRef,
        agent: { onFavorite },
      } as any),
    );

    await act(async () => {
      await result.current.loadHistory();
    });
    await act(async () => {
      await result.current.handleFavorite('s1', true);
    });
    expect(result.current.chatList[0].isFavorite).toBe(true);
    expect(typeof actionRef.current?.reload).toBe('function');
  });
});
