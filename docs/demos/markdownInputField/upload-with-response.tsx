import type { AttachmentFile, UploadResponse } from '@ant-design/agentic-ui';
import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Card, Space } from 'antd';
import React, { useState } from 'react';

/** 模拟一次"上传服务"返回的完整响应。20% 概率失败，便于演示错误分支。 */
const handleUploadWithResponse = async (
  file: AttachmentFile,
): Promise<UploadResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (Math.random() > 0.8) {
    return {
      contentId: null,
      errorMessage: '文件上传失败：服务器返回 500 错误',
      fileId: '',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: '',
      uploadStatus: 'FAIL',
    };
  }

  const fileId = `${file.name.replace(/\.[^/.]+$/, '')}-${Date.now()}`;
  const ext = file.type.split('/')[1] || 'unknown';
  return {
    contentId: `content-${Date.now()}`,
    errorMessage: null,
    fileId,
    fileName: file.name,
    fileSize: file.size,
    fileType: ext,
    fileUrl: `https://example.com/files/${fileId}.${ext}`,
    uploadStatus: 'SUCCESS',
  };
};

export default () => {
  const [value, setValue] = useState('尝试上传文件，查看完整的上传响应信息...');
  const [fileMap, setFileMap] = useState<Map<string, AttachmentFile>>(
    new Map(),
  );

  return (
    <div style={{ padding: 24 }}>
      <h2>uploadWithResponse 使用演示</h2>
      <p>
        使用 <code>uploadWithResponse</code> 接口可以返回完整的上传响应对象，
        响应数据自动存储到 <code>file.uploadResponse</code> 中。
      </p>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <MarkdownInputField
          value={value}
          onChange={setValue}
          attachment={{
            enable: true,
            uploadWithResponse: handleUploadWithResponse,
            fileMap,
            onFileMapChange: (files) => files && setFileMap(files),
          }}
          placeholder="点击附件按钮上传文件，查看完整的响应信息..."
        />

        {fileMap.size > 0 ? (
          <Card size="small" title="上传响应详情">
            <pre
              style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 400,
              }}
            >
              {JSON.stringify(Array.from(fileMap.entries()), null, 2)}
            </pre>
          </Card>
        ) : null}
      </Space>
    </div>
  );
};
