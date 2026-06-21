import { MarkdownRenderer } from '@ant-design/agentic-ui';
import { Button, Space, Switch } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const FULL_CONTENT = `# 流式 Markdown 演示

智能体正在逐步给出答案。开启「逐词淡入」后，新出现的文字会像 GPT 一样平滑淡入，已显示的内容保持稳定、不闪烁。

下面包含 **粗体**、\`内联代码\` 与代码块：

- 列表项 1：每个词在出现时各自淡入一次。
- 列表项 2：限流逐字推进，配合淡入形成连续的出字节奏。
- 列表项 3：代码块、表格、公式不参与拆词，避免破坏布局。

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> 提示：流式过程中内容随 SSE 即时更新渲染，逐词淡入纯 CSS 驱动，性能友好。
`;

export default () => {
  const [content, setContent] = useState('');
  const [running, setRunning] = useState(true);
  const [fade, setFade] = useState(true);
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
      <Space style={{ marginBottom: 16 }} wrap>
        <Button onClick={handleReplay} disabled={running}>
          重新播放
        </Button>
        <Space size={4}>
          <span style={{ color: '#666' }}>逐词淡入</span>
          <Switch checked={fade} onChange={setFade} size="small" />
        </Space>
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
        <MarkdownRenderer
          content={content}
          streaming={running}
          throttleOptions={{ fade }}
        />
      </div>
    </div>
  );
};
