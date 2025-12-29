import classNames from 'classnames';
import React, { startTransition, useEffect, useRef, useState } from 'react';
import { Editor, Node, Transforms } from 'slate';
import { useEditorStore } from '../../MarkdownEditor/editor/store';
import { ElementProps, InlineKatexNode } from '../../MarkdownEditor/el';
import { useSelStatus } from '../../MarkdownEditor/hooks/editor';
import { loadKatex } from './loadKatex';

/**
 * InlineKatex 组件 - 内联KaTeX数学公式组件
 *
 * 该组件用于在文本中渲染内联数学公式，支持编辑和只读模式。
 * 提供选择状态管理、公式渲染、点击交互等功能。
 *
 * @component
 * @description 内联KaTeX数学公式组件，支持行内数学公式渲染
 * @param {ElementProps<InlineKatexNode> & { style?: React.CSSProperties }} props - 组件属性
 * @param {InlineKatexNode} props.element - 内联KaTeX节点
 * @param {Object} props.attributes - Slate元素属性
 * @param {React.ReactNode} props.children - 子元素
 * @param {React.CSSProperties} [props.style] - 自定义样式
 *
 * @example
 * ```tsx
 * <InlineKatex
 *   element={inlineKatexNode}
 *   attributes={slateAttributes}
 *   style={{ fontSize: '13px' }}
 * >
 *   {children}
 * </InlineKatex>
 * ```
 *
 * @returns {React.ReactElement} 渲染的内联数学公式组件
 *
 * @remarks
 * - 支持内联数学公式渲染
 * - 提供编辑和只读模式
 * - 支持选择状态管理
 * - 提供点击交互功能
 * - 基于KaTeX库实现
 * - 支持自定义样式
 * - 在测试环境下简化显示
 * - 提供响应式布局
 */
export const InlineKatex = ({
  children,
  element,
  attributes,
  style,
}: ElementProps<InlineKatexNode> & { style?: React.CSSProperties }) => {
  const renderEl = useRef<HTMLElement>(null);
  const { markdownEditorRef, readonly } = useEditorStore();
  const [selected, path] = useSelStatus(element);
  const [katexLoaded, setKatexLoaded] = useState(false);
  const katexRef = useRef<typeof import('katex').default | null>(null);

  // 异步加载 Katex 库和 CSS
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setKatexLoaded(true);
      return;
    }

    startTransition(() => {
      // 异步加载在 startTransition 外部执行
      (async () => {
        try {
          const katexModule = await loadKatex();
          katexRef.current = katexModule.default;
          setKatexLoaded(true);
        } catch (error) {
          console.error('Failed to load Katex:', error);
          setKatexLoaded(true);
        }
      })();
    });
  }, []);

  useEffect(() => {
    if (!katexLoaded || !katexRef.current || selected) return;

    const value = Node.string(element);
    if (renderEl.current && katexRef.current) {
      katexRef.current.render(`${value}`, renderEl.current, {
        strict: false,
        output: 'html',
        throwOnError: false,
        macros: {
          '\\f': '#1f(#2)',
        },
      });
    }
  }, [selected, katexLoaded, element]);
  if (process.env.NODE_ENV === 'test') {
    return <span contentEditable={false} />;
  }

  if (readonly) {
    return (
      <span
        {...attributes}
        className="katex"
        data-be={'inline-katex'}
        style={{
          position: 'relative',
        }}
      >
        <span contentEditable={false} ref={renderEl} />
        <span
          style={{
            display: 'none',
          }}
        >
          {children}
        </span>
      </span>
    );
  }

  return (
    <span
      {...attributes}
      data-be={'inline-katex'}
      className={classNames('relative')}
    >
      <span
        style={{
          display: 'inline-flex',
          padding: selected ? '0.25rem' : '0',
          visibility: selected ? 'visible' : 'hidden',
          width: selected ? 'auto' : '0',
          height: selected ? 'auto' : '0',
          overflow: 'hidden',
          position: selected ? 'static' : 'absolute',
          ...style,
        }}
        className={selected ? 'inline-code-input' : ''}
      >
        {children}
      </span>
      <span
        className="katex"
        contentEditable={false}
        ref={renderEl}
        onClick={() => {
          Transforms.select(
            markdownEditorRef.current,
            Editor.end(markdownEditorRef.current, path),
          );
        }}
        style={{
          margin: '0 0.25rem',
          userSelect: 'none',
          visibility: selected ? 'hidden' : 'visible',
          width: selected ? '0' : 'auto',
          height: selected ? '0' : 'auto',
          overflow: selected ? 'hidden' : 'visible',
          position: selected ? 'absolute' : 'static',
        }}
      />
    </span>
  );
};
