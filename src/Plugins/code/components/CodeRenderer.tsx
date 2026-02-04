/**
 * @fileoverview 代码渲染器组件
 * 封装代码编辑器的所有渲染逻辑
 */

import { ConfigProvider, Skeleton, theme as antdTheme } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { MarkdownEditor } from '../../../MarkdownEditor';
import { useEditorStore } from '../../../MarkdownEditor/editor/store';
import { CodeNode, ElementProps } from '../../../MarkdownEditor/el';
import {
  useCodeEditorState,
  useRenderConditions,
  useToolbarConfig,
} from '../hooks';
import {
  AceEditor,
  AceEditorContainer,
  CodeContainer,
  CodeToolbar,
  HtmlPreview,
  ThinkBlock,
} from './index';

/**
 * 检测 HTML 代码中是否包含 JavaScript
 * @param htmlCode HTML 代码字符串
 * @returns 如果包含 JavaScript 返回 true，否则返回 false
 */
function containsJavaScript(htmlCode: string): boolean {
  if (!htmlCode || typeof htmlCode !== 'string') {
    return false;
  }

  const code = htmlCode.toLowerCase().trim();

  // 检测 <script> 标签
  if (/<script[\s>]/.test(code) || /<\/script>/.test(code)) {
    return true;
  }

  // 检测事件处理器属性（onclick, onerror, onload 等）
  if (/on\w+\s*=/i.test(code)) {
    return true;
  }

  // 检测 javascript: URL
  if (/javascript\s*:/i.test(code)) {
    return true;
  }

  // 检测 eval() 调用
  if (/\beval\s*\(/i.test(code)) {
    return true;
  }

  // 检测 Function() 构造函数
  if (/\bFunction\s*\(/i.test(code)) {
    return true;
  }

  // 检测 setTimeout/setInterval 中的字符串代码
  if (/(setTimeout|setInterval)\s*\([^,]*['"`]/i.test(code)) {
    return true;
  }

  return false;
}

// 简单的 CSV -> Markdown table 转换器

/**
 * 代码渲染器组件
 *
 * 功能特性：
 * - 基于 Ace Editor 的代码编辑
 * - 支持 100+ 种编程语言语法高亮
 * - 支持代码复制、全屏编辑
 * - 支持 HTML 代码实时预览
 * - 支持拖拽排序
 * - 响应式布局适配
 * - 支持代码框选中状态管理
 */
export function CodeRenderer(props: ElementProps<CodeNode>) {
  const { editorProps, readonly } = useEditorStore();

  // 使用状态管理Hook
  const {
    state,
    update,
    path,
    handleCloseClick,
    handleHtmlPreviewClose,
    handleShowBorderChange,
    handleHideChange,
  } = useCodeEditorState(props.element);
  const [theme, setTheme] = useState('github');
  const [isExpanded, setIsExpanded] = useState(true);

  // 选中状态管理
  const [isSelected, setIsSelected] = React.useState(false);

  // 视图模式状态管理（用于HTML和Markdown）
  // 如果是 markdown 或 html，默认打开预览模式
  // 但如果禁用了 HTML 预览，则强制使用代码模式
  const disableHtmlPreview = editorProps.codeProps?.disableHtmlPreview ?? false;
  const language = props.element?.language?.toLowerCase();
  const htmlValue = props.element?.value || '';

  // 检测 HTML 代码中是否包含 JavaScript
  const hasJavaScript = language === 'html' && containsJavaScript(htmlValue);

  // 如果禁用了 HTML 预览或包含 JavaScript，强制使用代码模式
  const shouldDisablePreview = disableHtmlPreview || hasJavaScript;

  const [viewMode, setViewMode] = useState<'preview' | 'code'>(() => {
    // 如果禁用了 HTML 预览或包含 JavaScript，强制使用代码模式
    if (shouldDisablePreview && language === 'html') {
      return 'code';
    }
    return language === 'html' || language === 'markdown' ? 'preview' : 'code';
  });

  // 使用Ace编辑器Hook
  const { dom, setLanguage, focusEditor } = AceEditor({
    element: props.element,
    theme,
    onUpdate: update,
    onShowBorderChange: handleShowBorderChange,
    onHideChange: handleHideChange,
    path,
    isSelected,
    onSelectionChange: setIsSelected,
  });

  // 使用渲染条件Hook
  const {
    shouldHideConfigHtml,
    shouldRenderAsThinkBlock,
    shouldRenderAsCodeEditor,
  } = useRenderConditions(props.element, readonly);

  // 视图模式切换处理函数
  const handleViewModeToggle = () => {
    // 如果禁用了 HTML 预览或包含 JavaScript，不允许切换到预览模式
    if (shouldDisablePreview && language === 'html') {
      setViewMode('code');
      return;
    }
    setViewMode((prev) => (prev === 'preview' ? 'code' : 'preview'));
  };

  // 使用工具栏配置Hook
  const { toolbarProps } = useToolbarConfig({
    element: props.element,
    readonly,
    onCloseClick: handleCloseClick,
    setLanguage,
    onSelectionChange: setIsSelected,
    onViewModeToggle: handleViewModeToggle,
    viewMode,
  });

  // 检查代码块是否未闭合
  const isUnclosed = props.element?.otherProps?.finished === false;

  // 5 秒超时机制：如果代码块未闭合，5 秒后自动设置为完成
  useEffect(() => {
    if (isUnclosed && !readonly) {
      const timer = setTimeout(() => {
        // 检查 finished 是否仍然是 false（可能已经被其他逻辑更新）
        if (props.element?.otherProps?.finished === false) {
          update({
            otherProps: {
              ...props.element?.otherProps,
              finished: true,
            },
          });
        }
      }, 5000); // 5 秒超时

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isUnclosed, readonly, props.element?.otherProps?.finished, update]);

  // 如果禁用了 HTML 预览或包含 JavaScript，强制使用代码模式
  useEffect(() => {
    if (shouldDisablePreview && language === 'html' && viewMode === 'preview') {
      setViewMode('code');
    }
  }, [shouldDisablePreview, language, viewMode]);

  // 渲染组件
  return useMemo(() => {
    // 配置型 HTML 代码块：如果未完成且内容较长，显示 skeleton
    if (shouldHideConfigHtml) {
      const isUnclosed = props.element?.otherProps?.finished === false;
      const contentLength = props.element?.value?.length || 0;
      const isLongContent = contentLength > 100; // 内容超过 100 字符视为较长

      // 如果未完成且内容较长，显示 skeleton
      if (isUnclosed && isLongContent) {
        return (
          <div {...props.attributes} style={{ padding: '20px' }}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        );
      }

      return null;
    }

    // 只读模式下的思考块特殊渲染
    if (shouldRenderAsThinkBlock) {
      return <ThinkBlock {...props} />;
    }

    // 主要的代码编辑器渲染
    if (shouldRenderAsCodeEditor) {
      return (
        <ConfigProvider
          theme={{
            algorithm:
              theme === 'chaos'
                ? antdTheme.darkAlgorithm
                : antdTheme.defaultAlgorithm,
          }}
        >
          <div {...props.attributes}>
            <CodeContainer
              theme={theme}
              element={props.element}
              showBorder={state.showBorder}
              hide={state.hide}
              onEditorClick={focusEditor}
            >
              {/* 工具栏 */}
              {!props.element.frontmatter &&
                !editorProps.codeProps?.hideToolBar && (
                  <CodeToolbar
                    theme={theme}
                    setTheme={setTheme}
                    isExpanded={isExpanded}
                    onExpandToggle={() => setIsExpanded(!isExpanded)}
                    {...toolbarProps}
                  />
                )}

              <div
                className="code-editor-content"
                style={{
                  borderBottomLeftRadius: 'inherit',
                  borderBottomRightRadius: 'inherit',
                  display: isExpanded ? 'block' : 'none',
                }}
              >
                {viewMode === 'preview' &&
                  props.element.language === 'html' &&
                  !shouldDisablePreview && (
                    <HtmlPreview htmlStr={props.element?.value} />
                  )}
                {viewMode === 'preview' &&
                  props.element.language &&
                  props.element.language === 'markdown' && (
                    <MarkdownEditor initValue={props.element?.value} />
                  )}
                <div
                  style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: 'inherit',
                    padding: '12px 0',
                    display: viewMode === 'code' ? 'block' : 'none',
                  }}
                >
                  <AceEditorContainer dom={dom} element={props.element}>
                    {props.children}
                  </AceEditorContainer>
                </div>
              </div>
            </CodeContainer>
          </div>
        </ConfigProvider>
      );
    }

    return null;
  }, [
    shouldHideConfigHtml,
    shouldRenderAsThinkBlock,
    shouldRenderAsCodeEditor,
    props.element,
    props.attributes,
    props.children,
    state.showBorder,
    state.hide,
    state.htmlStr,
    isSelected,
    editorProps.codeProps?.hideToolBar,
    editorProps.codeProps?.disableHtmlPreview,
    shouldDisablePreview,
    hasJavaScript,
    htmlValue,
    toolbarProps,
    handleHtmlPreviewClose,
    viewMode,
    handleViewModeToggle,
    disableHtmlPreview,
  ]);
}
