import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Typography } from 'antd';
import React from 'react';
import { TEMPLATE_VALUE, pageStyle } from './_constants';

const { Text, Title } = Typography;

export default () => (
  <div style={pageStyle}>
    <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
      禁用
    </Title>
    <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
      `disabled` 下不可编辑与发送。
    </Text>
    <MarkdownInputField
      disabled
      value={TEMPLATE_VALUE}
      placeholder="请输入内容"
    />
  </div>
);
