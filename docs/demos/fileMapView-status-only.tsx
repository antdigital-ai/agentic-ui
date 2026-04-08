import type { AttachmentFile } from '@ant-design/agentic-ui';
import { FileMapView } from '@ant-design/agentic-ui';
import React from 'react';

/**
 * 创建仅有元数据、无 url/previewUrl 的附件（用于展示「文件内容未拿到」时的占位块）
 * AttachmentFileIcon 会渲染文件大小 + 格式的小块
 */
const createStatusOnlyFile = (
  name: string,
  type: string,
  sizeInBytes: number,
): AttachmentFile =>
  ({
    name,
    type,
    size: sizeInBytes,
    status: 'done',
    lastModified: Date.now(),
    webkitRelativePath: '',
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    bytes: () => Promise.resolve(new Uint8Array(0)),
    text: () => Promise.resolve(''),
    stream: () => new ReadableStream(),
    slice: () => new Blob(),
  }) as AttachmentFile;

const statusOnlyFileMap = new Map<string, AttachmentFile>([
  ['img-1', createStatusOnlyFile('photo.jpg', 'image/jpeg', 2 * 1024 * 1024)],
  ['img-2', createStatusOnlyFile('screenshot.png', 'image/png', 512 * 1024)],
  ['vid-1', createStatusOnlyFile('demo.mp4', 'video/mp4', 15 * 1024 * 1024)],
  ['doc-1', createStatusOnlyFile('report.pdf', 'application/pdf', 1024 * 1024)],
  [
    'doc-2',
    createStatusOnlyFile(
      'sheet.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      256 * 1024,
    ),
  ],
  [
    'doc-3',
    createStatusOnlyFile(
      'note.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      88 * 1024,
    ),
  ],
]);

export default () => (
  <div style={{ padding: 24, maxWidth: 640 }}>
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
        仅有 status、无 url/previewUrl 时的占位展示
      </h3>
      <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
        文件内容未拿到时，展示「文件大小 + 文件格式」的小块，而非空白或错误图标
      </p>
    </div>
    <div
      style={{
        padding: 16,
        background: '#fafafa',
        borderRadius: 8,
        border: '1px solid #e8e8e8',
      }}
    >
      <FileMapView fileMap={statusOnlyFileMap} />
    </div>
  </div>
);
