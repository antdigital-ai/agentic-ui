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

const LONG_NAME_README =
  'README-agentic-ui-workspace-file-tree-lazy-load-and-list-switch-integration-notes.md';

const LONG_NAME_COMPONENT =
  'WorkspaceFilePanelWithTreeSwitchLazyLoadingAndSearchFilterBehavior.regression.test.tsx';

const LONG_NAME_ASSET =
  'screenshot-2024-q4-release-notes-banner-ultra-wide-3840x2160-final-v3.png';

const LONG_NAME_DOCS =
  'architecture-and-design-decisions-for-agentic-ui-file-panel-tree-mode-guide.md';

/** 恰好 200 字符，用于验证平铺 / 文件树下单行省略 */
const LONG_NAME_200_CHARS =
  'dtclaw--dtclaw-workspace-pool-prod-54h7r-' + 'a'.repeat(156) + '.md';

const LONG_FOLDER_200_CHARS =
  'dtclaw--dtclaw-workspace-pool-folder-prod-54h7r-' + 'b'.repeat(152);

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
    id: 'flat-name-200',
    name: LONG_NAME_200_CHARS,
    type: 'markdown',
    size: '1KB',
    lastModified: '刚刚',
    url: 'https://example.com/long-name-200.md',
    canPreview: true,
  },
  {
    id: 'flat-readme-long',
    name: LONG_NAME_README,
    type: 'markdown',
    size: '28KB',
    lastModified: '09:32',
    url: `https://example.com/${LONG_NAME_README}`,
    canPreview: true,
  },
  {
    id: 'flat-package',
    name: 'package.json',
    type: 'code',
    size: '2KB',
    lastModified: '08:00',
    url: 'https://example.com/package.json',
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
  {
    id: 'flat-file-item',
    name: 'FileItem.tsx',
    type: 'code',
    size: '6KB',
    lastModified: '11:18',
    url: 'https://example.com/FileItem.tsx',
    canPreview: true,
  },
  {
    id: 'flat-hook',
    name: 'useFileTreeLazyLoad.ts',
    type: 'code',
    size: '3KB',
    lastModified: '11:22',
    url: 'https://example.com/useFileTreeLazyLoad.ts',
    canPreview: true,
  },
  {
    id: 'flat-variables',
    name: 'variables.css',
    type: 'code',
    size: '1KB',
    lastModified: '11:25',
    url: 'https://example.com/variables.css',
    canPreview: true,
  },
  {
    id: 'flat-getting-started',
    name: 'getting-started.md',
    type: 'markdown',
    size: '16KB',
    lastModified: '10:40',
    url: 'https://example.com/getting-started.md',
    canPreview: true,
  },
  {
    id: 'flat-docs-long',
    name: LONG_NAME_DOCS,
    type: 'markdown',
    size: '42KB',
    lastModified: '10:45',
    url: `https://example.com/${LONG_NAME_DOCS}`,
    canPreview: true,
  },
  {
    id: 'flat-component-long',
    name: LONG_NAME_COMPONENT,
    type: 'code',
    size: '18KB',
    lastModified: '14:02',
    url: `https://example.com/${LONG_NAME_COMPONENT}`,
    canPreview: true,
  },
  {
    id: 'flat-logo',
    name: 'logo.png',
    type: 'image',
    size: '120KB',
    lastModified: '昨天',
    url: 'https://example.com/logo.png',
    canPreview: true,
  },
  {
    id: 'flat-asset-long',
    name: LONG_NAME_ASSET,
    type: 'image',
    size: '2.4MB',
    lastModified: '昨天',
    url: `https://example.com/${LONG_NAME_ASSET}`,
    canPreview: true,
  },
  {
    id: 'flat-ci',
    name: 'ci.yml',
    type: 'code',
    size: '3KB',
    lastModified: '周一',
    url: 'https://example.com/ci.yml',
    canPreview: true,
  },
  {
    id: 'flat-changelog',
    name: 'changelog.zh-CN.md',
    type: 'markdown',
    size: '56KB',
    lastModified: '周一',
    url: 'https://example.com/changelog.zh-CN.md',
    canPreview: true,
  },
];

