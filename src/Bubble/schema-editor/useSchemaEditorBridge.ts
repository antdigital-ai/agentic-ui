import { useEffect } from 'react';
import { useLatest } from 'react-use';
import type { SchemaValue } from '@schema-editor/host-sdk';
import {
  SchemaEditorBridgeManager,
  type BubbleHandler,
} from './SchemaEditorBridgeManager';
import { useRefState } from './useRefState';

/**
 * Schema Editor Bridge Hook 配置
 */
export interface UseSchemaEditorBridgeConfig {
  /**
   * 是否启用 Schema Editor
   * @description 控制是否启用插件集成，需用户主动启用
   * @default false
   */
  enabled?: boolean;

  /**
   * 内容变化时的回调（可选）
   * @description 用于持久化或同步到外部状态
   * @param content - 新的内容
   */
  onContentChange?: (content: string) => void;

  /**
   * 自定义预览渲染（可选）
   * @description 如不提供，使用内置的 Markdown 预览
   */
  renderPreview?: (schema: SchemaValue, containerId: string) => (() => void) | void;
}

/**
 * Schema Editor Bridge Hook 返回值
 */
export interface UseSchemaEditorBridgeResult {
  /** 当前内容（内部状态） */
  content: string;
  /** 手动设置内容 */
  setContent: (content: string) => void;
}

/**
 * Bubble 专用的 Schema Editor Bridge Hook
 * @description 使用单例模式管理全局监听器，避免多个 Bubble 组件冲突
 *
 * @param id - Bubble 的唯一标识（data-id）
 * @param initialContent - 初始内容
 * @param config - 配置选项
 * @returns Hook 返回值，包含内容状态和控制方法
 *
 * @example
 * ```tsx
 * const { content, setContent } = useSchemaEditorBridge(
 *   originData.id,
 *   originData.originContent || '',
 *   {
 *     enabled: process.env.NODE_ENV === 'development',
 *     onContentChange: (content) => saveToServer(content)
 *   }
 * );
 * ```
 */
export function useSchemaEditorBridge(
  id: string | undefined,
  initialContent: string,
  config?: UseSchemaEditorBridgeConfig,
): UseSchemaEditorBridgeResult {
  const { enabled = false, onContentChange, renderPreview } = config || {};

  /**
   * 内部状态：使用 useRefState 同时维护 state 和 ref
   * @description setContent 会立即更新 ref，解决 set 后立即读取的问题
   */
  const [content, setContentInternal, contentRef] = useRefState(initialContent);

  /** 使用 useLatest 避免闭包陷阱 */
  const onContentChangeRef = useLatest(onContentChange);
  const renderPreviewRef = useLatest(renderPreview);

  /**
   * 设置内容的函数
   * @description 同时更新内部状态（含 ref）和触发 onContentChange 回调
   */
  const setContent = (newContent: string) => {
    setContentInternal(newContent); // 立即更新 ref + 触发重渲染
    onContentChangeRef.current?.(newContent);
  };

  /**
   * 同步初始内容变化
   * @description 当外部传入的 initialContent 变化时，更新内部状态
   */
  useEffect(() => {
    setContentInternal(initialContent);
  }, [initialContent]);

  /**
   * 注册到单例管理器
   */
  useEffect(() => {
    const manager = SchemaEditorBridgeManager.getInstance();

    // 当禁用或无 id 时，确保注销已注册的 handler
    if (!id || !enabled) {
      if (id && manager.has(id)) {
        manager.unregister(id);
      }
      return;
    }

    /** 设置管理器启用状态 */
    manager.setEnabled(true);

    /** 创建处理器 */
    const handler: BubbleHandler = {
      getContent: () => contentRef.current,
      setContent,
      renderPreview: (schema, containerId) =>
        renderPreviewRef.current?.(schema, containerId),
    };

    /** 注册 */
    manager.register(id, handler);

    /** 清理：组件卸载时注销 */
    return () => {
      manager.unregister(id);
    };
  }, [id, enabled]);

  return {
    content,
    setContent,
  };
}

export default useSchemaEditorBridge;

