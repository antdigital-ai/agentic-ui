import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Typography } from 'antd';
import React, { useCallback } from 'react';
import { TEMPLATE_VALUE, inputMinStyle, pageStyle } from './_constants';
import { useDemoSend } from './useDemoSend';

const { Text, Title } = Typography;

export default () => {
  const { sentList, handleSend, handleStop } = useDemoSend();

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
        基本：异步标签与占位符模板
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        `tagInputProps.items` 异步返回候选；`value` 展示模板占位语法。
      </Text>
      {sentList.length > 0 ? (
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          已发送 {sentList.length} 条（模拟 1s 延迟；停止可中断）
        </Text>
      ) : null}
      <MarkdownInputField
        style={inputMinStyle}
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
