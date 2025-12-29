/**
 * @fileoverview Ace编辑器容器组件
 * 负责Ace编辑器DOM的渲染和内容副本的显示
 */

import React, { RefObject } from 'react';
import { CodeNode } from '../../../MarkdownEditor/el';

interface AceEditorContainerProps {
  dom: RefObject<HTMLDivElement>;
  element: CodeNode;
  children: React.ReactNode;
}

export function AceEditorContainer({
  dom,
  element,
  children,
}: AceEditorContainerProps) {
  return (
    <>
      <div
        data-testid="ace-editor-container"
        ref={dom}
        style={{ height: 200, lineHeight: 1.6 }}
      />

      {/* 隐藏的内容副本（用于搜索和 SEO） */}
      <div
        data-testid="code-content-copy"
        style={{
          height: '0.5px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        {element?.value?.replaceAll('\n', ' ')}
        {children}
      </div>
    </>
  );
}
