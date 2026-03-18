import React, { useCallback, useMemo, useState } from 'react';
import { ConfigProvider, message } from 'antd';
import clsx from 'clsx';
import type { RendererBlockProps } from '../types';

const extractTextContent = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractTextContent).join('');
  if (React.isValidElement(children) && children.props?.children) {
    return extractTextContent(children.props.children);
  }
  return '';
};

/**
 * 轻量代码块渲染器，不依赖 Slate 上下文。
 * 提供语法高亮（纯 CSS 类）、复制和语言标签。
 */
export const CodeBlockRenderer: React.FC<RendererBlockProps> = (props) => {
  const { language, children, className, ...rest } = props;
  const [copied, setCopied] = useState(false);
  const { getPrefixCls } = React.useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-md-renderer');

  const code = useMemo(() => extractTextContent(children), [children]);

  const handleCopy = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <div className={clsx(`${prefixCls}-code-block`, className)}>
      <div className={`${prefixCls}-code-block-header`}>
        {language && (
          <span className={`${prefixCls}-code-block-language`}>
            {language}
          </span>
        )}
        <button
          type="button"
          className={`${prefixCls}-code-block-copy`}
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? '✓' : '⎘'}
        </button>
      </div>
      <pre className={`${prefixCls}-code-block-content`}>
        <code className={language ? `language-${language}` : undefined}>
          {children}
        </code>
      </pre>
    </div>
  );
};

CodeBlockRenderer.displayName = 'CodeBlockRenderer';
