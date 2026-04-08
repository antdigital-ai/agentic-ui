import { ActionIconBox, Workspace } from '@ant-design/agentic-ui';
import { DownloadOutlined } from '@ant-design/icons';
import {
  Copy,
  Expand,
  MousePointerClick,
  SwitchToWindow,
} from '@sofa-design/icons';
import { message, Space } from 'antd';
import React, { useEffect, useState } from 'react';

const WorkspaceRealtimeDemo: React.FC = () => {
  const [shellContent, setShellContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlStatus, setHtmlStatus] = useState<'loading' | 'done' | 'error'>(
    'loading',
  );

  const sampleHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>实时 HTML 预览</title>
    <style>
        body { font-family: sans-serif; padding: 12px; }
        .header { background: #f0f0f0; padding: 12px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 实时 HTML 预览演示</h1>
        <p>这是一个使用 iframe 渲染的 HTML 预览示例</p>
    </div>
    <p>当前时间: <span id="time"></span></p>
    <script>
        document.getElementById('time').textContent = '2023-12-21 10:30:56';
    </script>
</body>
</html>`;

  const segmentedContent = (
    <Space size={8}>
      <div
        style={{
          height: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 6px',
          borderRadius: '200px',
          background: 'rgba(0, 16, 32, 0.0627)',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 500,
            lineHeight: '7px',
            color: 'rgba(84, 93, 109, 0.8)',
          }}
        >
          {sampleHtml.split('\n').length}
        </div>
      </div>
      <ActionIconBox
        title="复制"
        onClick={() => {
          console.log('复制');
          message.success('复制');
        }}
      >
        <Copy />
      </ActionIconBox>
      <ActionIconBox
        title="下载"
        onClick={() => {
          console.log('下载');
          message.success('下载');
        }}
      >
        <DownloadOutlined />
      </ActionIconBox>
      <ActionIconBox
        title="切换"
        onClick={() => {
          console.log('切换');
          message.success('切换');
        }}
      >
        <SwitchToWindow />
      </ActionIconBox>
      <ActionIconBox
        title="全屏"
        onClick={() => {
          console.log('全屏');
          message.success('全屏');
        }}
      >
        <Expand />
      </ActionIconBox>
    </Space>
  );

  const handleBack = () => {
    console.log('返回');
    message.success(`返回`);
    return true;
  };

  useEffect(() => {
    // Shell 命令执行模拟
    const shellCommands = [
      '$ npm install @ant-design/agentic-ui',
      'added 156 packages in 2.3s',
      '$ npm run build',
      'webpack compiled successfully',
    ];

    let shellIndex = 0;
    const shellInterval = setInterval(() => {
      if (shellIndex < shellCommands.length) {
        setShellContent(
          (prev) => prev + (prev ? '\n' : '') + shellCommands[shellIndex],
        );
        shellIndex++;
      } else {
        clearInterval(shellInterval);
      }
    }, 1000);

    // Markdown 内容模拟
    const markdownText = `# 实时文档

- 预览与打字机效果

\`\`\`js
console.log('ok');
\`\`\`
`;

    let mdIndex = 0;
    const mdInterval = setInterval(() => {
      if (mdIndex < markdownText.length) {
        setMarkdownContent(markdownText.slice(0, mdIndex + 1));
        mdIndex++;
      } else {
        clearInterval(mdInterval);
      }
    }, 50);

    // HTML 内容模拟
    setTimeout(() => {
      setHtmlContent(sampleHtml);
      setHtmlStatus('done');
    }, 2000);

    return () => {
      clearInterval(shellInterval);
      clearInterval(mdInterval);
    };
  }, []);

  return (
    <div style={{ height: 600, width: '100%' }}>
      <Workspace title="实时监控工作空间">
        <Workspace.Realtime
          tab={{ key: 'shell', title: '实时跟随' }}
          data={{
            type: 'shell',
            content: '```bash\n' + shellContent + '\n```',
            title: '命令执行',
            typewriter: true,
          }}
        />
        <Workspace.Realtime
          tab={{ key: 'markdown', title: 'Markdown 编辑' }}
          data={{
            type: 'md',
            content: markdownContent,
            title: '文档编辑',
            typewriter: true,
          }}
        />
        <Workspace.Realtime
          tab={{
            key: 'html',
            title: 'HTML 预览',
            icon: <MousePointerClick />,
          }}
          data={{
            type: 'html',
            content: htmlContent,
            title: '创建 HTML 文件',
            subTitle: 'report.html',
            defaultViewMode: 'preview',
            labels: { preview: '预览', code: '代码' },
            iframeProps: { sandbox: 'allow-scripts' },
            status: htmlStatus,
            segmentedExtra: segmentedContent,
            onBack: handleBack,
          }}
        />
      </Workspace>
    </div>
  );
};

export default WorkspaceRealtimeDemo;
