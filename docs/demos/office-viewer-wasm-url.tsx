import { OfficeViewer, getDefaultWasmUrl } from '@ant-design/agentic-ui';
import { Alert } from 'antd';
import React, { useState } from 'react';
import { OFFICE_SAMPLES } from './office-viewer-samples';

/**
 * 自定义 wasmUrl：用预置 xlsx 样例演示 CDN WASM 地址透传
 */
const OfficeViewerWasmUrlDemo: React.FC = () => {
  const wasmUrl = getDefaultWasmUrl('xlsx');
  const sample = OFFICE_SAMPLES.xlsx;
  const [message, setMessage] = useState(`加载 ${sample.fileName}…`);

  return (
    <div>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message={`wasmUrl = ${wasmUrl}`}
        description="生产环境建议将 *_parser_bg.wasm 托管到自有 CDN，再经 wasmUrl 传入。"
      />
      <p style={{ margin: '0 0 8px', color: '#666', fontSize: 13 }}>
        {message}
      </p>
      <OfficeViewer
        file={sample.url}
        fileType="xlsx"
        fileName={sample.fileName}
        wasmUrl={wasmUrl}
        height={420}
        onLoad={() => setMessage(`${sample.fileName} 加载完成`)}
        onError={(err) => setMessage(`加载失败：${err.message}`)}
      />
    </div>
  );
};

export default OfficeViewerWasmUrlDemo;
