import { Workspace } from '@ant-design/agentic-ui';
import {
  FileNode,
  GroupNode,
} from '@ant-design/agentic-ui/Workspace/types';
import { Segmented } from 'antd';
import React, { useMemo, useState } from 'react';

const FILE_TYPES: Array<{
  ext: string;
  type: FileNode['type'];
  size: string;
}> = [
  { ext: 'py', type: 'python', size: '12KB' },
  { ext: 'ts', type: 'typescript', size: '8KB' },
  { ext: 'tsx', type: 'react', size: '15KB' },
  { ext: 'js', type: 'javascript', size: '6KB' },
  { ext: 'go', type: 'go', size: '9KB' },
  { ext: 'rs', type: 'rust', size: '11KB' },
  { ext: 'java', type: 'java', size: '18KB' },
  { ext: 'md', type: 'markdown', size: '4KB' },
  { ext: 'json', type: 'config', size: '2KB' },
  { ext: 'yaml', type: 'config', size: '1KB' },
  { ext: 'sh', type: 'shell', size: '3KB' },
  { ext: 'sql', type: 'sql', size: '7KB' },
  { ext: 'txt', type: 'plainText', size: '512B' },
  { ext: 'pdf', type: 'pdf', size: '1.2MB' },
  { ext: 'png', type: 'image', size: '256KB' },
];

const MODULE_NAMES = [
  'auth',
  'user',
  'order',
  'api',
  'core',
  'utils',
  'config',
];

/** 生成 n 个文件节点 */
const generateFiles = (count: number, prefix = ''): FileNode[] =>
  Array.from({ length: count }, (_, i) => {
    const ft = FILE_TYPES[i % FILE_TYPES.length];
    const mod = MODULE_NAMES[i % MODULE_NAMES.length];
    const suffix = Math.floor(i / FILE_TYPES.length) || '';
    return {
      id: `${prefix}-file-${i}`,
      name: `${mod}${suffix ? `-${suffix}` : ''}.${ft.ext}`,
      type: ft.type,
      size: ft.size,
      lastModified: new Date(
        Date.now() - (count - i) * 3_600_000,
      ).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  });

const FILES_PER_GROUP = 30;

/** 分组模式：4 组 × 30 个文件（共 120） */
const GROUP_NODES: GroupNode[] = [
  {
    id: 'g1',
    name: '后端服务',
    type: 'python',
    children: generateFiles(FILES_PER_GROUP, 'backend'),
  },
  {
    id: 'g2',
    name: '前端应用',
    type: 'react',
    children: generateFiles(FILES_PER_GROUP, 'frontend'),
  },
  {
    id: 'g3',
    name: '基础设施',
    type: 'shell',
    children: generateFiles(FILES_PER_GROUP, 'infra'),
  },
  {
    id: 'g4',
    name: '文档 & 配置',
    type: 'markdown',
    children: generateFiles(FILES_PER_GROUP, 'docs'),
  },
];

const TOTAL_FILE_COUNT = FILES_PER_GROUP * GROUP_NODES.length;

/** 扁平模式：与分组总数量一致 */
const FLAT_NODES: FileNode[] = generateFiles(TOTAL_FILE_COUNT, 'flat');

type Mode = 'grouped' | 'flat';

const WorkspaceFileLargeDemo: React.FC = () => {
  const [mode, setMode] = useState<Mode>('grouped');

  const nodes = useMemo<(FileNode | GroupNode)[]>(
    () => (mode === 'grouped' ? GROUP_NODES : FLAT_NODES),
    [mode],
  );

  return (
    <div style={{ padding: '12px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <span style={{ color: '#666', fontSize: 13 }}>
          共 <strong>{TOTAL_FILE_COUNT}</strong> 个文件 · 每组/列表首次展示 50
          条，点击「查看更多」每次追加 100 条
        </span>
        <Segmented
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          options={[
            { label: '分组视图', value: 'grouped' },
            { label: '扁平视图', value: 'flat' },
          ]}
        />
      </div>

      <div style={{ height: 560 }}>
        <Workspace title="大数据量文件演示">
          <Workspace.File
            tab={{ count: TOTAL_FILE_COUNT }}
            nodes={nodes}
            onDownload={(file) => console.log('下载:', file.name)}
            onGroupDownload={(files, type) =>
              console.log(`批量下载 ${files.length} 个 ${type} 文件`)
            }
            onFileClick={(file) => console.log('点击:', file.name)}
          />
        </Workspace>
      </div>
    </div>
  );
};

export default WorkspaceFileLargeDemo;
