import React, { useContext, useMemo } from 'react';
import { RenderElementProps } from 'slate-react';
import { BubbleConfigContext } from '../../../../Bubble/BubbleConfigProvide';
import { SchemaRenderer } from '../../../../Schema';
import { debugInfo } from '../../../../Utils/debugUtils';
import { useEditorStore } from '../../store';

/**
 * Schema 组件 - 模式渲染组件
 *
 * 该组件用于渲染 Schema 类型的代码节点，支持自定义渲染、AgentAR 卡片渲染和默认渲染模式。
 * 根据不同的配置和节点类型提供不同的渲染方式。
 *
 * 功能特性：
 * - 支持自定义 apaasify/apassify 渲染模式
 * - 支持 AgentAR 卡片渲染
 * - 提供默认的 JSON 字符串渲染
 * - 包含隐藏的 JSON 数据用于调试和编辑
 * - 支持点击和键盘事件处理
 * - 响应式布局设计
 * - 提供测试 ID 支持
 *
 * @param props - Slate.js 渲染元素属性
 * @param props.element - 代码节点元素，包含 Schema 数据
 * @param props.children - 子组件，通常是文本内容
 * @param props.attributes - 元素的 DOM 属性
 * @returns 渲染的模式组件
 *
 * @example
 * ```tsx
 * <Schema
 *   element={codeNode}
 *   attributes={attributes}
 * >
 *   {children}
 * </Schema>
 * ```
 *
 * @remarks
 * 渲染优先级：
 * 1. 自定义 apaasify 渲染器
 * 2. AgentAR 卡片渲染
 * 3. 默认 JSON 字符串渲染
 */
export const Schema: React.FC<RenderElementProps> = (props) => {
  debugInfo('Schema - 渲染 Schema', {
    language: props.element.language,
    valueType: typeof props.element.value,
    hasApaasify: !!(props.element as any).apaasify,
  });
  const { element: node } = props;
  const { editorProps } = useEditorStore();
  const apaasify = editorProps?.apaasify || editorProps?.apassify;

  const { bubble } = useContext(BubbleConfigContext) || {};

  return useMemo(() => {
    if (apaasify?.enable && apaasify.render) {
      const renderedContent = apaasify.render(props, bubble?.originData);
      return (
        <div
          {...node.attributes}
          data-testid="schema-container"
          contentEditable={false}
          style={{
            display: 'flex',
            flexDirection: 'column',
            userSelect: 'text',
            WebkitUserSelect: 'text',
          }}
        >
          {renderedContent}
          <div
            data-testid="schema-hidden-json"
            style={{
              height: 1,
              opacity: 0,
              userSelect: 'none',
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            {JSON.stringify(props.element.value, null, 2)}
          </div>
        </div>
      );
    }

    if (node.language === 'agentar-card') {
      return (
        <div
          data-testid="agentar-card-container"
          style={{
            padding: '0.5em',
          }}
          data-agentar-card
        >
          <SchemaRenderer
            debug={false}
            fallbackContent={null}
            schema={props.element.value}
            values={props.element.value?.initialValues || {}}
            useDefaultValues={false}
          />
        </div>
      );
    }

    return (
      <div
        {...node.attributes}
        data-testid="schema-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <div
          data-testid="schema-clickable"
          style={{
            padding: 8,
            width: '100%',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            borderRadius: 8,
            flex: 1,
            border: '1px solid rgb(209 213 219 / 0.8)',
            alignItems: 'center',
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          data-be={node?.type}
        >
          {typeof node?.value === 'string'
            ? node.value
            : JSON.stringify(node?.value, null, 2)}
        </div>
        <span
          data-testid="schema-hidden-children"
          style={{
            display: 'none',
          }}
        >
          {props.children}
        </span>
      </div>
    );
  }, [node.value, bubble, apaasify]);
};
