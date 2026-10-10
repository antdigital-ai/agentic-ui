import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SchemaEditorBridgeManager } from '../../schema-editor/SchemaEditorBridgeManager';
import { useSchemaEditorBridge } from '../../schema-editor/useSchemaEditorBridge';

describe('useSchemaEditorBridge', () => {
  /** 保存原始 NODE_ENV */
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    SchemaEditorBridgeManager.destroy();
  });

  afterEach(() => {
    SchemaEditorBridgeManager.destroy();
    vi.clearAllMocks();
    /** 恢复 NODE_ENV */
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('初始化', () => {
    it('应该返回初始内容', () => {
      const { result } = renderHook(() =>
        useSchemaEditorBridge('test-id', 'initial content'),
      );

      expect(result.current.content).toBe('initial content');
    });

    it('应该返回 setContent 函数', () => {
      const { result } = renderHook(() =>
        useSchemaEditorBridge('test-id', 'initial content'),
      );

      expect(typeof result.current.setContent).toBe('function');
    });

    it('空初始内容应该正常工作', () => {
      const { result } = renderHook(() => useSchemaEditorBridge('test-id', ''));

      expect(result.current.content).toBe('');
    });
  });

  describe('setContent', () => {
    it('应该更新内容', () => {
      const { result } = renderHook(() =>
        useSchemaEditorBridge('test-id', 'initial'),
      );

      act(() => {
        result.current.setContent('updated');
      });

      expect(result.current.content).toBe('updated');
    });

    it('多次更新应该正常工作', () => {
      const { result } = renderHook(() =>
        useSchemaEditorBridge('test-id', 'initial'),
      );

      act(() => {
        result.current.setContent('first update');
      });
      expect(result.current.content).toBe('first update');

      act(() => {
        result.current.setContent('second update');
      });
      expect(result.current.content).toBe('second update');
    });
  });

  describe('开发环境启用', () => {
    it('开发环境应该注册到管理器', async () => {
      process.env.NODE_ENV = 'development';

      renderHook(() => useSchemaEditorBridge('test-id', 'content'));

      const manager = SchemaEditorBridgeManager.getInstance();
      await waitFor(() => expect(manager.has('test-id')).toBe(true));
    });

    it('开发环境下 getContent 应返回 contentRef 当前值', async () => {
      process.env.NODE_ENV = 'development';

      const { result } = renderHook(() =>
        useSchemaEditorBridge('getcontent-id', 'initial'),
      );

      const manager = SchemaEditorBridgeManager.getInstance();
      await waitFor(() =>
        expect(manager.getContentById('getcontent-id')).toBe('initial'),
      );

      act(() => {
        result.current.setContent('updated');
      });
      expect(manager.getContentById('getcontent-id')).toBe('updated');
    });

    it('生产环境不应该注册到管理器', () => {
      process.env.NODE_ENV = 'production';

      renderHook(() => useSchemaEditorBridge('test-id', 'content'));

      const manager = SchemaEditorBridgeManager.getInstance();
      expect(manager.has('test-id')).toBe(false);
    });

    it('测试环境不应该注册到管理器', () => {
      process.env.NODE_ENV = 'test';

      renderHook(() => useSchemaEditorBridge('test-id', 'content'));

      const manager = SchemaEditorBridgeManager.getInstance();
      expect(manager.has('test-id')).toBe(false);
    });

    it('生产环境不创建开发桥接管理器', () => {
      process.env.NODE_ENV = 'production';
      const getInstance = vi.spyOn(SchemaEditorBridgeManager, 'getInstance');
      renderHook(() => useSchemaEditorBridge('prod-test-id', 'content'));
      expect(getInstance).not.toHaveBeenCalled();
      getInstance.mockRestore();
    });

    it('异步模块加载前卸载不会注册过期消息', async () => {
      process.env.NODE_ENV = 'development';
      const { unmount } = renderHook(() =>
        useSchemaEditorBridge('unmounted', 'content'),
      );
      unmount();
      await act(async () => {});
      expect(SchemaEditorBridgeManager.getInstance().has('unmounted')).toBe(
        false,
      );
    });
  });

  describe('id 处理', () => {
    it('id 为 undefined 时不应该注册', () => {
      process.env.NODE_ENV = 'development';

      renderHook(() => useSchemaEditorBridge(undefined, 'content'));

      const manager = SchemaEditorBridgeManager.getInstance();
      expect(manager.getRegistrySize()).toBe(0);
    });

    it('id 变化时应该重新注册', async () => {
      process.env.NODE_ENV = 'development';

      const { rerender } = renderHook(
        ({ id }: { id: string }) => useSchemaEditorBridge(id, 'content'),
        { initialProps: { id: 'id-1' } },
      );

      const manager = SchemaEditorBridgeManager.getInstance();
      await waitFor(() => expect(manager.has('id-1')).toBe(true));

      rerender({ id: 'id-2' });

      /** 旧 id 应该被注销，新 id 应该被注册 */
      expect(manager.has('id-1')).toBe(false);
      await waitFor(() => expect(manager.has('id-2')).toBe(true));
    });
  });

  describe('initialContent 变化', () => {
    it('流式更新在当次渲染返回新正文，每次更新只渲染一次', () => {
      process.env.NODE_ENV = 'production';
      const rendered: string[] = [];
      const { rerender } = renderHook(
        ({ value }: { value: string }) => {
          const bridge = useSchemaEditorBridge('stream', value);
          rendered.push(bridge.content);
          return bridge;
        },
        { initialProps: { value: 'first' } },
      );
      rendered.length = 0;
      rerender({ value: 'first token' });
      expect(rendered).toEqual(['first token']);
    });

    it('外部更新、切换消息和恢复旧值都不会复活开发工具旧草稿', () => {
      const { result, rerender } = renderHook(
        ({ id, value }: { id: string; value: string }) =>
          useSchemaEditorBridge(id, value),
        { initialProps: { id: 'first', value: 'original' } },
      );
      act(() => result.current.setContent('draft'));
      expect(result.current.content).toBe('draft');
      rerender({ id: 'first', value: 'streamed' });
      expect(result.current.content).toBe('streamed');
      rerender({ id: 'first', value: 'original' });
      expect(result.current.content).toBe('original');
      act(() => result.current.setContent('another draft'));
      rerender({ id: 'second', value: 'original' });
      expect(result.current.content).toBe('original');
    });

    it('initialContent 变化时应该更新内部状态', () => {
      const { result, rerender } = renderHook(
        ({ initialContent }: { initialContent: string }) =>
          useSchemaEditorBridge('test-id', initialContent),
        { initialProps: { initialContent: 'initial' } },
      );

      expect(result.current.content).toBe('initial');

      rerender({ initialContent: 'updated from prop' });

      expect(result.current.content).toBe('updated from prop');
    });
  });

  describe('组件卸载', () => {
    it('卸载时应该注销 handler', async () => {
      process.env.NODE_ENV = 'development';

      const { unmount } = renderHook(() =>
        useSchemaEditorBridge('test-id', 'content'),
      );

      const manager = SchemaEditorBridgeManager.getInstance();
      await waitFor(() => expect(manager.has('test-id')).toBe(true));

      unmount();

      expect(manager.has('test-id')).toBe(false);
    });
  });

  describe('多个 Hook 实例', () => {
    it('多个实例应该各自独立注册', async () => {
      process.env.NODE_ENV = 'development';

      renderHook(() => useSchemaEditorBridge('id-1', 'content 1'));
      renderHook(() => useSchemaEditorBridge('id-2', 'content 2'));
      renderHook(() => useSchemaEditorBridge('id-3', 'content 3'));

      const manager = SchemaEditorBridgeManager.getInstance();
      await waitFor(() => expect(manager.getRegistrySize()).toBe(3));
      expect(manager.has('id-1')).toBe(true);
      expect(manager.has('id-2')).toBe(true);
      expect(manager.has('id-3')).toBe(true);
    });

    it('部分实例卸载不应该影响其他实例', async () => {
      process.env.NODE_ENV = 'development';

      const hook1 = renderHook(() =>
        useSchemaEditorBridge('id-1', 'content 1'),
      );
      const hook2 = renderHook(() =>
        useSchemaEditorBridge('id-2', 'content 2'),
      );

      const manager = SchemaEditorBridgeManager.getInstance();
      await waitFor(() => expect(manager.getRegistrySize()).toBe(2));

      hook1.unmount();

      expect(manager.has('id-1')).toBe(false);
      expect(manager.has('id-2')).toBe(true);
      expect(manager.getRegistrySize()).toBe(1);

      // 清理 hook2
      hook2.unmount();
      expect(manager.getRegistrySize()).toBe(0);
    });
  });

  describe('边界情况', () => {
    it('特殊字符 id 应该正常工作', async () => {
      process.env.NODE_ENV = 'development';

      const specialIds = [
        'id-with-dash',
        'id_with_underscore',
        'id.with.dot',
        'id:with:colon',
        '中文id',
        '123-numeric-start',
      ];

      for (const id of specialIds) {
        const { unmount } = renderHook(() =>
          useSchemaEditorBridge(id, 'content'),
        );

        const manager = SchemaEditorBridgeManager.getInstance();
        await waitFor(() => expect(manager.has(id)).toBe(true));

        unmount();
      }
    });
  });
});
