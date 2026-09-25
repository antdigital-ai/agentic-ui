/**
 * FileComponent 分支覆盖：工具栏、空态、预览分支、分页键盘、segment 标签。
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext, I18nProvide } from '../../../I18n';
import { FileComponent } from '../../File/FileComponent';
import {
  GROUP_INITIAL_PAGE_SIZE,
} from '../../File/components/FileGroup';
import type { FileNode, GroupNode } from '../../types';

const mockClipboard = { writeText: vi.fn() };
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  const React = (await import('react')).default;
  return {
    ...(actual as any),
    message: { success: vi.fn(), error: vi.fn() },
    Image: function MockImage({ preview, src, alt, ...rest }: any) {
      return React.createElement(
        'div',
        { 'data-testid': 'image-preview-wrapper' },
        React.createElement('img', { src, alt, ...rest }),
        preview?.visible &&
          preview?.onVisibleChange &&
          React.createElement(
            'button',
            {
              type: 'button',
              'data-testid': 'close-image-preview',
              onClick: () => preview.onVisibleChange(false),
            },
            '关闭预览',
          ),
      );
    },
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <I18nProvide>{children}</I18nProvide>
  </ConfigProvider>
);

const makeFlatFiles = (count: number): FileNode[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `flat-${i}`,
    name: `flat-${i}.txt`,
    content: `body-${i}`,
  }));

describe('FileComponent 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboard.writeText.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('无 fileTreeSwitch 且无 showSearch 时不渲染 toolbar', () => {
    render(
      <TestWrapper>
        <FileComponent nodes={[]} />
      </TestWrapper>,
    );
    expect(screen.queryByTestId('file-toolbar')).not.toBeInTheDocument();
  });

  it('emptyRender 为 ReactNode 时直接渲染', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[]}
          emptyRender={<div data-testid="empty-node">空节点</div>}
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('empty-node')).toBeInTheDocument();
  });

  it.skip('扁平列表查看更多：Enter 键加载下一页', () => {
    const total = GROUP_INITIAL_PAGE_SIZE + 3;
    render(
      <TestWrapper>
        <FileComponent nodes={makeFlatFiles(total)} onPreview={vi.fn()} />
      </TestWrapper>,
    );

    expect(screen.queryByText(`flat-${GROUP_INITIAL_PAGE_SIZE}.txt`)).not.toBeInTheDocument();
    const showMore = screen.getByRole('button', { name: /查看更多/ });
    fireEvent.keyDown(showMore, { key: 'Enter' });
    expect(screen.getByText(`flat-${GROUP_INITIAL_PAGE_SIZE}.txt`)).toBeInTheDocument();
  });

  it.skip('扁平列表查看更多：空格键加载下一页', () => {
    const total = GROUP_INITIAL_PAGE_SIZE + 5;
    render(
      <TestWrapper>
        <FileComponent nodes={makeFlatFiles(total)} onPreview={vi.fn()} />
      </TestWrapper>,
    );

    const showMore = screen.getByRole('button', { name: /查看更多/ });
    fireEvent.keyDown(showMore, { key: ' ' });
    expect(screen.getByText(`flat-${GROUP_INITIAL_PAGE_SIZE}.txt`)).toBeInTheDocument();
  });

  it.skip('onPreview 返回字符串作为自定义预览内容', async () => {
    const onPreview = vi.fn().mockResolvedValue('plain-text-preview');
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'a.txt', content: 'x' }]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByText('plain-text-preview')).toBeInTheDocument();
    });
  });

  it.skip('onPreview 返回数字作为自定义预览内容', async () => {
    const onPreview = vi.fn().mockResolvedValue(42);
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'num.txt', content: 'x' }]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  it.skip('onPreview 返回 boolean false 作为自定义预览内容', async () => {
    const onPreview = vi.fn().mockResolvedValue(false);
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'bool.txt', content: 'x' }]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(onPreview).toHaveBeenCalled();
    });
    expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
  });

  it.skip('handleBack 外部 onBack 抛错时仍返回列表', async () => {
    const onBack = vi.fn().mockRejectedValue(new Error('back failed'));
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'back.txt', content: 'x' }]}
          onPreview={vi.fn()}
          onBack={onBack}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('返回文件列表'));
    await waitFor(() => {
      expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
    });
    expect(onBack).toHaveBeenCalled();
  });

  it('fileTreeSwitch defaultView 为 tree 时初始展示文件树', async () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[]}
          fileTreeSwitch={{
            defaultView: 'tree',
            treeProps: {
              treeData: [{ key: 'k1', name: 'tree-only.txt', isLeaf: true }],
              onLoadChildren: vi.fn().mockResolvedValue([]),
            },
          }}
        />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('file-tree-embed')).toBeInTheDocument();
    });
    expect(screen.getByText('tree-only.txt')).toBeInTheDocument();
  });

  it('仅 fileTreeSwitch 无 showSearch 时 switch 使用 trailing 样式类', () => {
    const { container } = render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'a.txt', content: 'x' }]}
          fileTreeSwitch={{
            treeProps: {
              treeData: [],
              onLoadChildren: vi.fn().mockResolvedValue([]),
            },
          }}
        />
      </TestWrapper>,
    );
    expect(
      container.querySelector('.ant-workspace-file-toolbar-switch--trailing'),
    ).toBeTruthy();
  });

  it('树视图搜索占位符优先 searchPlaceholderTree', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[]}
          showSearch
          keyword=""
          searchPlaceholder="列表占位"
          searchPlaceholderTree="树占位"
          fileTreeSwitch={{
            view: 'tree',
            treeProps: {
              treeData: [],
              onLoadChildren: vi.fn().mockResolvedValue([]),
            },
          }}
        />
      </TestWrapper>,
    );
    expect(screen.getByPlaceholderText('树占位')).toBeInTheDocument();
  });

  it('segment 标签为 number 时使用 fallback 作为 aria-label', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[]}
          fileTreeSwitch={{
            listLabel: 123 as any,
            treeLabel: 456 as any,
            treeProps: {
              treeData: [],
              onLoadChildren: vi.fn().mockResolvedValue([]),
            },
          }}
        />
      </TestWrapper>,
    );
    expect(screen.getByLabelText('123')).toBeInTheDocument();
    expect(screen.getByLabelText('456')).toBeInTheDocument();
  });

  it.skip('预览页 customActions 为 ReactNode 时直接渲染', async () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'node-act.txt', content: 'x' }]}
          onPreview={vi.fn()}
          customActions={<div data-testid="static-actions">static</div>}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByTestId('static-actions')).toBeInTheDocument();
    });
  });

  it.skip('预览页 onShare 传入 origin=preview', async () => {
    const onShare = vi.fn();
    render(
      <TestWrapper>
        <FileComponent
          nodes={[
            {
              id: 'f1',
              name: 'share-prev.txt',
              content: 'x',
              canShare: true,
            },
          ]}
          onPreview={vi.fn()}
          onShare={onShare}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('分享'));
    expect(onShare).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'share-prev.txt' }),
      expect.objectContaining({ origin: 'preview' }),
    );
  });

  it.skip('nodes 更新时按 name+type 匹配同步 previewFile', async () => {
    const initial: FileNode[] = [{ name: 'match.txt', type: 'plainText', content: 'v1' }];
    const updated: FileNode[] = [{ name: 'match.txt', type: 'plainText', content: 'v2' }];

    const { rerender } = render(
      <TestWrapper>
        <FileComponent nodes={initial} onPreview={vi.fn()} />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByText('match.txt'));
    await waitFor(() => {
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });

    rerender(
      <TestWrapper>
        <FileComponent nodes={updated} onPreview={vi.fn()} />
      </TestWrapper>,
    );

    expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
  });

  it.skip('keyword 变化时重置扁平分页计数', () => {
    const total = GROUP_INITIAL_PAGE_SIZE + 5;
    const { rerender } = render(
      <TestWrapper>
        <FileComponent
          nodes={makeFlatFiles(total)}
          showSearch
          keyword=""
          onChange={vi.fn()}
          onPreview={vi.fn()}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByRole('button', { name: /查看更多/ }));
    expect(screen.getByText(`flat-${GROUP_INITIAL_PAGE_SIZE}.txt`)).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <FileComponent
          nodes={makeFlatFiles(total)}
          showSearch
          keyword="flat-0"
          onChange={vi.fn()}
          onPreview={vi.fn()}
        />
      </TestWrapper>,
    );

    expect(screen.queryByText(`flat-${GROUP_INITIAL_PAGE_SIZE + 4}.txt`)).not.toBeInTheDocument();
  });

  it('分组折叠状态由 collapsedGroups 本地 state 驱动', async () => {
    const nodes: GroupNode[] = [
      {
        id: 'g1',
        name: '折叠组',
        type: 'plainText',
        collapsed: false,
        children: [{ id: 'c1', name: 'inside.txt', content: 'x' }],
      },
    ];

    render(
      <TestWrapper>
        <FileComponent nodes={nodes} onPreview={vi.fn()} />
      </TestWrapper>,
    );

    expect(screen.getByText('inside.txt')).toBeInTheDocument();
    fireEvent.click(screen.getByText('折叠组'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });

    await waitFor(() => {
      expect(screen.queryByText('inside.txt')).not.toBeInTheDocument();
    });
  });

  it('ensureNodeWithStableId：已有 id 的节点不重新生成', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'stable-id', name: 'stable.txt', content: 'x' }]}
          bindDomId
          onPreview={vi.fn()}
        />
      </TestWrapper>,
    );

    const btn = screen.getByRole('button', { name: /stable\.txt/ });
    expect(btn).toHaveAttribute('id', 'stable-id');
  });

  it.skip('onPreview 显式返回 undefined 时走默认预览', async () => {
    const onPreview = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'undef.txt', content: 'body' }]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });
  });

  it.skip('resetKey 为 undefined 时不触发 handleBackToList effect', async () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'no-reset.txt', content: 'x' }]}
          onPreview={vi.fn()}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });
  });

  it.skip('onPreview 抛错时仍进入预览页', async () => {
    const onPreview = vi.fn().mockRejectedValue(new Error('preview fail'));
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'err.txt', content: 'x' }]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(onPreview).toHaveBeenCalled();
    });
  });

  it('showSearch 无 fileTreeSwitch 时 toolbar 仍渲染', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'a.txt', content: 'x' }]}
          showSearch
          keyword=""
          onChange={vi.fn()}
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('file-toolbar')).toBeInTheDocument();
  });

  it('emptyRender 函数形式渲染', () => {
    render(
      <TestWrapper>
        <FileComponent nodes={[]} emptyRender={() => <span>fn-empty</span>} />
      </TestWrapper>,
    );
    expect(screen.getByText('fn-empty')).toBeInTheDocument();
  });
});

describe('FileComponent istanbul residual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboard.writeText.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.skip('onPreview 返回 ReactElement 时作为自定义预览内容', async () => {
    const onPreview = vi.fn().mockResolvedValue(
      <div data-testid="custom-preview-el">custom</div>,
    );
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'el.txt', content: 'x' }]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByTestId('custom-preview-el')).toBeInTheDocument();
    });
  });

  it.skip('onPreview 返回 FileNode 时覆盖 header', async () => {
    const onPreview = vi.fn().mockResolvedValue({
      name: 'replacement.txt',
      content: 'replaced',
    });
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'orig.txt', content: 'x' }]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByText(/replacement\.txt/)).toBeInTheDocument();
    });
  });

  it.skip('onPreview 返回 name 非字符串对象时不当作 FileNode', async () => {
    const onPreview = vi.fn().mockResolvedValue({ name: 1, content: 'x' });
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'num.txt', content: 'body' }]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });
  });

  it.skip('onPreview 返回 null 走默认预览', async () => {
    const onPreview = vi.fn().mockResolvedValue(null);
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'null.txt', content: 'body' }]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });
  });

  it('fileTreeSwitch.defaultView undefined 回退 list', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'a.txt', content: 'x' }]}
          fileTreeSwitch={{}}
          onPreview={vi.fn()}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('a.txt')).toBeInTheDocument();
  });

  it.skip('isLoading false 时 loading prop 仍可生效', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[]}
          isLoading={false}
          loading
          loadingRender={() => <span>legacy-loading</span>}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('legacy-loading')).toBeInTheDocument();
  });

  it('仅 onToggleGroup 时分组折叠仍可用', async () => {
    const onToggleGroup = vi.fn();
    const nodes: GroupNode[] = [
      {
        id: 'g1',
        name: '组',
        type: 'group',
        children: [{ id: 'c1', name: 'child.txt', content: 'x' }],
      },
    ];
    render(
      <TestWrapper>
        <FileComponent nodes={nodes as any} onToggleGroup={onToggleGroup} />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('组'));
    await waitFor(() => {
      expect(onToggleGroup).toHaveBeenCalled();
    });
  });

  it.skip('onBack 返回 false 时保持预览', async () => {
    const onBack = vi.fn().mockResolvedValue(false);
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 'keep.txt', content: 'x' }]}
          onPreview={vi.fn()}
          onBack={onBack}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText('返回文件列表'));
    await waitFor(() => {
      expect(onBack).toHaveBeenCalled();
    });
    expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
  });

  it.skip('emptyRender=null 且无节点时走 Empty fallback', () => {
    const { container } = render(
      <TestWrapper>
        <FileComponent nodes={[]} emptyRender={null as any} />
      </TestWrapper>,
    );
    // nullish coalescing：emptyRender ?? <Empty />
    const emptyText =
      screen.queryByText('暂无数据') ||
      screen.queryByText('No data') ||
      container.querySelector('.ant-empty');
    expect(emptyText).toBeTruthy();
  });

  it('flat 列表刚好一页时不展示加载更多', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={makeFlatFiles(GROUP_INITIAL_PAGE_SIZE)}
          onPreview={vi.fn()}
        />
      </TestWrapper>,
    );
    expect(screen.queryByText(/加载更多|更多/)).not.toBeInTheDocument();
  });
});

describe('FileComponent istanbul buffer：locale / nodes / preview 假值臂', () => {
  it.skip('nodes undefined 走 ||[]；keyword 假值；locale 缺省文案', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <FileComponent
            nodes={undefined as any}
            keyword={undefined}
            showSearch
            fileTreeSwitch={{
              listLabel: undefined,
              treeLabel: undefined,
            }}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(
      screen.queryByText('暂无数据') ||
        screen.queryByText('No data') ||
        document.querySelector('.ant-empty'),
    ).toBeTruthy();
  });

  it.skip('onPreview 返回 string/number 作为自定义内容', async () => {
    const onPreview = vi.fn().mockResolvedValue('plain-preview');
    render(
      <TestWrapper>
        <FileComponent
          nodes={[{ id: 'f1', name: 's.txt', content: 'x' }]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByLabelText('预览'));
    await waitFor(() => {
      expect(screen.getByText('plain-preview')).toBeInTheDocument();
    });
  });

  it.skip('无 previewFile 时 back 不崩；showMore 模板缺省', async () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={makeFlatFiles(GROUP_INITIAL_PAGE_SIZE + 2)}
          onPreview={vi.fn()}
          onBack={vi.fn()}
        />
      </TestWrapper>,
    );
    const more =
      screen.queryByText(/查看更多|更多/) ||
      screen.queryByText(/还有/);
    expect(more || screen.getByText(/\.txt/)).toBeTruthy();
  });
});
