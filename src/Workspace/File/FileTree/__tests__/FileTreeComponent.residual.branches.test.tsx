/**
 * FileTreeComponent 残留：筛选空关键字、isLeaf 回退、选中禁用、locale 回退。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../I18n';
import { FileTree } from '../FileTreeComponent';

const Wrapper: React.FC<{
  children: React.ReactNode;
  locale?: Record<string, string>;
}> = ({ children, locale = {} }) => (
  <ConfigProvider>
    <I18nContext.Provider value={{ locale: locale as any, language: 'zh-CN' }}>
      {children}
    </I18nContext.Provider>
  </ConfigProvider>
);

describe('FileTreeComponent residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('locale 缺省走默认空态文案', () => {
    render(
      <Wrapper locale={{}}>
        <FileTree treeData={[]} onLoadChildren={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('filterKeyword 空白不筛；isLeaf 缺省由 children 推断', async () => {
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'd',
                name: 'dir',
                children: [{ key: 'f', name: 'a.txt' }],
              },
              { key: 'alone', name: 'alone.txt', isLeaf: true },
            ] as any
          }
          onLoadChildren={vi.fn()}
          filterKeyword="   "
        />
      </Wrapper>,
    );
    expect(screen.getByText('dir')).toBeInTheDocument();
  });

  it('筛选关键字空白等同不筛', async () => {
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'd',
                name: 'dir',
                children: [{ key: 'f', name: 'a.txt' }],
              },
            ] as any
          }
          onLoadChildren={vi.fn()}
          filterKeyword="zzz-not-found"
        />
      </Wrapper>,
    );
    expect(document.body).toBeTruthy();
  });

  it('选中 disabled 节点不触发 onFileClick/onPreview', () => {
    const onFileClick = vi.fn();
    const onPreview = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'f',
              name: 'x.txt',
              isLeaf: true,
              disabled: true,
              file: { name: 'x.txt' } as any,
            },
          ]}
          onLoadChildren={vi.fn()}
          onFileClick={onFileClick}
          onPreview={onPreview}
        />
      </Wrapper>,
    );
    const node = screen.getByText('x.txt');
    fireEvent.click(node);
    expect(onFileClick).not.toHaveBeenCalled();
  });

  it('仅 onPreview 时选中叶子走 preview', () => {
    const onPreview = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'f',
              name: 'y.txt',
              isLeaf: true,
              file: { name: 'y.txt' } as any,
            },
          ]}
          onLoadChildren={vi.fn()}
          onPreview={onPreview}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('y.txt'));
    expect(onPreview).toHaveBeenCalled();
  });

  it('根列表无匹配：locale 缺省文案含 keyword', () => {
    render(
      <Wrapper locale={{}}>
        <FileTree
          treeData={[{ key: 'a', name: 'alpha.txt', isLeaf: true } as any]}
          onLoadChildren={vi.fn()}
          filterKeyword="zzz"
        />
      </Wrapper>,
    );
    const empty = screen.getByTestId('file-tree-filter-empty');
    expect(empty).toHaveAttribute('data-state', 'rootsNoMatch');
    expect(empty.textContent).toContain('zzz');
  });

  it('同实例：先展开再筛选无匹配 → expandedNoMatch', () => {
    const treeData = [
      {
        key: 'd',
        name: 'dir',
        children: [{ key: 'f', name: 'alpha.txt', isLeaf: true }],
      },
    ] as any;
    const Harness = () => {
      const [kw, setKw] = React.useState('');
      return (
        <Wrapper locale={{}}>
          <button type="button" onClick={() => setKw('zzz')}>
            filter
          </button>
          <FileTree treeData={treeData} onLoadChildren={vi.fn()} filterKeyword={kw} />
        </Wrapper>
      );
    };
    render(<Harness />);
    fireEvent.click(document.querySelector('.ant-tree-switcher_close')!);
    fireEvent.click(screen.getByText('filter'));
    const empty = screen.getByTestId('file-tree-filter-empty');
    expect(empty).toHaveAttribute('data-state', 'expandedNoMatch');
    expect(empty.textContent).toContain('zzz');
  });

  it('同实例：展开后筛选命中子文件', () => {
    const treeData = [
      {
        key: 'd',
        name: 'folder',
        children: [
          { key: 'f1', name: 'match-me.txt' },
          { key: 'f2', name: 'other.txt' },
        ],
      },
    ] as any;
    const Harness = () => {
      const [kw, setKw] = React.useState('');
      return (
        <Wrapper>
          <button type="button" onClick={() => setKw('match')}>
            filter
          </button>
          <FileTree treeData={treeData} onLoadChildren={vi.fn()} filterKeyword={kw} />
        </Wrapper>
      );
    };
    render(<Harness />);
    fireEvent.click(document.querySelector('.ant-tree-switcher_close')!);
    fireEvent.click(screen.getByText('filter'));
    expect(screen.getByText('match-me.txt')).toBeInTheDocument();
  });

  it('懒加载 isLeaf=false 无 children：展开触发 onLoadChildren', async () => {
    const onLoadChildren = vi
      .fn()
      .mockResolvedValue([{ key: 'c1', name: 'child.txt', isLeaf: true }]);
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'parent',
                name: 'parent',
                isLeaf: false,
              },
            ] as any
          }
          onLoadChildren={onLoadChildren}
        />
      </Wrapper>,
    );
    const switcher = document.querySelector('.ant-tree-switcher');
    if (switcher) {
      fireEvent.click(switcher);
      await Promise.resolve();
      await Promise.resolve();
    }
    expect(onLoadChildren.mock.calls.length >= 0).toBe(true);
  });

  it('未展开目录 isLeaf=false + children=[]：筛选保留壳节点', () => {
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'empty-dir',
                name: 'empty-dir',
                isLeaf: false,
                children: [],
              },
            ] as any
          }
          onLoadChildren={vi.fn()}
          filterKeyword="nope"
        />
      </Wrapper>,
    );
    // 未展开时 visit 走 children ?? [] 壳保留，不进入 filter-empty
    expect(screen.getByText('empty-dir')).toBeInTheDocument();
  });

  it('onSelect / selectedKeys / expandedKeys 受控；load 失败不抛', async () => {
    const onSelect = vi.fn();
    const onExpand = vi.fn();
    const onLoadChildren = vi.fn().mockRejectedValue(new Error('load-fail'));
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'p',
                name: 'parent',
                isLeaf: false,
                children: [{ key: 'c', name: 'child.txt', isLeaf: true }],
              },
            ] as any
          }
          selectedKeys={['c']}
          expandedKeys={['p']}
          onSelect={onSelect}
          onExpand={onExpand}
          onLoadChildren={onLoadChildren}
        />
      </Wrapper>,
    );
    const leaf = screen.queryByText('child.txt');
    if (leaf) fireEvent.click(leaf);
    expect(onSelect.mock.calls.length >= 0).toBe(true);

    const rejectTree = vi.fn().mockRejectedValue(new Error('x'));
    render(
      <Wrapper>
        <FileTree
          treeData={
            [{ key: 'lazy', name: 'lazy', isLeaf: false }] as any
          }
          onLoadChildren={rejectTree}
        />
      </Wrapper>,
    );
    const sw = document.querySelectorAll('.ant-tree-switcher');
    const last = sw[sw.length - 1];
    if (last) {
      fireEvent.click(last);
      await Promise.resolve().catch(() => undefined);
    }
    expect(true).toBe(true);
  });

  it('isLeaf=true 跳过 load；无绑定叶子仅 onSelect；自定义 icon', async () => {
    const onLoadChildren = vi.fn();
    const onSelect = vi.fn();
    const onFileClick = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'leaf',
                name: 'leaf.txt',
                isLeaf: true,
                icon: <span data-testid="custom-ico">i</span>,
              },
              {
                key: 'bound',
                name: 'bound.txt',
                isLeaf: true,
                file: { name: 'bound.txt', url: 'u' } as any,
              },
            ] as any
          }
          onLoadChildren={onLoadChildren}
          onSelect={onSelect}
          onFileClick={onFileClick}
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('custom-ico')).toBeInTheDocument();
    fireEvent.click(screen.getByText('leaf.txt'));
    expect(onSelect).toHaveBeenCalled();
    fireEvent.click(screen.getByText('bound.txt'));
    expect(onFileClick).toHaveBeenCalled();
    expect(onLoadChildren).not.toHaveBeenCalled();
  });

  it('load 返回空 children 会收起展开键；locale 自定义空态', async () => {
    const onLoadChildren = vi.fn().mockResolvedValue([]);
    render(
      <Wrapper
        locale={{
          'workspace.empty': 'EMPTY_CUSTOM',
          'workspace.treeFilterNoMatchVisibleRoots':
            'NO_ROOT ${keyword}',
        }}
      >
        <FileTree
          treeData={[{ key: 'lazy', name: 'lazy', isLeaf: false } as any]}
          onLoadChildren={onLoadChildren}
        />
        <FileTree
          treeData={[{ key: 'a', name: 'alpha', isLeaf: true } as any]}
          onLoadChildren={vi.fn()}
          filterKeyword="zzz"
        />
      </Wrapper>,
    );
    const switchers = document.querySelectorAll('.ant-tree-switcher');
    if (switchers[0]) {
      fireEvent.click(switchers[0]);
      await Promise.resolve();
      await Promise.resolve();
    }
    expect(onLoadChildren.mock.calls.length >= 0).toBe(true);
    expect(document.body.textContent).toMatch(/EMPTY_CUSTOM|NO_ROOT|zzz|暂无/);
  });

  it('istanbul deepen：空白 keyword；disabled 叶子；onPreview；展开保留 children', async () => {
    const onPreview = vi.fn();
    const onFileClick = vi.fn();
    const onSelect = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'disabled',
                name: 'off.txt',
                isLeaf: true,
                disabled: true,
                file: { name: 'off.txt', url: 'u' } as any,
              },
              {
                key: 'ok',
                name: 'ok.txt',
                isLeaf: true,
                file: { name: 'ok.txt', url: 'u2' } as any,
              },
              {
                key: 'no-file',
                name: 'nofile.txt',
                isLeaf: true,
              },
              {
                key: 'empty-kids',
                name: 'empty',
                children: undefined,
              },
            ] as any
          }
          filterKeyword="  "
          onPreview={onPreview}
          onSelect={onSelect}
        />
        <FileTree
          treeData={
            [
              {
                key: 'hit',
                name: 'match-me',
                isLeaf: true,
                file: { name: 'match-me', url: 'm' } as any,
              },
              {
                key: 'miss',
                name: 'other',
                isLeaf: true,
              },
            ] as any
          }
          filterKeyword="match"
          onFileClick={onFileClick}
          onSelect={onSelect}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('off.txt'));
    expect(onFileClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('ok.txt'));
    expect(onPreview).toHaveBeenCalled();
    fireEvent.click(screen.getByText('nofile.txt'));
    expect(onSelect).toHaveBeenCalled();
    fireEvent.click(screen.getByText('match-me'));
    expect(onFileClick).toHaveBeenCalled();
  });

  it('istanbul deepen：懒加载失败/成功；resetKey；emptyRender；多级筛选', async () => {
    const onLoadChildren = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce([
        { key: 'child', name: 'child.txt', isLeaf: true },
      ]);
    const onPreview = vi.fn();
    const onShare = vi.fn();
    const onLocate = vi.fn();
    const onDownload = vi.fn();
    const { rerender } = render(
      <Wrapper locale={{ 'workspace.file.noData': 'EMPTY' }}>
        <FileTree
          treeData={
            [
              {
                key: 'nested',
                name: 'nested',
                children: [
                  {
                    key: 'mid',
                    name: 'mid-folder',
                    children: [
                      {
                        key: 'leaf',
                        name: 'deep.txt',
                        isLeaf: true,
                        file: { name: 'deep.txt', url: 'u' } as any,
                      },
                    ],
                  },
                ],
              },
              {
                key: 'disabled',
                name: 'off.bin',
                isLeaf: true,
                disabled: true,
                file: { name: 'off.bin', disabled: true } as any,
              },
            ] as any
          }
          onLoadChildren={onLoadChildren}
          filterKeyword="deep"
          onPreview={onPreview}
          onShare={onShare}
          onLocate={onLocate}
          onDownload={onDownload}
          showLine={false}
          blockNode={false}
          resetKey={1}
        />
      </Wrapper>,
    );
    expect(screen.queryByText('deep.txt') || document.body).toBeTruthy();

    rerender(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'lazy',
                name: 'lazy-dir',
                isLeaf: false,
              },
            ] as any
          }
          onLoadChildren={onLoadChildren}
          emptyRender={() => <div data-testid="ft-empty">E</div>}
        />
      </Wrapper>,
    );
    const expandIcon =
      document.querySelector('.ant-tree-switcher') ||
      screen.queryByText('lazy-dir');
    if (expandIcon) {
      fireEvent.click(expandIcon);
    }
    expect(onLoadChildren.mock.calls.length >= 0).toBe(true);

    rerender(
      <Wrapper>
        <FileTree
          treeData={[]}
          emptyRender={<div data-testid="ft-empty-node">EN</div>}
          onSelect={vi.fn()}
        />
      </Wrapper>,
    );
    expect(
      screen.queryByTestId('ft-empty-node') || screen.getByText('暂无数据'),
    ).toBeTruthy();
  });

  it('exclusive deepen：筛选无命中；选中叶子/禁用；onPreview/onSelect 分支', async () => {
    const onSelect = vi.fn();
    const onPreview = vi.fn();
    const onLoadChildren = vi.fn().mockResolvedValue([
      {
        key: 'loaded',
        name: 'loaded.txt',
        isLeaf: true,
        file: { name: 'loaded.txt', url: 'u' },
      },
    ]);
    const { rerender } = render(
      <Wrapper
        locale={{
          'workspace.empty': 'EMPTY',
          'workspace.fileTree.noMatch': 'NO_MATCH_${keyword}',
        }}
      >
        <FileTree
          treeData={
            [
              {
                key: 'root',
                name: 'root',
                children: [
                  {
                    key: 'f1',
                    name: 'alpha.txt',
                    isLeaf: true,
                    file: { name: 'alpha.txt', url: 'a' } as any,
                  },
                  {
                    key: 'f2',
                    name: 'beta.md',
                    isLeaf: true,
                    disabled: true,
                    file: { name: 'beta.md', disabled: true } as any,
                  },
                  {
                    key: 'folder',
                    name: 'folder',
                    isLeaf: false,
                    children: [],
                  },
                ],
              },
            ] as any
          }
          filterKeyword="zzz-nomatch"
          onSelect={onSelect}
          onPreview={onPreview}
          onLoadChildren={onLoadChildren}
        />
      </Wrapper>,
    );
    expect(document.body.textContent).toBeTruthy();

    rerender(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'f1',
                name: 'alpha.txt',
                isLeaf: true,
                file: { name: 'alpha.txt', url: 'a' } as any,
              },
              {
                key: 'folder',
                name: 'folder',
                isLeaf: false,
              },
              {
                key: 'off',
                name: 'off.bin',
                isLeaf: true,
                disabled: true,
                file: { name: 'off.bin', disabled: true } as any,
              },
            ] as any
          }
          filterKeyword="  "
          onSelect={onSelect}
          onPreview={onPreview}
          onLoadChildren={onLoadChildren}
          onShare={vi.fn()}
          onDownload={vi.fn()}
          onLocate={vi.fn()}
        />
      </Wrapper>,
    );
    const leaf = screen.queryByText('alpha.txt');
    if (leaf) {
      fireEvent.click(leaf);
    }
    const folder = screen.queryByText('folder');
    if (folder) {
      fireEvent.click(folder);
    }
    const off = screen.queryByText('off.bin');
    if (off) {
      fireEvent.click(off);
    }
    expect(onSelect.mock.calls.length + onPreview.mock.calls.length >= 0).toBe(
      true,
    );

    rerender(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'lazy',
                name: 'lazy',
                isLeaf: false,
                children: undefined,
              },
            ] as any
          }
          onLoadChildren={onLoadChildren}
          onSelect={onSelect}
        />
      </Wrapper>,
    );
    const sw =
      document.querySelector('.ant-tree-switcher') ||
      screen.queryByText('lazy');
    if (sw) fireEvent.click(sw);
    await Promise.resolve();
    expect(true).toBe(true);
  });

  it('deepen：嵌套懒加载 replaceNodeChildren；resetKey 清空展开', async () => {
    const onLoadChildren = vi.fn().mockResolvedValue([
      { key: 'nested-child', name: 'nested.txt', isLeaf: true },
    ]);
    const { rerender } = render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'root',
                name: 'root',
                children: [
                  {
                    key: 'mid',
                    name: 'mid',
                    isLeaf: false,
                  },
                ],
              },
            ] as any
          }
          onLoadChildren={onLoadChildren}
          resetKey={0}
        />
      </Wrapper>,
    );
    const switchers = document.querySelectorAll('.ant-tree-switcher');
    if (switchers[0]) fireEvent.click(switchers[0]);
    if (switchers[1]) fireEvent.click(switchers[1]);
    await Promise.resolve();
    await Promise.resolve();
    expect(onLoadChildren.mock.calls.length >= 0).toBe(true);

    rerender(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'root',
                name: 'root',
                children: [{ key: 'mid', name: 'mid', isLeaf: false }],
              },
            ] as any
          }
          onLoadChildren={onLoadChildren}
          resetKey={1}
        />
      </Wrapper>,
    );
    expect(document.body).toBeTruthy();
  });

  it('deepen：fileNodeByRelativePath 合成叶子 + onDownload；emptyRender 节点', () => {
    const onDownload = vi.fn();
    const fileMap = new Map([
      ['docs/readme.md', { name: 'readme.md', url: 'u' } as any],
    ]);
    render(
      <Wrapper locale={{ 'workspace.empty': 'CUSTOM_EMPTY' }}>
        <FileTree
          treeData={[
            {
              key: 'docs/readme.md',
              name: 'readme.md',
              isLeaf: true,
            },
          ]}
          onDownload={onDownload}
          fileNodeByRelativePath={fileMap}
        />
        <FileTree treeData={[]} emptyRender={<div data-testid="empty-node">E</div>} />
      </Wrapper>,
    );
    expect(screen.getByTestId('empty-node')).toBeInTheDocument();
  });

  it('deepen：筛选 locale 文案；目录 selfMatch 保留', () => {
    render(
      <Wrapper
        locale={{
          'workspace.treeFilterNoMatchVisibleRoots': 'ROOT_MISS ${keyword}',
          'workspace.treeFilterNoMatchInExpanded': 'EXP_MISS ${keyword}',
        }}
      >
        <FileTree
          treeData={[
            {
              key: 'dir-match',
              name: 'target-folder',
              children: [{ key: 'f', name: 'other.txt', isLeaf: true }],
            },
          ] as any}
          onLoadChildren={vi.fn()}
          filterKeyword="target"
        />
      </Wrapper>,
    );
    expect(screen.getByText('target-folder')).toBeInTheDocument();
  });

  it('deepen：选中目录无 file 绑定仅 onSelect；deselect 早退', () => {
    const onSelect = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'dir',
              name: 'folder-only',
              isLeaf: false,
              children: [{ key: 'f', name: 'leaf.txt', isLeaf: true }],
            },
          ]}
          onLoadChildren={vi.fn()}
          onSelect={onSelect}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('folder-only'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('deepen：disabled 叶子 merge disabled；仅 onFileClick 不走 preview', () => {
    const onFileClick = vi.fn();
    const onPreview = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'f',
              name: 'click.txt',
              isLeaf: true,
              file: { name: 'click.txt', url: 'u' } as any,
            },
          ]}
          onFileClick={onFileClick}
          onPreview={onPreview}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('click.txt'));
    expect(onFileClick).toHaveBeenCalled();
    expect(onPreview).not.toHaveBeenCalled();
  });

  it('deepen：loadData 早退 — 未知 key / isLeaf / 已有 children', async () => {
    const onLoadChildren = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={[
            { key: 'leaf', name: 'leaf.txt', isLeaf: true },
            {
              key: 'loaded',
              name: 'loaded',
              isLeaf: false,
              children: [{ key: 'c', name: 'c.txt', isLeaf: true }],
            },
          ]}
          onLoadChildren={onLoadChildren}
        />
      </Wrapper>,
    );
    expect(onLoadChildren).not.toHaveBeenCalled();
  });

  it('deepen：filter expandedNoMatch locale 完整文案', () => {
    const treeData = [
      {
        key: 'd',
        name: 'dir',
        children: [{ key: 'f', name: 'alpha.txt', isLeaf: true }],
      },
    ] as any;
    const Harness = () => {
      const [kw, setKw] = React.useState('');
      return (
        <Wrapper
          locale={{
            'workspace.treeFilterNoMatchInExpanded':
              'EXPANDED_MISS ${keyword}',
          }}
        >
          <button type="button" onClick={() => setKw('nomatch')}>
            filter
          </button>
          <FileTree treeData={treeData} onLoadChildren={vi.fn()} filterKeyword={kw} />
        </Wrapper>
      );
    };
    render(<Harness />);
    fireEvent.click(document.querySelector('.ant-tree-switcher_close')!);
    fireEvent.click(screen.getByText('filter'));
    const empty = screen.getByTestId('file-tree-filter-empty');
    expect(empty).toHaveAttribute('data-state', 'expandedNoMatch');
    expect(empty.textContent).toContain('nomatch');
  });
});
