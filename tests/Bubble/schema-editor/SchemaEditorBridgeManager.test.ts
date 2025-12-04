import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  SchemaEditorBridgeManager,
  BubbleHandler,
} from '../../../src/Bubble/schema-editor/SchemaEditorBridgeManager';
import { createSchemaEditorBridge } from '@schema-editor/host-sdk/core';

/** Mock @schema-editor/host-sdk */
vi.mock('@schema-editor/host-sdk/core', () => ({
  createSchemaEditorBridge: vi.fn(() => {
    return vi.fn(); // 返回 cleanup 函数
  }),
}));

describe('SchemaEditorBridgeManager', () => {
  beforeEach(() => {
    /** 每个测试前销毁单例，确保测试隔离 */
    SchemaEditorBridgeManager.destroy();
  });

  afterEach(() => {
    /** 清理 */
    SchemaEditorBridgeManager.destroy();
    vi.clearAllMocks();
  });

  describe('单例模式', () => {
    it('getInstance 应该返回同一个实例', () => {
      const instance1 = SchemaEditorBridgeManager.getInstance();
      const instance2 = SchemaEditorBridgeManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('destroy 后 getInstance 应该返回新实例', () => {
      const instance1 = SchemaEditorBridgeManager.getInstance();
      SchemaEditorBridgeManager.destroy();
      const instance2 = SchemaEditorBridgeManager.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('register / unregister', () => {
    it('应该正确注册 handler', () => {
      const manager = SchemaEditorBridgeManager.getInstance();
      const handler: BubbleHandler = {
        getContent: () => 'test content',
        setContent: vi.fn(),
      };

      manager.register('test-id', handler);

      expect(manager.has('test-id')).toBe(true);
      expect(manager.getRegistrySize()).toBe(1);
    });

    it('应该正确注销 handler', () => {
      const manager = SchemaEditorBridgeManager.getInstance();
      const handler: BubbleHandler = {
        getContent: () => 'test content',
        setContent: vi.fn(),
      };

      manager.register('test-id', handler);
      manager.unregister('test-id');

      expect(manager.has('test-id')).toBe(false);
      expect(manager.getRegistrySize()).toBe(0);
    });

    it('应该支持多个 handler 注册', () => {
      const manager = SchemaEditorBridgeManager.getInstance();

      manager.register('id-1', {
        getContent: () => 'content 1',
        setContent: vi.fn(),
      });
      manager.register('id-2', {
        getContent: () => 'content 2',
        setContent: vi.fn(),
      });
      manager.register('id-3', {
        getContent: () => 'content 3',
        setContent: vi.fn(),
      });

      expect(manager.getRegistrySize()).toBe(3);
      expect(manager.has('id-1')).toBe(true);
      expect(manager.has('id-2')).toBe(true);
      expect(manager.has('id-3')).toBe(true);
    });

    it('相同 id 注册应该覆盖旧 handler', () => {
      const manager = SchemaEditorBridgeManager.getInstance();
      const handler1: BubbleHandler = {
        getContent: () => 'content 1',
        setContent: vi.fn(),
      };
      const handler2: BubbleHandler = {
        getContent: () => 'content 2',
        setContent: vi.fn(),
      };

      manager.register('test-id', handler1);
      manager.register('test-id', handler2);

      expect(manager.getRegistrySize()).toBe(1);
    });

    it('注销不存在的 id 不应该抛出错误', () => {
      const manager = SchemaEditorBridgeManager.getInstance();

      expect(() => {
        manager.unregister('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('setEnabled / isEnabled', () => {
    it('初始状态应该是禁用的', () => {
      const manager = SchemaEditorBridgeManager.getInstance();

      expect(manager.isEnabled()).toBe(false);
    });

    it('应该正确设置启用状态', () => {
      const manager = SchemaEditorBridgeManager.getInstance();

      manager.setEnabled(true);
      expect(manager.isEnabled()).toBe(true);

      manager.setEnabled(false);
      expect(manager.isEnabled()).toBe(false);
    });
  });

  describe('destroy', () => {
    it('destroy 应该清理所有注册的 handler', () => {
      const manager = SchemaEditorBridgeManager.getInstance();

      manager.register('id-1', {
        getContent: () => 'content 1',
        setContent: vi.fn(),
      });
      manager.register('id-2', {
        getContent: () => 'content 2',
        setContent: vi.fn(),
      });

      SchemaEditorBridgeManager.destroy();

      const newManager = SchemaEditorBridgeManager.getInstance();
      expect(newManager.getRegistrySize()).toBe(0);
    });

    it('重复调用 destroy 不应该抛出错误', () => {
      expect(() => {
        SchemaEditorBridgeManager.destroy();
        SchemaEditorBridgeManager.destroy();
        SchemaEditorBridgeManager.destroy();
      }).not.toThrow();
    });
  });

  describe('has', () => {
    it('应该正确检查 id 是否存在', () => {
      const manager = SchemaEditorBridgeManager.getInstance();

      expect(manager.has('test-id')).toBe(false);

      manager.register('test-id', {
        getContent: () => 'content',
        setContent: vi.fn(),
      });

      expect(manager.has('test-id')).toBe(true);
      expect(manager.has('other-id')).toBe(false);
    });
  });

  describe('getRegistrySize', () => {
    it('应该正确返回注册数量', () => {
      const manager = SchemaEditorBridgeManager.getInstance();

      expect(manager.getRegistrySize()).toBe(0);

      manager.register('id-1', {
        getContent: () => '',
        setContent: vi.fn(),
      });
      expect(manager.getRegistrySize()).toBe(1);

      manager.register('id-2', {
        getContent: () => '',
        setContent: vi.fn(),
      });
      expect(manager.getRegistrySize()).toBe(2);

      manager.unregister('id-1');
      expect(manager.getRegistrySize()).toBe(1);
    });
  });

  describe('Bridge 启动/停止逻辑', () => {
    it('启用且有注册时应该启动 bridge', async () => {
      const { createSchemaEditorBridge } = await import(
        '@schema-editor/host-sdk/core'
      );
      const manager = SchemaEditorBridgeManager.getInstance();

      manager.setEnabled(true);
      manager.register('test-id', {
        getContent: () => 'content',
        setContent: vi.fn(),
      });

      expect(createSchemaEditorBridge).toHaveBeenCalled();
    });

    it('禁用时不应该启动 bridge', async () => {
      const { createSchemaEditorBridge } = await import(
        '@schema-editor/host-sdk/core'
      );
      vi.mocked(createSchemaEditorBridge).mockClear();

      const manager = SchemaEditorBridgeManager.getInstance();

      manager.setEnabled(false);
      manager.register('test-id', {
        getContent: () => 'content',
        setContent: vi.fn(),
      });

      expect(createSchemaEditorBridge).not.toHaveBeenCalled();
    });

    it('所有 handler 注销后应该停止 bridge', async () => {
      const mockCleanup = vi.fn();
      const { createSchemaEditorBridge } = await import(
        '@schema-editor/host-sdk/core'
      );
      vi.mocked(createSchemaEditorBridge).mockReturnValue(mockCleanup);

      const manager = SchemaEditorBridgeManager.getInstance();

      manager.setEnabled(true);
      manager.register('test-id', {
        getContent: () => 'content',
        setContent: vi.fn(),
      });

      /** 注销后应该调用 cleanup */
      manager.unregister('test-id');
      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('renderPreview 配置', () => {
    it('注册时应该能提供自定义 renderPreview', () => {
      const manager = SchemaEditorBridgeManager.getInstance();
      const customRenderPreview = vi.fn();

      manager.register('test-id', {
        getContent: () => 'content',
        setContent: vi.fn(),
        renderPreview: customRenderPreview,
      });

      expect(manager.has('test-id')).toBe(true);
    });
  });

  describe('Bridge 回调函数', () => {
    /**
     * 辅助函数：从 mock 调用中获取 bridge 配置
     */
    const getBridgeConfig = () => {
      const mockCalls = vi.mocked(createSchemaEditorBridge).mock.calls;
      if (mockCalls.length === 0) return null;
      return mockCalls[mockCalls.length - 1][0] as {
        getSchema?: (params: string) => any;
        updateSchema?: (schema: any, params: string) => boolean;
        renderPreview?: (schema: any, containerId: string) => (() => void) | void;
      };
    };

    describe('getSchema 回调', () => {
      it('应该返回已注册 handler 的内容', () => {
        const manager = SchemaEditorBridgeManager.getInstance();
        manager.setEnabled(true);
        manager.register('test-id', {
          getContent: () => 'test content',
          setContent: vi.fn(),
        });

        const config = getBridgeConfig();
        expect(config).not.toBeNull();
        const result = config?.getSchema?.('test-id');
        expect(result).toBe('test content');
      });

      it('应该返回 undefined 当 handler 不存在时', () => {
        const manager = SchemaEditorBridgeManager.getInstance();
        manager.setEnabled(true);
        manager.register('test-id', {
          getContent: () => 'content',
          setContent: vi.fn(),
        });

        const config = getBridgeConfig();
        expect(config).not.toBeNull();
        const result = config?.getSchema?.('non-existent-id');
        expect(result).toBeUndefined();
      });
    });

    describe('updateSchema 回调', () => {
      it('应该正确更新字符串类型的 schema', () => {
        const setContentMock = vi.fn();
        const manager = SchemaEditorBridgeManager.getInstance();
        manager.setEnabled(true);
        manager.register('test-id', {
          getContent: () => 'old content',
          setContent: setContentMock,
        });

        const config = getBridgeConfig();
        expect(config).not.toBeNull();
        const result = config?.updateSchema?.('new content', 'test-id');
        expect(result).toBe(true);
        expect(setContentMock).toHaveBeenCalledWith('new content');
      });

      it('应该正确更新对象类型的 schema', () => {
        const setContentMock = vi.fn();
        const manager = SchemaEditorBridgeManager.getInstance();
        manager.setEnabled(true);
        manager.register('test-id', {
          getContent: () => 'old content',
          setContent: setContentMock,
        });

        const config = getBridgeConfig();
        expect(config).not.toBeNull();
        const schemaObject = { key: 'value', nested: { data: 123 } };
        const result = config?.updateSchema?.(schemaObject, 'test-id');
        expect(result).toBe(true);
        expect(setContentMock).toHaveBeenCalledWith(
          JSON.stringify(schemaObject, null, 2),
        );
      });

      it('应该返回 false 当 handler 不存在时', () => {
        const manager = SchemaEditorBridgeManager.getInstance();
        manager.setEnabled(true);
        manager.register('test-id', {
          getContent: () => 'content',
          setContent: vi.fn(),
        });

        const config = getBridgeConfig();
        expect(config).not.toBeNull();
        const result = config?.updateSchema?.(
          'new content',
          'non-existent-id',
        );
        expect(result).toBe(false);
      });

      it('应该捕获错误并返回 false', () => {
        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});
        const setContentMock = vi.fn().mockImplementation(() => {
          throw new Error('Test error');
        });
        const manager = SchemaEditorBridgeManager.getInstance();
        manager.setEnabled(true);
        manager.register('test-id', {
          getContent: () => 'old content',
          setContent: setContentMock,
        });

        const config = getBridgeConfig();
        expect(config).not.toBeNull();
        const result = config?.updateSchema?.('new content', 'test-id');
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe('renderPreview 回调', () => {
      it('应该调用自定义 renderPreview 当存在时', () => {
        const customRenderPreview = vi.fn().mockReturnValue(() => {});
        const manager = SchemaEditorBridgeManager.getInstance();
        manager.setEnabled(true);
        manager.register('test-id', {
          getContent: () => 'content',
          setContent: vi.fn(),
          renderPreview: customRenderPreview,
        });

        const config = getBridgeConfig();
        /** 先调用 getSchema 设置 currentEditingId */
        config?.getSchema?.('test-id');

        expect(config).not.toBeNull();
        config?.renderPreview?.('schema content', 'container-id');
        expect(customRenderPreview).toHaveBeenCalledWith(
          'schema content',
          'container-id',
        );
      });

      it('应该使用默认预览当没有自定义 renderPreview 时', () => {
        /** 创建 mock DOM 容器 */
        const container = document.createElement('div');
        container.id = 'preview-container';
        document.body.appendChild(container);

        const manager = SchemaEditorBridgeManager.getInstance();
        manager.setEnabled(true);
        manager.register('test-id', {
          getContent: () => 'content',
          setContent: vi.fn(),
          /** 没有 renderPreview */
        });

        const config = getBridgeConfig();
        /** 先调用 getSchema 设置 currentEditingId */
        config?.getSchema?.('test-id');

        expect(config).not.toBeNull();
        const cleanup = config?.renderPreview?.(
          '# Test Markdown',
          'preview-container',
        );
        expect(typeof cleanup).toBe('function');

        /** 清理 */
        if (typeof cleanup === 'function') {
          cleanup();
        }
        document.body.removeChild(container);
      });

      it('默认预览当容器不存在时应该返回 undefined', () => {
        const manager = SchemaEditorBridgeManager.getInstance();
        manager.setEnabled(true);
        manager.register('test-id', {
          getContent: () => 'content',
          setContent: vi.fn(),
        });

        const config = getBridgeConfig();
        /** 先调用 getSchema 设置 currentEditingId */
        config?.getSchema?.('test-id');

        expect(config).not.toBeNull();
        const result = config?.renderPreview?.(
          '# Test',
          'non-existent-container',
        );
        expect(result).toBeUndefined();
      });

      it('默认预览应该处理对象类型的 schema', () => {
        const container = document.createElement('div');
        container.id = 'preview-container-obj';
        document.body.appendChild(container);

        const manager = SchemaEditorBridgeManager.getInstance();
        manager.setEnabled(true);
        manager.register('test-id', {
          getContent: () => 'content',
          setContent: vi.fn(),
        });

        const config = getBridgeConfig();
        /** 先调用 getSchema 设置 currentEditingId */
        config?.getSchema?.('test-id');

        const schemaObject = { type: 'test', data: [1, 2, 3] };
        const cleanup = config?.renderPreview?.(
          schemaObject,
          'preview-container-obj',
        );
        expect(typeof cleanup).toBe('function');

        if (typeof cleanup === 'function') {
          cleanup();
        }
        document.body.removeChild(container);
      });
    });
  });

  describe('setEnabled 边界情况', () => {
    it('从启用切换到禁用应该停止 bridge', async () => {
      const mockCleanup = vi.fn();
      const { createSchemaEditorBridge } = await import(
        '@schema-editor/host-sdk/core'
      );
      vi.mocked(createSchemaEditorBridge).mockReturnValue(mockCleanup);

      const manager = SchemaEditorBridgeManager.getInstance();

      /** 先启用并注册 */
      manager.setEnabled(true);
      manager.register('test-id', {
        getContent: () => 'content',
        setContent: vi.fn(),
      });

      /** 然后禁用 */
      manager.setEnabled(false);
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('重复启用不应该重复创建 bridge', async () => {
      const { createSchemaEditorBridge } = await import(
        '@schema-editor/host-sdk/core'
      );
      vi.mocked(createSchemaEditorBridge).mockClear();

      const manager = SchemaEditorBridgeManager.getInstance();

      manager.setEnabled(true);
      manager.register('test-id', {
        getContent: () => 'content',
        setContent: vi.fn(),
      });

      const callCountAfterFirst = vi.mocked(createSchemaEditorBridge).mock.calls
        .length;

      /** 再次启用 */
      manager.setEnabled(true);

      /** 不应该再次创建 bridge */
      expect(vi.mocked(createSchemaEditorBridge).mock.calls.length).toBe(
        callCountAfterFirst,
      );
    });

    it('启用时如果没有注册的 handler 不应该启动 bridge', async () => {
      const { createSchemaEditorBridge } = await import(
        '@schema-editor/host-sdk/core'
      );
      vi.mocked(createSchemaEditorBridge).mockClear();

      const manager = SchemaEditorBridgeManager.getInstance();

      /** 启用但没有注册任何 handler */
      manager.setEnabled(true);

      expect(createSchemaEditorBridge).not.toHaveBeenCalled();
    });
  });

  describe('destroy 清理 previewRoot', () => {
    /**
     * 辅助函数：从 mock 调用中获取 bridge 配置
     */
    const getBridgeConfig = () => {
      const mockCalls = vi.mocked(createSchemaEditorBridge).mock.calls;
      if (mockCalls.length === 0) return null;
      return mockCalls[mockCalls.length - 1][0] as {
        getSchema?: (params: string) => any;
        updateSchema?: (schema: any, params: string) => boolean;
        renderPreview?: (schema: any, containerId: string) => (() => void) | void;
      };
    };

    it('destroy 应该清理 previewRoot', () => {
      const container = document.createElement('div');
      container.id = 'preview-container-destroy';
      document.body.appendChild(container);

      const manager = SchemaEditorBridgeManager.getInstance();
      manager.setEnabled(true);
      manager.register('test-id', {
        getContent: () => 'content',
        setContent: vi.fn(),
      });

      const config = getBridgeConfig();
      /** 触发创建 previewRoot */
      config?.getSchema?.('test-id');
      config?.renderPreview?.('# Test', 'preview-container-destroy');

      /** 销毁应该不抛出错误 */
      expect(() => {
        SchemaEditorBridgeManager.destroy();
      }).not.toThrow();

      document.body.removeChild(container);
    });

    it('destroy 应该正确清理已创建的 previewRoot', () => {
      /** 创建容器 */
      const container = document.createElement('div');
      container.id = 'preview-root-cleanup-test';
      document.body.appendChild(container);

      const manager = SchemaEditorBridgeManager.getInstance();
      manager.setEnabled(true);
      manager.register('cleanup-test-id', {
        getContent: () => 'markdown content',
        setContent: vi.fn(),
      });

      const config = getBridgeConfig();
      expect(config).not.toBeNull();

      /** 调用 getSchema 设置 currentEditingId */
      config?.getSchema?.('cleanup-test-id');

      /** 调用 renderPreview 创建 previewRoot */
      const cleanup = config?.renderPreview?.(
        '# Preview Content',
        'preview-root-cleanup-test',
      );
      expect(typeof cleanup).toBe('function');

      /** 验证 destroy 能正确处理有 previewRoot 的情况 */
      expect(() => {
        SchemaEditorBridgeManager.destroy();
      }).not.toThrow();

      /** 清理 DOM */
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    });

    it('多次调用 renderPreview 后 destroy 应该正常工作', () => {
      const container = document.createElement('div');
      container.id = 'multi-preview-test';
      document.body.appendChild(container);

      const manager = SchemaEditorBridgeManager.getInstance();
      manager.setEnabled(true);
      manager.register('multi-test-id', {
        getContent: () => 'content',
        setContent: vi.fn(),
      });

      const config = getBridgeConfig();
      config?.getSchema?.('multi-test-id');

      /** 多次调用 renderPreview */
      config?.renderPreview?.('First', 'multi-preview-test');
      config?.renderPreview?.('Second', 'multi-preview-test');
      config?.renderPreview?.('Third', 'multi-preview-test');

      /** destroy 应该正常工作 */
      expect(() => {
        SchemaEditorBridgeManager.destroy();
      }).not.toThrow();

      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    });
  });
});

