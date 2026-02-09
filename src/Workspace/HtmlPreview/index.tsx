import { ConfigProvider, Empty, Segmented, Spin } from 'antd';
import classNames from 'clsx';
import DOMPurify from 'dompurify';
import React, { useContext, useMemo, useState } from 'react';
import { I18nContext } from '../../I18n';
import { MarkdownEditor, type MarkdownEditorProps } from '../../MarkdownEditor';
import { useHtmlPreviewStyle } from './style';

export type HtmlViewMode = 'preview' | 'code';

export interface HtmlPreviewProps {
  html: string;
  status?: 'generating' | 'loading' | 'done' | 'error';
  viewMode?: HtmlViewMode;
  defaultViewMode?: HtmlViewMode;
  onViewModeChange?: (mode: HtmlViewMode) => void;
  markdownEditorProps?: Partial<MarkdownEditorProps>;
  iframeProps?: React.IframeHTMLAttributes<HTMLIFrameElement>;
  labels?: { preview?: string; code?: string };
  loadingRender?: React.ReactNode | (() => React.ReactNode);
  errorRender?: React.ReactNode | (() => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
  // 是否在组件内部渲染 Segmented；如为 false，父级可自定义外部切换
  showSegmented?: boolean;
  segmentedItems?: Array<{ label: React.ReactNode; value: string }>;
  emptyRender?: React.ReactNode | (() => React.ReactNode);
}

/**
 * HtmlPreview 组件 - HTML预览组件
 *
 * 该组件提供HTML内容的预览和代码查看功能，支持预览模式和代码模式的切换。
 * 使用DOMPurify进行安全的内容清理，支持iframe预览和Markdown代码显示。
 *
 * @component
 * @description HTML预览组件，支持预览和代码模式切换
 * @param {HtmlPreviewProps} props - 组件属性
 * @param {string} props.html - HTML内容字符串
 * @param {'generating' | 'loading' | 'done' | 'error'} [props.status] - 内容状态
 * @param {HtmlViewMode} [props.viewMode] - 当前视图模式（受控模式）
 * @param {HtmlViewMode} [props.defaultViewMode='preview'] - 默认视图模式
 * @param {(mode: HtmlViewMode) => void} [props.onViewModeChange] - 视图模式变化回调
 * @param {Partial<MarkdownEditorProps>} [props.markdownEditorProps] - Markdown编辑器配置
 * @param {React.IframeHTMLAttributes<HTMLIFrameElement>} [props.iframeProps] - iframe属性
 * @param {Object} [props.labels] - 自定义标签文本
 * @param {React.ReactNode | (() => React.ReactNode)} [props.loadingRender] - 自定义加载渲染
 * @param {React.ReactNode | (() => React.ReactNode)} [props.errorRender] - 自定义错误渲染
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {boolean} [props.showSegmented=true] - 是否显示分段控制器
 * @param {Array<{label: React.ReactNode, value: string}>} [props.segmentedItems] - 自定义分段选项
 *
 * @example
 * ```tsx
 * <HtmlPreview
 *   html="<h1>Hello World</h1>"
 *   status="done"
 *   defaultViewMode="preview"
 *   onViewModeChange={(mode) => console.log('模式切换:', mode)}
 *   labels={{ preview: '预览', code: '源码' }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的HTML预览组件
 *
 * @remarks
 * - 支持预览模式和代码模式切换
 * - 使用DOMPurify进行安全的内容清理
 * - 提供iframe预览功能
 * - 支持Markdown代码显示
 * - 提供加载和错误状态处理
 * - 支持自定义渲染内容
 * - 响应式布局设计
 * - 支持受控和非受控模式
 */
export const HtmlPreview: React.FC<HtmlPreviewProps> = (props) => {
  const {
    html,
    status: inputStatus,
    viewMode,
    defaultViewMode = 'preview',
    onViewModeChange,
    markdownEditorProps,
    iframeProps,
    labels,
    loadingRender,
    errorRender,
    className,
    style,
    showSegmented = true,
    segmentedItems,
    emptyRender,
  } = props;

  const status = inputStatus === 'generating' ? 'loading' : inputStatus;
  const isControlled = viewMode !== undefined;
  const [innerMode, setInnerMode] = useState<HtmlViewMode>(defaultViewMode);
  const mode = isControlled ? (viewMode as HtmlViewMode) : innerMode;

  const { locale } = useContext(I18nContext);

  const handleModeChange = (m: HtmlViewMode) => {
    if (!isControlled) setInnerMode(m);
    onViewModeChange?.(m);
  };

  // 始终在 html 变化时更新 iframe 内容，避免首次未显示
  const iframeHtml = useMemo(() => DOMPurify.sanitize(html || ''), [html]);

  const labelsMap = {
    preview: labels?.preview || locale?.['htmlPreview.preview'] || '预览',
    code: labels?.code || locale?.['htmlPreview.code'] || '代码',
  };

  // 使用 ConfigProvider 获取前缀类名
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('workspace-html-preview');

  const overlayNode = (() => {
    if (status !== 'loading' && status !== 'error') return null;
    const loadingNode =
      typeof loadingRender === 'function' ? loadingRender() : loadingRender;
    const errorNode =
      typeof errorRender === 'function' ? errorRender() : errorRender;
    return (
      <div
        className={classNames(`${prefixCls}-overlay`, {
          [`${prefixCls}-overlay--loading`]: status === 'loading',
          [`${prefixCls}-overlay--error`]: status === 'error',
        })}
      >
        {status === 'loading'
          ? loadingNode || <Spin />
          : errorNode || (
              <span>
                {locale?.['htmlPreview.renderFailed'] || '页面渲染失败'}
              </span>
            )}
      </div>
    );
  })();

  const getMergedMdConfig = () => {
    const defaultMdConfig: Partial<MarkdownEditorProps> = {
      width: '100%',
      height: '100%',
      contentStyle: {
        width: '100%',
        padding: 0,
        marginTop: -10,
      },
      codeProps: {
        showGutter: true,
        showLineNumbers: true,
        hideToolBar: true,
      },
    };
    return {
      ...defaultMdConfig,
      ...markdownEditorProps,
    };
  };

  const { wrapSSR, hashId } = useHtmlPreviewStyle(prefixCls);

  const isEmpty = (html ?? '').trim() === '';
  const shouldShowEmpty = isEmpty && status !== 'loading' && status !== 'error';
  const emptyNode =
    typeof emptyRender === 'function' ? emptyRender() : emptyRender;

  return wrapSSR(
    <div className={classNames(prefixCls, className, hashId)} style={style}>
      {showSegmented && (
        <div className={classNames(`${prefixCls}-actions`, hashId)}>
          {segmentedItems && segmentedItems.length > 0 ? (
            <Segmented
              options={segmentedItems}
              value={mode}
              onChange={(v) => handleModeChange(String(v) as HtmlViewMode)}
            />
          ) : (
            <Segmented
              size="small"
              options={[
                { label: labelsMap.preview, value: 'preview' },
                { label: labelsMap.code, value: 'code' },
              ]}
              value={mode}
              onChange={(v) => handleModeChange(v as HtmlViewMode)}
            />
          )}
        </div>
      )}

      <div
        className={classNames(`${prefixCls}-content`, hashId)}
        style={{ minHeight: 240 }}
      >
        {overlayNode}
        {shouldShowEmpty ? (
          <div className={classNames(`${prefixCls}-empty`, hashId)}>
            {emptyNode || (
              <Empty description={locale?.['workspace.empty'] || 'No data'} />
            )}
          </div>
        ) : mode === 'code' ? (
          <MarkdownEditor
            {...getMergedMdConfig()}
            readonly
            toc={false}
            initValue={`\`\`\`html\n${html || ''}\n\`\`\``}
          />
        ) : (
          <iframe
            title="html-preview"
            className={classNames(`${prefixCls}-iframe`, hashId)}
            sandbox={iframeProps?.sandbox || 'allow-scripts'}
            srcDoc={iframeHtml}
            key={iframeHtml}
            {...iframeProps}
          />
        )}
      </div>
    </div>,
  );
};

export default HtmlPreview;
