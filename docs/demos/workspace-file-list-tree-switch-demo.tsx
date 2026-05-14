import { Workspace } from '@ant-design/agentic-ui';
import type {
  FileNode,
  FilePanelViewMode,
  FileTreeNode,
} from '@ant-design/agentic-ui/Workspace/types';
import { Alert, Button, Flex, Space, Typography } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

const TREE_ROOT: FileTreeNode[] = [
  {
    key: 'demo-root',
    name: 'workspace',
    isLeaf: false,
    children: [] as FileTreeNode[],
  },
];

const MOCK_CHILDREN: Record<string, FileTreeNode[]> = {
  'demo-root': [
    { key: 'demo-root/src', name: 'src', isLeaf: false },
    { key: 'demo-root/README.md', name: 'README.md', isLeaf: true },
  ],
  'demo-root/src': [
    {
      key: 'demo-root/src/api.ts',
      name: 'api.ts',
      isLeaf: true,
    },
    {
      key: 'demo-root/src/app.tsx',
      name: 'app.tsx',
      isLeaf: true,
    },
  ],
};

const ALL_FILES: FileNode[] = [
  {
    id: 'flat-readme',
    name: 'README.md',
    type: 'markdown',
    size: '12KB',
    lastModified: '09:30',
    url: 'https://example.com/README.md',
    canPreview: true,
  },
  {
    id: 'flat-api',
    name: 'api.ts',
    type: 'code',
    size: '4KB',
    lastModified: '10:12',
    url: 'https://example.com/api.ts',
    canPreview: true,
  },
  {
    id: 'flat-app',
    name: 'app.tsx',
    type: 'code',
    size: '8KB',
    lastModified: '11:05',
    url: 'https://example.com/app.tsx',
    canPreview: true,
  },
];

const LOAD_DELAY_MS = 200;

const WorkspaceFileListTreeSwitchDemo: React.FC = () => {
  const [panelView, setPanelView] = useState<FilePanelViewMode>('list');
  const [keyword, setKeyword] = useState('');

  const handleLoadChildren = useCallback(async (node: FileTreeNode) => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, LOAD_DELAY_MS);
    });
    return MOCK_CHILDREN[node.key] ?? [];
  }, []);

  const filteredNodes = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return ALL_FILES;
    return ALL_FILES.filter((f) => f.name.toLowerCase().includes(q));
  }, [keyword]);

  return (
    <div style={{ padding: 12 }}>
      <div style={{ maxWidth: 720 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            通过 <Typography.Text code>fileTreeSwitch</Typography.Text>{' '}
            开启工具栏 上的分段切换；下方按钮演示<strong>受控</strong>的{' '}
            <Typography.Text code>view</Typography.Text> /{' '}
            <Typography.Text code>onViewChange</Typography.Text>，与面板内
            Segmented 同步
          </Typography.Paragraph>

          <Alert
            type="info"
            showIcon
            message={panelView === 'list' ? '平铺模式' : '文件树模式'}
            description={
              panelView === 'list'
                ? '列表按文件名过滤当前全部文件条目'
                : '树内搜索仅匹配已展开目录下已加载的文件名；无匹配时根级与「已展开仍无结果」会显示不同提示'
            }
          />

          <Flex wrap="wrap" gap={8}>
            <Button
              type={panelView === 'list' ? 'primary' : 'default'}
              onClick={() => setPanelView('list')}
            >
              外部：切到平铺
            </Button>
            <Button
              type={panelView === 'tree' ? 'primary' : 'default'}
              onClick={() => setPanelView('tree')}
            >
              外部：切到文件树
            </Button>
          </Flex>

          <Workspace title="文件 — 平铺 / 文件树" activeTabKey="file">
            <Workspace.File
              tab={{ key: 'file' }}
              nodes={filteredNodes}
              showSearch
              keyword={keyword}
              onChange={setKeyword}
              searchPlaceholder="搜索全部文件名"
              searchPlaceholderTree="仅搜索已展开目录内已加载的文件"
              fileTreeSwitch={{
                view: panelView,
                onViewChange: setPanelView,
                listLabel: '平铺',
                treeLabel: '文件树',
                treeProps: {
                  treeData: TREE_ROOT,
                  onLoadChildren: handleLoadChildren,
                },
              }}
            />
          </Workspace>
        </Space>
      </div>
    </div>
  );
};

export default WorkspaceFileListTreeSwitchDemo;
