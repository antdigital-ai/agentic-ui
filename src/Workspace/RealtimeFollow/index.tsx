import {
  FileMarkdown,
  FileXml,
  ArrowLeft as LeftIcon,
  SquareTerminal,
} from '@sofa-design/icons';
import { ConfigProvider, Empty, Segmented, Spin } from 'antd';
import classNames from 'clsx';
import React, { useContext, useEffect, useRef, useState } from 'react';
import useAutoScroll from '../../Hooks/useAutoScroll';
import { I18nContext } from '../../I18n';
import {
  MarkdownEditor,
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from '../../MarkdownEditor';
import { parserMdToSchema } from '../../MarkdownEditor/editor/parser/parserMdToSchema';
import { HtmlPreview } from '../HtmlPreview';
import { useRealtimeFollowStyle } from './style';

const SCROLL_TOLERANCE = 30;
const SCROLL_TIMEOUT = 100;
const SCROLL_DELAY = 50;

export type RealtimeFollowMode =
  | 'shell'
  | 'html'
  | 'markdown'
  | 'md'
  | 'default';

export interface DiffContent {
  original: string;
  modified: string;
}

export interface RealtimeFollowData {
  type: RealtimeFollowMode;
  content?: string | DiffContent;
  markdownEditorProps?: Partial<MarkdownEditorProps>;
  title?: string;
  subTitle?: string;
  icon?: React.ComponentType;
  typewriter?: boolean;
  rightContent?: React.ReactNode;
  loadingRender?: React.ReactNode | (() => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
  errorRender?: React.ReactNode | (() => React.ReactNode);
  emptyRender?: React.ReactNode | (() => React.ReactNode);
  status?: 'loading' | 'done' | 'error';
  onBack?: () => void;
  customContent?: React.ReactNode | (() => React.ReactNode);
  viewMode?: 'preview' | 'code';
  defaultViewMode?: 'preview' | 'code';
  onViewModeChange?: (mode: 'preview' | 'code') => void;
  iframeProps?: React.IframeHTMLAttributes<HTMLIFrameElement>;
  labels?: { preview?: string; code?: string };
  segmentedItems?: Array<{ label: React.ReactNode; value: string }>;
  segmentedExtra?: React.ReactNode;
}

const TYPE_CONFIGS: Record<
  RealtimeFollowMode,
  { icon: React.ComponentType; titleKey: string; defaultTitle: string }
> = {
  shell: {
    icon: SquareTerminal,
    titleKey: 'workspace.terminalExecution',
    defaultTitle: '终端执行',
  },
  html: {
    icon: FileXml,
    titleKey: 'workspace.createHtmlFile',
    defaultTitle: '创建 HTML 文件',
  },
  markdown: {
    icon: FileMarkdown,
    titleKey: 'workspace.markdownContent',
    defaultTitle: 'Markdown 内容',
  },
  md: {
    icon: FileMarkdown,
    titleKey: 'workspace.markdownContent',
    defaultTitle: 'Markdown 内容',
  },
  default: {
    icon: SquareTerminal,
    titleKey: 'workspace.terminalExecution',
    defaultTitle: '终端执行',
  },
};

const ICON_TYPE_CLASSES: Record<string, string> = {
  html: 'html',
  markdown: 'md',
  md: 'md',
};

const getTypeConfig = (type: RealtimeFollowMode, locale?: any) => {
  const config = TYPE_CONFIGS[type];
  return {
    icon: config.icon,
    title: locale?.[config.titleKey] || config.defaultTitle,
  };
};

const getIconTypeClass = (type: RealtimeFollowMode, prefixCls: string) => {
  const suffix = ICON_TYPE_CLASSES[type] || 'default';
  return `${prefixCls}-header-icon--${suffix}`;
};

const isTestEnvironment = () => process.env.NODE_ENV === 'test';

const renderNode = (node: React.ReactNode | (() => React.ReactNode)) => {
  return typeof node === 'function' ? node() : node;
};

const RealtimeHeader: React.FC<{
  data: RealtimeFollowData;
  hasBorder?: boolean;
  prefixCls?: string;
  hashId?: string;
}> = ({ data, hasBorder, prefixCls, hashId }) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const finalPrefixCls = prefixCls || getPrefixCls('workspace-realtime');
  const config = getTypeConfig(data.type, locale);

  const IconComponent = data.icon || config.icon;
  const headerTitle = data.title || config.title;
  const headerSubTitle = data.subTitle;
  const hasBackButton = Boolean(data.onBack);

  const iconNode = (
    <div
      className={classNames(
        `${finalPrefixCls}-header-icon`,
        getIconTypeClass(data.type, finalPrefixCls),
        hashId,
      )}
    >
      <IconComponent />
    </div>
  );

  return (
    <header
      className={classNames(
        `${finalPrefixCls}-header`,
        {
          [`${finalPrefixCls}-header-with-border`]: hasBorder,
          [`${finalPrefixCls}-header-with-back`]: hasBackButton,
        },
        hashId,
      )}
    >
      <div className={classNames(`${finalPrefixCls}-header-left`, hashId)}>
        {hasBackButton && (
          <button
            type="button"
            className={classNames(
              `${finalPrefixCls}-header-back-button`,
              hashId,
            )}
            onClick={data.onBack}
          >
            <LeftIcon
              className={classNames(
                `${finalPrefixCls}-header-back-icon`,
                hashId,
              )}
            />
          </button>
        )}
        <div className={classNames(`${finalPrefixCls}-header-content`, hashId)}>
          {!hasBackButton && iconNode}
          <div
            className={classNames(
              `${finalPrefixCls}-header-title-wrapper`,
              hashId,
            )}
          >
            <div
              className={classNames(`${finalPrefixCls}-header-title`, hashId)}
            >
              {hasBackButton && iconNode}
              {headerTitle}
            </div>
            {headerSubTitle && (
              <div
                className={classNames(
                  `${finalPrefixCls}-header-subtitle`,
                  hashId,
                )}
                title={headerSubTitle}
              >
                {headerSubTitle}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={classNames(`${finalPrefixCls}-header-right`, hashId)}>
        {data.rightContent}
      </div>
    </header>
  );
};

const BASE_EDITOR_CONFIG: Partial<MarkdownEditorProps> = {
  readonly: true,
  toc: false,
  style: { width: '100%' },
  typewriter: true,
};

const SHELL_CODE_PROPS = {
  theme: 'chaos',
  showGutter: true,
  showLineNumbers: true,
  hideToolBar: true,
};

const VISIBLE_OVERFLOW_STYLE = { overflow: 'visible' };

const EDITOR_CONFIGS: Record<string, Partial<MarkdownEditorProps>> = {
  shell: {
    ...BASE_EDITOR_CONFIG,
    contentStyle: { padding: 0, ...VISIBLE_OVERFLOW_STYLE },
    codeProps: SHELL_CODE_PROPS,
  },
  markdown: {
    ...BASE_EDITOR_CONFIG,
    contentStyle: { padding: 16, ...VISIBLE_OVERFLOW_STYLE },
    height: '100%',
  },
};

const getEditorConfig = (
  type: RealtimeFollowMode,
): Partial<MarkdownEditorProps> => {
  if (type === 'md') return EDITOR_CONFIGS.markdown;
  return EDITOR_CONFIGS[type] || BASE_EDITOR_CONFIG;
};

const Overlay: React.FC<{
  status?: 'loading' | 'done' | 'error';
  loadingRender?: React.ReactNode | (() => React.ReactNode);
  errorRender?: React.ReactNode | (() => React.ReactNode);
  prefixCls?: string;
  hashId?: string;
}> = ({ status, loadingRender, errorRender, prefixCls, hashId }) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const finalPrefixCls = prefixCls || getPrefixCls('workspace-realtime');

  if (status !== 'loading' && status !== 'error') return null;

  const loadingNode = renderNode(loadingRender);
  const errorNode = renderNode(errorRender);

  const content =
    status === 'loading'
      ? loadingNode || <Spin />
      : errorNode || (
          <span>{locale?.['htmlPreview.renderFailed'] || '页面渲染失败'}</span>
        );

  return (
    <div
      className={classNames(
        `${finalPrefixCls}-overlay`,
        {
          [`${finalPrefixCls}-overlay--loading`]: status === 'loading',
          [`${finalPrefixCls}-overlay--error`]: status === 'error',
        },
        hashId,
      )}
    >
      {content}
    </div>
  );
};

const getContentForEditor = (
  type: RealtimeFollowMode,
  content: string | DiffContent | undefined,
): string => {
  if (type === 'html') {
    const html = typeof content === 'string' ? content : '';
    return `\`\`\`html\n${html}\n\`\`\``;
  }
  return String(content);
};

const shouldUpdateEditor = (
  type: RealtimeFollowMode,
  htmlViewMode: 'preview' | 'code',
): boolean => {
  if (type === 'shell') return true;
  if (type === 'markdown' || type === 'md') return true;
  if (type === 'html' && htmlViewMode === 'code') return true;
  return false;
};

/**
 * RealtimeFollow 组件
 *
 * 实时跟随显示，支持 HTML、Markdown、Shell 等类型
 *
 * @example
 * ```tsx
 * <RealtimeFollow data={{ type: 'shell', content: '$ ls' }} />
 * ```
 */
export const RealtimeFollow: React.FC<{
  data: RealtimeFollowData;
  htmlViewMode?: 'preview' | 'code';
  prefixCls?: string;
  hashId?: string;
}> = ({ data, htmlViewMode = 'preview', prefixCls, hashId }) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const finalPrefixCls = prefixCls || getPrefixCls('workspace-realtime');
  const mdInstance = useRef<MarkdownEditorInstance>();
  const isTestEnv = isTestEnvironment();
  const { containerRef: autoScrollRef, scrollToBottom } = useAutoScroll({
    SCROLL_TOLERANCE,
    timeout: SCROLL_TIMEOUT,
    deps: [isTestEnv],
  });

  useEffect(() => {
    if (isTestEnv || !mdInstance.current?.store) return;
    if (!shouldUpdateEditor(data.type, htmlViewMode)) return;

    const content = getContentForEditor(data.type, data.content);
    const { schema } = parserMdToSchema(
      content,
      mdInstance.current.store.plugins,
    );
    mdInstance.current.store.updateNodeList(schema);

    if (data.typewriter && !isTestEnv) {
      setTimeout(() => scrollToBottom(), SCROLL_DELAY);
    }
  }, [
    data.content,
    data.type,
    htmlViewMode,
    isTestEnv,
    data.typewriter,
    scrollToBottom,
  ]);

  if (data.customContent) {
    const customNode = renderNode(data.customContent);
    return (
      <div className={classNames(`${finalPrefixCls}-content`, hashId)}>
        {customNode || null}
      </div>
    );
  }

  if (data.type === 'html') {
    const html = typeof data.content === 'string' ? data.content : '';
    return (
      <div className={classNames(`${finalPrefixCls}-content`, hashId)}>
        <HtmlPreview
          html={html}
          status={isTestEnv ? 'done' : data.status}
          viewMode={htmlViewMode}
          onViewModeChange={(m) => data.onViewModeChange?.(m)}
          markdownEditorProps={data.markdownEditorProps}
          iframeProps={data.iframeProps}
          labels={data.labels}
          loadingRender={isTestEnv ? undefined : data.loadingRender}
          errorRender={isTestEnv ? undefined : data.errorRender}
          showSegmented={false}
          emptyRender={isTestEnv ? undefined : data.emptyRender}
        />
      </div>
    );
  }

  if (!['shell', 'markdown', 'md', 'default'].includes(data.type)) {
    return null;
  }

  const defaultProps = getEditorConfig(data.type);
  const mergedProps = {
    ...defaultProps,
    ...data.markdownEditorProps,
    typewriter: isTestEnv
      ? false
      : (data.typewriter ?? defaultProps.typewriter),
    style: {
      maxHeight: 'auto',
      ...defaultProps.style,
      ...data.markdownEditorProps?.style,
    },
  };

  const contentStr = String(data.content ?? '');
  const isEmpty = contentStr.trim() === '';
  const shouldShowEmpty =
    !isTestEnv &&
    isEmpty &&
    data.status !== 'loading' &&
    data.status !== 'error';
  const emptyNode = renderNode(data.emptyRender);

  return (
    <div
      className={classNames(`${finalPrefixCls}-content`, hashId)}
      ref={isTestEnv ? undefined : autoScrollRef}
    >
      {!isTestEnv && (
        <Overlay
          status={data.status}
          loadingRender={data.loadingRender}
          errorRender={data.errorRender}
          prefixCls={prefixCls}
          hashId={hashId}
        />
      )}
      {shouldShowEmpty ? (
        <div className={classNames(`${finalPrefixCls}-empty`, hashId)}>
          {emptyNode || <Empty />}
        </div>
      ) : (
        <MarkdownEditor
          {...mergedProps}
          editorRef={mdInstance}
          initValue={String(data.content)}
        />
      )}
    </div>
  );
};

const getSegmentedOptions = (labels: { preview: string; code: string }) => [
  {
    label: <div className="ant-segmented-item-title">{labels.preview}</div>,
    value: 'preview',
  },
  {
    label: <div className="ant-segmented-item-title">{labels.code}</div>,
    value: 'code',
  },
];

const getRightContent = (
  data: RealtimeFollowData,
  labels: { preview: string; code: string },
  htmlViewMode: 'preview' | 'code',
  handleSetMode: (mode: 'preview' | 'code') => void,
  prefixCls: string,
  hashId: string,
): React.ReactNode => {
  if (data.rightContent) return data.rightContent;
  if (data.type !== 'html') return null;

  const segmentedNode =
    data.segmentedItems && data.segmentedItems.length > 0 ? (
      <Segmented
        options={data.segmentedItems}
        onChange={(val) => data.onViewModeChange?.(String(val) as any)}
      />
    ) : (
      <Segmented
        options={getSegmentedOptions(labels)}
        value={htmlViewMode}
        onChange={(val) => handleSetMode(val as 'preview' | 'code')}
      />
    );

  if (!data.segmentedExtra) return segmentedNode;

  return (
    <div className={classNames(`${prefixCls}-header-segmented-right`, hashId)}>
      {segmentedNode}
      <div
        className={classNames(
          `${prefixCls}-header-segmented-right-extra`,
          hashId,
        )}
      >
        {data.segmentedExtra}
      </div>
    </div>
  );
};

/**
 * RealtimeFollowList 组件
 *
 * RealtimeFollow 的包装组件，管理视图模式状态
 */
export const RealtimeFollowList: React.FC<{
  data: RealtimeFollowData;
}> = ({ data }) => {
  const isControlled = data.type === 'html' && data.viewMode !== undefined;
  const [innerViewMode, setInnerViewMode] = useState<'preview' | 'code'>(
    data.defaultViewMode || 'preview',
  );

  const htmlViewMode: 'preview' | 'code' =
    data.type === 'html'
      ? isControlled
        ? (data.viewMode as any)
        : innerViewMode
      : 'preview';

  const handleSetMode = (mode: 'preview' | 'code') => {
    if (!isControlled) setInnerViewMode(mode);
    data.onViewModeChange?.(mode);
  };

  const { locale } = useContext(I18nContext);
  const labels = {
    preview: data.labels?.preview || locale?.['htmlPreview.preview'] || '预览',
    code: data.labels?.code || locale?.['htmlPreview.code'] || '代码',
  };

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('workspace-realtime');
  const styleResult = useRealtimeFollowStyle(prefixCls);
  const { wrapSSR, hashId } = styleResult || {
    wrapSSR: (node: any) => node,
    hashId: '',
  };

  const rightContent = getRightContent(
    data,
    labels,
    htmlViewMode,
    handleSetMode,
    prefixCls,
    hashId,
  );

  const headerData: RealtimeFollowData = { ...data, rightContent };
  const hasBorder = data.type === 'html' || data.type === 'markdown';

  return wrapSSR(
    <div
      className={classNames(
        `${prefixCls}-container`,
        `${prefixCls}--${data.type}`,
        data.className,
        hashId,
      )}
      style={data.style}
      data-testid="realtime-follow"
    >
      <RealtimeHeader
        data={headerData}
        hasBorder={hasBorder}
        prefixCls={prefixCls}
        hashId={hashId}
      />
      <RealtimeFollow
        data={data}
        htmlViewMode={htmlViewMode}
        prefixCls={prefixCls}
        hashId={hashId}
      />
    </div>,
  );
};
