import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { BubbleHandler } from './SchemaEditorBridgeManager';

interface ContentSource {
  id: string | undefined;
  content: string;
}

interface ContentOverride {
  source: ContentSource;
  content: string;
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

  const source = useMemo<ContentSource>(
    () => ({ id, content: initialContent }),
    [id, initialContent],
  );
  const [override, setOverride] = useState<ContentOverride>();

  // 外部正文直接用于当前渲染；开发工具的改稿只属于当时的消息版本。
  const content =
    override?.source === source ? override.content : initialContent;
  const contentRef = useRef(content);
  useLayoutEffect(() => {
    contentRef.current = content;
  }, [content]);
  const setContent = useRefFunction((nextContent: string) => {
    contentRef.current = nextContent;
    setOverride({ source, content: nextContent });
  });

  /**
   * 注册到单例管理器
   */
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || !id) return;

    let cancelled = false;
    let unregister: (() => void) | undefined;
    // 生产包可移除整个开发桥接，避免引入 SDK、预览编辑器和 ReactDOM。
    void import('./SchemaEditorBridgeManager').then(
      ({ SchemaEditorBridgeManager }) => {
        if (cancelled) return;
        const manager = SchemaEditorBridgeManager.getInstance();
        const handler: BubbleHandler = {
          getContent: () => contentRef.current,
          setContent,
        };
        manager.setEnabled(true);
        manager.register(id, handler);
        unregister = () => manager.unregister(id);
      },
    );

    return () => {
      cancelled = true;
      unregister?.();
    };
  }, [id, enabled]);

  return {
    content,
    setContent,
  };
}

export default useSchemaEditorBridge;
