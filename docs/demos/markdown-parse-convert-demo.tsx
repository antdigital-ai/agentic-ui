import {
  MarkdownEditor,
  MarkdownEditorInstance,
  MarkdownEditorPlugin,
} from '@ant-design/agentic-ui';
import { Button, Card, Space, Tabs, message } from 'antd';
import React, { useRef, useState } from 'react';

// 自定义 Markdown 解析与转换插件
const markdownParseConvertPlugin: MarkdownEditorPlugin = {
  // 解析 Markdown 时的转换规则
  parseMarkdown: [
    // 自定义警告代码块
    {
      match: (node: any) => node.type === 'code' && node.lang === 'warning',
      convert: (node: any) => ({
        type: 'code',
        language: 'warning',
        value: `⚠️ 警告: ${node.value}`,
        children: [{ text: `⚠️ 警告: ${node.value}` }],
      }),
    },
    // 自定义信息代码块
    {
      match: (node: any) => node.type === 'code' && node.lang === 'info',
      convert: (node: any) => ({
        type: 'code',
        language: 'info',
        value: `ℹ️ 信息: ${node.value}`,
        children: [{ text: `ℹ️ 信息: ${node.value}` }],
      }),
    },
    // 自定义成功代码块
    {
      match: (node: any) => node.type === 'code' && node.lang === 'success',
      convert: (node: any) => ({
        type: 'code',
        language: 'success',
        value: `✅ 成功: ${node.value}`,
        children: [{ text: `✅ 成功: ${node.value}` }],
      }),
    },
  ],
  // 转换为 Markdown 时的规则
  toMarkdown: [
    {
      match: (node: any) => node.type === 'code' && node.language === 'warning',
      convert: (node: any) => ({
        type: 'code',
        lang: 'warning',
        value: (node.value || '').replace(/^⚠️ 警告: /, ''),
      }),
    },
    {
      match: (node: any) => node.type === 'code' && node.language === 'info',
      convert: (node: any) => ({
        type: 'code',
        lang: 'info',
        value: (node.value || '').replace(/^ℹ️ 信息: /, ''),
      }),
    },
    {
      match: (node: any) => node.type === 'code' && node.language === 'success',
      convert: (node: any) => ({
        type: 'code',
        lang: 'success',
        value: (node.value || '').replace(/^✅ 成功: /, ''),
      }),
    },
  ],
  // 自定义元素渲染
  elements: {
    code: ({ attributes, children, element }) => {
      const codeElement = element as any;

      // 根据语言类型渲染不同的样式
      if (codeElement.language === 'warning') {
        return (
          <div
            {...attributes}
            style={{
              border: '1px solid #faad14',
              borderRadius: '6px',
              padding: '12px',
              backgroundColor: '#fffbe6',
              margin: '8px 0',
              borderLeft: '4px solid #faad14',
            }}
          >
            <div
              style={{
                color: '#d48806',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ⚠️ 警告
            </div>
            <pre
              style={{
                margin: 0,
                fontFamily: 'monospace',
                color: '#333',
                whiteSpace: 'pre-wrap',
                fontSize: '13px',
              }}
            >
              <code>{children}</code>
            </pre>
          </div>
        );
      }

      if (codeElement.language === 'info') {
        return (
          <div
            {...attributes}
            style={{
              border: '1px solid #1890ff',
              borderRadius: '6px',
              padding: '12px',
              backgroundColor: '#f0f8ff',
              margin: '8px 0',
              borderLeft: '4px solid #1890ff',
            }}
          >
            <div
              style={{
                color: '#1890ff',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ℹ️ 信息
            </div>
            <pre
              style={{
                margin: 0,
                fontFamily: 'monospace',
                color: '#333',
                whiteSpace: 'pre-wrap',
                fontSize: '13px',
              }}
            >
              <code>{children}</code>
            </pre>
          </div>
        );
      }

      if (codeElement.language === 'success') {
        return (
          <div
            {...attributes}
            style={{
              border: '1px solid #52c41a',
              borderRadius: '6px',
              padding: '12px',
              backgroundColor: '#f6ffed',
              margin: '8px 0',
              borderLeft: '4px solid #52c41a',
            }}
          >
            <div
              style={{
                color: '#389e0d',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ✅ 成功
            </div>
            <pre
              style={{
                margin: 0,
                fontFamily: 'monospace',
                color: '#333',
                whiteSpace: 'pre-wrap',
                fontSize: '13px',
              }}
            >
              <code>{children}</code>
            </pre>
          </div>
        );
      }

      // 默认代码块渲染
      return (
        <pre {...attributes}>
          <code>{children}</code>
        </pre>
      );
    },
  },
};

// 示例 Markdown 内容
const sampleMarkdown = `# Markdown 解析与转换 Demo

这是一个展示 Markdown 解析与转换功能的完整示例。

## 普通代码块

\`\`\`javascript
console.log("这是普通的 JavaScript 代码");
const greeting = "Hello, World!";
\`\`\`

## 自定义警告代码块

\`\`\`warning
这是一个重要的警告信息！
请注意以下几点：
1. 定期备份重要数据
2. 检查系统安全性
3. 更新软件版本
\`\`\`

## 自定义信息代码块

\`\`\`info
有用的信息提示：
- 使用 Ctrl+S 保存文件
- 使用 Ctrl+Z 撤销操作
- 使用 Ctrl+Y 重做操作
\`\`\`

## 自定义成功代码块

\`\`\`success
操作成功完成！
✅ 文件已保存
✅ 代码已编译
✅ 测试已通过
\`\`\`

## 功能说明

这个插件演示了以下功能：

1. **parseMarkdown**: 将特定语言标识的代码块转换为自定义元素
2. **toMarkdown**: 将自定义元素转换回标准的 Markdown 格式
3. **elements**: 自定义元素的渲染样式

支持的语言标识：
- \`warning\`: 警告信息
- \`info\`: 信息提示
- \`success\`: 成功信息
`;

export default function MarkdownParseConvertDemo() {
  const editorRef = useRef<MarkdownEditorInstance>();
  const [exportedMarkdown, setExportedMarkdown] = useState('');
  const [activeTab, setActiveTab] = useState('editor');

  const handleExportMarkdown = () => {
    if (editorRef.current) {
      try {
        const content = editorRef.current.store.getMDContent([
          markdownParseConvertPlugin,
        ]);
        setExportedMarkdown(content);
        message.success('Markdown 导出成功！');
      } catch (error: any) {
        message.error('导出失败：' + (error?.message || '未知错误'));
      }
    }
  };

  const handleCopyMarkdown = () => {
    if (exportedMarkdown) {
      navigator.clipboard.writeText(exportedMarkdown).then(() => {
        message.success('Markdown 已复制到剪贴板！');
      });
    }
  };

  const handleReset = () => {
    setExportedMarkdown('');
    message.info('导出内容已清空，请重新编辑内容');
  };

  const items = [
    {
      key: 'editor',
      label: '编辑器',
      children: (
        <div style={{ padding: '12px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Space>
              <Button type="primary" onClick={handleExportMarkdown}>
                导出 Markdown
              </Button>
              <Button onClick={handleReset}>重置内容</Button>
            </Space>
          </div>

          <Card style={{ border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            <MarkdownEditor
              editorRef={editorRef}
              initValue={sampleMarkdown}
              plugins={[markdownParseConvertPlugin]}
              style={{ minHeight: '400px' }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'export',
      label: '导出的 Markdown',
      children: (
        <div style={{ padding: '12px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              onClick={handleCopyMarkdown}
              disabled={!exportedMarkdown}
            >
              复制到剪贴板
            </Button>
          </div>

          <Card>
            <pre
              style={{
                backgroundColor: '#f5f5f5',
                padding: '16px',
                borderRadius: '6px',
                overflow: 'auto',
                maxHeight: '500px',
                minHeight: '200px',
                border: '1px solid #d9d9d9',
                fontSize: '13px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {exportedMarkdown || '点击"导出 Markdown"按钮查看结果'}
            </pre>
          </Card>
        </div>
      ),
    },
    {
      key: 'code',
      label: '插件代码',
      children: (
        <div style={{ padding: '12px' }}>
          <Card title="Markdown 解析与转换插件">
            <pre
              style={{
                backgroundColor: '#f5f5f5',
                padding: '16px',
                borderRadius: '6px',
                overflow: 'auto',
                maxHeight: '500px',
                fontSize: '12px',
                lineHeight: '1.4',
              }}
            >
              {`const markdownParseConvertPlugin: MarkdownEditorPlugin = {
  // 解析 Markdown 时的转换规则
  parseMarkdown: [
    {
      match: (node: any) => node.type === 'code' && node.lang === 'warning',
      convert: (node: any) => ({
        type: 'warning-code',
        language: 'text',
        value: node.value,
        children: [{ text: node.value }],
      }),
    },
    // ... 更多转换规则
  ],
  
  // 转换为 Markdown 时的规则
  toMarkdown: [
    {
      match: (node: any) => node.type === 'warning-code',
      convert: (node: any) => ({
        type: 'code',
        lang: 'warning',
        value: node.value || '',
      }),
    },
    // ... 更多转换规则
  ],
  
  // 自定义元素渲染
  elements: {
    'warning-code': ({ attributes, children, element }) => (
      <div style={{ /* 自定义样式 */ }}>
        {/* 自定义渲染逻辑 */}
      </div>
    ),
    // ... 更多元素定义
  },
};`}
            </pre>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ padding: '24px 0' }}>
        <h1 style={{ marginBottom: '8px', color: '#1890ff' }}>
          Markdown 解析与转换 Demo
        </h1>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '24px' }}>
          展示如何使用插件系统实现 Markdown 的双向解析与转换功能
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        size="large"
        style={{ backgroundColor: '#fff', borderRadius: '8px' }}
      />
    </div>
  );
}
