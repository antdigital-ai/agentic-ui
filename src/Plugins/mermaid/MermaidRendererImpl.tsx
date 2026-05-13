import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { ConfigProvider, theme } from 'antd';
import classNames from 'clsx';
import copy from 'copy-to-clipboard';
import React, { useContext, useMemo, useRef } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { useIntersectionOnce } from '../../Hooks/useIntersectionOnce';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { useLocale } from '../../I18n';
import { getSlateElementPlainText } from '../../MarkdownEditor/editor/utils/codeBlockPlainText';
import { CodeNode } from '../../MarkdownEditor/el';
import { useStyle } from './style';
import { useMermaidRender } from './useMermaidRender';
import { createMermaidThemeConfig } from './utils';

const PRE_STYLE: React.CSSProperties = {
  margin: 0,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const serializeSvgForFile = (svg: SVGSVGElement): string => {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  if (!clone.getAttribute('xmlns:xlink')) {
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }
  return new XMLSerializer().serializeToString(clone);
};

export const MermaidRendererImpl = (props: { element: CodeNode }) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const locale = useLocale();
  const { token } = theme.useToken();
  const baseCls =
    context?.getPrefixCls('agentic-plugin-mermaid') || 'plugin-mermaid';
  const { wrapSSR, hashId } = useStyle(baseCls);
  const containerRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const id = useMemo(
    () => 'm' + (Date.now() + Math.ceil(Math.random() * 1000)),
    [],
  );
  const mermaidTheme = useMemo(
    () =>
      createMermaidThemeConfig({
        colorBgContainer: token.colorBgContainer,
        colorBgElevated: token.colorBgElevated,
        colorText: token.colorText,
        colorTextSecondary: token.colorTextSecondary,
        colorBorder: token.colorBorder,
        colorPrimary: token.colorPrimary,
        fontFamily: token.fontFamily,
      }),
    [
      token.colorBgContainer,
      token.colorBgElevated,
      token.colorText,
      token.colorTextSecondary,
      token.colorBorder,
      token.colorPrimary,
      token.fontFamily,
    ],
  );
  const isVisible = useIntersectionOnce(containerRef);
  const mermaidSource = getSlateElementPlainText(props.element);
  const { error, renderedCode } = useMermaidRender(
    mermaidSource,
    divRef,
    id,
    isVisible,
    {
      colorBgContainer: token.colorBgContainer,
      colorBgElevated: token.colorBgElevated,
      colorText: token.colorText,
      colorTextSecondary: token.colorTextSecondary,
      colorBorder: token.colorBorder,
      colorPrimary: token.colorPrimary,
      fontFamily: token.fontFamily,
    },
  );

  const isError = useMemo(() => !!error && !!error.trim(), [error]);
  const isRendered = useMemo(
    () => !!renderedCode && !isError,
    [renderedCode, isError],
  );

  const diagramStyle = useMemo(
    () =>
      ({
        opacity: isRendered ? 1 : 0,
        pointerEvents: isRendered ? 'auto' : 'none',
        width: '100%',
        minHeight: isRendered ? '120px' : '0',
        maxHeight: isRendered ? 'none' : '0',
        height: isRendered ? 'auto' : '0',
        overflow: isRendered ? 'auto' : 'hidden',
      }) as React.CSSProperties,
    [isRendered],
  );

  const code = mermaidSource;

  const handleCopySource = useRefFunction(() => {
    if (!code) {
      return;
    }
    copy(code);
  });

  const handleDownloadSvg = useRefFunction(() => {
    const root = divRef.current;
    if (!root) {
      return;
    }
    const svg = root.querySelector(
      '[data-mermaid-svg="true"]',
    ) as SVGSVGElement | null;
    if (!svg) {
      return;
    }
    const payload = serializeSvgForFile(svg);
    const blob = new Blob([payload], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `mermaid-diagram-${Date.now()}.svg`;
    anchor.rel = 'noopener';
    anchor.click();
    URL.revokeObjectURL(url);
  });

  return wrapSSR(
    <div
      ref={containerRef}
      className={classNames(baseCls, hashId)}
      contentEditable={false}
      data-mermaid-theme={mermaidTheme.darkMode ? 'dark' : 'light'}
    >
      <div
        contentEditable={false}
        className={classNames(`${baseCls}-viewport`, hashId)}
        data-mermaid-viewport="true"
      >
        <div
          contentEditable={false}
          ref={divRef}
          className={classNames(hashId)}
          style={diagramStyle}
          data-mermaid-container="true"
        />
        {isRendered && (
          <div
            className={classNames(`${baseCls}-toolbar-float`, hashId)}
            role="toolbar"
            aria-label="Mermaid diagram actions"
            data-mermaid-toolbar
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
          >
            <span data-mermaid-action="copy-source">
              <ActionIconBox
                title={locale.copy}
                borderLess
                noPadding
                onClick={handleCopySource}
                iconStyle={{ color: token.colorTextSecondary }}
              >
                <CopyOutlined />
              </ActionIconBox>
            </span>
            <span data-mermaid-action="download-svg">
              <ActionIconBox
                title={locale.download}
                borderLess
                noPadding
                onClick={handleDownloadSvg}
                iconStyle={{ color: token.colorTextSecondary }}
              >
                <DownloadOutlined />
              </ActionIconBox>
            </span>
          </div>
        )}
      </div>
      {error && (
        <div className={classNames(`${baseCls}-error`, hashId)}>
          <pre style={PRE_STYLE}>{code}</pre>
        </div>
      )}
      {!renderedCode && !error && (
        <div className={classNames(`${baseCls}-empty`, hashId)}>
          <pre style={PRE_STYLE}>{code}</pre>
        </div>
      )}
    </div>,
  );
};
