import { ChevronsUpDown, Copy, Moon } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import { CodeContainer } from '../../Plugins/code/components/CodeContainer';
import { LoadImage } from '../../Plugins/code/components/LoadImage';
import { langIconMap } from '../../Plugins/code/langIconMap';
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
 * 代码块渲染器——复用 MarkdownEditor 的 CodeContainer 和样式体系。
 * 不依赖 Slate 上下文，提供与 CodeRenderer readonly 模式一致的视觉效果。
 */
export const CodeBlockRenderer: React.FC<RendererBlockProps> = (props) => {
  const { language, children, className } = props;
  const [theme, setTheme] = useState('github');
  const [isExpanded, setIsExpanded] = useState(true);
  const i18n = useContext(I18nContext);

  const code = useMemo(() => extractTextContent(children), [children]);

  const fakeElement = useMemo(
    () => ({
      type: 'code' as const,
      language: language || '',
      value: code,
      children: [{ text: code }],
    }),
    [language, code],
  );

  const handleCopy = useCallback(() => {
    try {
      copy(code);
    } catch (error) {
      console.error('复制失败:', error);
    }
  }, [code]);

  const langIcon = langIconMap.get(language?.toLowerCase() || '');

  return (
    <CodeContainer
      element={fakeElement as any}
      showBorder={false}
      hide={false}
      onEditorClick={() => {}}
      theme={theme}
    >
      <div
        data-testid="code-toolbar"
        contentEditable={false}
        style={{
          borderTopLeftRadius: 'inherit',
          borderTopRightRadius: 'inherit',
          backgroundColor: 'transparent',
          paddingLeft: '0.25em',
          paddingRight: '0.25em',
          width: '100%',
          position: 'sticky',
          left: 0,
          top: 0,
          fontSize: '1em',
          font: 'var(--font-text-h6-base)',
          color: 'inherit',
          justifyContent: 'space-between',
          zIndex: 50,
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          padding: '9px 12px',
          gap: '16px',
          alignSelf: 'stretch',
          boxSizing: 'border-box',
          userSelect: 'none',
          borderBottom: isExpanded
            ? theme === 'chaos'
              ? '1px solid #161616'
              : '1px solid var(--color-gray-border-light)'
            : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              gap: 4,
              font: 'inherit',
              color: 'inherit',
              userSelect: 'none',
            }}
          >
            {langIcon && (
              <div
                style={{
                  height: '1em',
                  width: '1em',
                  fontSize: '16px',
                  display: 'flex',
                }}
              >
                <LoadImage
                  style={{ height: '1em', width: '1em' }}
                  src={langIcon}
                />
              </div>
            )}
            <span>{language || 'plain text'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <ActionIconBox
            title={i18n?.locale?.theme || '主题'}
            theme={theme === 'chaos' ? 'dark' : 'light'}
            onClick={() => setTheme(theme === 'github' ? 'chaos' : 'github')}
          >
            <Moon />
          </ActionIconBox>
          <ActionIconBox
            theme={theme === 'chaos' ? 'dark' : 'light'}
            title={i18n?.locale?.copy || '复制'}
            style={{
              fontSize: '1em',
              lineHeight: '1.75em',
              marginLeft: '0.125em',
            }}
            onClick={handleCopy}
          >
            <Copy />
          </ActionIconBox>
          <ActionIconBox
            title={i18n?.locale?.expandCollapse || '展开/收起'}
            theme={theme === 'chaos' ? 'dark' : 'light'}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronsUpDown />
          </ActionIconBox>
        </div>
      </div>
      <div
        className="code-editor-content"
        style={{
          borderBottomLeftRadius: 'inherit',
          borderBottomRightRadius: 'inherit',
          display: isExpanded ? 'block' : 'none',
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            borderRadius: 'inherit',
            padding: '12px 16px',
            overflow: 'auto',
            fontSize: '0.9em',
            lineHeight: 1.6,
            fontFamily:
              "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          <code className={language ? `language-${language}` : undefined}>
            {children}
          </code>
        </div>
      </div>
    </CodeContainer>
  );
};

CodeBlockRenderer.displayName = 'CodeBlockRenderer';
