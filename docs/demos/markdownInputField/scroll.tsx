import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Typography } from 'antd';
import React from 'react';
import { LONG_SCROLL_SAMPLE, TAG_ITEMS, pageStyle } from './_constants';
import { useDemoSend } from './useDemoSend';

const { Text, Title } = Typography;

export default () => {
  const { handleSend, handleStop } = useDemoSend();

  return (
    <div style={pageStyle}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        多行滚动
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        长文本观察内部滚动与换行。
      </Text>
      <MarkdownInputField
        tagInputProps={{ enable: true, items: TAG_ITEMS }}
        onSend={handleSend}
        value={LONG_SCROLL_SAMPLE}
        onStop={handleStop}
        placeholder="请输入内容"
      />
    </div>
  );
};
