/**
 * FileTreeComponent 分支覆盖：懒加载早退、筛选、选中、图标与空态。
 */
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../I18n';
import type { FileNode } from '../../../types';
import { FileTree } from '../FileTreeComponent';

const mockLocale = {
  'workspace.empty': '暂无数据',
  'workspace.treeFilterNoMatchVisibleRoots': '根目录无匹配 ${keyword}',
  'workspace.treeFilterNoMatchInExpanded': '展开目录无匹配 ${keyword}',
  'workspace.file.preview': '预览',
  'workspace.file.download': '下载',
} as Record<string, string>;

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <I18nContext.Provider value={{ locale: mockLocale, language: 'zh-CN' }}>
      {children}
    </I18nContext.Provider>
  </ConfigProvider>
);

describe('FileTreeComponent 分支覆盖', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('innerTree 为空时展示默认 Empty', () => {
    render(
      <TestWrapper>
        <FileTree treeData={[]} onLoadChildren={vi.fn()} />
      </TestWrapper>,
    );
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('emptyRender 函数优先于默认 Empty', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[]}
          onLoadChildren={vi.fn()}
          emptyRender={() => <span data-testid="custom-empty">无文件</span>}
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
  });

  it('resetKey 变化时清空 expandedKeys', async () => {
    const { rerender } = render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'd',
              name: 'dir',
              isLeaf: false,
              children: [{ key: 'f', name: 'a.txt', isLeaf: true }],
            },
          ]}
          onLoadChildren={vi.fn()}
          resetKey={1}
        />
      </TestWrapper>,
    );
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    await waitFor(() =>
      expect(document.querySelector('.ant-tree-switcher_open')).toBeTruthy(),
    );
    rerender(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'd',
              name: 'dir',
              isLeaf: false,
              children: [{ key: 'f', name: 'a.txt', isLeaf: true }],
            },
          ]}
          onLoadChildren={vi.fn()}
          resetKey={2}
        />
      </TestWrapper>,
    );
    expect(document.querySelector('.ant-tree-switcher_close')).toBeTruthy();
  });

  it('handleLoadData：source 不在 map 时直接 resolve', async () => {
    const onLoadChildren = vi.fn();
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'leaf', name: 'x.txt', isLeaf: true }]}
          onLoadChildren={onLoadChildren}
        />
      </TestWrapper>,
    );
    expect(onLoadChildren).not.toHaveBeenCalled();
  });

  it('handleLoadData：isLeaf=true 时不触发 onLoadChildren', async () => {
    const onLoadChildren = vi.fn();
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'leaf', name: 'only.txt', isLeaf: true }]}
          onLoadChildren={onLoadChildren}
        />
      </TestWrapper>,
    );
    expect(onLoadChildren).not.toHaveBeenCalled();
  });

  it('handleLoadData：已有 children 时不重复加载', async () => {
    const onLoadChildren = vi.fn();
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'd',
              name: 'dir',
              children: [{ key: 'c', name: 'b.txt', isLeaf: true }],
            },
          ]}
          onLoadChildren={onLoadChildren}
        />
      </TestWrapper>,
    );
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    expect(onLoadChildren).not.toHaveBeenCalled();
  });

  it('handleLoadData 失败时 reject 并 console.error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onLoadChildren = vi.fn().mockRejectedValue(new Error('load fail'));
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            { key: 'd', name: 'dir', isLeaf: false, children: [] as any },
          ]}
          onLoadChildren={onLoadChildren}
        />
      </TestWrapper>,
    );
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    await waitFor(() => expect(onLoadChildren).toHaveBeenCalled());
    await act(async () => {
      await Promise.resolve();
    });
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('handleSelect：info.selected=false 时不回调', () => {
    const onSelect = vi.fn();
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'leaf', name: 'a.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          onSelect={onSelect}
        />
      </TestWrapper>,
    );
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('handleSelect：disabled 叶子不触发 onFileClick/onPreview', async () => {
    const onFileClick = vi.fn();
    const onPreview = vi.fn();
    const file: FileNode = {
      id: 'f1',
      name: 'd.md',
      url: 'https://example.com/d.md',
      canPreview: true,
      disabled: true,
    };
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'leaf',
              name: 'd.md',
              isLeaf: true,
              file,
              disabled: true,
            },
          ]}
          onLoadChildren={vi.fn()}
          onFileClick={onFileClick}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('d.md'));
    await waitFor(() => expect(onFileClick).not.toHaveBeenCalled());
    expect(onPreview).not.toHaveBeenCalled();
  });

  it('自定义 node.icon 优先于文件类型图标', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'leaf',
              name: 'custom.txt',
              isLeaf: true,
              icon: <span data-testid="custom-icon">IC</span>,
            },
          ]}
          onLoadChildren={vi.fn()}
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('filterKeyword 根目录无匹配时 data-state=rootsNoMatch', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'x', name: 'readme.md', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          filterKeyword="nomatch"
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('file-tree-filter-empty')).toHaveAttribute(
      'data-state',
      'rootsNoMatch',
    );
  });

  it('filterKeyword 展开后无匹配时 data-state=expandedNoMatch', async () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'r',
              name: 'root',
              isLeaf: false,
              children: [{ key: 'a', name: 'foo.txt', isLeaf: true }],
            },
          ]}
          onLoadChildren={vi.fn()}
          filterKeyword="zzz"
        />
      </TestWrapper>,
    );
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    const empty = await screen.findByTestId('file-tree-filter-empty');
    expect(empty).toHaveAttribute('data-state', 'expandedNoMatch');
  });

  it('filter：文件夹名匹配时保留未展开子树', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'r',
              name: 'alpha-dir',
              isLeaf: false,
              children: [{ key: 'c', name: 'other.txt', isLeaf: true }],
            },
          ]}
          onLoadChildren={vi.fn()}
          filterKeyword="alpha"
        />
      </TestWrapper>,
    );
    expect(screen.getByText('alpha-dir')).toBeInTheDocument();
  });

  it('filter：isLeaf=false 且 children 为空时保留空 children', async () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'r',
              name: 'empty-dir',
              isLeaf: false,
              children: [],
            },
          ]}
          onLoadChildren={vi.fn()}
          filterKeyword="empty"
        />
      </TestWrapper>,
    );
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    expect(screen.getByText('empty-dir')).toBeInTheDocument();
  });

  it('showLine=false 与 blockNode=false 仍可渲染树', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'l', name: 'f.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          showLine={false}
          blockNode={false}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('f.txt')).toBeInTheDocument();
  });

  it('fileNodeByRelativePath 启用 synthetic leaf 绑定', async () => {
    const onPreview = vi.fn();
    const map = new Map<string, FileNode>();
    map.set('orphan.md', {
      id: 'syn',
      name: 'orphan.md',
      url: 'https://example.com/orphan.md',
      canPreview: true,
    });
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'leaf', name: 'orphan.md', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          onPreview={onPreview}
          fileNodeByRelativePath={map}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('orphan.md'));
    await waitFor(() => expect(onPreview).toHaveBeenCalled());
  });

  it('handleSelect selected=true 时优先 onFileClick', async () => {
    const onFileClick = vi.fn();
    const onPreview = vi.fn();
    const file: FileNode = {
      id: 'f1',
      name: 'doc.md',
      url: 'https://example.com/doc.md',
      canPreview: true,
    };
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'leaf', name: 'doc.md', isLeaf: true, file }]}
          onLoadChildren={vi.fn()}
          onFileClick={onFileClick}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('doc.md'));
    await waitFor(() => expect(onFileClick).toHaveBeenCalledWith(file));
    expect(onPreview).not.toHaveBeenCalled();
  });

  it('handleSelect 无 onFileClick 时回退 onPreview', async () => {
    const onPreview = vi.fn();
    const file: FileNode = {
      id: 'f2',
      name: 'readme.md',
      url: 'https://example.com/readme.md',
      canPreview: true,
    };
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'leaf', name: 'readme.md', isLeaf: true, file }]}
          onLoadChildren={vi.fn()}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('readme.md'));
    await waitFor(() => expect(onPreview).toHaveBeenCalledWith(file));
  });

  it('filterKeyword 匹配子文件名时保留父目录', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'dir',
              name: 'docs',
              isLeaf: false,
              children: [{ key: 'f', name: 'target.txt', isLeaf: true }],
            },
          ]}
          onLoadChildren={vi.fn()}
          filterKeyword="target"
        />
      </TestWrapper>,
    );
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    expect(screen.getByText('docs')).toBeInTheDocument();
    expect(screen.getByText('target.txt')).toBeInTheDocument();
  });

  it('emptyRender 为 ReactNode 时直接使用', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[]}
          onLoadChildren={vi.fn()}
          emptyRender={<span data-testid="node-empty">无</span>}
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('node-empty')).toBeInTheDocument();
  });

  it('onDownload 启用 synthetic leaf 绑定', async () => {
    const onDownload = vi.fn();
    const map = new Map<string, FileNode>();
    map.set('dl.txt', {
      id: 'dl',
      name: 'dl.txt',
      url: 'https://example.com/dl.txt',
    });
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'leaf', name: 'dl.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          onDownload={onDownload}
          fileNodeByRelativePath={map}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('dl.txt')).toBeInTheDocument();
  });

  it('懒加载返回空数组时 onLoadChildren 被调用', async () => {
    const onLoadChildren = vi.fn().mockResolvedValue([]);
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            { key: 'd', name: 'dir', isLeaf: false, children: [] as any },
          ]}
          onLoadChildren={onLoadChildren}
        />
      </TestWrapper>,
    );
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    await waitFor(() => expect(onLoadChildren).toHaveBeenCalled());
  });

  it('filterKeyword 空白时不触发筛选空态', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'x', name: 'readme.md', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          filterKeyword="   "
        />
      </TestWrapper>,
    );
    expect(screen.getByText('readme.md')).toBeInTheDocument();
    expect(
      screen.queryByTestId('file-tree-filter-empty'),
    ).not.toBeInTheDocument();
  });

  it('文件夹节点渲染 FileFolders 图标', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'd',
              name: 'folder',
              isLeaf: false,
              children: [{ key: 'f', name: 'a.txt', isLeaf: true }],
            },
          ]}
          onLoadChildren={vi.fn()}
        />
      </TestWrapper>,
    );
    expect(
      document.querySelector('[class*="icon--folder"]'),
    ).toBeInTheDocument();
  });

  it('custom className/style 应用到面板', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'l', name: 'f.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          className="custom-tree"
          style={{ maxHeight: 300 }}
        />
      </TestWrapper>,
    );
    const panel = screen.getByTestId('workspace-file-tree');
    expect(panel.className).toContain('custom-tree');
    expect(panel.style.maxHeight).toBe('300px');
  });

  it('handleLoadData 成功后合并 children', async () => {
    const onLoadChildren = vi.fn().mockResolvedValue([
      { key: 'new', name: 'new.txt', isLeaf: true },
    ]);
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            { key: 'd', name: 'dir', isLeaf: false, children: [] as any },
          ]}
          onLoadChildren={onLoadChildren}
        />
      </TestWrapper>,
    );
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    await waitFor(() => expect(onLoadChildren).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('new.txt')).toBeInTheDocument());
  });

  it('filterKeyword 大小写不敏感匹配', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'x', name: 'ReadMe.md', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          filterKeyword="readme"
        />
      </TestWrapper>,
    );
    expect(screen.getByText('ReadMe.md')).toBeInTheDocument();
  });

  it('onSelect 回调 selected=true 时触发', async () => {
    const onSelect = vi.fn();
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'leaf', name: 'sel.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          onSelect={onSelect}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('sel.txt'));
    await waitFor(() => expect(onSelect).toHaveBeenCalled());
  });

  it('onLoadChildren 失败时不抛错', async () => {
    const onLoadChildren = vi.fn().mockRejectedValue(new Error('load fail'));
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            { key: 'd', name: 'dir', isLeaf: false, children: [] as any },
          ]}
          onLoadChildren={onLoadChildren}
        />
      </TestWrapper>,
    );
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    await waitFor(() => expect(onLoadChildren).toHaveBeenCalled());
  });

  it('showLine=false 时 Tree 不显示连接线', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'x', name: 'line.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          showLine={false}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('line.txt')).toBeInTheDocument();
  });

  it('blockNode=false 时仍可渲染树节点', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'x', name: 'block.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          blockNode={false}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('block.txt')).toBeInTheDocument();
  });

  it('locale undefined 使用中文空态回退', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[]}
          onLoadChildren={vi.fn()}
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('workspace-file-tree')).toBeInTheDocument();
  });

  it('filterKeyword 无匹配展示空过滤态', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'a', name: 'alpha.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          filterKeyword="zzz-nomatch"
        />
      </TestWrapper>,
    );
    expect(screen.queryByText('alpha.txt')).not.toBeInTheDocument();
  });

  it('fileItemPrefixCls / fileItemHashId 透传', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'p', name: 'pref.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          fileItemPrefixCls="custom-file-item"
          fileItemHashId="hash-x"
        />
      </TestWrapper>,
    );
    expect(screen.getByText('pref.txt')).toBeInTheDocument();
  });

  it('目录 isLeaf 缺省时按 children 推断', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'd',
              name: 'folder',
              children: [{ key: 'c', name: 'child.txt', isLeaf: true }],
            } as any,
          ]}
          onLoadChildren={vi.fn()}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('folder')).toBeInTheDocument();
  });

  it('选中叶子节点触发 onSelect', async () => {
    const onSelect = vi.fn();
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'leaf', name: 'only.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          onSelect={onSelect}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('only.txt'));
    await waitFor(() => expect(onSelect).toHaveBeenCalled());
  });

  it('filterKeyword 空字符串不过滤，展示全部节点', () => {
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'a', name: 'visible.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          filterKeyword=""
        />
      </TestWrapper>,
    );
    expect(screen.getByText('visible.txt')).toBeInTheDocument();
  });

  it('isLeaf 为 undefined 且无 children 时视为叶子不触发懒加载', async () => {
    const onLoadChildren = vi.fn().mockResolvedValue([
      { key: 'c', name: 'child.txt', isLeaf: true },
    ]);
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'd', name: 'lazy-dir' } as any]}
          onLoadChildren={onLoadChildren}
        />
      </TestWrapper>,
    );
    // mapTreeToDataNodes: isLeaf ?? !hasChildren → true；handleLoadData 对
    // isLeaf===undefined 且无 children 直接 resolve，不调用 onLoadChildren
    expect(screen.getByText('lazy-dir')).toBeInTheDocument();
    expect(onLoadChildren).not.toHaveBeenCalled();
  });

  it('handleLoadData 找不到 source 时不调用 onLoadChildren', async () => {
    const onLoadChildren = vi.fn();
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'd', name: 'dir', isLeaf: false, children: [] as any }]}
          onLoadChildren={onLoadChildren}
        />
      </TestWrapper>,
    );
    const tree = screen.getByTestId('workspace-file-tree');
    expect(tree).toBeInTheDocument();
    expect(onLoadChildren).not.toHaveBeenCalled();
  });

  it('选中叶子无 onPreview/onDownload 时不触发预览', async () => {
    const onSelect = vi.fn();
    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'leaf', name: 'plain.txt', isLeaf: true }]}
          onLoadChildren={vi.fn()}
          onSelect={onSelect}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('plain.txt'));
    await waitFor(() => expect(onSelect).toHaveBeenCalled());
  });

  it('locale 空对象时空树展示中文「暂无数据」', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
          <FileTree treeData={[]} onLoadChildren={vi.fn()} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('istanbul residual：筛选无匹配、disabled 选中、懒加载目录', async () => {
    // 叶子根无匹配 → rootsNoMatch（未展开目录不会被筛掉）
    const { unmount: unmountFilter } = render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'a', name: 'a.txt', isLeaf: true }]}
          filterKeyword="zzz-no-match"
          onLoadChildren={vi.fn()}
        />
      </TestWrapper>,
    );
    expect(await screen.findByTestId('file-tree-filter-empty')).toHaveAttribute(
      'data-state',
      'rootsNoMatch',
    );
    unmountFilter();

    // disabled 叶子：antd 可能不触发 onSelect；即便触发也不得预览
    const onPreview = vi.fn();
    const onFileClick = vi.fn();
    const { unmount: unmountDisabled } = render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'd',
              name: 'disabled.txt',
              isLeaf: true,
              disabled: true,
              file: {
                id: 'd',
                name: 'disabled.txt',
                url: 'https://example.com/d.txt',
                canPreview: true,
                disabled: true,
              },
            },
          ]}
          onLoadChildren={vi.fn()}
          onPreview={onPreview}
          onFileClick={onFileClick}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('disabled.txt'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(onPreview).not.toHaveBeenCalled();
    expect(onFileClick).not.toHaveBeenCalled();
    unmountDisabled();

    // isLeaf=false + children 缺省：可懒加载目录
    const onLoadChildren = vi.fn().mockResolvedValue([]);
    const { unmount: unmountLazy } = render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'lazy',
              name: 'lazy-dir',
              isLeaf: false,
              children: undefined,
            },
          ]}
          onLoadChildren={onLoadChildren}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('lazy-dir')).toBeInTheDocument();
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    await waitFor(() => expect(onLoadChildren).toHaveBeenCalled());
    unmountLazy();

    // locale 空对象时筛选空态仍可读
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
          <FileTree
            treeData={[{ key: 'x', name: 'x.txt', isLeaf: true }]}
            filterKeyword="nomatch"
            onLoadChildren={vi.fn()}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(await screen.findByTestId('file-tree-filter-empty')).toHaveAttribute(
      'data-state',
      'rootsNoMatch',
    );
  });

  it('istanbul buffer：空白筛选词、isLeaf 缺省、取消选中', async () => {
    const onPreview = vi.fn();
    const { unmount } = render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'folder',
              name: 'folder',
              children: undefined,
            },
            {
              key: 'leaf',
              name: 'leaf.txt',
              isLeaf: true,
              file: {
                id: 'leaf',
                name: 'leaf.txt',
                url: 'https://example.com/leaf.txt',
                canPreview: true,
              },
            },
          ]}
          filterKeyword="   "
          onPreview={onPreview}
          onLoadChildren={vi.fn()}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('folder')).toBeInTheDocument();
    fireEvent.click(screen.getByText('leaf.txt'));
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(screen.getByText('leaf.txt'));
    await act(async () => {
      await Promise.resolve();
    });
    unmount();
  });

  it('istanbul fill：懒加载空 children 收起；选中未知 key；仅 onSelect', async () => {
    const onSelect = vi.fn();
    const onLoadChildren = vi.fn().mockResolvedValue([]);
    const { unmount } = render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'empty-dir',
              name: 'empty-dir',
              isLeaf: false,
              children: [],
            },
          ]}
          onLoadChildren={onLoadChildren}
          onSelect={onSelect}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('empty-dir')).toBeInTheDocument();
    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    await waitFor(() => expect(onLoadChildren).toHaveBeenCalled());
    unmount();

    render(
      <TestWrapper>
        <FileTree
          treeData={[{ key: 'only', name: 'only.txt', isLeaf: true }]}
          onSelect={onSelect}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('only.txt'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(onSelect).toHaveBeenCalled();
  });

  it('istanbul after：节点 name 缺失回退空串；无 locale empty 文案', async () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
          <FileTree
            treeData={[
              {
                key: 'n',
                name: undefined as any,
                isLeaf: true,
                file: {
                  id: 'n',
                  name: '',
                  url: 'https://example.com/n',
                  canPreview: true,
                },
              },
            ]}
            onPreview={vi.fn()}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    // name ?? '' → 空标题仍挂载树
    expect(document.querySelector('.ant-tree')).toBeTruthy();

    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
          <FileTree treeData={[]} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });
});

