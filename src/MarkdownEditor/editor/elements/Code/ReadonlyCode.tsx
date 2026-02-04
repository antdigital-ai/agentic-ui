import DOMPurify from 'dompurify';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import { debugInfo } from '../../../../Utils/debugUtils';

/**
 * ReadonlyCode 组件 - 只读代码块预览组件
 *
 * 专门针对 readonly 模式优化的代码块组件，移除了编辑相关功能。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读代码块预览组件，用于预览模式下的代码块渲染
 * @param {RenderElementProps} props - 组件属性
 * @param {any} props.element - 代码块节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyCode
 *   element={codeNode}
 *   attributes={attributes}
 * >
 *   代码内容
 * </ReadonlyCode>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读代码块组件
 *
 * @remarks
 * - 简化渲染逻辑，移除编辑相关功能
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyCode: React.FC<RenderElementProps> = React.memo(
  ({ attributes, children, element }) => {
    debugInfo('ReadonlyCode - 渲染只读代码块', {
      language: element?.language,
      valueLength: element?.value?.length,
      isConfig: element?.otherProps?.isConfig,
      finished: element?.otherProps?.finished,
    });

    // HTML 代码块处理
    if (element?.language === 'html') {
      debugInfo('ReadonlyCode - HTML 代码块', {
        isConfig: element?.otherProps?.isConfig,
      });
      return (
        <div
          {...attributes}
          style={{
            display: element?.otherProps?.isConfig ? 'none' : 'block',
          }}
        >
          {element?.otherProps?.isConfig
            ? ''
            : DOMPurify.sanitize(element?.value?.trim())}
        </div>
      );
    }

    // 检查代码块是否未闭合
    const isUnclosed = element?.otherProps?.finished === false;

    return (
      <div
        {...attributes}
        data-is-unclosed={isUnclosed}
        data-language={element?.language}
        style={
          element?.language === 'html'
            ? {
                display: element?.otherProps?.isConfig ? 'none' : 'block',
              }
            : {
                height: '240px',
                minWidth: '398px',
                maxWidth: '800px',
                minHeight: '240px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                alignSelf: 'stretch',
                zIndex: 5,
                color: 'rgb(27, 27, 27)',
                padding: '1em',
                margin: '1em 0',
                fontSize: '0.8em',
                lineHeight: '1.5',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                fontFamily: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
                wordWrap: 'break-word',
                borderRadius: '12px',
                background: '#FFFFFF',
                boxShadow: 'var(--shadow-control-base)',
                position: 'relative',
              }
        }
      >
        {element?.value?.trim() || children}
      </div>
    );
  },
);

ReadonlyCode.displayName = 'ReadonlyCode';
