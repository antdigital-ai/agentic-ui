import { describe, expect, it } from 'vitest';
import type { FileNode, GroupNode } from '../../types';
import { buildFileNodeRelativePathIndex } from '../buildFileNodeRelativePathIndex';

describe('buildFileNodeRelativePathIndex', () => {
  it('应按工作区相对路径索引平铺与分组文件', () => {
    const sourceFile: FileNode = {
      id: 'workspace:src/index.ts',
      name: 'index.ts',
      canPreview: true,
    };
    const readmeFile: FileNode = {
      id: 'file:README.md',
      name: 'README.md',
      canDownload: true,
    };
    const plainFile: FileNode = {
      id: 'CHANGELOG.md',
      name: 'CHANGELOG.md',
    };
    const nodes: (FileNode | GroupNode)[] = [
      {
        children: [sourceFile],
        name: 'Code',
        type: 'typescript',
      },
      readmeFile,
      plainFile,
    ];

    const index = buildFileNodeRelativePathIndex(nodes);

    expect(index.get('src/index.ts')).toBe(sourceFile);
    expect(index.get('README.md')).toBe(readmeFile);
    expect(index.get('CHANGELOG.md')).toBe(plainFile);
  });

  it('应跳过无法解析相对路径的文件节点', () => {
    const invalidNodes: FileNode[] = [
      {
        id: '',
        name: 'empty.md',
      },
      {
        id: 'workspace:',
        name: 'empty-workspace-prefix.md',
      },
      {
        id: 'file:',
        name: 'empty-file-prefix.md',
      },
      {
        id: 'dir:src',
        name: 'directory-key.md',
      },
      {
        name: 'missing-id.md',
      },
    ];

    expect(buildFileNodeRelativePathIndex(invalidNodes).size).toBe(0);
  });
});
