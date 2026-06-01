import {
  MarkdownInputField,
  type MarkdownInputFieldProps,
} from '@ant-design/agentic-ui';
import { Card, Space, Tag, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { pageStyle } from './_constants';
import { useDemoSend } from './useDemoSend';

const { Text, Title } = Typography;

export default () => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [focusCount, setFocusCount] = useState(0);
  const [blurCount, setBlurCount] = useState(0);
  const { handleSend, handleStop } = useDemoSend();

  const handleFocus = useCallback<
    NonNullable<MarkdownInputFieldProps['onFocus']>
  >(() => {
    setIsFocused(true);
    setFocusCount((c) => c + 1);
  }, []);

  const handleBlur = useCallback<
    NonNullable<MarkdownInputFieldProps['onBlur']>
  >(() => {
    setIsFocused(false);
    setBlurCount((c) => c + 1);
  }, []);

  return (
    <div style={pageStyle}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        onFocus / onBlur
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        获得或失去焦点时更新状态；可与埋点、高亮边框等逻辑联动。
      </Text>

      <Card size="small">
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
        onSend={handleSend}
        onStop={handleStop}
      />
    </div>
  );
};
