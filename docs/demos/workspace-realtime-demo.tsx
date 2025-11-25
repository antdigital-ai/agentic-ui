import { Workspace } from '@ant-design/agentic-ui';
import React, { useEffect, useState } from 'react';

const WorkspaceRealtimeDemo: React.FC = () => {
  const [shellContent, setShellContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlStatus, setHtmlStatus] = useState<'loading' | 'done' | 'error'>(
    'loading',
  );

  useEffect(() => {
    // Shell 命令执行模拟
    const shellCommands = [
      '$ npm install @ant-design/agentic-ui',
      'added 156 packages in 2.3s',
      '$ npm run build',
      'webpack compiled successfully',
      '# 可用性质量指数（UQ-index）计算模型',
      'from flash_mla import get _mla_metadata, flash_mla_with_kvcache',
      'tile_scheduler_metadata, num_splits = get_mla_metadata (cache_seqlens, s_q * h_q // h_kv, h_kv)',
      'for i in range(num_layers):',
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
    const markdownText = `# 实时文档编辑

## 功能特性

- **实时预览**: 支持 Markdown 实时预览
- **语法高亮**: 代码块语法高亮
- **数学公式**: 支持 LaTeX 数学公式

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## 数学公式

$E = mc^2$
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
    const htmlText = `<!DOCTYPE html>
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

    setTimeout(() => {
      setHtmlContent(htmlText);
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
          tab={{ key: 'html', title: 'HTML 预览' }}
          data={{
            type: 'html',
            content: htmlContent,
            title: 'HTML 渲染',
            status: htmlStatus,
            defaultViewMode: 'preview',
          }}
        />
      </Workspace>
    </div>
  );
};

export default WorkspaceRealtimeDemo;
