import classNames from 'classnames';
import RcResizeObserver from 'rc-resize-observer';
import React, { useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import type { AttachmentFile } from '../AttachmentButton/types';
import Enlargement from '../Enlargement';
import { RefinePromptButton } from '../RefinePromptButton';

export interface QuickActionsProps {
  /** 当前输入值 */
  value?: string;

  /** 文件映射表 */
  fileMap?: Map<string, AttachmentFile>;

  /** 文件映射表变化回调 */
  onFileMapChange?: (fileMap?: Map<string, AttachmentFile>) => void;

  /** 是否悬停 */
  isHover?: boolean;

  /** 是否加载中 */
  isLoading?: boolean;

  /** 是否禁用 */
  disabled?: boolean;

  /** 文件上传状态 */
  fileUploadStatus?: 'uploading' | 'done' | 'error';

  /** 提示词优化配置 */
  refinePrompt?: {
    enable: boolean;
    onRefine: (input: string) => Promise<string>;
  };

  /** Markdown 编辑器实例 */
  editorRef?: React.MutableRefObject<MarkdownEditorInstance | undefined>;

  /** 值变化回调 */
  onValueChange?: (value: string) => void;

  /** 自定义渲染函数 */
  quickActionRender?: (props: any) => React.ReactNode[];

  /** CSS 类名前缀 */
  prefixCls?: string;

  /** hash ID */
  hashId?: string;

  /** resize 回调 */
  onResize?: (width: number, rightOffset: number) => void;

  /** 是否支持编辑器放大功能 */
  enlargeable?: boolean;

  /** 是否处于放大状态 */
  isEnlarged?: boolean;

  /** 放大按钮点击回调 */
  onEnlargeClick?: () => void;
}

/**
 * QuickActions 组件 - 快速操作区域
 *
 * @description 在编辑区域右上角渲染快速操作按钮，包括提示词优化等功能
 */
export const QuickActions = React.forwardRef<HTMLDivElement, QuickActionsProps>(
  (
    {
      value,
      fileMap,
      onFileMapChange,
      isHover = false,
      isLoading = false,
      disabled = false,
      fileUploadStatus = 'done',
      refinePrompt,
      editorRef,
      onValueChange,
      quickActionRender,
      prefixCls = 'ant-agentic-md-input-field',
      hashId = '',
      onResize,
      isEnlarged = false,
      onEnlargeClick,
      enlargeable = false,
    },
    ref,
  ) => {
    const [refineStatus, setRefineStatus] = useState<'idle' | 'loading'>(
      'idle',
    );

    /**
     * 统一应用内容到编辑器与受控值
     */
    const applyEditorContent = useRefFunction((text: string) => {
      editorRef?.current?.store?.setMDContent(text);
      onValueChange?.(text);
    });

    /**
     * 处理提示词优化
     */
    const handleRefine = useRefFunction(async () => {
      if (!refinePrompt?.enable) return;
      if (!refinePrompt?.onRefine) return;
      if (refineStatus === 'loading') return;
      const current =
        editorRef?.current?.store?.getMDContent?.() ?? value ?? '';
      setRefineStatus('loading');
      try {
        const refined = await refinePrompt.onRefine(current);
        applyEditorContent(refined ?? '');
        setRefineStatus('idle');
      } catch (e) {
        setRefineStatus('idle');
      }
    });

    return (
      <RcResizeObserver
        onResize={(e) => {
          try {
            if (typeof window === 'undefined') {
              onResize?.(e.offsetWidth, 0);
              return;
            }
            const element = ref && 'current' in ref ? ref.current : null;
            if (!element) {
              onResize?.(e.offsetWidth, 0);
              return;
            }
            const styles = window.getComputedStyle(element as Element);
            const right = parseFloat(styles.right || '0');
            const rightOffset = Number.isNaN(right) ? 0 : right;
            onResize?.(e.offsetWidth, rightOffset);
          } catch {}
        }}
      >
        <div
          ref={ref}
          onBlur={(e) => {
            e.stopPropagation();
          }}
          onFocus={(e) => {
            e.stopPropagation();
          }}
          contentEditable={false}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className={classNames(`${prefixCls}-quick-actions`, hashId, {
            [`${prefixCls}-quick-actions-vertical`]: enlargeable,
          })}
        >
          {[
            // Enlargement组件 - 显示在最上方
            enlargeable && (
              <Enlargement
                key="enlargement"
                isEnlarged={isEnlarged}
                onEnlargeClick={onEnlargeClick}
              />
            ),
            // 自定义快速操作按钮
            ...(quickActionRender
              ? quickActionRender({
                  value,
                  fileMap,
                  onFileMapChange,
                  isHover,
                  isLoading,
                  fileUploadStatus,
                })
              : []),
            // 提示词优化按钮
            ...(refinePrompt?.enable
              ? [
                  <RefinePromptButton
                    key="refine-prompt"
                    isHover={isHover}
                    disabled={disabled}
                    status={refineStatus}
                    onRefine={handleRefine}
                  />,
                ]
              : []),
          ].filter(Boolean)}
        </div>
      </RcResizeObserver>
    );
  },
);

QuickActions.displayName = 'QuickActions';
