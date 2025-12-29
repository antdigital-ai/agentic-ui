/**
 * @fileoverview HTML预览模态框组件
 * 负责显示HTML代码的执行结果
 */

import React from 'react';

interface HtmlPreviewProps {
  htmlStr: string;
}

export function HtmlPreview({ htmlStr }: HtmlPreviewProps) {
  return (
    <iframe
      data-testid="html-preview-iframe"
      style={{
        outline: 0,
        borderRadius: 'inherit',
        border: 'none',
        height: '100%',
        minHeight: 400,
        width: '100%',
      }}
      width="100%"
      srcDoc={htmlStr}
    />
  );
}
