import { CloseCircleOutlined } from '@ant-design/icons';
import type { Ace } from 'ace-builds';
import { message } from 'antd';
import copy from 'copy-to-clipboard';
import React, { useContext, useEffect, useRef } from 'react';
import { useGetSetState } from 'react-use';

import { Copy } from '@sofa-design/icons';
import { Path } from 'slate';
import { ReactEditor } from 'slate-react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import { useEditorStore } from '../../MarkdownEditor/editor/store';
import { DragHandle } from '../../MarkdownEditor/editor/tools/DragHandle';
import { CodeNode, ElementProps } from '../../MarkdownEditor/el';
import { useSelStatus } from '../../MarkdownEditor/hooks/editor';
import { Mermaid } from './Mermaid';

/**
 * MermaidElement 组件 - Mermaid图表元素组件
 *
 * 该组件用于在Markdown编辑器中渲染Mermaid图表，支持流程图、时序图、甘特图等。
 * 提供图表编辑、预览、复制、拖拽等功能。
 *
 * @component
 * @description Mermaid图表元素组件，支持各种Mermaid图表类型
 * @param {ElementProps<CodeNode>} props - 组件属性
 * @param {CodeNode} props.element - 代码节点数据
 * @param {string} [props.element.language] - 图表语言类型
 * @param {string} [props.element.value] - Mermaid图表代码
 * @param {boolean} [props.element.frontmatter] - 是否为前置元数据
 * @param {Object} props.attributes - Slate元素属性
 * @param {React.ReactNode} props.children - 子元素
 *
 * @example
 * ```tsx
 * <MermaidElement
 *   element={{
 *     type: 'code',
 *     language: 'mermaid',
 *     value: 'graph TD\nA[开始] --> B[结束]'
 *   }}
 *   attributes={slateAttributes}
 *   children={slateChildren}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Mermaid图表组件
 *
 * @remarks
 * - 支持多种Mermaid图表类型（流程图、时序图、甘特图等）
 * - 提供图表编辑和预览功能
 * - 支持图表代码复制
 * - 提供拖拽排序功能
 * - 支持选择状态管理
 * - 集成Ace编辑器
 * - 提供国际化支持
 * - 响应式布局适配
 */
export function MermaidElement(props: ElementProps<CodeNode>) {
  const { markdownEditorRef } = useEditorStore();
  const [state, setState] = useGetSetState({
    showBorder: false,
    htmlStr: '',
    hide: props.element.language === 'mermaid',
    lang: props.element.language || '',
  });
  const pathRef = useRef<Path>();
  const [selected, path] = useSelStatus(props.element);
  pathRef.current = path;
  const editorRef = useRef<Ace.Editor>();

  useEffect(() => {
    if (
      selected &&
      !editorRef.current?.isFocused() &&
      ReactEditor.isFocused(markdownEditorRef.current)
    ) {
      setState({ showBorder: true });
    } else if (state().showBorder) {
      setState({ showBorder: false });
    }
  }, [selected, path]);
  const i18n = useContext(I18nContext);
  return (
    <div
      {...props.attributes}
      contentEditable={false}
      className={'ace-el drag-el'}
      data-be={'mermaid'}
      tabIndex={-1}
      onBlur={() => {}}
      data-lang={props.element.language}
    >
      {!props.element.frontmatter && <DragHandle />}
      <div
        onClick={(e) => {
          e.stopPropagation();
          editorRef.current?.focus();
        }}
        style={{
          padding: state().hide ? 0 : undefined,
          marginBottom: state().hide ? 0 : undefined,
          boxSizing: 'border-box',
          backgroundColor: state().showBorder
            ? 'rgba(59, 130, 246, 0.1)'
            : state().hide
              ? 'transparent'
              : 'rgb(252, 252, 252)',
          maxHeight: 400,
          overflow: 'auto',
          position: 'relative',
          height: state().hide ? 0 : 'auto',
          opacity: state().hide ? 0 : 1,
        }}
      >
        {!props.element.frontmatter && (
          <div
            contentEditable={false}
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              height: '1.75em',
              backgroundColor: '#FFF',
              borderBottom: '1px solid #eee',
              paddingLeft: '0.75em',
              paddingRight: '0.375em',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              position: 'sticky',
              left: 0,
              top: 0,
              fontSize: '1em',
              color: 'rgba(0, 0, 0, 0.6)',
              justifyContent: 'space-between',
              zIndex: 50,
              userSelect: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 5,
              }}
            >
              <ActionIconBox
                title="关闭"
                onClick={() => {
                  setState({
                    hide: props.element.language === 'mermaid',
                  });
                }}
              >
                <CloseCircleOutlined />
              </ActionIconBox>
              <ActionIconBox
                title="复制"
                style={{
                  fontSize: '0.9em',
                  lineHeight: '1.75em',
                  marginLeft: '0.125em',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    const code = props.element.value || '';
                    copy(code);
                    message.success(i18n.locale?.copySuccess || '复制成功');
                  } catch (error) {}
                }}
              >
                <Copy />
              </ActionIconBox>
            </div>
          </div>
        )}
        <div data-hidden>{props.children}</div>
      </div>
      <Mermaid element={props.element} />
    </div>
  );
}
