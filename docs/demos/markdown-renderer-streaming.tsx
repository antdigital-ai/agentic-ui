import { MarkdownRenderer } from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const FULL_CONTENT = `# 流式 Markdown 演示

智能体正在逐步给出答案，下面包含 **粗体**、\`内联代码\` 与代码块：

- 列表项 1
- 列表项 2
- 列表项 3

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> 提示：流式过程中内容随 SSE 即时更新渲染。
`;

export default () => {
  const [content, setContent] = useState('');
  const [running, setRunning] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      indexRef.current += 6;
      const next = FULL_CONTENT.slice(0, indexRef.current);
      setContent(next);
      if (indexRef.current >= FULL_CONTENT.length) {
        setRunning(false);
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [running]);

  const handleReplay = () => {
    indexRef.current = 0;
    setContent('');
    setRunning(true);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={handleReplay} disabled={running}>
          重新播放
        </Button>
        <span style={{ color: '#999' }}>
          状态：{running ? '流式中' : '已完成'}
        </span>
      </Space>
      <div
        style={{
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: 16,
          minHeight: 240,
        }}
      >
        <MarkdownRenderer content={content} streaming={running} />
      </div>
    </div>
  );
};
