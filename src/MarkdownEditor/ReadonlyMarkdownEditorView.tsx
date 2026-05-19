import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext, useRef } from 'react';
import { MarkdownRenderer } from '../MarkdownRenderer';
import I18nBoundary from './I18nBoundary';
import { PluginContext } from './plugin';
import { useStyle } from './style';
import { MarkdownEditorProps } from './types';
import { resolveContainerContentStyle } from '../Constants/contentPaddingVars';
import { sanitizeEditorChromeStyle } from './utils/sanitizeChromeStyle';

/**
 * 只读 + renderMode=markdown 专用外壳：不挂载 Slate / EditorStore，不执行 parserMdToSchema 等编辑侧逻辑。
 * 与 BaseMarkdownEditorSlate 二选一，由 BaseMarkdownEditor 根入口按 props 分流。
 */
const ReadonlyMarkdownEditorView: React.FC<MarkdownEditorProps> = (props) => {
  const {
    id,
    initValue = '',
    width,
    className,
    reportMode,
    slideMode,
    contentStyle: rawContentStyle = { height: '100%' },
    style: rawStyle,
    height,
    children,
  } = props;

  const contentStyle = resolveContainerContentStyle(
    sanitizeEditorChromeStyle(rawContentStyle),
  );
  const rootStyle = sanitizeEditorChromeStyle(rawStyle);
  const markdownContainerRef = useRef<HTMLDivElement | null>(null);

  const isStreaming = props.streaming ?? props.typewriter ?? false;

  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls('agentic-md-editor');
  const { wrapSSR, hashId } = useStyle(baseClassName);

  return wrapSSR(
    <I18nBoundary>
      <PluginContext.Provider value={props.plugins || []}>
        <div
          id={id ? String(id) || undefined : undefined}
          className={classNames(
            baseClassName,
            'markdown-editor',
            hashId,
            className,
            {
              [`${baseClassName}-readonly`]: true,
              [`${baseClassName}-report`]: reportMode,
              [`${baseClassName}-slide`]: slideMode,
            },
          )}
          data-testid="markdown-editor"
          style={{
            width: width || '100%',
            height: height || 'auto',
            ...rootStyle,
          }}
          ref={markdownContainerRef}
        >
          <MarkdownRenderer
            content={initValue}
            streaming={isStreaming}
            isFinished={props.isFinished ?? !isStreaming}
            queueOptions={props.queueOptions}
            streamingParagraphAnimation={props.streamingParagraphAnimation}
            plugins={props.plugins}
            remarkPlugins={props.markdownToHtmlOptions}
            codeProps={props.codeProps}
            apaasify={props.apaasify}
            style={{
              height: '100%',
              ...contentStyle,
            }}
            prefixCls={baseClassName}
            fncProps={props.fncProps}
            linkConfig={props.linkConfig}
            eleRender={props.eleRender}
            fileMapConfig={props.fileMapConfig}
          />
          {children}
        </div>
      </PluginContext.Provider>
    </I18nBoundary>,
  );
};

export default ReadonlyMarkdownEditorView;
