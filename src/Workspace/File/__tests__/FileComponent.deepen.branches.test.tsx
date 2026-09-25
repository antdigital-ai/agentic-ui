/**
 * FileComponent 分支补洞：预览回调、分页键盘、toolbar/空态、actionRef、树视图。
 */
import '@testing-library/jest-dom';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext, I18nProvide } from '../../../I18n';
import type { FileNode, GroupNode } from '../../types';
import { FileComponent } from '../FileComponent';
import {
  GROUP_INITIAL_PAGE_SIZE,
  GROUP_PAGE_SIZE_INCREMENT,
} from '../components/FileGroup';

const mockClipboard = { writeText: vi.fn() };
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
  configurable: true,
});

if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn();
}

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  const ReactMod = (await import('react')).default;
  return {
    ...(actual as any),
    message: { success: vi.fn(), error: vi.fn() },
    Image: function MockImage({ preview, src, alt, ...rest }: any) {
      return ReactMod.createElement(
        'div',
        { 'data-testid': 'image-preview-wrapper' },
        ReactMod.createElement('img', { src, alt, ...rest }),
        preview?.visible &&
          preview?.onVisibleChange &&
          ReactMod.createElement(
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

const previewableFile = (
  id: string,
  name: string,
  content = 'x',
): FileNode => ({
  id,
  name,
  content,
  canPreview: true,
});

const makeFlatFiles = (count: number): FileNode[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `flat-${i}`,
    name: `flat-${i}.txt`,
    content: `body-${i}`,
    canPreview: true,
  }));

const openPreviewFor = async (fileName: string) => {
  fireEvent.click(screen.getByText(fileName));
  await waitFor(() => {
    expect(
      document.querySelector('.ant-workspace-file-preview-back-button'),
    ).toBeTruthy();
  });
};

const expectPreviewOpen = () => {
  expect(document.querySelector('.ant-workspace-file-preview-back-button')).toBeTruthy();
};

const expectPreviewClosed = () => {
  expect(document.querySelector('.ant-workspace-file-preview-back-button')).toBeNull();
};

const clickBackToList = () => {
  const back = document.querySelector(
    '.ant-workspace-file-preview-back-button',
  ) as HTMLButtonElement | null;
  expect(back).toBeTruthy();
  fireEvent.click(back!);
};

const previewActionButtons = () =>
  document.querySelectorAll('.ant-workspace-file-preview-item-action-btn');


describe('FileComponent deepen branches', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('nodes undefined 走 ||[]；locale 缺省 Empty', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <FileComponent nodes={undefined as any} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(document.querySelector('.ant-empty')).toBeTruthy();
  });

  it('keyword 仅空白不算 hasKeyword；有 keyword 无匹配走 noResultsFor', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('1', 'alpha.txt')]}
          showSearch
          keyword="   "
        />
      </TestWrapper>,
    );
    expect(screen.getByText('alpha.txt')).toBeInTheDocument();

    const { unmount } = render(
      <TestWrapper>
        <FileComponent nodes={[]} showSearch keyword="nomatch-xyz" />
      </TestWrapper>,
    );
    expect(screen.getByText(/nomatch-xyz/)).toBeInTheDocument();
    unmount();
  });

  it('loading / isLoading / loadingRender 分支', () => {
    const { rerender } = render(
      <TestWrapper>
        <FileComponent
          nodes={[]}
          loading
          loadingRender={() => <div data-testid="custom-loading">L</div>}
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <FileComponent nodes={[]} isLoading />
      </TestWrapper>,
    );
    expect(document.querySelector('.ant-spin')).toBeTruthy();

    rerender(
      <TestWrapper>
        <FileComponent nodes={[]} isLoading={false} loading />
      </TestWrapper>,
    );
    expect(document.querySelector('.ant-spin')).toBeNull();
  });

  it('emptyRender 为 null 时走 Empty fallback', () => {
    render(
      <TestWrapper>
        <FileComponent nodes={[]} emptyRender={null as any} />
      </TestWrapper>,
    );
    expect(document.querySelector('.ant-empty')).toBeTruthy();
  });

  it('扁平列表查看更多：点击、Enter、Space；keyword 变化重置分页', () => {
    const total = GROUP_INITIAL_PAGE_SIZE + 5;
    const { container, rerender } = render(
      <TestWrapper>
        <FileComponent
          nodes={makeFlatFiles(total)}
          onPreview={vi.fn()}
          showSearch
          keyword=""
        />
      </TestWrapper>,
    );

    const showMore =
      screen.queryByRole('button', { name: /查看更多/ }) ||
      container.querySelector('.ant-workspace-file-show-more');
    expect(showMore).toBeTruthy();
    fireEvent.click(showMore!);
    expect(
      screen.getByText(`flat-${GROUP_INITIAL_PAGE_SIZE}.txt`),
    ).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <FileComponent
          nodes={makeFlatFiles(total + GROUP_PAGE_SIZE_INCREMENT)}
          onPreview={vi.fn()}
          showSearch
          keyword="flat-0"
        />
      </TestWrapper>,
    );
    expect(
      screen.queryByText(`flat-${GROUP_INITIAL_PAGE_SIZE + 4}.txt`),
    ).not.toBeInTheDocument();

    rerender(
      <TestWrapper>
        <FileComponent nodes={makeFlatFiles(total)} onPreview={vi.fn()} />
      </TestWrapper>,
    );
    const moreBtn =
      screen.queryByRole('button', { name: /查看更多/ }) ||
      container.querySelector('.ant-workspace-file-show-more');
    expect(moreBtn).toBeTruthy();
    fireEvent.keyDown(moreBtn!, { key: 'Enter' });
    fireEvent.keyDown(moreBtn!, { key: ' ' });
    expect(
      screen.getByText(`flat-${GROUP_INITIAL_PAGE_SIZE}.txt`),
    ).toBeInTheDocument();
  });

  it('onPreview 返回 string/number/boolean 自定义内容', async () => {
    for (const [name, value, matcher] of [
      ['plain-preview.txt', 'plain-preview', (t: string) => screen.getByText(t)],
      ['num.txt', 42, (t: string) => screen.getByText(t)],
      ['bool.txt', true, () => document.querySelector('.ant-workspace-file-preview-back-button')],
    ] as const) {
      const onPreview = vi.fn().mockResolvedValue(value);
      const { unmount } = render(
        <TestWrapper>
          <FileComponent
            nodes={[previewableFile('f1', name)]}
            onPreview={onPreview}
          />
        </TestWrapper>,
      );
      await openPreviewFor(name);
      expect(matcher(String(value === true ? name : value))).toBeTruthy();
      unmount();
    }
  });

  it('onPreview 返回 false 阻止预览；null/undefined 走默认预览', async () => {
    const onFalse = vi.fn().mockResolvedValue(false);
    const { unmount: u1 } = render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f1', 'block.txt')]}
          onPreview={onFalse}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('block.txt'));
    await waitFor(() => expect(onFalse).toHaveBeenCalled());
    expectPreviewClosed();
    u1();

    const onUndef = vi.fn().mockResolvedValue(undefined);
    const { unmount: u2 } = render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f2', 'undef.txt')]}
          onPreview={onUndef}
        />
      </TestWrapper>,
    );
    await openPreviewFor('undef.txt');
    await waitFor(() => {
      expectPreviewOpen();
    });
    u2();

    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f3', 'null.txt')]}
          onPreview={vi.fn().mockResolvedValue(null)}
        />
      </TestWrapper>,
    );
    await openPreviewFor('null.txt');
    await waitFor(() => {
      expectPreviewOpen();
    });
  });

  it('onPreview 抛错仍进入默认预览', async () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f1', 'err.txt')]}
          onPreview={vi.fn().mockRejectedValue(new Error('fail'))}
        />
      </TestWrapper>,
    );
    await openPreviewFor('err.txt');
    await waitFor(() => {
      expectPreviewOpen();
    });
  });

  it('onPreview 返回 FileNode；name 非字符串对象走默认预览', async () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f1', 'orig.txt')]}
          onPreview={vi.fn().mockResolvedValue({
            id: 'f2',
            name: 'replacement.txt',
            content: 'new',
          })}
        />
      </TestWrapper>,
    );
    await openPreviewFor('orig.txt');
    await waitFor(() => {
      expect(screen.getByText('replacement.txt')).toBeInTheDocument();
    });

    const { unmount } = render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f3', 'bad.txt', 'body')]}
          onPreview={vi.fn().mockResolvedValue({ name: 1, content: 'x' })}
        />
      </TestWrapper>,
    );
    await openPreviewFor('bad.txt');
    await waitFor(() => {
      expectPreviewOpen();
    });
    unmount();
  });

  it('onPreview 返回 ReactElement：clone 注入 back/download/share/setPreviewHeader', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    const CustomPreview: React.FC<any> = ({
      back,
      download,
      share,
      setPreviewHeader,
    }) => (
      <div>
        <button type="button" aria-label="cp-back" onClick={() => back()} />
        <button type="button" aria-label="cp-dl" onClick={() => download()} />
        <button type="button" aria-label="cp-share" onClick={() => share()} />
        <button
          type="button"
          aria-label="cp-header"
          onClick={() => setPreviewHeader(<span>Hdr</span>)}
        />
      </div>
    );
    render(
      <TestWrapper>
        <FileComponent
          nodes={[
            {
              id: 'f1',
              name: 'el.txt',
              content: 'x',
              url: 'https://example.com/el.txt',
              canPreview: true,
            },
          ]}
          onPreview={vi.fn().mockResolvedValue(<CustomPreview />)}
        />
      </TestWrapper>,
    );
    await openPreviewFor('el.txt');
    await waitFor(() => {
      expect(screen.getByLabelText('cp-back')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText('cp-dl'));
    fireEvent.click(screen.getByLabelText('cp-share'));
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
    fireEvent.click(screen.getByLabelText('cp-header'));
    fireEvent.click(screen.getByLabelText('cp-back'));
    await waitFor(() => {
      expectPreviewClosed();
    });
  });

  it('过期 onPreview 请求结果被忽略', async () => {
    let resolveFirst: (v: FileNode) => void = () => {};
    const onPreview = vi
      .fn()
      .mockReturnValueOnce(
        new Promise<FileNode>((resolve) => {
          resolveFirst = resolve;
        }),
      )
      .mockResolvedValueOnce({
        id: 'f2',
        name: 'winner.txt',
        content: 'win',
      });
    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f0', 'race.txt')]}
          onPreview={onPreview}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('race.txt'));
    fireEvent.click(screen.getByText('race.txt'));
    await act(async () => {
      resolveFirst({ id: 'f1', name: 'stale.txt', content: 'old' });
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(screen.getByText('winner.txt')).toBeInTheDocument();
    });
  });

  it('handleBack：onBack 抛错仍返回；返回 false 保持预览', async () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f1', 'back.txt')]}
          onPreview={vi.fn()}
          onBack={vi.fn().mockRejectedValue(new Error('back err'))}
        />
      </TestWrapper>,
    );
    await openPreviewFor('back.txt');
    await waitFor(() => {
      expectPreviewOpen();
    });
    clickBackToList();
    await waitFor(() => {
      expectPreviewClosed();
    });

    const onBackFalse = vi.fn().mockResolvedValue(false);
    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f2', 'keep.txt')]}
          onPreview={vi.fn()}
          onBack={onBackFalse}
        />
      </TestWrapper>,
    );
    await openPreviewFor('keep.txt');
    await waitFor(() => {
      expectPreviewOpen();
    });
    clickBackToList();
    await waitFor(() => expect(onBackFalse).toHaveBeenCalled());
    expectPreviewOpen();
  });

  it('预览页 onShare origin=preview；无 onShare 走默认分享', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    const onShare = vi.fn();
    const actionRef = React.createRef<any>();
    const shareFile = {
      id: 'f1',
      name: 'share.txt',
      content: 'x',
      url: 'https://example.com/s.txt',
      canShare: true,
      canPreview: true,
    };
    const { unmount: uShare1 } = render(
      <TestWrapper>
        <FileComponent
          actionRef={actionRef}
          nodes={[shareFile]}
          onPreview={vi.fn()}
          onShare={onShare}
        />
      </TestWrapper>,
    );
    await act(async () => {
      actionRef.current?.openPreview(shareFile);
    });
    await waitFor(() => expectPreviewOpen());
    await waitFor(() => {
      expect(previewActionButtons().length).toBeGreaterThan(0);
    });
    fireEvent.click(previewActionButtons()[0]!);
    expect(onShare).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'share.txt' }),
      expect.objectContaining({ origin: 'preview' }),
    );
    uShare1();

    const actionRef2 = React.createRef<any>();
    const defShareFile = {
      id: 'f2',
      name: 'def-share.txt',
      content: 'y',
      url: 'https://example.com/d.txt',
      canShare: true,
      canPreview: true,
    };
    const { unmount } = render(
      <TestWrapper>
        <FileComponent
          actionRef={actionRef2}
          nodes={[defShareFile]}
          onPreview={vi.fn()}
        />
      </TestWrapper>,
    );
    await act(async () => {
      actionRef2.current?.openPreview(defShareFile);
    });
    await waitFor(() => expectPreviewOpen());
    await waitFor(() => {
      expect(previewActionButtons().length).toBeGreaterThan(0);
    });
    fireEvent.click(previewActionButtons()[0]!);
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
    unmount();
  });

  it('预览内 onDownload 优先于默认下载', async () => {
    const onDownload = vi.fn();
    const actionRef = React.createRef<any>();
    const file = previewableFile('f1', 'dl.txt', 'content');
    render(
      <TestWrapper>
        <FileComponent
          actionRef={actionRef}
          nodes={[file]}
          onPreview={vi.fn()}
          onDownload={onDownload}
        />
      </TestWrapper>,
    );
    await act(async () => {
      actionRef.current?.openPreview(file);
    });
    await waitFor(() => expectPreviewOpen());
    await waitFor(() => {
      expect(previewActionButtons().length).toBeGreaterThan(0);
    });
    fireEvent.click(previewActionButtons().item(previewActionButtons().length - 1)!);
    expect(onDownload).toHaveBeenCalled();
  });

  it('customActions 函数与 ReactNode 分支', async () => {
    const { unmount: u1 } = render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f1', 'act.txt')]}
          onPreview={vi.fn()}
          customActions={(file) => (
            <div data-testid="fn-actions">{file.name}</div>
          )}
        />
      </TestWrapper>,
    );
    await openPreviewFor('act.txt');
    expect(screen.getByTestId('fn-actions')).toHaveTextContent('act.txt');
    u1();

    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f2', 'static.txt')]}
          onPreview={vi.fn()}
          customActions={<div data-testid="static-actions">S</div>}
        />
      </TestWrapper>,
    );
    await openPreviewFor('static.txt');
    expect(screen.getByTestId('static-actions')).toBeInTheDocument();
  });

  it('resetKey 传入时 mount effect 重置预览', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f1', 'reset.txt')]}
          onPreview={vi.fn()}
          resetKey={0}
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('file-component')).toBeInTheDocument();
  });

  it('resetKey undefined 时不误触发返回列表', async () => {
    const file = previewableFile('f1', 'stay.txt');
    const { rerender } = render(
      <TestWrapper>
        <FileComponent nodes={[file]} onPreview={vi.fn()} />
      </TestWrapper>,
    );
    await openPreviewFor('stay.txt');
    rerender(
      <TestWrapper>
        <FileComponent nodes={[file]} onPreview={vi.fn()} />
      </TestWrapper>,
    );
    expectPreviewOpen();
  });

  it('nodes 同步 previewFile：id 匹配与 name+type 匹配', async () => {
    const initial: FileNode[] = [
      { name: 'match.txt', type: 'plainText', content: 'v1', canPreview: true },
    ];
    const updated: FileNode[] = [
      { name: 'match.txt', type: 'plainText', content: 'v2', canPreview: true },
    ];
    const { rerender } = render(
      <TestWrapper>
        <FileComponent nodes={initial} onPreview={vi.fn()} />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('match.txt'));
    await waitFor(() => {
      expectPreviewOpen();
    });
    rerender(
      <TestWrapper>
        <FileComponent nodes={updated} onPreview={vi.fn()} />
      </TestWrapper>,
    );
    expectPreviewOpen();

    const nestedInitial: GroupNode[] = [
      {
        id: 'g1',
        name: 'G',
        type: 'plainText',
        children: [
          { id: 'c1', name: 'nested.txt', content: 'n1', canPreview: true },
        ],
      },
    ];
    const nestedUpdated: GroupNode[] = [
      {
        id: 'g1',
        name: 'G',
        type: 'plainText',
        children: [
          { id: 'c1', name: 'nested.txt', content: 'n2', canPreview: true },
        ],
      },
    ];
    const { rerender: rr2, unmount } = render(
      <TestWrapper>
        <FileComponent nodes={nestedInitial} onPreview={vi.fn()} />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('nested.txt'));
    await waitFor(() => {
      expectPreviewOpen();
    });
    rr2(
      <TestWrapper>
        <FileComponent nodes={nestedUpdated} onPreview={vi.fn()} />
      </TestWrapper>,
    );
    expectPreviewOpen();
    unmount();
  });

  it('onGroupToggle 与 onToggleGroup 互斥分支', async () => {
    const onGroupToggle = vi.fn();
    const nodes: GroupNode[] = [
      {
        id: 'g1',
        name: '组A',
        type: 'plainText',
        children: [previewableFile('c1', 'child.txt')],
      },
    ];
    const { unmount: u1 } = render(
      <TestWrapper>
        <FileComponent nodes={nodes} onGroupToggle={onGroupToggle} />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('组A'));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    await waitFor(() => expect(onGroupToggle).toHaveBeenCalled());
    u1();

    const onToggleGroup = vi.fn();
    render(
      <TestWrapper>
        <FileComponent nodes={nodes} onToggleGroup={onToggleGroup} />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('组A'));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    await waitFor(() => expect(onToggleGroup).toHaveBeenCalled());
  });

  it('fileTreeSwitch 受控/非受控视图与占位符链', async () => {
    const onViewChange = vi.fn();
    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f1', 'list.txt')]}
          showSearch
          keyword=""
          fileTreeSwitch={{
            view: 'list',
            onViewChange,
            listLabel: '列表',
            treeLabel: '树',
            treeProps: {
              treeData: [{ key: 'k1', name: 'tree.txt', isLeaf: true }],
              onLoadChildren: vi.fn().mockResolvedValue([]),
            },
          }}
        />
      </TestWrapper>,
    );
    expect(screen.getByLabelText('列表')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('树'));
    expect(onViewChange).toHaveBeenCalledWith('tree');

    render(
      <TestWrapper>
        <FileComponent
          nodes={[]}
          showSearch
          searchPlaceholderTree="树专用"
          fileTreeSwitch={{
            defaultView: 'tree',
            treeProps: {
              treeData: [],
              onLoadChildren: vi.fn().mockResolvedValue([]),
            },
          }}
        />
      </TestWrapper>,
    );
    expect(screen.getByPlaceholderText('树专用')).toBeInTheDocument();
  });

  it('树视图 keyword 过滤传入 FileTree', () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[previewableFile('f1', 'list-only.txt')]}
          showSearch
          keyword="filter-me"
          fileTreeSwitch={{
            view: 'tree',
            treeProps: {
              treeData: [{ key: 'k1', name: 'tree.txt', isLeaf: true }],
              onLoadChildren: vi.fn().mockResolvedValue([]),
            },
          }}
        />
      </TestWrapper>,
    );
    expect(screen.getByTestId('file-tree-embed')).toBeInTheDocument();
  });

  it('无 onPreview 时图片走 Image 预览并 onVisibleChange 关闭', async () => {
    render(
      <TestWrapper>
        <FileComponent
          nodes={[
            {
              id: 'img1',
              name: 'pic.png',
              type: 'image',
              url: 'https://example.com/pic.png',
              canPreview: true,
            },
          ]}
        />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByText('pic.png'));
    await waitFor(() => {
      expect(screen.getByTestId('close-image-preview')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('close-image-preview'));
    await waitFor(() => {
      expect(screen.queryByTestId('close-image-preview')).not.toBeInTheDocument();
    });
  });

  it('actionRef：openPreview/backToList/updatePreviewHeader 与卸载清理', async () => {
    const actionRef = React.createRef<any>();
    const { unmount } = render(
      <TestWrapper>
        <FileComponent
          actionRef={actionRef}
          nodes={[previewableFile('f1', 'ref.txt')]}
          onPreview={vi.fn()}
        />
      </TestWrapper>,
    );
    await act(async () => {
      actionRef.current?.openPreview(previewableFile('f1', 'ref.txt'));
    });
    await waitFor(() => {
      expectPreviewOpen();
    });
    act(() => {
      actionRef.current?.updatePreviewHeader({ name: 'renamed.txt' });
    });
    await waitFor(() => {
      expect(screen.getByText('renamed.txt')).toBeInTheDocument();
    });
    act(() => actionRef.current?.backToList());
    await waitFor(() => {
      expectPreviewClosed();
    });
    unmount();
    expect(actionRef.current).toBeNull();
  });

  it('ensureNodeWithStableId：无 id 节点 WeakMap 缓存复用', () => {
    const node: FileNode = {
      name: 'no-id.txt',
      content: 'x',
      canPreview: true,
    } as FileNode;
    const { rerender } = render(
      <TestWrapper>
        <FileComponent nodes={[node]} bindDomId onPreview={vi.fn()} />
      </TestWrapper>,
    );
    const firstId = screen
      .getByRole('button', { name: /no-id\.txt/ })
      .getAttribute('id');
    expect(firstId).toBeTruthy();
    rerender(
      <TestWrapper>
        <FileComponent nodes={[node]} bindDomId onPreview={vi.fn()} />
      </TestWrapper>,
    );
    expect(
      screen.getByRole('button', { name: /no-id\.txt/ }).getAttribute('id'),
    ).toBe(firstId);
  });
});
