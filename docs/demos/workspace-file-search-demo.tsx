import { Workspace } from '@ant-design/agentic-ui';
import { FileNode } from '@ant-design/agentic-ui/Workspace/types';
import React, { useMemo, useState } from 'react';

const WorkspaceFileSearchDemo: React.FC = () => {
  const [keyword, setKeyword] = useState('');

  const files: FileNode[] = [
    {
      name: 'README.md',
      type: 'markdown',
      size: '12KB',
      lastModified: '09:30',
    },
    {
      name: '开发规范.md',
      type: 'markdown',
      size: '24KB',
      lastModified: '10:20',
    },
    {
      name: '使用手册.md',
      type: 'markdown',
      size: '31KB',
      lastModified: '16:45',
    },
    { name: 'logo.png', type: 'image', size: '4KB', lastModified: '08:12' },
    { name: 'banner.jpg', type: 'image', size: '125KB', lastModified: '12:55' },
    {
      name: 'assets.zip',
      type: 'archive',
      size: '5.1MB',
      lastModified: '14:21',
    },
    { name: 'backup.7z', type: 'zip', size: '7.9MB', lastModified: '18:01' },
    {
      name: '独立文件.txt',
      type: 'plainText',
      size: '1KB',
      lastModified: '11:05',
    },
  ];

  // 外部过滤：仅按文件名匹配（不分组）
  const filteredFiles = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return files;
    return files.filter((f) => (f.name || '').toLowerCase().includes(kw));
  }, [files, keyword]);

  return (
    <div style={{ padding: 12 }}>
      <div style={{ maxWidth: 640 }}>
        <Workspace title="文件管理-搜索">
          <Workspace.File
            nodes={filteredFiles}
            // 受控搜索：仅用于展示搜索框与回调，过滤在外部完成
            keyword={keyword}
            onChange={setKeyword}
            showSearch={true}
            searchPlaceholder="搜索文件名"
          />
        </Workspace>
      </div>
    </div>
  );
};

export default WorkspaceFileSearchDemo;
