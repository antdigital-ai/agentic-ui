import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Typography } from 'antd';
import React, { useState } from 'react';
import { pageStyle } from './_constants';
import { useDemoSend } from './useDemoSend';

const { Text, Title } = Typography;

export default () => {
  const [value, setValue] = useState(
    '试试将鼠标悬停在输入框上，看看是否有阴影动画效果...',
  );
  const { handleSend, handleStop } = useDemoSend();

  return (
    <div style={pageStyle}>
      <div>
        <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
          默认启用 hover 动画
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          鼠标悬停时会出现阴影动画。
        </Text>
        <MarkdownInputField
          value={value}
          onChange={setValue}
          onSend={handleSend}
          onStop={handleStop}
          placeholder="将鼠标悬停在这里，会看到阴影动画效果"
        />
      </div>

      <div>
        <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
          禁用 hover 动画
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          `disableHoverAnimation` 关闭悬停阴影。
        </Text>
        <MarkdownInputField
          value={value}
          onChange={setValue}
          onSend={handleSend}
          onStop={handleStop}
          placeholder="将鼠标悬停在这里，不会看到阴影动画效果"
          disableHoverAnimation
        />
      </div>
    </div>
  );
};
