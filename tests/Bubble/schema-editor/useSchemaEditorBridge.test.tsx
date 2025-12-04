import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useSchemaEditorBridge } from '../../../src/Bubble/schema-editor/useSchemaEditorBridge';
import { SchemaEditorBridgeManager } from '../../../src/Bubble/schema-editor/SchemaEditorBridgeManager';

/** Mock @schema-editor/host-sdk */
vi.mock('@schema-editor/host-sdk/core', () => ({
  createSchemaEditorBridge: vi.fn(() => vi.fn()),
}));

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
    it('开发环境应该注册到管理器', () => {
      process.env.NODE_ENV = 'development';

      renderHook(() => useSchemaEditorBridge('test-id', 'content'));

      const manager = SchemaEditorBridgeManager.getInstance();
      expect(manager.has('test-id')).toBe(true);
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

    it('生产环境应该注销已注册的 handler', () => {
      /** 模拟：先在开发环境注册 handler */
      const manager = SchemaEditorBridgeManager.getInstance();
      manager.setEnabled(true);
      manager.register('prod-test-id', {
        getContent: () => 'content',
        setContent: () => {},
      });
      expect(manager.has('prod-test-id')).toBe(true);

      /** 切换到生产环境并执行 hook */
      process.env.NODE_ENV = 'production';

      /** 使用 rerender 触发 useEffect */
      const { rerender } = renderHook(
        ({ id }: { id: string }) => useSchemaEditorBridge(id, 'content'),
        { initialProps: { id: 'prod-test-id' } },
      );

      /** 触发 effect */
      rerender({ id: 'prod-test-id' });

      /** 应该注销已存在的 handler */
      expect(manager.has('prod-test-id')).toBe(false);
    });

    it('生产环境 effect 应该执行注销逻辑', () => {
      /** 先手动注册一个 handler */
      const manager = SchemaEditorBridgeManager.getInstance();
      manager.setEnabled(true);
      manager.register('unregister-test', {
        getContent: () => 'test',
        setContent: () => {},
      });

      /** 确认已注册 */
      expect(manager.has('unregister-test')).toBe(true);

      /** 在生产环境运行 hook */
      process.env.NODE_ENV = 'production';

      renderHook(() => useSchemaEditorBridge('unregister-test', 'content'));

      /** 验证被注销 */
      expect(manager.has('unregister-test')).toBe(false);
    });
  });

  describe('id 处理', () => {
    it('id 为 undefined 时不应该注册', () => {
      process.env.NODE_ENV = 'development';

      renderHook(() => useSchemaEditorBridge(undefined, 'content'));

      const manager = SchemaEditorBridgeManager.getInstance();
      expect(manager.getRegistrySize()).toBe(0);
    });

    it('id 变化时应该重新注册', () => {
      process.env.NODE_ENV = 'development';

      const { rerender } = renderHook(
        ({ id }: { id: string }) => useSchemaEditorBridge(id, 'content'),
        { initialProps: { id: 'id-1' } },
      );

      const manager = SchemaEditorBridgeManager.getInstance();
      expect(manager.has('id-1')).toBe(true);

      rerender({ id: 'id-2' });

      /** 旧 id 应该被注销，新 id 应该被注册 */
      expect(manager.has('id-1')).toBe(false);
      expect(manager.has('id-2')).toBe(true);
    });
  });

  describe('initialContent 变化', () => {
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
    it('卸载时应该注销 handler', () => {
      process.env.NODE_ENV = 'development';

      const { unmount } = renderHook(() =>
        useSchemaEditorBridge('test-id', 'content'),
      );

      const manager = SchemaEditorBridgeManager.getInstance();
      expect(manager.has('test-id')).toBe(true);

      unmount();

      expect(manager.has('test-id')).toBe(false);
    });
  });

  describe('多个 Hook 实例', () => {
    it('多个实例应该各自独立注册', () => {
      process.env.NODE_ENV = 'development';

      renderHook(() => useSchemaEditorBridge('id-1', 'content 1'));
      renderHook(() => useSchemaEditorBridge('id-2', 'content 2'));
      renderHook(() => useSchemaEditorBridge('id-3', 'content 3'));

      const manager = SchemaEditorBridgeManager.getInstance();
      expect(manager.getRegistrySize()).toBe(3);
      expect(manager.has('id-1')).toBe(true);
      expect(manager.has('id-2')).toBe(true);
      expect(manager.has('id-3')).toBe(true);
    });

    it('部分实例卸载不应该影响其他实例', () => {
      process.env.NODE_ENV = 'development';

      const hook1 = renderHook(() =>
        useSchemaEditorBridge('id-1', 'content 1'),
      );
      const hook2 = renderHook(() =>
        useSchemaEditorBridge('id-2', 'content 2'),
      );

      const manager = SchemaEditorBridgeManager.getInstance();
      expect(manager.getRegistrySize()).toBe(2);

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
    it('特殊字符 id 应该正常工作', () => {
      process.env.NODE_ENV = 'development';

      const specialIds = [
        'id-with-dash',
        'id_with_underscore',
        'id.with.dot',
        'id:with:colon',
        '中文id',
        '123-numeric-start',
      ];

      specialIds.forEach((id) => {
        const { unmount } = renderHook(() =>
          useSchemaEditorBridge(id, 'content'),
        );

        const manager = SchemaEditorBridgeManager.getInstance();
        expect(manager.has(id)).toBe(true);

        unmount();
      });
    });
  });
});
