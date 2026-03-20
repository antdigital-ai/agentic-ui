import { MarkdownEditor, MarkdownRenderer } from '@ant-design/agentic-ui';
import React, { useEffect, useRef, useState } from 'react';
import { newEnergyFundContent } from './shared/newEnergyFundContent';
import { RERENDER_CARD_APPENDIX } from './shared/rerenderCardAppendix';

import type { MarkdownEditorInstance } from '@ant-design/agentic-ui';

const rerenderDemoMarkdown = `${newEnergyFundContent}\n\n${RERENDER_CARD_APPENDIX.trim()}`;

/**
 * 左侧 MarkdownEditor、右侧 MarkdownRenderer 同内容对比
 */
export const RerenderMdDemo = () => {
  const [content, setContent] = useState(rerenderDemoMarkdown);
  const editorRef = useRef<MarkdownEditorInstance>(null);

  useEffect(() => {
    setContent(rerenderDemoMarkdown);
    editorRef.current?.store.setMDContent(rerenderDemoMarkdown);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 24 }}>
      <MarkdownEditor
        readonly
        reportMode
        initValue={content}
        editorRef={editorRef}
        style={{ width: '50%' }}
      />
      <MarkdownRenderer
        content={content}
        streaming={false}
        isFinished
        style={{ width: '50%' }}
      />
    </div>
  );
};

export default RerenderMdDemo;
