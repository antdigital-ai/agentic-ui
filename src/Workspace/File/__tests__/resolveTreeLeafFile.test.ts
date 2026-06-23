import { describe, expect, it } from 'vitest';
import type { FileTreeNode } from '../../types';
import {
  hasTreeLeafFileBinding,
  resolveTreeLeafFile,
} from '../resolveTreeLeafFile';

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

  it('file 为 null 时应返回 null', () => {
    const node = {
      key: 'leaf-null',
      name: 'missing.md',
      isLeaf: true,
      file: null,
    } as FileTreeNode;

    expect(resolveTreeLeafFile(node)).toBeNull();
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

  it('应按相对路径对齐平铺 nodes（workspace: 与 file:）', () => {
    const flatNode = {
      id: 'workspace:AGENTS.md',
      name: 'AGENTS.md',
      canPreview: true,
      canDownload: true,
    };

    const index = new Map([['AGENTS.md', flatNode]]);

    const treeLeaf: FileTreeNode = {
      key: 'file:AGENTS.md',
      name: 'AGENTS.md',
      isLeaf: true,
    };

    expect(
      resolveTreeLeafFile(treeLeaf, { fileNodeByRelativePath: index }),
    ).toEqual(
      expect.objectContaining({
        id: 'workspace:AGENTS.md',
        name: 'AGENTS.md',
        canPreview: true,
        canDownload: true,
      }),
    );
  });

  it('无索引时仍使用树 key 作为 id', () => {
    const treeLeaf: FileTreeNode = {
      key: 'file:skills/data-query/SKILL.md',
      name: 'SKILL.md',
      isLeaf: true,
    };

    expect(resolveTreeLeafFile(treeLeaf)).toEqual(
      expect.objectContaining({
        id: 'file:skills/data-query/SKILL.md',
        name: 'SKILL.md',
      }),
    );
  });

  it('应仅在允许合成时将无 file 元数据叶子视为可绑定文件', () => {
    const treeLeaf: FileTreeNode = {
      key: 'file:README.md',
      name: 'README.md',
      isLeaf: true,
    };

    expect(hasTreeLeafFileBinding(treeLeaf)).toBe(false);
    expect(hasTreeLeafFileBinding(treeLeaf, { allowSyntheticLeaf: true })).toBe(
      true,
    );
  });

  it('file 为 null 时即使允许合成也不绑定文件', () => {
    const treeLeaf: FileTreeNode = {
      key: 'file:missing.md',
      name: 'missing.md',
      isLeaf: true,
      file: null,
    } as any;

    expect(hasTreeLeafFileBinding(treeLeaf, { allowSyntheticLeaf: true })).toBe(
      false,
    );
  });
});
