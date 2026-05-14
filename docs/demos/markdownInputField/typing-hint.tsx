import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Space, Switch, Typography } from 'antd';
import React, { useState } from 'react';
import { pageStyle } from './_constants';

const { Text, Title } = Typography;

export default () => {
  const [value, setValue] = useState('');
  const [aiReplying, setAiReplying] = useState(true);

  return (
    <div style={pageStyle}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        AI 回复中的输入提示
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        打开开关时，输入区为只读并显示「AI
        正在回复」类动画提示（输入框为空时）；关闭后可正常输入。发送消息且
        <Text code>onSend</Text> 未结束时，空输入同样会显示该提示且为只读。
      </Text>
      <Space align="center">
        <Text>模拟 AI 正在回复（typing）</Text>
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
        style={{ minHeight: 120, maxHeight: 280 }}
      />
    </div>
  );
};
