/**
 * @fileoverview 代码编辑器容器组件
 * 负责代码编辑器的布局、样式和状态管理
 */

import classNames from 'classnames';
import React, { ReactNode, useRef } from 'react';
import { CodeNode } from '../../../MarkdownEditor/el';

interface CodeContainerProps {
  element?: CodeNode;
  showBorder: boolean;
  hide: boolean;
  onEditorClick: () => void;
  children: ReactNode;
  readonly?: boolean;
  theme: string;
}

export function CodeContainer({
  element,
  showBorder,
  hide,
  onEditorClick,
  children,
  theme,
}: CodeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理未定义的 element
  const safeElement = element || {
    language: undefined,
    frontmatter: false,
  };

  return (
    <div
      contentEditable={false}
      className="ace-el drag-el"
      data-be="code"
      data-testid="code-container"
      ref={containerRef}
      tabIndex={-1}
      onBlur={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      data-lang={safeElement.language}
    >
      <div
        data-testid="code-editor-container"
        onClick={(e) => {
          e.stopPropagation();
          onEditorClick();
        }}
        style={{
          padding: hide ? 1 : 1,
          marginBottom: hide ? 0 : undefined,
          boxShadow: 'var(--shadow-control-base)',
          borderRadius: 'var(--radius-card-base)',
          backgroundColor: showBorder
            ? 'rgba(59, 130, 246, 0.1)'
            : hide
              ? 'transparent'
              : theme === 'chaos'
                ? 'var(--color-gray-text-default)'
                : 'rgb(252, 252, 252)',
          color:
            theme === 'chaos' ? '#FFFFFF' : 'var(--color-gray-text-default)',
          height: hide ? 0 : 'auto',
          opacity: hide ? 0 : 1,
        }}
        data-frontmatter={safeElement.frontmatter ? '' : undefined}
        className={classNames(
          'ace-container',
          'code-editor-container',
          'drag-el',
        )}
      >
        {children}
      </div>
    </div>
  );
}
