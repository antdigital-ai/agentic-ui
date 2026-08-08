/**
 * resolveTreeLeafFile / hasTreeLeafFileBinding mid-tail 分支。
 */
import { describe, expect, it } from 'vitest';
import type { FileTreeNode } from '../../types';
import {
  hasTreeLeafFileBinding,
  resolveTreeLeafFile,
} from '../resolveTreeLeafFile';

describe('resolveTreeLeafFile midtail branches', () => {
  it('hasTreeLeafFileBinding：file=null / 对象 / 顶层字段 / synthetic', () => {
    expect(
      hasTreeLeafFileBinding({ key: 'a', name: 'a', file: null } as FileTreeNode),
    ).toBe(false);
    expect(
      hasTreeLeafFileBinding({
        key: 'a',
        name: 'a',
        file: { id: '1', name: 'a.txt' },
      } as FileTreeNode),
    ).toBe(true);
    expect(
      hasTreeLeafFileBinding({
        key: 'a',
        name: 'a',
        url: 'https://x/a.txt',
      } as FileTreeNode),
    ).toBe(true);
    expect(
      hasTreeLeafFileBinding(
        { key: 'a', name: 'a' } as FileTreeNode,
        { allowSyntheticLeaf: true },
      ),
    ).toBe(true);
    expect(
      hasTreeLeafFileBinding({ key: 'a', name: 'a' } as FileTreeNode),
    ).toBe(false);
  });

  it('resolveTreeLeafFile：非叶子 / file=null / 无索引 / 索引命中与未命中', () => {
    expect(
      resolveTreeLeafFile({
        key: 'dir',
        name: 'dir',
        children: [{ key: 'c', name: 'c' }],
        isLeaf: false,
      } as FileTreeNode),
    ).toBeNull();

    expect(
      resolveTreeLeafFile({
        key: 'a',
        name: 'a',
        isLeaf: true,
        file: null,
      } as FileTreeNode),
    ).toBeNull();

    const leaf = resolveTreeLeafFile({
      key: 'leaf.txt',
      name: 'leaf.txt',
      isLeaf: true,
      url: 'https://x/leaf.txt',
    } as FileTreeNode);
    expect(leaf?.name).toBe('leaf.txt');
    expect(leaf?.url).toBe('https://x/leaf.txt');

    const index = new Map([
      ['docs/a.txt', { id: 'flat-1', name: 'flat-a.txt', url: 'https://flat' }],
    ]);
    const merged = resolveTreeLeafFile(
      {
        key: 'docs/a.txt',
        name: 'tree-name.txt',
        isLeaf: true,
        id: 'docs/a.txt',
      } as FileTreeNode,
      { fileNodeByRelativePath: index },
    );
    expect(merged?.id).toBe('flat-1');
    expect(merged?.name).toBe('tree-name.txt');

    const miss = resolveTreeLeafFile(
      {
        key: 'other.txt',
        name: 'other.txt',
        isLeaf: true,
      } as FileTreeNode,
      { fileNodeByRelativePath: index },
    );
    expect(miss?.name).toBe('other.txt');
  });

  it('resolveTreeLeafFile：空 Map 索引直接返回 base', () => {
    const node = {
      key: 'x',
      name: 'x.md',
      isLeaf: true,
      content: '# hi',
    } as FileTreeNode;
    const r = resolveTreeLeafFile(node, {
      fileNodeByRelativePath: new Map(),
    });
    expect(r?.name).toBe('x.md');
    expect(r?.content).toBe('# hi');
  });

  it('hasTreeLeafFileBinding：allowSyntheticLeaf 无顶层字段也可绑定', () => {
    expect(
      hasTreeLeafFileBinding(
        { key: 'k', name: 'n', isLeaf: true } as FileTreeNode,
        { allowSyntheticLeaf: true },
      ),
    ).toBe(true);
    expect(
      hasTreeLeafFileBinding({
        key: 'k',
        name: 'n',
        isLeaf: true,
        file: null,
      } as FileTreeNode),
    ).toBe(false);
  });
});
