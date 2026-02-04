import { Popover, theme } from 'antd';
import React, { useContext, useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  MarkdownEditor,
  MarkdownEditorInstance,
  MarkdownEditorProps,
  parserMdToSchema,
} from '../../';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { MessageBubbleData } from '../type';
import { MessagesContext } from './BubbleContext';

/**
 * MarkdownPreview 组件用于渲染 Markdown 内容的预览。
 *
 * @param {Object} props - 组件的属性。
 * @param {string} props.content - 要渲染的 Markdown 内容。
 * @param {MarkdownEditorProps['fncProps']} props.fncProps - Markdown 编辑器的函数属性。
 * @param {boolean} [props.typing] - 是否启用打字机效果。
 * @param {React.ReactNode} props.extra - 额外的 React 节点。
 * @param {React.ReactNode} props.docListNode - 文档列表节点。
 * @param {React.RefObject<HTMLDivElement>} props.htmlRef - HTML 元素的引用。
 *
 * @returns {JSX.Element} 渲染的 Markdown 预览组件。
 */
export interface MarkdownPreviewProps {
  /** markdown 源文本内容，例如: "# 标题\n这是正文" */
  content: string;
  /** markdown 编辑器的功能属性配置，控制编辑器行为 */
  fncProps?: MarkdownEditorProps['fncProps'];
  placement?: 'left' | 'right';
  /** 是否启用打字机效果，例如: true */
  typing?: boolean;
  /** 额外的 React 节点，用于显示附加内容，例如: <Button>更多</Button> */
  extra?: React.ReactNode;
  /** 文档列表节点，用于展示相关文档，例如: <DocList items={[...]} /> */
  docListNode?: React.ReactNode;
  /** HTML 元素的引用，用于获取容器尺寸，例如: useRef<HTMLDivElement>(null) */
  htmlRef?: React.RefObject<HTMLDivElement>;
  /** 内容是否已完成加载，例如: true */
  isFinished?: boolean;
  style?: React.CSSProperties;
  originData?: MessageBubbleData;
  markdownRenderConfig?: MarkdownEditorProps;
  /** 在 content 前面插入的 DOM 元素，例如: <div>前置内容</div> */
  beforeContent: React.ReactNode;
  /** 在 content 后面插入的 DOM 元素，例如: <div>后置内容</div> */
  afterContent: React.ReactNode;
}

/**
 * Markdown 预览组件
 * @component MarkdownPreview
 *
 * @param {Object} props - 组件属性
 * @param {string} props.content - Markdown 内容
 * @param {ReactNode} props.extra - 额外的内容
 * @param {boolean} props.typing - 是否正在输入
 * @param {React.RefObject} props.htmlRef - HTML 元素的引用
 * @param {Object} props.fncProps - 功能属性
 * @param {ReactNode} props.docListNode - 文档列表节点
 * @param {boolean} props.isFinished - 内容是否已完成
 * @param {ReactNode} props.beforeContent - 在 content 前面插入的 DOM 元素
 * @param {ReactNode} props.afterContent - 在 content 后面插入的 DOM 元素
 *
 * @description
 * 这是一个用于渲染 Markdown 内容的预览组件。它支持以下功能：
 * - 普通 Markdown 渲染
 * - 支持打字机效果
 * - 错误边界处理
 * - 支持 Apaasify 自定义渲染
 * - 支持紧凑模式和标准模式
 * - 支持弹出层展示额外内容
 * - 支持在 content 前后插入自定义 DOM 元素
 *
 * @example
 * ```tsx
 * <MarkdownPreview
 *   content="# Hello World"
 *   typing={false}
 *   htmlRef={ref}
 *   beforeContent={<div>前置内容</div>}
 *   afterContent={<div>后置内容</div>}
 * />
 * ```
 */
