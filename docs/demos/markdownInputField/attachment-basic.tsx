import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Typography } from 'antd';
import React, { useMemo } from 'react';
import {
  TAG_ITEMS,
  TEMPLATE_VALUE,
  mockDelete,
  mockUpload,
  pageStyle,
} from './_constants';
import { useDemoSend } from './useDemoSend';

const { Text, Title } = Typography;

export default () => {
  const { handleSend, handleStop } = useDemoSend();

  const attachmentConfig = useMemo(
    () => ({
      enable: true as const,
      upload: (file: File) => mockUpload(file, 1000),
      onDelete: mockDelete,
    }),
    [],
  );

  return (
    <div style={pageStyle}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        文件上传
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        开启 `attachment`，模拟上传返回 blob URL，删除时 `revokeObjectURL`。
      </Text>
      <MarkdownInputField
        attachment={attachmentConfig}
        value={TEMPLATE_VALUE}
        tagInputProps={{ enable: true, items: TAG_ITEMS }}
        onSend={handleSend}
        onStop={handleStop}
        placeholder="请输入内容"
      />
    </div>
  );
};
