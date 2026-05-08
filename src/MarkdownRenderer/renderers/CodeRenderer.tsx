import copy from 'copy-to-clipboard';
import React, { useMemo, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { CodeNode } from '../../MarkdownEditor/el';
import type { MarkdownEditorProps } from '../../MarkdownEditor/types';
import { useDetectTheme } from '../../Plugins/chart/hooks';
import { CodeContainer } from '../../Plugins/code/components/CodeContainer';
import { debugInfo } from '../../Utils/debugUtils';
import { extractBlockTextContent } from '../extractBlockTextContent';
import type { RendererBlockProps } from '../types';
import { CodeBlockToolbar } from './CodeBlockToolbar';

/**
 * 代码块渲染器——复用 MarkdownEditor 的 CodeContainer 和样式体系。
 * 不依赖 Slate 上下文，提供与 CodeRenderer readonly 模式一致的视觉效果。
 */

const CONTENT_OUTER_BASE_STYLE: React.CSSProperties = {
  borderBottomLeftRadius: 'inherit',
  borderBottomRightRadius: 'inherit',
};

const CONTENT_INNER_STYLE: React.CSSProperties = {
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
};

/**
 * 计算代码内容外层容器样式：通过 display: none 实现折叠态。
 * 提取为函数以避免 inline 表达式让 React diff 失稳。
 */
const buildContentOuterStyle = (expanded: boolean): React.CSSProperties => ({
  ...CONTENT_OUTER_BASE_STYLE,
  display: expanded ? 'block' : 'none',
});

export const CodeBlockRenderer: React.FC<
  RendererBlockProps & {
    editorCodeProps?: MarkdownEditorProps['codeProps'];
  }
> = (props) => {
  const { language, children, editorCodeProps } = props;
  const detectedTheme = useDetectTheme();
  const theme =
    (editorCodeProps?.theme as string) ||
    (detectedTheme === 'dark' ? 'chaos' : 'github');
  const [isExpanded, setIsExpanded] = useState(true);

  const code = useMemo(() => extractBlockTextContent(children), [children]);

  const fakeElement = useMemo<CodeNode>(
    () => ({
      type: 'code',
      language: language || '',
      value: code,
      children: [{ text: code }],
    }),
    [language, code],
  );

  const handleCopy = useRefFunction(() => {
    try {
      copy(code);
    } catch (error) {
      debugInfo('CodeBlockRenderer - 复制失败', {
        error: (error as Error)?.message || String(error),
      });
    }
  });

  const handleToggleExpanded = useRefFunction(() => {
    setIsExpanded((prev) => !prev);
  });

  const defaultDom = (
    <CodeContainer
      element={fakeElement}
      showBorder={false}
      hide={false}
      onEditorClick={() => {}}
    >
      <CodeBlockToolbar
        language={language}
        expanded={isExpanded}
        theme={theme === 'chaos' ? 'dark' : 'light'}
        onCopy={handleCopy}
        onToggleExpanded={handleToggleExpanded}
      />
      <div
        className="code-editor-content"
        style={buildContentOuterStyle(isExpanded)}
      >
        <div style={CONTENT_INNER_STYLE}>
          <code className={language ? `language-${language}` : undefined}>
            {children}
          </code>
        </div>
      </div>
    </CodeContainer>
  );

  const customRender = editorCodeProps?.render;
  if (!customRender) {
    return defaultDom;
  }

  try {
    // customRender 接受 Slate-like 结构。MarkdownRenderer 不依赖 Slate，
    // 构造一个形状兼容的对象即可；因 customRender 的 `props` 类型为 `CustomLeaf<...> & { children }`，
    // 与此处 `element` 字段类型并不严格匹配，故在调用边界保留一次必要的类型断言。
    const renderElementProps = {
      attributes: {},
      children: null,
      element: fakeElement,
    } as unknown as Parameters<typeof customRender>[0];
    const rendered = customRender(
      renderElementProps,
      defaultDom,
      editorCodeProps,
    );
    if (rendered === undefined) {
      return defaultDom;
    }
    return rendered;
  } catch (error) {
    debugInfo('CodeBlockRenderer - codeProps.render 异常，回退默认', {
      error: (error as Error)?.message || String(error),
    });
    return defaultDom;
  }
};

CodeBlockRenderer.displayName = 'CodeBlockRenderer';