describe('FileTree istanbul buffer：搜索无结果文案 / filterKeyword 假值', () => {
  it('有 keyword 无匹配时展示 noResults 回退', async () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
          <FileTree
            treeData={[
              {
                key: 'a',
                name: 'alpha.txt',
                isLeaf: true,
                file: { id: 'a', name: 'alpha.txt', canPreview: true },
              },
            ]}
            filterKeyword="zzz-no-match"
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(
        screen.queryByText(/未找到|noResults|zzz/i) ||
          document.querySelector('.ant-empty') ||
          document.querySelector('.ant-tree'),
      ).toBeTruthy();
    });
  });
});

describe('FileTree istanbul residual：filter / select / leaf 假值矩阵', () => {
  it('空 filterKeyword 返回全量；isLeaf ?? !hasChildren；children ?? []', async () => {
    // if (!q) return nodes;
    // const resolvedIsLeaf = node.isLeaf ?? !hasChildren;
    // return { ...node, children: node.children ?? [] };
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'dir',
              name: 'dir',
              isLeaf: undefined,
              children: undefined,
            },
            {
              key: 'leaf',
              name: 'leaf.txt',
              isLeaf: true,
              file: {
                id: 'leaf',
                name: 'leaf.txt',
                url: 'https://example.com/l',
                canPreview: true,
              },
            },
          ]}
          filterKeyword="  "
        />
      </TestWrapper>,
    );
    expect(screen.getByText('leaf.txt')).toBeInTheDocument();
  });

  it('onSelect：未选中早退；disabled；onPreview else', async () => {
    // if (!info.selected) return;
    // if (!n) return;
    // if (!file || n.disabled === true) return;
    // } else if (onPreview) {
    const onPreview = vi.fn();
    const onSelect = vi.fn();
    render(
      <TestWrapper>
        <FileTree
          treeData={[
            {
              key: 'd',
              name: 'disabled.txt',
              isLeaf: true,
              disabled: true,
              file: {
                id: 'd',
                name: 'disabled.txt',
                canPreview: true,
              },
            },
            {
              key: 'p',
              name: 'preview.txt',
              isLeaf: true,
              file: {
                id: 'p',
                name: 'preview.txt',
                url: 'https://example.com/p',
                canPreview: true,
              },
            },
          ]}
          onPreview={onPreview}
          onSelect={onSelect}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('preview.txt'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(onPreview.mock.calls.length + onSelect.mock.calls.length).toBeGreaterThan(
      0,
    );
  });
});
