import classNames from 'classnames';
import React, { createElement } from 'react';
import { Node } from 'slate';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, HeadNode } from '../../../el';
import { slugify } from '../../utils/dom';

/**
 * ReadonlyHead 组件 - 只读标题预览组件
 *
 * 专门针对 readonly 模式优化的标题组件，移除了拖拽功能，保留标题样式和锚点。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读标题预览组件，用于预览模式下的标题渲染
 * @param {ElementProps<HeadNode>} props - 组件属性
 * @param {HeadNode} props.element - 标题节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyHead
 *   element={headNode}
 *   attributes={attributes}
 * >
 *   标题内容
 * </ReadonlyHead>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读标题组件
 *
 * @remarks
 * - 移除拖拽手柄（DragHandle）
 * - 移除拖拽相关事件处理
 * - 保留锚点功能（id 属性）
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyHead: React.FC<ElementProps<HeadNode>> = React.memo(
  ({ element, attributes, children }) => {
    debugInfo('ReadonlyHead - 渲染只读标题', {
      level: element.level,
      text: Node.string(element)?.substring(0, 50),
      align: element.align,
    });

    const str = Node.string(element);

    return createElement(
      `h${element.level}`,
      {
        ...attributes,
        id: slugify(str),
        ['data-be']: 'head',
        ['data-head']: slugify(Node.string(element) || ''),
        ['data-title']: true, // 预览模式下不标记为标题
        ['data-align']: element.align,
        style: { textAlign: element.align },
        className: classNames({
          empty: !str,
        }),
      },
      children,
    );
  },
);

ReadonlyHead.displayName = 'ReadonlyHead';
