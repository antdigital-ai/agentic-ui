import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Slider, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { TEMPLATE_VALUE, inputMinStyle, pageStyle } from './_constants';
import { useDemoSend } from './useDemoSend';

const { Text, Title } = Typography;

export default () => {
  const [borderRadius, setBorderRadius] = useState(0);
  const { handleSend, handleStop } = useDemoSend();

  const asyncTagItems = useCallback(
    async (props: { placeholder?: string } | undefined) =>
      ['tag1', 'tag2', 'tag3'].map((item) => ({
        key: item,
        label: `${props?.placeholder ?? ''}${item}`,
      })),
    [],
  );

  return (
    <div style={pageStyle}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        圆角
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        `borderRadius` 与标签模板组合示例。
      </Text>
      <div style={{ marginBottom: 12 }}>
        <Text>圆角</Text>
        <Slider
          min={0}
          max={16}
          value={borderRadius}
          onChange={setBorderRadius}
        />
      </div>
      <MarkdownInputField
        style={inputMinStyle}
        borderRadius={borderRadius}
        value={TEMPLATE_VALUE}
        tagInputProps={{
          enable: true,
          items: asyncTagItems,
        }}
        onSend={handleSend}
        onStop={handleStop}
        placeholder="请输入内容"
      />
    </div>
  );
};
