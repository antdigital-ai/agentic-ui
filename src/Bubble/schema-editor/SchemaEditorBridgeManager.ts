import type {
  SchemaElementEditorBridge,
  SchemaValue,
} from '@schema-element-editor/host-sdk/core';
import { createSchemaElementEditorBridge } from '@schema-element-editor/host-sdk/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MarkdownEditor } from '../../MarkdownEditor';

/**
 * Bubble 处理器接口
 * @description 每个 Bubble 组件注册时提供的处理器
 */
export interface BubbleHandler {
  /** 获取当前内容 */
  getContent: () => string;
  /** 设置内容 */
  setContent: (content: string) => void;
  /** 自定义预览渲染（可选） */
  renderPreview?: (
    schema: SchemaValue,
    containerId: string,
  ) => (() => void) | void;
}

/**
 * Schema Editor Bridge 单例管理器
 * @description 全局唯一的监听器管理，避免多个 Bubble 组件冲突
 *
 * @remarks
 * 推荐使用 `useSchemaEditorBridge` Hook，它会自动管理启用状态和注册/注销流程。
 * Schema Editor 在开发环境下自动启用（process.env.NODE_ENV === 'development'）。
 * 如需直接使用 Manager，需手动调用 `setEnabled(true)` 启动 Bridge。
 *
 * @example
 * ```tsx
 * // 推荐方式：使用 useSchemaEditorBridge Hook（开发环境自动启用）
 * const { content, setContent } = useSchemaEditorBridge(id, initialContent);
 *
 * // 直接使用 Manager（需手动管理启用状态）
 * useEffect(() => {
 *   const manager = SchemaEditorBridgeManager.getInstance();
 *   manager.setEnabled(true); // 必须：启用 Bridge
 *   manager.register(id, {
 *     getContent: () => contentRef.current,
 *     setContent: (c) => setContent(c)
 *   });
 *   return () => manager.unregister(id);
 * }, [id]);
 * ```
 */
export class SchemaEditorBridgeManager {
  /** 单例实例 */
  private static instance: SchemaEditorBridgeManager | null = null;

  /** Bubble 处理器注册表：id -> handler */
  private registry: Map<string, BubbleHandler> = new Map();

  /** Bridge 实例 */
  private bridge: SchemaElementEditorBridge | null = null;

  /** 是否启用 */
  private enabled: boolean = false;

  /** 预览 Root */
  private previewRoot: ReactDOM.Root | null = null;

  /** 当前正在编辑的 Bubble id */
  private currentEditingId: string | null = null;

  /** 私有构造函数，防止外部实例化 */
  private constructor() {}

  /**
   * 获取单例实例
   * @returns SchemaEditorBridgeManager 实例
   */
  static getInstance(): SchemaEditorBridgeManager {
    if (!SchemaEditorBridgeManager.instance) {
      SchemaEditorBridgeManager.instance = new SchemaEditorBridgeManager();
    }
    return SchemaEditorBridgeManager.instance;
  }

  /**
   * 设置启用状态
   * @param enabled - 是否启用
   */
  setEnabled(enabled: boolean): void {
    const wasEnabled = this.enabled;
    this.enabled = enabled;

    if (enabled && !wasEnabled && this.registry.size > 0) {
      this.startBridge();
    } else if (!enabled && wasEnabled) {
      this.stopBridge();
    }
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 注册 Bubble 处理器
   * @param id - Bubble 的唯一标识（data-id）
   * @param handler - 处理器对象
   */
  register(id: string, handler: BubbleHandler): void {
    this.registry.set(id, handler);

    if (this.enabled) {
      this.startBridge();
    }
  }

  /**
   * 注销 Bubble 处理器
   * @param id - Bubble 的唯一标识
   */
  unregister(id: string): void {
    this.registry.delete(id);

    if (this.registry.size === 0) {
      this.stopBridge();
    }
  }

  /**
   * 获取注册的 Bubble 数量
   */
  getRegistrySize(): number {
    return this.registry.size;
  }

  /**
   * 检查某个 ID 是否已注册
   */
  has(id: string): boolean {
    return this.registry.has(id);
  }

  /**
   * 启动 Bridge（幂等，已启动时直接返回）
   */
  private startBridge(): void {
    if (this.bridge) return;

    this.bridge = createSchemaElementEditorBridge({
      getSchema: (params: string) => {
        const handler = this.registry.get(params);
        if (!handler) {
          // 返回 undefined 表示该元素不可编辑，插件将无法打开编辑器
          this.currentEditingId = null;
          return undefined as unknown as SchemaValue;
        }
        // 记录当前编辑的 Bubble id,供 renderPreview 使用
        this.currentEditingId = params;
        return handler.getContent();
      },

      updateSchema: (schema: SchemaValue, params: string) => {
        const handler = this.registry.get(params);
        if (!handler) {
          return false;
        }

        try {
          const content =
            typeof schema === 'string'
              ? schema
              : JSON.stringify(schema, null, 2);
          handler.setContent(content);
          return true;
        } catch (error) {
          console.error('[SchemaEditorBridge] updateSchema failed:', error);
          return false;
        }
      },

      renderPreview: (schema: SchemaValue, containerId: string) => {
        /** 使用当前编辑 Bubble 的自定义预览 */
        if (this.currentEditingId) {
          const handler = this.registry.get(this.currentEditingId);
          if (handler?.renderPreview) {
            return handler.renderPreview(schema, containerId);
          }
        }

        /** 兜底：内置 Markdown 预览 */
        return this.createDefaultPreview(schema, containerId);
      },
    });
  }

  /**
   * 停止 Bridge
   */
  private stopBridge(): void {
    if (!this.bridge) return;

    try {
      if (typeof this.bridge.cleanup === 'function') {
        this.bridge.cleanup();
      }
    } catch (error) {
      console.warn(
        '[SchemaEditorBridge] cleanup failed during stopBridge:',
        error,
      );
    } finally {
      this.bridge = null;
    }
  }

  /**
   * 创建默认预览
   * @description 使用 MarkdownEditor 渲染 Markdown 预览
   */
  private createDefaultPreview(
    schema: SchemaValue,
    containerId: string,
  ): (() => void) | void {
    const container = document.getElementById(containerId);
    if (!container) return;

    const content =
      typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2);

    /** 复用或创建 Root */
    if (!this.previewRoot) {
      this.previewRoot = ReactDOM.createRoot(container);
    }

    this.previewRoot.render(
      React.createElement(MarkdownEditor, {
        initValue: content,
        readonly: true,
        style: { padding: 16 },
        height: 'auto',
        width: '100%',
      }),
    );

    return () => {
      this.previewRoot?.unmount?.();
      this.previewRoot = null;
    };
  }

  /**
   * 销毁单例（主要用于测试）
   */
  static destroy(): void {
    if (!SchemaEditorBridgeManager.instance) return;

    const instance = SchemaEditorBridgeManager.instance;

    instance.stopBridge();
    instance.previewRoot?.unmount();
    instance.previewRoot = null;
    instance.registry.clear();
    SchemaEditorBridgeManager.instance = null;
  }
}

export default SchemaEditorBridgeManager;
