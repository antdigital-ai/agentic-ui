import { Popover } from 'antd';
import React, { useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocale } from '../../I18n';
import { MarkdownEditor } from '../../MarkdownEditor';
import type { MarkdownEditorPlugin } from '../../MarkdownEditor/plugin';
import type { MarkdownEditorProps } from '../../MarkdownEditor/types';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { MessageBubbleData } from '../type';
import {
  hasEditorDirectives,
  ReadonlyMarkdownContent,
} from './ReadonlyMarkdownContent';

export interface MarkdownPreviewProps {
  content: string;
  fncProps?: MarkdownEditorProps['fncProps'];
  placement?: 'left' | 'right';
  typing?: boolean;
  extra?: React.ReactNode;
  extraVisible?: boolean;
  docListNode?: React.ReactNode;
  htmlRef?: React.RefObject<HTMLDivElement | null>;
  isFinished?: boolean;
  style?: React.CSSProperties;
  originData?: MessageBubbleData;
  markdownRenderConfig?: MarkdownEditorProps;
  readonly?: boolean;
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

const DEFAULT_TABLE_CONFIG: MarkdownEditorProps['tableConfig'] = {
  actions: { fullScreen: 'modal' },
};

// Only select the lightweight view automatically when all requested behavior
// can be preserved. An explicit renderMode remains the caller's choice.
const RENDERER_CONFIG_KEYS = new Set<keyof MarkdownEditorProps>([
  'initValue',
  'readonly',
  'plugins',
  'streaming',
  'typewriter',
  'isFinished',
  'throttleOptions',
  'markdownToHtmlOptions',
  'fncProps',
  'linkConfig',
  'codeProps',
  'tableConfig',
  'apaasify',
  'eleRender',
  'fileMapConfig',
  'formula',
  'className',
  'style',
  'renderMode',
  'renderType',
]);

const supportsMarkdownRenderer = (config?: MarkdownEditorProps) => {
  if (!config) return true;
  if (
    Object.entries(config).some(
      ([key, value]) =>
        value !== undefined &&
        !RENDERER_CONFIG_KEYS.has(key as keyof MarkdownEditorProps),
    ) ||
    Object.entries(config.codeProps ?? {}).some(
      ([key, value]) => value !== undefined && key !== 'theme',
    ) ||
    Object.entries(config.tableConfig ?? {}).some(
      ([key, value]) =>
        value !== undefined && key !== 'actions' && key !== 'previewTitle',
    ) ||
    Object.entries(config.tableConfig?.actions ?? {}).some(
      ([key, value]) => value !== undefined && key !== 'fullScreen',
    ) ||
    config.apaasify?.render
  ) {
    return false;
  }
  return (
    (config.plugins as MarkdownEditorPlugin[] | undefined)?.every((plugin) => {
      return !(
        Object.keys(plugin.elements ?? {}).length > 0 ||
        plugin.parseMarkdown?.length ||
        plugin.withEditor ||
        plugin.jinja
      );
    }) ?? true
  );
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

  const config = useContext(BubbleConfigContext);
  const locale = useLocale();
  const standalone = config?.standalone;
  const extraShowOnHover = config?.extraShowOnHover;
  const rc = props.markdownRenderConfig;
  const markdownContent = rc?.initValue ?? content;
  const readonly = props.readonly ?? rc?.readonly ?? true;
  const hasEditableHistory = useRef(!readonly);
  useLayoutEffect(() => {
    if (!readonly) hasEditableHistory.current = true;
  }, [readonly]);
  const effectiveFncProps = fncProps ?? rc?.fncProps;
  const rendererTableConfig = useMemo(
    () => ({
      actions: rc?.tableConfig?.actions
        ? { fullScreen: rc.tableConfig.actions.fullScreen }
        : DEFAULT_TABLE_CONFIG?.actions,
      previewTitle: rc?.tableConfig?.previewTitle,
    }),
    [rc?.tableConfig],
  );
  const renderMode = useMemo(
    () =>
      rc?.renderMode ??
      rc?.renderType ??
      (!hasEditableHistory.current &&
      supportsMarkdownRenderer(rc) &&
      !hasEditorDirectives(markdownContent)
        ? 'markdown'
        : 'slate'),
    [rc, markdownContent, readonly],
  );
  const isFinished = props.originData?.isAborted
    ? true
    : (props.originData?.isFinished ?? props.isFinished ?? rc?.isFinished);
  const isStreaming =
    (rc?.streaming ?? rc?.typewriter ?? Boolean(typing)) &&
    (props.originData?.isLast ?? true) &&
    !isFinished;
  const noPadding = !!extra && props.extraVisible !== false;

  const markdown = useMemo(() => {
    if (markdownContent === '' && !rc?.initSchemaValue?.length) return null;

    if (readonly && renderMode === 'markdown') {
      return (
        <ReadonlyMarkdownContent
          preserveEditorDirectives={false}
          content={markdownContent}
          streaming={isStreaming}
          isFinished={isFinished}
          throttleOptions={rc?.throttleOptions}
          plugins={rc?.plugins}
          remarkPlugins={rc?.markdownToHtmlOptions}
          fncProps={effectiveFncProps}
          linkConfig={rc?.linkConfig}
          codeProps={rc?.codeProps}
          tableConfig={rendererTableConfig}
          apaasify={rc?.apaasify}
          fileMapConfig={rc?.fileMapConfig}
          eleRender={rc?.eleRender}
          formula={rc?.formula}
          className={rc?.className}
          style={{
            fontSize: 14,
            ...props.style,
            maxWidth: standalone ? '100%' : undefined,
            padding: noPadding ? 0 : undefined,
            margin: noPadding ? 0 : undefined,
            ...(rc?.style || {}),
          }}
        />
      );
    }

    const minWidth = markdownContent.includes('chartType')
      ? standalone
        ? Math.max((htmlRef?.current?.clientWidth || 600) - 23, 500)
        : Math.min((htmlRef?.current?.clientWidth || 600) - 128, 500)
      : undefined;

    return (
      <MarkdownEditor
        {...(rc || {})}
        fncProps={effectiveFncProps}
        initValue={markdownContent}
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
        isFinished={isFinished}
        style={{
          minWidth: minWidth ? `min(${minWidth}px,100%)` : undefined,
          maxWidth: standalone ? '100%' : undefined,
          padding: noPadding ? 0 : undefined,
          margin: noPadding ? 0 : undefined,
          ...(rc?.style || {}),
        }}
        readonly={readonly}
      />
    );
  }, [
    props.originData?.isLast,
    props.originData?.isFinished,
    props.originData?.isAborted,
    props.style,
    htmlRef,
    isStreaming,
    isFinished,
    noPadding,
    markdownContent,
    renderMode,
    rendererTableConfig,
    rc,
    effectiveFncProps,
    standalone,
    readonly,
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
      {(!extraShowOnHover || props.extraVisible === false) && extra}
    </div>
  );

  const needsActionPopover =
    extraShowOnHover || !readonly || hasEditableHistory.current;
  if (!needsActionPopover) return body;

  const isLeft = props.placement === 'left';
  const showHoverActions =
    !!extraShowOnHover && !!extra && !typing && props.extraVisible !== false;

  // Keep the body under the same parent while actions change visibility.
  // Removing Popover here remounts Slate and discards its local draft.
  return (
    <Popover
      destroyOnHidden
      trigger={showHoverActions ? 'hover' : []}
      {...(showHoverActions ? {} : { open: false })}
      align={{
        points: isLeft ? ['tl', 'bl'] : ['tr', 'br'],
        offset: [0, -12],
      }}
      content={showHoverActions ? extra : null}
      styles={
        {
          root: POPOVER_SHARED_STYLE,
          body: { ...POPOVER_SHARED_STYLE, padding: 'var(--padding-0-5x)' },
          content: { ...POPOVER_SHARED_STYLE, padding: 'var(--padding-0-5x)' },
        } as any
      }
      arrow={false}
      placement={isLeft ? 'bottomLeft' : 'bottomRight'}
    >
      {body}
    </Popover>
  );
};
