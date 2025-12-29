/**
 * @fileoverview Katex 数学公式渲染插件
 * 提供基于 KaTeX 的数学公式渲染功能，支持块级和内联公式
 * @author Katex Plugin Team
 */

import React, { useMemo } from 'react';
import { useEditorStore } from '../../MarkdownEditor/editor/store';
import { DragHandle } from '../../MarkdownEditor/editor/tools/DragHandle';
import { CodeNode, ElementProps } from '../../MarkdownEditor/el';
import { Katex } from './Katex';

/**
 * KatexElement 组件 - KaTeX 数学公式元素组件
 *
 * 该组件用于在Markdown编辑器中渲染数学公式，基于KaTeX库实现。
 * 支持块级公式渲染、拖拽排序、只读模式等功能。
 *
 * @component
 * @description KaTeX 数学公式元素组件，支持LaTeX数学公式渲染
 * @param {ElementProps<CodeNode>} props - 组件属性
 * @param {CodeNode} props.element - 代码节点数据
 * @param {boolean} [props.element.katex] - 是否为KaTeX公式
 * @param {string} [props.element.value] - 公式内容
 * @param {Object} props.attributes - Slate元素属性
 * @param {React.ReactNode} props.children - 子元素
 *
 * @example
 * ```tsx
 * <KatexElement
 *   element={{
 *     type: 'katex',
 *     katex: true,
 *     value: '\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n'
 *   }}
 *   attributes={slateAttributes}
 *   children={slateChildren}
 * />
 * ```
 *
 * @returns {React.ReactElement|null} 渲染的KaTeX公式组件，非KaTeX节点时返回null
 *
 * @remarks
 * - 基于KaTeX库实现数学公式渲染
 * - 支持LaTeX数学语法
 * - 提供实时渲染预览
 * - 支持拖拽排序功能
 * - 响应式布局适配
 * - 支持只读模式简化渲染
 * - 提供隐藏内容副本用于搜索和SEO
 * - 集成编辑器状态管理
 */
export function KatexElement(props: ElementProps<CodeNode>) {
  const { readonly } = useEditorStore();

  // 渲染组件
  return useMemo(() => {
    // 只处理 katex 类型的节点
    if (!props.element.katex) {
      return null;
    }
    // 只读模式下的简化渲染
    if (readonly) {
      return (
        <div
          {...props.attributes}
          contentEditable={false}
          style={{
            margin: '1em 0',
            userSelect: 'none',
          }}
        >
          <Katex el={props.element} />
          {/* 隐藏的内容副本（用于搜索和 SEO） */}
          <div
            style={{
              height: '0.5px',
              overflow: 'hidden',
              opacity: 0,
              pointerEvents: 'none',
            }}
          >
            {props.element?.value}
            {props.children}
          </div>
        </div>
      );
    }

    // 编辑模式下的完整渲染
    return (
      <div
        {...props.attributes}
        contentEditable={false}
        className={'katex-el drag-el'}
        data-be={'katex'}
        tabIndex={-1}
        style={{
          margin: '1em 0',
          userSelect: 'none',
        }}
        onBlur={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* 拖拽手柄 */}
        <DragHandle />

        {/* Katex 渲染容器 */}
        <div
          style={{
            position: 'relative',
            backgroundColor: 'rgb(252, 252, 252)',
            borderRadius: '0.375rem',
            padding: '0.5rem',
            border: '1px solid #e5e5e5',
          }}
        >
          <Katex el={props.element} />

          {/* 隐藏的内容副本（用于搜索和 SEO） */}
          <div
            style={{
              height: '0.5px',
              overflow: 'hidden',
              opacity: 0,
              pointerEvents: 'none',
            }}
          >
            {props.element?.value}
            {props.children}
          </div>
        </div>
      </div>
    );
  }, [props.element, props.element.value, props.element.katex, readonly]);
}

// 导出内联 KaTeX 组件
export { InlineKatex } from './InlineKatex';

// 导出核心 Katex 渲染组件
export { Katex } from './Katex';
