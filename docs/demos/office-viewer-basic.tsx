import { OfficeViewer } from '@ant-design/agentic-ui';
import { Alert, Upload } from 'antd';
import React, { useState } from 'react';

/**
 * 选择本地 .docx / .xlsx / .pptx 文件进行预览（需安装 @silurus/ooxml）
 */
const OfficeViewerBasicDemo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('请选择 Office 文件');

  return (
    <div>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="需安装 optional peer：pnpm add @silurus/ooxml"
        description="WASM 默认从 jsDelivr 加载；仅支持 .docx / .xlsx / .pptx。"
      />
      <Upload
        accept=".docx,.xlsx,.pptx"
        maxCount={1}
        beforeUpload={(f) => {
          setFile(f);
          setMessage(`已选择：${f.name}`);
          return false;
        }}
        onRemove={() => {
          setFile(null);
          setMessage('请选择 Office 文件');
        }}
      >
        <a>选择本地 Office 文件</a>
      </Upload>
      <p style={{ margin: '8px 0', color: '#666', fontSize: 13 }}>{message}</p>
      {file && (
        <OfficeViewer
          file={file}
          fileName={file.name}
          height={420}
          onLoad={() => setMessage(`${file.name} 加载完成`)}
          onError={(err) => setMessage(`加载失败：${err.message}`)}
        />
      )}
    </div>
  );
};

export default OfficeViewerBasicDemo;
