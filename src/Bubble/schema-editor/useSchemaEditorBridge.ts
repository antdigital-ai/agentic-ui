import { useEffect } from 'react';
import {
  SchemaEditorBridgeManager,
  type BubbleHandler,
} from './SchemaEditorBridgeManager';
import { useRefState } from './useRefState';

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
 * 开发环境自动启用，生产环境自动禁用
 *
 * @param id - Bubble 的唯一标识（data-id）
 * @param initialContent - 初始内容
 * @returns Hook 返回值，包含内容状态和控制方法
 *
 * @example
 * ```tsx
 * const { content, setContent } = useSchemaEditorBridge(
 *   originData.id,
 *   originData.originContent || '',
 * );
 * ```
 */
export function useSchemaEditorBridge(
  id: string | undefined,
  initialContent: string,
): UseSchemaEditorBridgeResult {
  /** 开发环境自动启用 */
  const enabled = process.env.NODE_ENV === 'development';

  /**
   * 内部状态：使用 useRefState 同时维护 state 和 ref
   * @description setContent 会立即更新 ref，解决 set 后立即读取的问题
   */
  const [content, setContent, contentRef] = useRefState(initialContent);

  /**
   * 同步初始内容变化
   * @description 当外部传入的 initialContent 变化时，更新内部状态
   */
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  /**
   * 注册到单例管理器
   */
  useEffect(() => {
    const manager = SchemaEditorBridgeManager.getInstance();

    /** 无 id 时直接返回 */
    if (!id) return;

    /** 禁用时注销已注册的 handler 并返回 */
    if (!enabled) {
      if (manager.has(id)) manager.unregister(id);
      return;
    }

    /** 设置管理器启用状态 */
    manager.setEnabled(true);

    /** 创建处理器 */
    const handler: BubbleHandler = {
      getContent: () => contentRef.current,
      setContent,
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
