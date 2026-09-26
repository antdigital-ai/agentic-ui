import { OfficeViewer } from '@ant-design/agentic-ui';
import { Alert, Segmented, Space, Upload } from 'antd';
import React, { useState } from 'react';
import {
  OFFICE_SAMPLES,
  type OfficeSampleKey,
} from './office-viewer-samples';

/**
 * 预置常见三件套样例 + 可选本地文件预览（需安装 @silurus/ooxml）
 */
const OfficeViewerBasicDemo: React.FC = () => {
  const [sampleKey, setSampleKey] = useState<OfficeSampleKey>('docx');
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [message, setMessage] = useState('正在加载示例文档…');

  const sample = OFFICE_SAMPLES[sampleKey];
  const file = localFile ?? sample.url;
  const fileName = localFile?.name ?? sample.fileName;
  const fileType = localFile
    ? undefined
    : (sampleKey as 'docx' | 'xlsx' | 'pptx');

  return (
    <div>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="需安装 optional peer：pnpm add @silurus/ooxml"
        description="下方预置了公开测试样例（docx / xlsx / pptx）；也可改用本地文件。"
      />
      <Space wrap style={{ marginBottom: 12 }}>
        <Segmented
          disabled={Boolean(localFile)}
          value={sampleKey}
          options={Object.entries(OFFICE_SAMPLES).map(([key, item]) => ({
            label: item.label,
            value: key,
          }))}
          onChange={(value) => {
            setLocalFile(null);
            setSampleKey(value as OfficeSampleKey);
            setMessage('正在加载示例文档…');
          }}
        />
        <Upload
          accept=".docx,.xlsx,.pptx"
          maxCount={1}
          showUploadList={false}
          beforeUpload={(f) => {
            setLocalFile(f);
            setMessage(`已选择：${f.name}`);
            return false;
          }}
        >
          <a>选择本地文件</a>
        </Upload>
        {localFile && (
          <a
            onClick={() => {
              setLocalFile(null);
              setMessage('正在加载示例文档…');
            }}
          >
            恢复示例
          </a>
        )}
      </Space>
      <p style={{ margin: '0 0 8px', color: '#666', fontSize: 13 }}>{message}</p>
      <OfficeViewer
        key={localFile ? localFile.name : sample.url}
        file={file}
        fileName={fileName}
        fileType={fileType}
        height={420}
        onLoad={() => setMessage(`${fileName} 加载完成`)}
        onError={(err) => setMessage(`加载失败：${err.message}`)}
      />
    </div>
  );
};

export default OfficeViewerBasicDemo;
