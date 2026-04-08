import {
  EditorUtils,
  jinjaPlugin,
  MarkdownEditor,
} from '@ant-design/agentic-ui';
import { Button } from 'antd';
import React, { useRef } from 'react';

const IF_ELSE_SCHEMA = [
  {
    type: 'paragraph',
    children: [
      { text: '{% if ' },
      {
        text: '$(系统:用户输入)',
        code: true,
        tag: true,
        triggerText: '$',
        id: 'c8ce9f09-89e6-433a-9cec-619ac5e50253',
        varId: '33964',
        varData: {
          children: null,
          code: 'LATEST_QUERY',
          defaultValue: null,
          desc: '当前轮用户输入，已经移除特殊字符',
          enumValue: null,
          id: null,
          isGlobal: null,
          isInvalidNewVar: null,
          label: '用户输入',
          modelId: null,
          refSlotId: null,
          refTypeId: null,
          slotType: null,
          value: '33964',
          varName: null,
          varType: 'system',
        },
      },
      { text: '  %}' },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: '条件为真时的文本' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '{% else %}' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '条件为假时的文本' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '{% endif %}' }],
  },
  EditorUtils.p,
];

export default () => {
  const editorRef = useRef<any>(null);

  const handleSetSchema = () => {
    editorRef.current?.store?.setContent(
      JSON.parse(JSON.stringify(IF_ELSE_SCHEMA)),
    );
  };

  return (
    <div
      style={{
        padding: 24,
        border: '1px solid #f0f0f0',
        margin: '20px auto',
        width: '100%',
        maxWidth: 720,
        background: '#fff',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleSetSchema}>
          设置 if/else 条件模板
        </Button>
        <span style={{ marginLeft: 12, color: '#666', fontSize: 12 }}>
          点击按钮将 if/else 模板（含变量标签）写入编辑器
        </span>
      </div>
      <MarkdownEditor
        width="100%"
        height={360}
        initValue=""
        toolBar={{ enable: true, min: true }}
        plugins={[jinjaPlugin]}
        editorRef={editorRef}
      />
    </div>
  );
};
