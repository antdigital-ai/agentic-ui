/**
 * @fileoverview 代码编辑器容器组件
 * 负责代码编辑器的布局、样式和状态管理
 */

import classNames from 'clsx';
import React, { ReactNode, useRef } from 'react';
import '../../../MarkdownEditor/editor/code.css';
import { CodeNode } from '../../../MarkdownEditor/el';

interface CodeContainerProps {
  element?: CodeNode;
  showBorder: boolean;
  hide: boolean;
  onEditorClick: () => void;
  children: ReactNode;
  readonly?: boolean;
}

export function CodeContainer({
  element,
  showBorder,
  hide,
  onEditorClick,
  children,
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
        data-frontmatter={safeElement.frontmatter ? '' : undefined}
        className={classNames(
          'ace-container',
          'code-editor-container',
          'drag-el',
          {
            'code-editor-container--show-border': showBorder,
            'code-editor-container--hide': hide,
          },
        )}
      >
        {children}
      </div>
    </div>
  );
}
