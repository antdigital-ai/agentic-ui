import {
  MarkdownEditor,
  MarkdownEditorInstance,
  MarkdownEditorPlugin,
} from '@ant-design/agentic-ui';
import React, { useRef } from 'react';

// 简单的自定义代码块插件
const customCodePlugin: MarkdownEditorPlugin = {
  parseMarkdown: [
    {
      match: (node: any) => node.type === 'code' && node.lang === 'note',
      convert: (node: any) =>
        ({
          type: 'note-code',
          language: 'text',
          value: node.value,
          children: [{ text: node.value }],
        }) as any,
    },
  ],
  toMarkdown: [
    {
      match: (node: any) => node.type === 'note-code',
      convert: (node: any) => ({
        type: 'code',
        lang: 'note',
        value: node.value || '',
      }),
    },
  ],
  elements: {
    'note-code': ({ attributes, children, element }) => (
      <div
        {...attributes}
        style={{
          border: '1px solid #1890ff',
          borderRadius: '4px',
          padding: '12px',
          backgroundColor: '#f0f8ff',
          margin: '8px 0',
        }}
      >
        <div
          style={{
            color: '#1890ff',
            fontWeight: 'bold',
            marginBottom: '4px',
            fontSize: '12px',
          }}
        >
          📝 笔记
        </div>
        <pre
          style={{
            margin: 0,
            fontFamily: 'monospace',
            color: '#333',
            whiteSpace: 'pre-wrap',
          }}
        >
          {(element as any).value}
        </pre>
        {children}
      </div>
    ),
  },
};

const markdown = `# toMarkdown 插件示例

这是一个简单的 toMarkdown 插件示例。

## 普通代码块

\`\`\`javascript
console.log("这是普通的 JavaScript 代码");
\`\`\`

## 自定义笔记代码块

下面的代码块会被插件特殊处理：

\`\`\`note
这是一个重要的笔记！
记住要定期保存你的工作。
使用 Ctrl+S 或 Cmd+S 保存文件。
\`\`\`

## 说明

- 使用 \`note\` 语言标识的代码块会被转换为笔记框
- 普通的代码块不会被插件影响
- 导出 Markdown 时，自定义元素会被正确转换回原始格式
`;

export default function SimpleToMarkdownExample() {
  const editorRef = useRef<MarkdownEditorInstance>();

  const handleExportMarkdown = () => {
    if (editorRef.current) {
      // 获取编辑器内容并传递插件参数
      const content = editorRef.current.store.getMDContent([customCodePlugin]);
      console.log('导出的 Markdown:', content);

      // 显示在页面上
      const pre = document.getElementById('markdown-output');
      if (pre) {
        pre.textContent = content;
      }
    }
  };

  return (
    <div style={{ padding: '12px' }}>
      <h1>简单的 toMarkdown 插件示例</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={handleExportMarkdown}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          导出 Markdown
        </button>
      </div>

      <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
        <MarkdownEditor
          editorRef={editorRef}
          initValue={markdown}
          plugins={[customCodePlugin]}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>导出的 Markdown:</h3>
        <pre
          id="markdown-output"
          style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '300px',
            minHeight: '100px',
            border: '1px solid #d9d9d9',
          }}
        >
          点击上面的"导出 Markdown"按钮查看结果
        </pre>
      </div>

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>editorRef</strong>: 编辑器实例引用，用于调用编辑器方法
          </li>
          <li>
            <strong>initValue</strong>: 编辑器的初始内容值
          </li>
          <li>
            <strong>plugins</strong>: 插件数组，用于扩展编辑器功能
          </li>
          <li>
            <strong>plugins[].parseMarkdown</strong>: parseMarkdown 插件配置数组
          </li>
          <li>
            <strong>plugins[].toMarkdown</strong>: toMarkdown 插件配置数组
          </li>
          <li>
            <strong>plugins[].elements</strong>: 自定义元素渲染配置
          </li>
          <li>
            <strong>parseMarkdown[].match</strong>:
            匹配函数，用于判断是否应用转换
          </li>
          <li>
            <strong>parseMarkdown[].convert</strong>:
            转换函数，用于转换匹配的节点
          </li>
          <li>
            <strong>toMarkdown[].match</strong>: 匹配函数，用于判断是否应用转换
          </li>
          <li>
            <strong>toMarkdown[].convert</strong>: 转换函数，用于转换匹配的节点
          </li>
        </ul>
      </div>
    </div>
  );
}
