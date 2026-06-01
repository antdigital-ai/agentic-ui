import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Typography, message } from 'antd';
import React, { useState } from 'react';
import { mockDelete, mockUpload, pageStyle } from './_constants';

const { Text, Title } = Typography;

const MAX_FILE_COUNT = 3;

export default () => {
  const [value, setValue] = useState(
    '先上传 2 个文件，再次选择 2 个文件（2+2>3），观察超限提示。',
  );

  return (
    <div style={pageStyle}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        文件数量超限回调
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        最多 <Text strong>{MAX_FILE_COUNT}</Text>{' '}
        个文件。选择文件数量超限时会触发 <Text code>onExceedMaxCount</Text>{' '}
        回调，由消费者展示提示，避免静默失败。
      </Text>
      <MarkdownInputField
        value={value}
        onChange={setValue}
        attachment={{
          enable: true,
          maxFileCount: MAX_FILE_COUNT,
          allowMultiple: true,
          onExceedMaxCount: ({ maxCount, currentCount, selectedCount }) => {
            const remaining = maxCount - currentCount;
            if (remaining <= 0) {
              message.warning(`最多上传 ${maxCount} 个文件，已达上限`);
              return;
            }
            message.warning(
              `最多上传 ${maxCount} 个文件，还可上传 ${remaining} 个，本次选择了 ${selectedCount} 个`,
            );
          },
          upload: (file) => mockUpload(file, 600),
          onDelete: mockDelete,
        }}
        placeholder="输入内容后点击附件按钮选择文件..."
      />
    </div>
  );
};
