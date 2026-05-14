import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Typography } from 'antd';
import React, { useState } from 'react';
import { mockDelete, mockUpload, pageStyle } from './_constants';

const { Text, Title } = Typography;

/** 限制为 100KB，便于选择普通文件即可触发「文件超过最大值」报错 */
const MAX_FILE_SIZE_BYTES = 100 * 1024;

export default () => {
  const [value, setValue] = useState(
    '点击附件按钮选择超过 100KB 的文件，可看到大小超限报错。',
  );

  return (
    <div style={pageStyle}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        文件超过最大值报错
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        单文件最大 <Text strong>100KB</Text>。选择超过大小的文件时，会在附件列表中显示「超过 xxx KB」报错。
      </Text>
      <MarkdownInputField
        value={value}
        onChange={setValue}
        attachment={{
          enable: true,
          maxFileSize: MAX_FILE_SIZE_BYTES,
          upload: (file) => mockUpload(file, 600),
          onDelete: mockDelete,
        }}
        placeholder="输入内容后点击附件按钮选择文件..."
      />
    </div>
  );
};
