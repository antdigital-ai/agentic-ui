import { Workspace } from '@ant-design/agentic-ui';
import type { FileTreeNode } from '@ant-design/agentic-ui/Workspace/types';
import { Alert, Space, Typography } from 'antd';
import React, { useState } from 'react';

/**
 * 模拟按目录 key 懒加载子项（可替换为真实接口）
 */
const MOCK_BY_PARENT_KEY: Record<string, FileTreeNode[]> = {
  root: [
    { key: 'root/src', name: 'src', isLeaf: false },
    { key: 'root/docs', name: 'docs', isLeaf: false },
    { key: 'root/README.md', name: 'README.md', isLeaf: true },
  ],
  'root/src': [
    { key: 'root/src/components', name: 'components', isLeaf: false },
    { key: 'root/src/index.ts', name: 'index.ts', isLeaf: true },
  ],
  'root/src/components': [
    { key: 'root/src/components/Button.tsx', name: 'Button.tsx', isLeaf: true },
    { key: 'root/src/components/Input.tsx', name: 'Input.tsx', isLeaf: true },
  ],
  'root/docs': [{ key: 'root/docs/guide.md', name: 'guide.md', isLeaf: true }],
};

const LOAD_DELAY_MS = 360;

const WorkspaceFileTreeDemo: React.FC = () => {
  const [lastSelected, setLastSelected] = useState<FileTreeNode | null>(null);

  const loadChildren = async (node: FileTreeNode) => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, LOAD_DELAY_MS);
    });
    return MOCK_BY_PARENT_KEY[node.key] ?? [];
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{ maxWidth: 560 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            展开目录时通过 <Typography.Text code>loadChildren</Typography.Text>{' '}
            拉取子节点（本示例为本地模拟延迟）
          </Typography.Paragraph>
          {lastSelected && (
            <Alert
              type="info"
              showIcon
              message="onSelect"
              description={
                <span>
                  <Typography.Text code>{lastSelected.key}</Typography.Text> —{' '}
                  {lastSelected.name}
                </span>
              }
            />
          )}
          <Workspace title="文件树 - 懒加载" activeTabKey="fileTree">
            <Workspace.Realtime
              data={{
                type: 'markdown',
                content: '### 说明\n与 **文件树** 同屏时，可在此查看说明。',
              }}
            />
            <Workspace.FileTree
              tab={{ key: 'fileTree' }}
              treeData={[
                {
                  key: 'root',
                  name: 'project',
                  isLeaf: false,
                  children: [] as FileTreeNode[],
                },
              ]}
              loadChildren={loadChildren}
              onSelect={setLastSelected}
            />
          </Workspace>
        </Space>
      </div>
    </div>
  );
};

export default WorkspaceFileTreeDemo;
