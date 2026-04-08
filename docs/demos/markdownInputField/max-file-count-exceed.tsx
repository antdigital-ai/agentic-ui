import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Card, Space, message } from 'antd';
import React, { useState } from 'react';

const MAX_FILE_COUNT = 3;

/**
 * 文件数量超限回调 Demo
 * 配置 maxFileCount 后，当选择的文件数量超出限制时，
 * 通过 onExceedMaxCount 回调通知消费者，由消费者展示提示信息。
 */
const MaxFileCountExceedDemo: React.FC = () => {
  const [value, setValue] = useState(
    '先上传 2 个文件，再次选择 2 个文件（2+2>3），观察超限提示。',
  );

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card size="small" title="文件数量超限回调">
          <Space direction="vertical" style={{ width: '100%' }}>
            <p
              style={{
                color: 'var(--color-gray-text-secondary)',
                marginBottom: 8,
              }}
            >
              最多 <strong>{MAX_FILE_COUNT}</strong>{' '}
              个文件。选择文件数量超限时，会通过 <code>onExceedMaxCount</code>{' '}
              回调弹出提示，而不是静默失败。
            </p>
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
                  } else {
                    message.warning(
                      `最多上传 ${maxCount} 个文件，还可上传 ${remaining} 个，本次选择了 ${selectedCount} 个`,
                    );
                  }
                },
                upload: async (file) => {
                  await new Promise((r) => setTimeout(r, 600));
                  return URL.createObjectURL(file);
                },
                onDelete: async () => {},
              }}
              placeholder="输入内容后点击附件按钮选择文件..."
            />
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default MaxFileCountExceedDemo;
