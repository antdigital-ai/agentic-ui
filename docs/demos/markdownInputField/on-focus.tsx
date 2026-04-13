import {
  MarkdownInputField,
  type MarkdownInputFieldProps,
} from '@ant-design/agentic-ui';
import { Card, Space, Tag, Typography } from 'antd';
import React, { useCallback, useState } from 'react';

const { Paragraph, Text, Title } = Typography;

export default () => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [focusCount, setFocusCount] = useState(0);
  const [blurCount, setBlurCount] = useState(0);

  const handleFocus = useCallback(
    (
      _value: string,
      _schema: unknown,
      _e: React.FocusEvent<HTMLDivElement>,
    ) => {
      setIsFocused(true);
      setFocusCount((c) => c + 1);
    },
    [],
  );

  const handleBlur = useCallback<
    NonNullable<MarkdownInputFieldProps['onBlur']>
  >((_value, _schema, _e) => {
    setIsFocused(false);
    setBlurCount((c) => c + 1);
  }, []);

  return (
    <div style={{ boxSizing: 'border-box', maxWidth: 720, padding: 12 }}>
      <Title level={4} style={{ marginTop: 0 }}>
        onFocus / onBlur
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        获得或失去焦点时更新状态；可与埋点、高亮边框等逻辑联动。
      </Paragraph>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Text>焦点：</Text>
          <Tag color={isFocused ? 'processing' : 'default'}>
            {isFocused ? '已获得焦点' : '未获得焦点'}
          </Tag>
          <Text type="secondary">
            聚焦次数 {focusCount} · 失焦次数 {blurCount}
          </Text>
        </Space>
      </Card>

      <MarkdownInputField
        value={value}
        onChange={setValue}
        placeholder="点击输入框获得焦点…"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSend={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }}
      />

      <Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        <Text strong>回调参数</Text>
      </Paragraph>
      <ul style={{ marginTop: 8, paddingInlineStart: 20 }}>
        <li>
          <Text code>onFocus</Text> / <Text code>onBlur</Text>：首参为当前
          Markdown 文本，次参为编辑器 schema，第三参为对应的原生事件
        </li>
      </ul>
    </div>
  );
};
