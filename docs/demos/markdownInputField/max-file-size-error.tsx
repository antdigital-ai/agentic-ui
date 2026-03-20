import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Card, Space } from 'antd';
import React, { useState } from 'react';

/** 限制为 100KB，便于选择普通文件即可触发「文件超过最大值」报错 */
const MAX_FILE_SIZE_BYTES = 100 * 1024;
const MAX_FILE_COUNT = 2;

/**
 * 文件超过最大值报错 Demo
 * 配置 maxFileSize 后，选择超过限制的文件会以 error 状态出现在附件列表中，并展示「文件大小超过 xxx KB」错误文案
 */
const MaxFileSizeErrorDemo: React.FC = () => {
  const [value, setValue] = useState(
    '点击附件按钮选择超过 100KB 的文件，或选择超过 2 个文件，可看到超限报错展示。',
  );

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card size="small" title="文件超过最大值报错">
          <Space direction="vertical" style={{ width: '100%' }}>
            <p
              style={{
                color: 'var(--color-gray-text-secondary)',
                marginBottom: 8,
              }}
            >
              单文件最大 <strong>100KB</strong>，最多 <strong>2</strong>{' '}
              个文件。选择超过大小的文件时，会在附件列表中显示「超过 xxx
              KB」报错。
            </p>
            <MarkdownInputField
              value={value}
              onChange={setValue}
              attachment={{
                enable: true,
                accept: '.pdf,.doc,.docx,image/*',
                maxFileSize: MAX_FILE_SIZE_BYTES,
                maxFileCount: MAX_FILE_COUNT,
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

export default MaxFileSizeErrorDemo;
