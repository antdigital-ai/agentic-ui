import { HistoryDataType } from '@ant-design/agentic-ui';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHistory } from '../../src/History/hooks/useHistory';

describe('useHistory Hook', () => {
  const mockHistoryData: HistoryDataType[] = [
    {
      id: '1',
      sessionId: 'session1',
      sessionTitle: '测试会话1',
      gmtCreate: Date.now() - 1000 * 60 * 60,
      gmtLastConverse: Date.now() - 1000 * 30 * 60,
      isFavorite: false,
    },
    {
      id: '2',
      sessionId: 'session2',
      sessionTitle: '测试会话2',
      gmtCreate: Date.now() - 1000 * 60 * 60 * 24,
      gmtLastConverse: Date.now() - 1000 * 60 * 60 * 2,
      isFavorite: true,
    },
  ];

  const defaultProps = {
    agentId: 'test-agent',
    sessionId: 'current-session',
    request: vi.fn().mockResolvedValue(mockHistoryData),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础状态管理', () => {
    it('应该正确初始化状态', () => {
      const { result } = renderHook(() => useHistory(defaultProps));

      expect(result.current.open).toBe(false);
      expect(result.current.searchKeyword).toBe('');
      expect(result.current.selectedIds).toEqual(['current-session']);
      expect(result.current.filteredList).toEqual([]);
    });

    it('应该加载历史数据', async () => {
      const { result } = renderHook(() => useHistory(defaultProps));

      await act(async () => {
        await result.current.loadHistory();
      });

      expect(defaultProps.request).toHaveBeenCalledWith({
        agentId: 'test-agent',
      });
      expect(result.current.filteredList).toEqual(mockHistoryData);
    });

    it('应该在 sessionId 变化时重新加载数据', async () => {
      const { rerender } = renderHook((props) => useHistory(props), {
        initialProps: defaultProps,
      });

      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });
      });

      expect(defaultProps.request).toHaveBeenCalledTimes(1);

      // 更新 sessionId
      rerender({ ...defaultProps, sessionId: 'new-session' });

      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });
      });

      expect(defaultProps.request).toHaveBeenCalledTimes(2);
    });
  });

  describe('搜索功能', () => {
    it('应该处理搜索', async () => {
      const { result } = renderHook(() => useHistory(defaultProps));

      await act(async () => {
        await result.current.loadHistory();
      });

      act(() => {
        result.current.handleSearch('测试');
      });

      expect(result.current.searchKeyword).toBe('测试');
    });

    it('应该处理大小写不敏感的搜索', async () => {
      const { result } = renderHook(() => useHistory(defaultProps));

      await act(async () => {
        await result.current.loadHistory();
      });

      act(() => {
        result.current.handleSearch('TEST');
      });

      expect(result.current.searchKeyword).toBe('TEST');
    });
  });

  describe('收藏功能', () => {
    it('应该处理收藏操作', async () => {
      const { result } = renderHook(() => useHistory(defaultProps));

      await act(async () => {
        await result.current.loadHistory();
      });

      // 测试收藏功能是否可用
      expect(typeof result.current.handleFavorite).toBe('function');
    });

    it('应调用 onFavorite 并更新本地列表的 isFavorite', async () => {
      const onFavorite = vi.fn().mockResolvedValue(undefined);
      const props = {
        ...defaultProps,
        agent: { onFavorite },
      };
      const { result } = renderHook(() => useHistory(props));

      await act(async () => {
        await result.current.loadHistory();
      });

      expect(result.current.filteredList).toHaveLength(2);

      await act(async () => {
        await result.current.handleFavorite('session1', true);
      });

      expect(onFavorite).toHaveBeenCalledWith('session1', true);
      const session1 = result.current.filteredList.find(
        (item) => item.sessionId === 'session1',
      );
      expect(session1?.isFavorite).toBe(true);
    });
  });

  describe('多选功能', () => {
    it('应该处理选择操作', async () => {
      const { result } = renderHook(() => useHistory(defaultProps));

      await act(async () => {
        await result.current.loadHistory();
      });

      act(() => {
        result.current.handleSelectionChange('session1', true);
      });

      expect(result.current.selectedIds).toContain('session1');
    });

    it('应该处理取消选择操作', async () => {
      const { result } = renderHook(() => useHistory(defaultProps));

      await act(async () => {
        await result.current.loadHistory();
      });

      act(() => {
        result.current.handleSelectionChange('session1', true);
      });

      expect(result.current.selectedIds).toContain('session1');

      act(() => {
        result.current.handleSelectionChange('session1', false);
      });

      expect(result.current.selectedIds).not.toContain('session1');
    });
  });

  describe('菜单状态', () => {
    it('应该控制菜单开关状态', () => {
      const { result } = renderHook(() => useHistory(defaultProps));

      expect(result.current.open).toBe(false);

      act(() => {
        result.current.setOpen(true);
      });

      expect(result.current.open).toBe(true);
    });
  });

  describe('Agent 模式回调', () => {
    it('应该处理加载更多', () => {
      const onLoadMore = vi.fn();
      const props = {
        ...defaultProps,
        agent: { onLoadMore },
      };

      const { result } = renderHook(() => useHistory(props));

      act(() => {
        result.current.handleLoadMore();
      });

      expect(onLoadMore).toHaveBeenCalled();
    });

    it('应该处理新对话', () => {
      const onNewChat = vi.fn();
      const props = {
        ...defaultProps,
        agent: { onNewChat },
      };

      const { result } = renderHook(() => useHistory(props));

      act(() => {
        result.current.handleNewChat();
      });

      expect(onNewChat).toHaveBeenCalled();
    });
  });

  describe('回调函数', () => {
    it('应该调用 onInit 回调', async () => {
      const onInit = vi.fn();
      const props = {
        ...defaultProps,
        onInit,
      };

      renderHook(() => useHistory(props));

      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });
      });

      expect(onInit).toHaveBeenCalled();
    });

    it('应该调用 onShow 回调', async () => {
      const onShow = vi.fn();
      const props = {
        ...defaultProps,
        onShow,
      };

      const { result } = renderHook(() => useHistory(props));

      act(() => {
        result.current.setOpen(true);
      });

      expect(onShow).toHaveBeenCalled();
    });
  });

  describe('性能优化', () => {
    it('应该保持函数引用的稳定性', () => {
      const { result, rerender } = renderHook(() => useHistory(defaultProps));

      const firstHandleSearch = result.current.handleSearch;
      const firstHandleFavorite = result.current.handleFavorite;

      rerender(defaultProps);

      expect(result.current.handleSearch).toBe(firstHandleSearch);
      expect(result.current.handleFavorite).toBe(firstHandleFavorite);
    });
  });
});