const MOCK_CHILDREN: Record<string, FileTreeNode[]> = {
  'demo-root': [
    {
      key: `demo-root/${LONG_FOLDER_200_CHARS}`,
      name: LONG_FOLDER_200_CHARS,
      isLeaf: false,
    },
    {
      key: `demo-root/${LONG_NAME_200_CHARS}`,
      name: LONG_NAME_200_CHARS,
      isLeaf: true,
      file: ALL_FILES[1],
    },
    { key: 'demo-root/src', name: 'src', isLeaf: false },
    { key: 'demo-root/docs', name: 'docs', isLeaf: false },
    { key: 'demo-root/assets', name: 'assets', isLeaf: false },
    { key: 'demo-root/.github', name: '.github', isLeaf: false },
    {
      key: 'demo-root/README.md',
      name: 'README.md',
      isLeaf: true,
      file: ALL_FILES[0],
    },
    {
      key: `demo-root/${LONG_NAME_README}`,
      name: LONG_NAME_README,
      isLeaf: true,
      file: ALL_FILES[2],
    },
    {
      key: 'demo-root/package.json',
      name: 'package.json',
      isLeaf: true,
      file: ALL_FILES[3],
    },
    {
      key: 'demo-root/changelog.zh-CN.md',
      name: 'changelog.zh-CN.md',
      isLeaf: true,
      file: ALL_FILES[15],
    },
  ],
  [`demo-root/${LONG_FOLDER_200_CHARS}`]: [
    {
      key: `demo-root/${LONG_FOLDER_200_CHARS}/inside.md`,
      name: 'inside.md',
      isLeaf: true,
      file: ALL_FILES[0],
    },
  ],
  'demo-root/src': [
    { key: 'demo-root/src/components', name: 'components', isLeaf: false },
    { key: 'demo-root/src/hooks', name: 'hooks', isLeaf: false },
    { key: 'demo-root/src/styles', name: 'styles', isLeaf: false },
    {
      key: 'demo-root/src/api.ts',
      name: 'api.ts',
      isLeaf: true,
      file: ALL_FILES[4],
    },
    {
      key: 'demo-root/src/app.tsx',
      name: 'app.tsx',
      isLeaf: true,
      file: ALL_FILES[5],
    },
  ],
  'demo-root/src/components': [
    {
      key: 'demo-root/src/components/FileItem.tsx',
      name: 'FileItem.tsx',
      isLeaf: true,
      file: ALL_FILES[6],
    },
    {
      key: `demo-root/src/components/${LONG_NAME_COMPONENT}`,
      name: LONG_NAME_COMPONENT,
      isLeaf: true,
      file: ALL_FILES[11],
    },
  ],
  'demo-root/src/hooks': [
    {
      key: 'demo-root/src/hooks/useFileTreeLazyLoad.ts',
      name: 'useFileTreeLazyLoad.ts',
      isLeaf: true,
      file: ALL_FILES[7],
    },
  ],
  'demo-root/src/styles': [
    {
      key: 'demo-root/src/styles/variables.css',
      name: 'variables.css',
      isLeaf: true,
      file: ALL_FILES[8],
    },
  ],
  'demo-root/docs': [
    {
      key: 'demo-root/docs/getting-started.md',
      name: 'getting-started.md',
      isLeaf: true,
      file: ALL_FILES[9],
    },
    {
      key: `demo-root/docs/${LONG_NAME_DOCS}`,
      name: LONG_NAME_DOCS,
      isLeaf: true,
      file: ALL_FILES[10],
    },
  ],
  'demo-root/assets': [
    {
      key: 'demo-root/assets/logo.png',
      name: 'logo.png',
      isLeaf: true,
      file: ALL_FILES[12],
    },
    {
      key: `demo-root/assets/${LONG_NAME_ASSET}`,
      name: LONG_NAME_ASSET,
      isLeaf: true,
      file: ALL_FILES[13],
    },
  ],
  'demo-root/.github': [
    { key: 'demo-root/.github/workflows', name: 'workflows', isLeaf: false },
  ],
  'demo-root/.github/workflows': [
    {
      key: 'demo-root/.github/workflows/ci.yml',
      name: 'ci.yml',
      isLeaf: true,
      file: ALL_FILES[14],
    },
  ],
};

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
            开启工具栏上的分段切换；下方按钮演示<strong>受控</strong>的{' '}
            <Typography.Text code>view</Typography.Text> /{' '}
            <Typography.Text code>onViewChange</Typography.Text>，与面板内
            Segmented 同步。列表含多级目录、<strong>200 字符文件名</strong>
            与超长文件夹名，便于验证单行省略与操作区叠层
          </Typography.Paragraph>

          <Alert
            type="info"
            showIcon
            message={panelView === 'list' ? '平铺模式' : '文件树模式'}
            description={
              panelView === 'list'
                ? '列表按文件名过滤当前全部 16 个文件条目（含 200 字符文件名与 4 个其它超长名）'
                : '树内搜索仅匹配已展开目录下已加载的文件名；展开 workspace 可见 200 字符文件夹/文件；再展开 src / docs / assets 浏览更多叶子'
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
