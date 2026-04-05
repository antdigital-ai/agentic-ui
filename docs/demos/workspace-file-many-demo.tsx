import { Workspace } from '@ant-design/agentic-ui';
import type { FileNode, GroupNode } from '@ant-design/agentic-ui/Workspace/types';
import React, { useMemo } from 'react';

/** 足以观察长列表性能，体量适中 */
const MANY_FILE_COUNT = 120;

function buildManyFileNodes(): (FileNode | GroupNode)[] {
  const children: FileNode[] = [];
  for (let i = 0; i < MANY_FILE_COUNT; i += 1) {
    const id = `stress-file-${i}`;
    children.push({
      id,
      name: `module-${String(i).padStart(4, '0')}.ts`,
      type: 'typescript',
      size: `${(i % 50) + 1}KB`,
      lastModified: '2025-08-01 10:00:00',
      content: `// stress demo file ${i}\nexport const value = ${i};\n`,
    });
  }
  return [
    {
      name: `大量文件（${MANY_FILE_COUNT}）`,
      type: 'typescript',
      collapsed: false,
      children,
    },
  ];
}

/**
 * 用于复现 / 验证「文件列表节点过多时」工作区性能与交互（滚动、展开等）。
 * 数据在首屏用 useMemo 构建一次，避免重复分配。
 */
const WorkspaceFileManyDemo: React.FC = () => {
  const nodes = useMemo(() => buildManyFileNodes(), []);

  return (
    <div style={{ padding: '12px' }}>
      <p style={{ marginBottom: 12, color: 'var(--ant-color-text-secondary)' }}>
        单分组内共 {MANY_FILE_COUNT}{' '}
        个文件节点，用于观察列表渲染与滚动性能。若页面卡顿，可考虑业务侧虚拟列表或分页。
      </p>
      <div style={{ maxHeight: 560, height: 560 }}>
        <Workspace title="文件管理（大量文件）">
          <Workspace.File
            tab={{
              count: MANY_FILE_COUNT,
            }}
            nodes={nodes}
            onDownload={(file) => {
              console.log('download', file.name);
            }}
            onGroupDownload={(files) => {
              console.log('group download', files.length);
            }}
          />
        </Workspace>
      </div>
    </div>
  );
};

export default WorkspaceFileManyDemo;
