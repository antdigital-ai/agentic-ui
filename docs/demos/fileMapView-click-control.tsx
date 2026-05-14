import type { AttachmentFile } from '@ant-design/agentic-ui';
import { FileMapView } from '@ant-design/agentic-ui';
import { Button, message, Space } from 'antd';
import React, { useState } from 'react';

const createAttachmentFile = (
  name: string,
  type: string,
  url?: string,
): AttachmentFile =>
  ({
    name,
    type,
    size: 512 * 1024,
    url,
    previewUrl: url,
    status: 'done',
    uuid: `uuid-${name}`,
    lastModified: Date.now(),
    webkitRelativePath: '',
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    bytes: () => Promise.resolve(new Uint8Array(0)),
    text: () => Promise.resolve(''),
    stream: () => new ReadableStream(),
    slice: () => new Blob(),
  }) as AttachmentFile;

const noUrlFileMap = new Map<string, AttachmentFile>([
  ['image', createAttachmentFile('商品主图色差对比.png', 'image/png')],
  ['video', createAttachmentFile('商品讲解视频.mp4', 'video/mp4')],
  ['pdf', createAttachmentFile('质检报告.pdf', 'application/pdf')],
  ['json', createAttachmentFile('analysis-result.json', 'application/json')],
]);

const urlFileMap = new Map<string, AttachmentFile>([
  [
    'pdf',
    createAttachmentFile(
      '需求说明.pdf',
      'application/pdf',
      'https://example.com/requirement.pdf',
    ),
  ],
  [
    'doc',
    createAttachmentFile(
      '处理建议.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'https://example.com/suggestion.docx',
    ),
  ],
]);

export default () => {
  const [disableDefaultFileClick, setDisableDefaultFileClick] = useState(true);

  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          background: '#e6f7ff',
          borderRadius: 8,
          border: '1px solid #91d5ff',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>
          自定义文件点击与无 URL 文件卡片
        </h3>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
          无 url/previewUrl 但有 type/name 的图片、视频、文档会按普通文件卡片展示；
          也可以通过 onFileClick 接管普通文件点击。
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12 }}>无 URL 文件按类型展示卡片</h4>
        <FileMapView fileMap={noUrlFileMap} />
      </div>

      <div>
        <Space style={{ marginBottom: 12 }}>
          <Button
            size="small"
            onClick={() => setDisableDefaultFileClick((value) => !value)}
          >
            {disableDefaultFileClick ? '启用默认点击预览' : '禁用默认点击预览'}
          </Button>
          <span style={{ color: '#666' }}>
            当前默认点击预览：
            {disableDefaultFileClick ? '已禁用' : '已启用'}
          </span>
        </Space>
        <FileMapView
          fileMap={urlFileMap}
          disableDefaultFileClick={disableDefaultFileClick}
          onFileClick={(file) => {
            message.info(`业务接管文件点击：${file.name}`);
          }}
          onPreview={(file) => {
            message.success(`执行默认预览回调：${file.name}`);
          }}
        />
      </div>
    </div>
  );
};
