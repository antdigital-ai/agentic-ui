import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Space, Switch, Typography } from 'antd';
import React, { useState } from 'react';

/**
 * AI 回复中输入区内提示（typing / 发送 loading 且输入为空）
 */
const TypingHintDemo: React.FC = () => {
  const [value, setValue] = useState('');
  const [aiReplying, setAiReplying] = useState(true);

  return (
    <div style={{ padding: '24px', maxWidth: '720px', margin: '0 auto' }}>
      <Typography.Paragraph style={{ marginBottom: 16 }}>
        打开下方开关时，输入区为只读并显示「AI
        正在回复」类动画提示（输入框为空时）；关闭开关后可正常输入。发送消息且{' '}
        <Typography.Text code>onSend</Typography.Text>{' '}
        未结束时，空输入时同样会显示该提示且为只读。
      </Typography.Paragraph>
      <Space style={{ marginBottom: 16 }} align="center">
        <span>模拟 AI 正在回复（typing）</span>
        <Switch
          checked={aiReplying}
          onChange={setAiReplying}
          aria-label="toggle AI replying"
        />
      </Space>
      <MarkdownInputField
        value={value}
        onChange={setValue}
        typing={aiReplying}
        placeholder="关闭「模拟 AI 正在回复」后可在此输入"
        onSend={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }}
        style={{
          minHeight: '120px',
          maxHeight: '280px',
        }}
      />
    </div>
  );
};

export default TypingHintDemo;
