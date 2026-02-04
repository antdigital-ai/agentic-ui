import { ExportOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { Node } from 'slate';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, FootnoteDefinitionNode } from '../../../el';
import { useEditorStore } from '../../store';

/**
 * ReadonlyFootnoteDefinition 组件 - 只读脚注定义预览组件
 *
 * 专门针对 readonly 模式优化的脚注定义组件，移除了拖拽功能。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读脚注定义预览组件，用于预览模式下的脚注定义渲染
 * @param {ElementProps<FootnoteDefinitionNode>} props - 组件属性
 * @param {FootnoteDefinitionNode} props.element - 脚注定义节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyFootnoteDefinition
 *   element={footnoteDefinitionNode}
 *   attributes={attributes}
 * >
 *   脚注内容
 * </ReadonlyFootnoteDefinition>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读脚注定义组件
 *
 * @remarks
 * - 移除拖拽手柄（DragHandle）
 * - 移除拖拽相关事件处理
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyFootnoteDefinition: React.FC<
  ElementProps<FootnoteDefinitionNode>
> = React.memo((props) => {
  const { store } = useEditorStore();
  const element = props.element;

  useMemo(() => {
    store.footnoteDefinitionMap = store.footnoteDefinitionMap.set(
      element.identifier,
      element,
    );
  }, [element]);

  const str = Node.string(props.element);
  debugInfo('ReadonlyFootnoteDefinition - 渲染', {
    identifier: element.identifier,
    strLength: str.length,
  });
  return (
    <div
      {...props.attributes}
      style={{
        fontSize: '12px',
        margin: '5px 0',
        display: 'flex',
        gap: 4,
      }}
      data-be={'footnoteDefinition'}
      className={!str ? 'empty' : undefined}
    >
      {element.identifier}.
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {props.children}
        <ExportOutlined />
      </span>
    </div>
  );
});

ReadonlyFootnoteDefinition.displayName = 'ReadonlyFootnoteDefinition';
