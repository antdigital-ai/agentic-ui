import { MarkdownEditor, MarkdownRenderer } from '@ant-design/agentic-ui';
import React, { useEffect, useRef, useState } from 'react';
import { newEnergyFundContent } from './shared/newEnergyFundContent';

import type { MarkdownEditorInstance } from '@ant-design/agentic-ui';

/**
 * 左侧 MarkdownEditor、右侧 MarkdownRenderer 同内容对比
 */
export const RerenderMdDemo = () => {
  const [content, setContent] = useState(newEnergyFundContent);
  const editorRef = useRef<MarkdownEditorInstance>(null);

  useEffect(() => {
    setContent(newEnergyFundContent);
    editorRef.current?.store.setMDContent(newEnergyFundContent);
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
