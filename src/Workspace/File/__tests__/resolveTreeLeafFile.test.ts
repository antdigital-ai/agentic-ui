import { describe, expect, it } from 'vitest';
import { resolveTreeLeafFile } from '../resolveTreeLeafFile';
import type { FileTreeNode } from '../../types';

describe('resolveTreeLeafFile', () => {
  it('目录节点应返回 null', () => {
    const folder: FileTreeNode = {
      key: 'dir',
      name: 'src',
      isLeaf: false,
      children: [],
    };
    expect(resolveTreeLeafFile(folder)).toBeNull();
  });

  it('应合并 file 与节点顶层的 url 等字段', () => {
    const node = {
      key: 'leaf-1',
      name: 'report.pdf',
      isLeaf: true,
      url: 'https://example.com/report.pdf',
      type: 'pdf',
      file: {
        id: 'nested-id',
        name: 'ignored-name.pdf',
      },
    } as FileTreeNode & { url: string; type: string };

    const file = resolveTreeLeafFile(node);
    expect(file).toEqual(
      expect.objectContaining({
        id: 'nested-id',
        name: 'ignored-name.pdf',
        url: 'https://example.com/report.pdf',
        type: 'pdf',
      }),
    );
  });

  it('无 file 时应由 name 与 key 合成 FileNode', () => {
    const node: FileTreeNode = {
      key: 'leaf-2',
      name: 'orphan.md',
      isLeaf: true,
    };
    const file = resolveTreeLeafFile(node);
    expect(file).toEqual(
      expect.objectContaining({
        id: 'leaf-2',
        name: 'orphan.md',
      }),
    );
  });

  it('有 children 且未标 isLeaf 时应视为目录', () => {
    const node: FileTreeNode = {
      key: 'parent',
      name: 'parent',
      children: [{ key: 'c', name: 'child.md', isLeaf: true }],
    };
    expect(resolveTreeLeafFile(node)).toBeNull();
  });
});
