import { Popover } from 'antd';
import React, { useContext, useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  MarkdownEditor,
  MarkdownEditorInstance,
  MarkdownEditorProps,
  parserMdToSchema,
} from '../../';
import { useLocale } from '../../I18n';
import { MarkdownRenderer } from '../../MarkdownRenderer';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { MessageBubbleData } from '../type';
import { MessagesContext } from './BubbleContext';

export interface MarkdownPreviewProps {
  content: string;
  fncProps?: MarkdownEditorProps['fncProps'];
  placement?: 'left' | 'right';
  typing?: boolean;
  extra?: React.ReactNode;
  docListNode?: React.ReactNode;
  htmlRef?: React.RefObject<HTMLDivElement>;
  isFinished?: boolean;
  style?: React.CSSProperties;
  originData?: MessageBubbleData;
  markdownRenderConfig?: MarkdownEditorProps;
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
}

const CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  maxWidth: '100%',
};

const POPOVER_SHARED_STYLE: React.CSSProperties = {
  padding: 0,
  borderRadius: 'var(--radius-control-sm)',
  background: 'var(--color-primary-bg-page)',
  boxShadow: 'var(--shadow-control-base)',
};

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

  const editorRef = React.useRef<MarkdownEditorInstance | undefined>(undefined);
  const { hidePadding } = useContext(MessagesContext) || {};
  const config = useContext(BubbleConfigContext);
  const locale = useLocale();
  const standalone = config?.standalone;
  const extraShowOnHover = config?.extraShowOnHover;
  const rc = props.markdownRenderConfig;
  const renderMode = rc?.renderMode ?? rc?.renderType ?? 'slate';
  const isStreaming =
    (rc?.streaming ?? rc?.typewriter ?? Boolean(typing)) &&
    (props.originData?.isLast ?? true);
  const isFinished = props.originData?.isFinished ?? props.isFinished;
  const noPadding = !!extra;

  useEffect(() => {
    if (renderMode !== 'slate') return;
    editorRef.current?.store.updateNodeList(
      parserMdToSchema(content).schema,
    );
  }, [content, renderMode]);

  const markdown = useMemo(() => {
    if (renderMode === 'markdown') {
      return (
        <MarkdownRenderer
          content={content}
          streaming={isStreaming}
          isFinished={isFinished}
          plugins={rc?.plugins}
          remarkPlugins={rc?.markdownToHtmlOptions}
          queueOptions={rc?.queueOptions}
          streamingParagraphAnimation={rc?.streamingParagraphAnimation}
          fncProps={fncProps}
          linkConfig={rc?.linkConfig}
          codeProps={rc?.codeProps}
          apaasify={rc?.apaasify}
          fileMapConfig={rc?.fileMapConfig}
          eleRender={rc?.eleRender}
          style={{
            maxWidth: standalone ? '100%' : undefined,
            padding: noPadding ? 0 : undefined,
            margin: noPadding ? 0 : undefined,
            ...(rc?.style || {}),
          }}
        />
      );
    }

    const minWidth = content?.includes?.('chartType')
      ? standalone
        ? Math.max((htmlRef?.current?.clientWidth || 600) - 23, 500)
        : Math.min((htmlRef?.current?.clientWidth || 600) - 128, 500)
      : undefined;

    return (
      <MarkdownEditor
        {...(rc || {})}
        fncProps={fncProps}
        editorRef={editorRef}
        initValue={content}
        toc={false}
        width="100%"
        height="auto"
        contentStyle={props.style}
        tableConfig={{
          actions: { fullScreen: 'modal' },
          ...(rc?.tableConfig || {}),
        }}
        deps={[
          String(props.originData?.isLast),
          String(props.originData?.isFinished),
          String(props.originData?.isAborted),
        ]}
        rootContainer={htmlRef as any}
        editorStyle={{ fontSize: 14, ...(rc?.editorStyle || {}) }}
        streaming={isStreaming}
        style={{
          minWidth: minWidth ? `min(${minWidth}px,100%)` : undefined,
          maxWidth: standalone ? '100%' : undefined,
          padding: noPadding ? 0 : undefined,
          margin: noPadding ? 0 : undefined,
          ...(rc?.style || {}),
        }}
        readonly
      />
    );
  }, [
    hidePadding,
    typing,
    props.originData?.isLast,
    props.originData?.isFinished,
    noPadding,
    content,
    renderMode,
    rc,
    fncProps,
    standalone,
  ]);

  const errorDom = (
    <div
      style={{
        padding: 'var(--padding-5x)',
        background: 'var(--ant-color-bg-container, #fff)',
        color: 'var(--ant-color-error, #ff4d4f)',
        borderRadius: '16px 16px 2px 16px',
        border: '1px solid var(--ant-color-error-border, #ffccc7)',
        marginLeft: props.placement === 'right' ? 0 : 24,
        marginRight: props.placement === 'right' ? 24 : 0,
      }}
    >
      {locale?.['error.unexpected'] || '出现点意外情况，请重新发送'}
    </div>
  );

  const body = (
    <div style={CONTAINER_STYLE}>
      <ErrorBoundary fallback={errorDom}>
        {beforeContent}
        {markdown}
        {docListNode}
        {afterContent}
      </ErrorBoundary>
      {!extraShowOnHover && extra}
    </div>
  );

  if (!extraShowOnHover || !extra || typing) return body;

  const isLeft = props.placement === 'left';

  return (
    <Popover
      trigger="hover"
      align={{
        points: isLeft ? ['tl', 'bl'] : ['tr', 'br'],
        offset: [0, -12],
      }}
      content={extra}
      styles={{ root: POPOVER_SHARED_STYLE, body: { ...POPOVER_SHARED_STYLE, padding: 'var(--padding-0-5x)' } }}
      arrow={false}
      placement={isLeft ? 'bottomLeft' : 'bottomRight'}
    >
      {body}
    </Popover>
  );
};
