import { OfficeViewer, getDefaultWasmUrl } from '@ant-design/agentic-ui';
import { Alert, Upload } from 'antd';
import React, { useState } from 'react';

/**
 * 自定义 wasmUrl：显式传入 CDN 地址（生产可换成自建静态资源）
 */
const OfficeViewerWasmUrlDemo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const wasmUrl = getDefaultWasmUrl('xlsx');

  return (
    <div>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message={`wasmUrl = ${wasmUrl}`}
        description="生产环境建议将 *_parser_bg.wasm 托管到自有 CDN，再经 wasmUrl 传入。"
      />
      <Upload
        accept=".xlsx"
        maxCount={1}
        beforeUpload={(f) => {
          setFile(f);
          return false;
        }}
        onRemove={() => setFile(null)}
      >
        <a>选择本地 .xlsx</a>
      </Upload>
      {file && (
        <div style={{ marginTop: 12 }}>
          <OfficeViewer
            file={file}
            fileType="xlsx"
            fileName={file.name}
            wasmUrl={wasmUrl}
            height={420}
          />
        </div>
      )}
    </div>
  );
};

export default OfficeViewerWasmUrlDemo;
