import classNames from 'classnames';
import React from 'react';
import { Node } from 'slate';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, ParagraphNode } from '../../../el';

/**
 * ReadonlyParagraph 组件 - 只读段落预览组件
 *
 * 专门针对 readonly 模式优化的段落组件，移除了拖拽手柄、占位符逻辑等编辑相关功能。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读段落预览组件，用于预览模式下的段落渲染
 * @param {ElementProps<ParagraphNode>} props - 组件属性
 * @param {ParagraphNode} props.element - 段落节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyParagraph
 *   element={paragraphNode}
 *   attributes={attributes}
 * >
 *   段落内容
 * </ReadonlyParagraph>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读段落组件
 *
 * @remarks
 * - 移除拖拽手柄（DragHandle）
 * - 移除占位符逻辑
 * - 移除拖拽相关事件处理
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyParagraph: React.FC<ElementProps<ParagraphNode>> =
  React.memo((props) => {
    debugInfo('ReadonlyParagraph - 渲染只读段落', {
      align: props.element.align,
      children: props.element.children,
    });

    const str = Node.string(props.element).trim();
    debugInfo('ReadonlyParagraph - useMemo 渲染', {
      strLength: str.length,
      align: props.element.align,
    });

    return (
      <div
        {...props.attributes}
        data-be={'paragraph'}
        className={classNames({})}
        data-align={props.element.align}
        style={{
          display: !!str || !!props.children?.at(0).type ? undefined : 'none',
          textAlign: props.element.align,
        }}
      >
        {props.children}
      </div>
    );
  });

ReadonlyParagraph.displayName = 'ReadonlyParagraph';
