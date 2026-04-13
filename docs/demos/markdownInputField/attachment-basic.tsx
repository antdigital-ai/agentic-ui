import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Typography } from 'antd';
import React, { useMemo } from 'react';
import { TAG_ITEMS, TEMPLATE_VALUE, pageStyle } from './_constants';
import { useDemoSend } from './useDemoSend';

const { Text, Title } = Typography;

export default () => {
  const { handleSend, handleStop } = useDemoSend();

  const attachmentConfig = useMemo(
    () => ({
      enable: true as const,
      upload: async (file: File) =>
        new Promise<string>((resolve) => {
          setTimeout(() => resolve(URL.createObjectURL(file)), 1000);
        }),
      onDelete: async (file: { url?: string; previewUrl?: string }) => {
        const fileUrl = typeof file.url === 'string' ? file.url : undefined;
        const previewUrl =
          typeof file.previewUrl === 'string' ? file.previewUrl : undefined;
        if (fileUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(fileUrl);
        }
        if (previewUrl?.startsWith('blob:') && previewUrl !== fileUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      },
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
