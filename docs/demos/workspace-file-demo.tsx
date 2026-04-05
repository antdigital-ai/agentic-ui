import { Workspace } from '@ant-design/agentic-ui';
import {
  FileNode,
  FileType,
  GroupNode,
} from '@ant-design/agentic-ui/Workspace/types';
import { CoffeeOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';

// 自定义 markdownEditorProps 配置
const customMarkdownEditorProps = {
  height: '300px',
  width: '100%',
  style: {
    fontSize: '16px',
    lineHeight: '1.6',
  },
};

const WorkspaceFileDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(
    '# Generating ...\n\n',
  );
  const [nodes] = useState<(FileNode | GroupNode)[]>([
    {
      name: 'Word',
      type: 'word',
      collapsed: true,
      children: [
        {
          name: '项目需求文档.docx',
          id: 'customPreviewDomID1',
          // type: 'word',// 非必填，会自动推断
          size: '2.3MB',
          lastModified: '12:30',
          url: '/downloads/project-requirements.docx',
          canPreview: true,
          canShare: true,
        },
        {
          id: 'customPreviewDomID2',
          name: 'md-preview用户手册.docx',
          size: '1.8MB',
          lastModified: '2025-08-01 09:15:00',
          content: '# 项目需求文档',
          canLocate: true,
        },
      ],
    },
    {
      name: '不同的文件类型',
      type: 'folder',
      children: [
        {
          id: 'file-7',
          name: '配置文件.json',
          size: '5KB',
          lastModified: '2025-08-01 17:00:00',
          url: '/downloads/config.json',
          type: 'code',
          canShare: true,
          canPreview: true,
          canLocate: true,
        },
        {
          name: '数据统计表.xlsx',
          // type: 'excel',
          size: '1.2MB',
          lastModified: '2025-08-01 10:20:00',
          url: '/downloads/data-statistics.xlsx',
        },
      ],
    },
    {
      name: 'PDF文档',
      type: 'pdf',
      children: [
        {
          name: '产品说明书.pdf',
          // type: 'pdf',
          size: '3.2MB',
          lastModified: '2025-08-01 11:20:00',
          url: '/downloads/product-manual.pdf',
        },
      ],
    },
    {
      name: '音频文件',
      type: 'audio',
      children: [
        {
          name: '产品介绍.mp3',
          type: 'audio',
          size: '5.2MB',
          lastModified: '2025-08-01 10:30:00',
          url: '/downloads/product-intro.mp3',
        },
      ],
    },
    {
      name: 'CSV文件',
      type: 'plainText',
      children: [
        {
          name: '用户数据.csv',
          // type: 'plainText',
          size: '856KB',
          lastModified: '2025-08-01 08:45:00',
          content: '下载/downloads/user-data.csv',
        },
      ],
    },
    {
      name: 'Markdown文档23',
      // type: 'markdown',
      children: [
        {
          name: 'README.md',
          // type: 'markdown',
          size: '15KB',
          lastModified: '2025-08-01 13:15:00',
          url: '/downloads/readme.md',
        },
        {
          name: 'API文档-文本.md',
          // type: 'markdown',
          size: '28KB',
          canDownload: false,
          content: `# API 文档（示例）

| 字段 | 类型 |
|------|------|
| name | string |

\`\`\`ts
const ok = () => true;
\`\`\`
`,
          lastModified: '2025-08-01 13:20:00',
        },
      ],
    },
    {
      name: '图片',
      type: 'image',
      children: [
        {
          name: '产品展示.jpg',
          // type: 'image',
          size: '1.5MB',
          lastModified: '2025-08-01 09:30:00',
          url: `https://t15.baidu.com/it/u=1723601087,48527874&fm=224&app=112&f=JPEG?w=500&h=500`,
        },
      ],
    },
    {
      name: '视频',
      type: 'video',
      children: [
        {
          name: '产品演示.mp4',
          type: 'video',
          size: '15.5MB',
          lastModified: '10:30',
          url: '/downloads/demo.mp4',
        },
      ],
    },
    {
      type: 'archive',
      name: '压缩包文件',
      children: [
        {
          name: '项目源码.zip',
          type: 'archive',
          size: '25.5MB',
          lastModified: '16:30',
          url: '/downloads/source-code.zip',
        },
      ],
    },
    {
      name: '代码示例',
      type: 'javascript',
      children: [
        {
          name: 'hello.html',
          size: '156B',
          lastModified: '2025-08-01 09:00:00',
          content:
            ' <!doctype html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Hello HTML</title>\n  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";padding:24px} .btn{padding:8px 12px;border:1px solid #d9d9d9;border-radius:6px;cursor:pointer} .btn:active{transform:scale(0.98)}</style>\n</head>\n<body>\n  <h1>你好，HTML！</h1>\n  <p>这是一个用于 Workspace 预览的 HTML 示例。</p>\n  <button class="btn" onclick="alert(\'Hello from HTML!\')">点我</button>\n</body>\n</html>',
        },
        {
          name: 'App.tsx',
          size: '521B',
          lastModified: '2025-08-01 09:05:00',
          content:
            "import React, { useState } from 'react';\n\nconst App: React.FC = () => {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;\n};\n\nexport default App;",
        },
        {
          name: 'server.py',
          size: '754B',
          lastModified: '2025-08-01 09:10:00',
          content:
            "from flask import Flask\napp = Flask(__name__)\n\n@app.get('/')\ndef index():\n    return 'OK'\n\nif __name__ == '__main__':\n    app.run()",
        },
        {
          name: 'package.json',
          size: '428B',
          lastModified: '2025-08-01 09:12:00',
          content:
            '{\n  "name": "code-preview-demo",\n  "version": "1.0.0",\n  "scripts": { \n    "build": "webpack --mode production" \n  }\n}',
          type: 'config',
        },
      ],
    },
  ]);

  // 模拟内容不断随机组合的效果
  useEffect(() => {
    const texts = [
      '正在分析您的需求...\n',
      '开始生成内容...\n\n',
      '## 第一部分：简介\n',
      '这是一个演示流式内容生成的示例。\n\n',
      '## 第二部分：功能特性\n',
      '1. 实时内容追加\n',
      '2. 流畅的用户体验\n',
      '3. 支持 Markdown 格式\n\n',
      '## 第三部分：代码示例\n',
      '```typescript\n',
      'const demo = () => {\n',
      '  console.log("Hello World");\n',
      '};\n',
      '```\n\n',
      '## 第四部分：总结\n',
      '内容生成完成！\n',
    ];

    const interval = setInterval(() => {
      // 随机选择3-8个片段进行组合
      const randomCount = Math.floor(Math.random() * 6) + 3;
      const selectedTexts: string[] = [];

      for (let i = 0; i < randomCount; i++) {
        const randomIndex = Math.floor(Math.random() * texts.length);
        selectedTexts.push(texts[randomIndex]);
      }

      const newContent =
        '# Generating ...\n\n' +
        selectedTexts.join('') +
        '\n\n' +
        Math.random().toString(36).substring(2, 8);
      setGeneratingContent(newContent);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = (file: FileNode) => {
    console.log('下载单个文件:', file);
    alert(`正在下载文件: ${file.name}`);
  };

  const handleGroupDownload = (files: FileNode[], groupType?: FileType) => {
    console.log('下载文件组:', files);
    // 获取文件类型的可读名称
    const getTypeDisplayName = (type: FileType) => {
      switch (type) {
        case 'plainText':
          return '文本文件';
        case 'image':
          return '图片文件';
        case 'video':
          return '视频文件';
        case 'pdf':
          return 'PDF文档';
        case 'word':
          return 'Word文档';
        case 'excel':
          return 'Excel表格';
        case 'markdown':
          return 'Markdown文档';
        case 'archive':
          return '压缩包文件';
        default:
          return '文件';
      }
    };

    alert(
      `正在下载${files.length}个${groupType ? getTypeDisplayName(groupType) : '文件'}...`,
    );
  };

  const handleToggleGroup = (type: FileType, collapsed: boolean) => {
    console.log(`切换分组 ${type} 状态:`, collapsed ? '收起' : '展开');
  };

  return (
    <div style={{ padding: '12px' }}>
      <h2>文件组件演示</h2>

      <div style={{ marginBottom: '16px' }}>
        <Button
          type="primary"
          onClick={() => setLoading(!loading)}
          style={{ marginRight: '8px' }}
        >
          {loading ? '停止加载' : '显示加载'}
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          maxHeight: '600px',
          height: '600px',
        }}
      >
        <div style={{ flex: 1 }}>
          <Workspace title="文件管理">
            <Workspace.File
              tab={{
                count: 123,
              }}
              nodes={nodes}
              isLoading={loading}
              onDownload={handleDownload}
              onGroupDownload={handleGroupDownload}
              onToggleGroup={handleToggleGroup}
              onLocate={(file) => console.log('定位文件:', file)}
              markdownEditorProps={customMarkdownEditorProps}
            />
            <Workspace.Custom
              tab={{
                key: 'custom',
                title: '自定义',
                icon: <CoffeeOutlined />,
                count: 123,
              }}
            >
              <div>
                <div>文件组件演示</div>
                <p>自定义内容</p>
              </div>
            </Workspace.Custom>
          </Workspace>
        </div>
        <div style={{ flex: 1 }}>
          <Workspace title="文件管理">
            <Workspace.File
              tab={{
                count: 2,
              }}
              nodes={[
                {
                  id: 'customPreviewDomID2',
                  name: 'md正在加载的文件.docx',
                  size: '1.8MB',
                  lastModified: '2025-08-01 09:15:00',
                  content: generatingContent,
                  loading: true,
                },
              ]}
              isLoading={loading}
              onDownload={handleDownload}
              onGroupDownload={handleGroupDownload}
              onToggleGroup={handleToggleGroup}
              markdownEditorProps={customMarkdownEditorProps}
            />
          </Workspace>
        </div>
      </div>
    </div>
  );
};
export default WorkspaceFileDemo;
