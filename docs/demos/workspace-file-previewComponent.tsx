import { PreviewComponent, Workspace } from '@ant-design/agentic-ui';
import type { FileNode } from '@ant-design/agentic-ui/Workspace/types';
import { Modal, message } from 'antd';
import React, { useMemo, useState } from 'react';

const DemoPreviewComponentInModal: React.FC = () => {
  const files = useMemo<FileNode[]>(
    () => [
      {
        id: 'readme-md1',
        name: 'README1.md',
        size: '15KB',
        lastModified: '2025-08-01 13:15:00',
        content: `# Hello Preview\n\n这是一个 Markdown 文档示例。\n\n- 支持代码块\n\n\`\`\`ts\nconst greet = (name: string) => 'Hello ' + name;\n\`\`\`\n`,
      },
      {
        id: 'readme-md2',
        name: 'README2.md',
        size: '150KB',
        lastModified: '2025-08-01 13:16:00',
        content: `# Hello Preview2\n\n这是一个 Markdown 文档示例。\n\n- 支持代码块\n\n\`\`\`ts\nconst greet = (name: string) => 'Hello ' + name;\n\`\`\`\n`,
      },
    ],
    [],
  );

  const [open, setOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileNode | null>(null);

  const handleOpen = (file: FileNode) => {
    setCurrentFile(file);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentFile(null);
  };

  const handleDownload = (file: FileNode) => {
    message.info(`下载文件：${file.name}`);
  };

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ marginBottom: 12 }}>暴露文件预览组件</h3>
      <Workspace.File
        nodes={files}
        onDownload={handleDownload}
        onPreview={(file) => {
          handleOpen(file);
          return false; // 返回 false 可阻止组件默认的预览行为
        }}
      />

      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        width={920}
        styles={{ body: { padding: 0 } }}
      >
        {currentFile && <PreviewComponent file={currentFile} />}
      </Modal>
    </div>
  );
};

export default DemoPreviewComponentInModal;