export const MarkdownPreview = (props: MarkdownPreviewProps) => {
  const {
    content,
    extra,
    typing,
    htmlRef,
    fncProps,
    docListNode,
    beforeContent,
    afterContent,
  } = props;
  const MarkdownEditorRef = React.useRef<MarkdownEditorInstance | undefined>(
    undefined,
  );

  const { hidePadding } = useContext(MessagesContext) || {};

  const { locale, standalone } = useContext(BubbleConfigContext) || {};
  const { token } = theme.useToken();

  const isPaddingHidden = useMemo(() => {
    return !!extra;
  }, [extra, typing]);

  useEffect(() => {
    const schema = parserMdToSchema(content).schema;
    MarkdownEditorRef.current?.store.updateNodeList(schema);
  }, [content]);

  const markdown = useMemo(() => {
    const minWidth = content?.includes?.('chartType')
      ? standalone
        ? Math.max((htmlRef?.current?.clientWidth || 600) - 23, 500)
        : Math.min((htmlRef?.current?.clientWidth || 600) - 128, 500)
      : undefined;
    return (
      <MarkdownEditor
        {...(props.markdownRenderConfig || {})}
        fncProps={fncProps}
        editorRef={MarkdownEditorRef}
        initValue={content}
        toc={false}
        width="100%"
        height="auto"
        contentStyle={props.style}
        tableConfig={{
          actions: {
            fullScreen: 'modal',
          },
          ...(props.markdownRenderConfig?.tableConfig || {}),
        }}
        deps={[
          String(props.originData?.isLast),
          String(props.originData?.isFinished),
          String(props.originData?.isAborted),
        ]}
        rootContainer={htmlRef as any}
        editorStyle={{
          fontSize: 14,
          ...(props.markdownRenderConfig?.editorStyle || {}),
        }}
        typewriter={props.markdownRenderConfig?.typewriter ?? typing}
        style={{
          minWidth: minWidth ? `min(${minWidth}px,100%)` : undefined,
          maxWidth: standalone ? '100%' : undefined,
          padding: isPaddingHidden ? 0 : undefined,
          margin: isPaddingHidden ? 0 : undefined,
          ...(props.markdownRenderConfig?.style || {}),
        }}
        readonly
      />
    );
  }, [hidePadding, typing, props.originData?.isLast, isPaddingHidden, content]);

  const errorDom = (
    <div
      style={{
        padding: 'var(--padding-5x)',
        background: ' #FFFFFF',
        color: token.colorError,
        borderRadius: '16px 16px 2px 16px',
        border: '1px solid ' + token.colorErrorBorder,
        marginLeft: props.placement === 'right' ? 0 : 24,
        marginRight: props.placement === 'right' ? 24 : 0,
      }}
    >
      {locale?.['error.unexpected'] || '出现点意外情况，请重新发送'}
    </div>
  );

  if (props.placement !== 'right') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          maxWidth: '100%',
        }}
      >
        <ErrorBoundary fallback={errorDom}>
          {beforeContent}
          {markdown}
          {docListNode}
          {afterContent}
        </ErrorBoundary>
        {extra}
      </div>
    );
  }

  return (
    <Popover
      align={{
        points: ['tr', 'br'],
        offset: [0, -12],
      }}
      content={extra}
      styles={{
        root: {
          padding: 0,
          borderRadius: 'var(--radius-control-sm)',
          background: 'var(--color-primary-bg-page)',
          boxShadow: 'var(--shadow-control-base)',
        },
        body: {
          padding: 'var(--padding-0-5x)',
          borderRadius: 'var(--radius-control-sm)',
          background: 'var(--color-primary-bg-page)',
          boxShadow: 'var(--shadow-control-base)',
        },
      }}
      arrow={false}
      placement="bottomRight"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          maxWidth: '100%',
        }}
      >
        <ErrorBoundary fallback={errorDom}>
          {beforeContent}
          {markdown}
          {docListNode}
          {afterContent}
        </ErrorBoundary>
      </div>
    </Popover>
  );
};
