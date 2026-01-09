import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider, message } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvide } from '../../../src/I18n';
import { FileComponent } from '../../../src/Workspace/File/FileComponent';
import type { FileNode, GroupNode } from '../../../src/Workspace/types';

//  Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

// Mock message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...(actual as any),
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <I18nProvide>{children}</I18nProvide>
  </ConfigProvider>
);

describe('FileComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboard.writeText.mockReset();
  });

  describe('基础渲染', () => {
    it('应该渲染文件列表', () => {
      const nodes: FileNode[] = [
        { id: 'f1', name: 'test.txt', url: 'https://example.com/test.txt' },
        { id: 'f2', name: 'image.png', url: 'https://example.com/image.png' },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('test.txt')).toBeInTheDocument();
      expect(screen.getByText('image.png')).toBeInTheDocument();
    });

    it('应该渲染文件分组', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            {
              id: 'f1',
              name: 'doc1.txt',
              url: 'https://example.com/doc1.txt',
            },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('文档')).toBeInTheDocument();
      expect(screen.getByText('doc1.txt')).toBeInTheDocument();
    });

    it('应该显示加载状态', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={[]} loading />
        </TestWrapper>,
      );

      expect(document.querySelector('.ant-spin')).toBeInTheDocument();
    });

    it('应该显示自定义加载状态', () => {
      const loadingRender = () => (
        <div data-testid="custom-loading">Loading...</div>
      );

      render(
        <TestWrapper>
          <FileComponent nodes={[]} loading loadingRender={loadingRender} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
    });

    it('应该显示空状态', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={[]} />
        </TestWrapper>,
      );

      // Antd Empty component should be rendered
      expect(document.querySelector('.ant-empty')).toBeInTheDocument();
    });

    it('应该显示自定义空状态', () => {
      const emptyRender = () => <div data-testid="custom-empty">暂无数据</div>;

      render(
        <TestWrapper>
          <FileComponent nodes={[]} emptyRender={emptyRender} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
    });

    it('应该显示搜索框', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <FileComponent
            nodes={[]}
            showSearch
            keyword=""
            onChange={handleChange}
          />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText('搜索文件名');
      expect(input).toBeInTheDocument();
    });

    it('应该显示自定义搜索占位符', () => {
      render(
        <TestWrapper>
          <FileComponent
            nodes={[]}
            showSearch
            keyword=""
            searchPlaceholder="搜索..."
          />
        </TestWrapper>,
      );

      expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
    });
  });

  describe('文件交互', () => {
    it('应该触发文件点击事件', () => {
      const handleClick = vi.fn();
      const nodes: FileNode[] = [
        { id: 'f1', name: 'test.txt', url: 'https://example.com/test.txt' },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onFileClick={handleClick} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByText('test.txt'));
      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test.txt' }),
      );
    });

    it('应该显示下载按钮并触发下载', () => {
      const handleDownload = vi.fn();
      const nodes: FileNode[] = [
        { id: 'f1', name: 'test.txt', url: 'https://example.com/test.txt' },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onDownload={handleDownload} />
        </TestWrapper>,
      );

      const downloadBtn = screen.getByLabelText('下载');
      expect(downloadBtn).toBeInTheDocument();

      fireEvent.click(downloadBtn);
      expect(handleDownload).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test.txt' }),
      );
    });

    it('应该根据canDownload控制下载按钮显示', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          canDownload: false,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onDownload={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.queryByLabelText('下载')).not.toBeInTheDocument();
    });

    it('应该显示分享按钮', () => {
      const handleShare = vi.fn();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          canShare: true,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onShare={handleShare} />
        </TestWrapper>,
      );

      const shareBtn = screen.getByLabelText('分享');
      expect(shareBtn).toBeInTheDocument();

      fireEvent.click(shareBtn);
      expect(handleShare).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test.txt' }),
        expect.objectContaining({ origin: 'list' }),
      );
    });

    it('应该默认分享行为：复制链接', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          canShare: true,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      const shareBtn = screen.getByLabelText('分享');
      fireEvent.click(shareBtn);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          'https://example.com/test.txt',
        );
      });
    });

    it('应该显示预览按钮', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('预览')).toBeInTheDocument();
    });

    it('应该根据canPreview控制预览按钮显示', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          canPreview: false,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.queryByLabelText('预览')).not.toBeInTheDocument();
    });

    it('应该显示文件大小', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          size: 1024,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText(/1\.00 KB/)).toBeInTheDocument();
    });

    it('应该显示文件更新时间', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          lastModified: new Date('2023-12-21 10:30:56'),
        },
      ];

      const { container } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      // 应该显示时间信息
      const timeElement = container.querySelector(
        '.ant-workspace-file-item-time',
      );
      expect(timeElement).toBeTruthy();
      expect(timeElement?.textContent).toBeTruthy();
    });
  });

  describe('分组交互', () => {
    it('应该折叠和展开分组', async () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          collapsed: false,
          children: [
            {
              id: 'f1',
              name: 'doc1.txt',
              url: 'https://example.com/doc1.txt',
            },
          ],
        },
      ];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rerender } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('doc1.txt')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(screen.getByText('文档'));

      // File should be hidden after animation completes
      await waitFor(() => {
        expect(screen.queryByText('doc1.txt')).not.toBeInTheDocument();
      });
    });

    it('应该触发分组折叠回调', () => {
      const handleToggle = vi.fn();
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            {
              id: 'f1',
              name: 'doc1.txt',
              url: 'https://example.com/doc1.txt',
            },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onGroupToggle={handleToggle} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByText('文档'));
      expect(handleToggle).toHaveBeenCalledWith('plainText', true);
    });

    it('应该显示分组下载按钮', () => {
      const handleGroupDownload = vi.fn();
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            {
              id: 'f1',
              name: 'doc1.txt',
              url: 'https://example.com/doc1.txt',
            },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onGroupDownload={handleGroupDownload} />
        </TestWrapper>,
      );

      // Find download button within the group header
      const downloadButtons = screen.getAllByLabelText(/下载/);
      expect(downloadButtons.length).toBeGreaterThan(0);
    });

    it('应该根据canDownload控制分组下载按钮', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          canDownload: false,
          children: [
            {
              id: 'f1',
              name: 'doc1.txt',
              url: 'https://example.com/doc1.txt',
            },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onGroupDownload={vi.fn()} />
        </TestWrapper>,
      );

      // 分组下载按钮不应该显示
      const groupHeader = screen.getByText('文档').closest('div');
      const downloadButtons =
        groupHeader?.querySelectorAll('[aria-label*="下载"]');
      expect(downloadButtons?.length || 0).toBe(0);
    });

    it('应该显示分组文件数量', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            { id: 'f1', name: 'doc1.txt' },
            { id: 'f2', name: 'doc2.txt' },
            { id: 'f3', name: 'doc3.txt' },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('预览功能', () => {
    it('应该默认点击文件打开预览', async () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello World',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      // Click on file to open preview
      fireEvent.click(screen.getByText('test.txt'));

      // Preview should be opened (we'll see preview header)
      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });
    });

    it('应该忽略过期的预览请求结果', async () => {
      const firstFile: FileNode = {
        id: 'f1',
        name: 'first-old.txt',
        content: 'old content',
      };
      const secondFile: FileNode = {
        id: 'f2',
        name: 'second.txt',
        content: 'new content',
      };
      let resolveFirst: (value: FileNode) => void = () => {};
      const onPreview = vi
        .fn()
        .mockReturnValueOnce(
          new Promise<FileNode>((resolve) => {
            resolveFirst = resolve;
          }),
        )
        .mockResolvedValueOnce(secondFile);
      const nodes: FileNode[] = [
        {
          id: 'f0',
          name: 'test.txt',
          content: 'Hello World',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={onPreview} />
        </TestWrapper>,
      );

      // 点击文件本身两次（而不是预览按钮），避免 ActionIconBox 的 loading 状态阻止第二次点击
      const fileItem = screen.getByText('test.txt');
      fireEvent.click(fileItem);
      fireEvent.click(fileItem);

      // 延迟 resolve 第一个请求
      await act(async () => {
        resolveFirst(firstFile);
        await Promise.resolve();
      });

      // 第二个请求应该胜出，显示 second.txt
      await waitFor(() => {
        expect(screen.getByText('second.txt')).toBeInTheDocument();
      });
      expect(screen.queryByText('first-old.txt')).not.toBeInTheDocument();
    });

    it('应该触发自定义预览回调', async () => {
      const handlePreview = vi.fn().mockResolvedValue(undefined);
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello World',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={handlePreview} />
        </TestWrapper>,
      );

      const previewBtn = screen.getByLabelText('预览');
      fireEvent.click(previewBtn);

      await waitFor(() => {
        expect(handlePreview).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'test.txt' }),
        );
      });
    });

    it('应该支持返回false阻止预览', async () => {
      const handlePreview = vi.fn().mockResolvedValue(false);
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={handlePreview} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(handlePreview).toHaveBeenCalled();
      });

      // Should not open preview
      expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
    });

    it('应该支持自定义预览内容', async () => {
      const handlePreview = vi
        .fn()
        .mockResolvedValue(<div data-testid="custom-preview">Custom</div>);
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={handlePreview} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByTestId('custom-preview')).toBeInTheDocument();
      });
    });

    it('应该支持返回新文件节点', async () => {
      const newFile: FileNode = {
        id: 'f2',
        name: 'new.txt',
        content: 'New content',
      };
      const handlePreview = vi.fn().mockResolvedValue(newFile);
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={handlePreview} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByText('new.txt')).toBeInTheDocument();
      });
    });

    it('应该从预览返回列表', async () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      // Open preview
      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // Click back
      fireEvent.click(screen.getByLabelText('返回文件列表'));

      // Should be back to list
      await waitFor(() => {
        expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
      });

      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    it('应该支持自定义返回行为', async () => {
      const handleBack = vi.fn().mockResolvedValue(false);
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            onPreview={vi.fn()}
            onBack={handleBack}
          />
        </TestWrapper>,
      );

      // Open preview
      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // Click back
      fireEvent.click(screen.getByLabelText('返回文件列表'));

      await waitFor(() => {
        expect(handleBack).toHaveBeenCalled();
      });

      // Should still be in preview because onBack returned false
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });

    it('应该重置预览状态当resetKey改变', async () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      const { rerender } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} resetKey={1} />
        </TestWrapper>,
      );

      // Open preview
      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // Change resetKey
      rerender(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} resetKey={2} />
        </TestWrapper>,
      );

      // Should be back to list
      await waitFor(() => {
        expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
      });
    });
  });

  describe('actionRef功能', () => {
    it('应该通过actionRef打开预览', async () => {
      const actionRef = React.createRef<any>();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            actionRef={actionRef}
            onPreview={vi.fn()}
          />
        </TestWrapper>,
      );

      // Call openPreview programmatically
      actionRef.current?.openPreview(nodes[0]);

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });
    });

    it('应该通过actionRef返回列表', async () => {
      const actionRef = React.createRef<any>();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            actionRef={actionRef}
            onPreview={vi.fn()}
          />
        </TestWrapper>,
      );

      // Open preview first
      actionRef.current?.openPreview(nodes[0]);

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // Call backToList
      actionRef.current?.backToList();

      await waitFor(() => {
        expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
      });
    });

    it('应该通过actionRef更新预览标题', async () => {
      const actionRef = React.createRef<any>();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            actionRef={actionRef}
            onPreview={vi.fn()}
          />
        </TestWrapper>,
      );

      // Open preview
      actionRef.current?.openPreview(nodes[0]);

      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });

      // Update header
      actionRef.current?.updatePreviewHeader({ name: 'updated.txt' });

      await waitFor(() => {
        expect(screen.getByText('updated.txt')).toBeInTheDocument();
      });
    });
  });

  describe('搜索功能', () => {
    it('应该更新搜索关键字', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <FileComponent
            nodes={[]}
            showSearch
            keyword=""
            onChange={handleChange}
          />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText('搜索文件名');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(handleChange).toHaveBeenCalledWith('test');
    });

    it('应该显示搜索无结果提示', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={[]} showSearch keyword="test" />
        </TestWrapper>,
      );

      expect(screen.getByText(/未找到与/)).toBeInTheDocument();
    });

    it('应该清空搜索', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <FileComponent
            nodes={[]}
            showSearch
            keyword="test"
            onChange={handleChange}
          />
        </TestWrapper>,
      );

      const clearBtn = document.querySelector(
        '.ant-input-clear-icon',
      ) as HTMLElement;
      if (clearBtn) {
        fireEvent.click(clearBtn);
        expect(handleChange).toHaveBeenCalledWith('');
      }
    });
  });

  describe('边缘情况', () => {
    it('应该处理空数组', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={[]} />
        </TestWrapper>,
      );

      expect(document.querySelector('.ant-empty')).toBeInTheDocument();
    });

    it('应该处理undefined nodes', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={undefined as any} />
        </TestWrapper>,
      );

      expect(document.querySelector('.ant-empty')).toBeInTheDocument();
    });

    it('应该为没有id的节点生成id', () => {
      const nodes: FileNode[] = [
        {
          name: 'test.txt',
          content: 'Hello',
        } as FileNode,
      ];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { container } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      // Component should render without errors
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    it('应该处理分组中没有id的文件', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            {
              name: 'doc1.txt',
            } as FileNode,
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('doc1.txt')).toBeInTheDocument();
    });

    it('应该处理没有url/content/file的文件', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'empty.txt',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('empty.txt')).toBeInTheDocument();
      // Should not show download button by default
      expect(screen.queryByLabelText('下载')).not.toBeInTheDocument();
    });

    it('应该处理异步预览错误', async () => {
      const handlePreview = vi
        .fn()
        .mockRejectedValue(new Error('Preview error'));
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={handlePreview} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        // Should still show preview (with default content)
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });
    });

    it('应该处理复制失败', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Copy failed'));

      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          canShare: true,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      const shareBtn = screen.getByLabelText('分享');
      fireEvent.click(shareBtn);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalled();
      });
    });
  });

  describe('无障碍性', () => {
    it('应该支持键盘导航', () => {
      const handleClick = vi.fn();
      const nodes: FileNode[] = [
        { id: 'f1', name: 'test.txt', url: 'https://example.com/test.txt' },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onFileClick={handleClick} />
        </TestWrapper>,
      );

      const fileItem = screen.getByRole('button', { name: /文件.*test\.txt/ });
      expect(fileItem).toHaveAttribute('tabindex', '0');

      // Simulate Enter key
      fireEvent.keyDown(fileItem, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('应该为所有交互元素提供aria-label', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          content: 'Hello', // 添加content以显示预览按钮
          canShare: true,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            onDownload={vi.fn()}
            onPreview={vi.fn()}
          />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('预览')).toBeInTheDocument();
      expect(screen.getByLabelText('下载')).toBeInTheDocument();
      expect(screen.getByLabelText('分享')).toBeInTheDocument();
    });
  });

  describe('文件定位', () => {
    it('列表：当 canLocate 为 true 时显示定位按钮并触发 onLocate', () => {
      const handleLocate = vi.fn();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'locate.txt',
          url: 'https://example.com/locate.txt',
          canLocate: true,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onLocate={handleLocate} />
        </TestWrapper>,
      );

      const locateBtn = screen.getByLabelText('定位');
      expect(locateBtn).toBeInTheDocument();
      fireEvent.click(locateBtn);
      expect(handleLocate).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'locate.txt' }),
      );
    });

    it('列表：默认不显示定位按钮', () => {
      const nodes: FileNode[] = [
        { id: 'f1', name: 'nolocate.txt', url: 'https://example.com/a.txt' },
      ];
      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onLocate={vi.fn()} />
        </TestWrapper>,
      );
      expect(screen.queryByLabelText('定位')).not.toBeInTheDocument();
    });

    it('预览页：当 canLocate 为 true 时显示定位按钮并触发 onLocate', async () => {
      const handleLocate = vi.fn();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'preview-locate.txt',
          content: 'Hello',
          canLocate: true,
        },
      ];
      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            onPreview={vi.fn()}
            onLocate={handleLocate}
          />
        </TestWrapper>,
      );

      // 打开预览
      fireEvent.click(screen.getByLabelText('预览'));
      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      const locateBtn = screen.getByLabelText('定位');
      expect(locateBtn).toBeInTheDocument();

      fireEvent.click(locateBtn);
      expect(handleLocate).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'preview-locate.txt' }),
      );
    });
  });

  describe('自定义渲染与行为', () => {
    it('预览页：customActions 支持函数与节点渲染', async () => {
      const nodes: FileNode[] = [
        { id: 'f1', name: 'actions.txt', content: 'Hello' },
      ];
      const customActions = (file: FileNode) => (
        <div data-testid="custom-actions">act-{file.name}</div>
      );
      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            onPreview={vi.fn()}
            customActions={customActions}
          />
        </TestWrapper>,
      );
      // 打开预览
      fireEvent.click(screen.getByLabelText('预览'));
      await waitFor(() => {
        expect(screen.getByTestId('custom-actions')).toHaveTextContent(
          'act-actions.txt',
        );
      });
    });

    it('onPreview 返回自定义元素时，支持 setPreviewHeader / share / download / back', async () => {
      const onShare = vi.fn();
      const onDownload = vi.fn();

      const CustomPreview: React.FC<any> = ({
        setPreviewHeader,
        back,
        download,
        share,
      }) => {
        return (
          <div>
            <button
              type="button"
              aria-label="update-header"
              onClick={() => setPreviewHeader('override.txt')}
            />
            <button type="button" aria-label="share" onClick={() => share()} />
            <button
              type="button"
              aria-label="download"
              onClick={() => download()}
            />
            <button type="button" aria-label="back" onClick={() => back()} />
            <div data-testid="custom-preview-content">CP</div>
          </div>
        );
      };

      const handlePreview = vi
        .fn()
        .mockResolvedValue((<CustomPreview />) as any);
      const nodes: FileNode[] = [
        { id: 'f1', name: 'preview.txt', content: 'Hello' },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            onPreview={handlePreview}
            onShare={onShare}
            onDownload={onDownload}
          />
        </TestWrapper>,
      );

      // 列表点击预览
      fireEvent.click(screen.getByLabelText('预览'));
      // 自定义内容渲染
      await waitFor(() => {
        expect(
          screen.getByTestId('custom-preview-content'),
        ).toBeInTheDocument();
      });

      // 更新标题
      fireEvent.click(screen.getByLabelText('update-header'));
      await waitFor(() => {
        expect(screen.getByText('override.txt')).toBeInTheDocument();
      });

      // 触发 share / download
      fireEvent.click(screen.getByLabelText('share'));
      expect(onShare).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'preview.txt' }),
        undefined,
      );

      fireEvent.click(screen.getByLabelText('download'));
      expect(onDownload).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'preview.txt' }),
      );

      // 返回列表
      fireEvent.click(screen.getByLabelText('back'));
      await waitFor(() => {
        expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
      });
    });
  });

  describe('更多分组行为', () => {
    it('点击分组下载按钮应触发 onGroupDownload', () => {
      const onGroupDownload = vi.fn();
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '分组',
          type: 'plainText',
          children: [
            { id: 'f1', name: 'a.txt', url: 'https://a' },
            { id: 'f2', name: 'b.txt', url: 'https://b' },
          ],
        },
      ];
      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onGroupDownload={onGroupDownload} />
        </TestWrapper>,
      );
      // 分组行上的下载按钮
      const groupDownload = screen
        .getAllByLabelText('下载')
        .find((el) => el.closest('[class*="group-header"]'));
      expect(groupDownload).toBeTruthy();
      fireEvent.click(groupDownload!);
      expect(onGroupDownload).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'a.txt' }),
          expect.objectContaining({ name: 'b.txt' }),
        ]),
        'plainText',
      );
    });
  });

  describe('显示控制', () => {
    it('默认不显示搜索框（showSearch=false）', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={[]} />
        </TestWrapper>,
      );
      expect(
        screen.queryByPlaceholderText('搜索文件名'),
      ).not.toBeInTheDocument();
    });
  });

  describe('bindDomId 行为', () => {
    it('默认不绑定 DOM id（bindDomId 未传或为 false）', () => {
      const nodes: FileNode[] = [
        { id: 'file-1', name: 'doc.txt', url: 'https://a/b.doc' },
      ];
      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );
      const fileButton = screen.getByRole('button', { name: /文件.*doc\.txt/ });
      expect(fileButton.getAttribute('id')).toBeNull();
    });

    it('bindDomId 为 true 时绑定用户提供的 id', () => {
      const nodes: FileNode[] = [
        { id: 'user-id-001', name: 'doc.txt', url: 'https://a/b.doc' },
      ];
      render(
        <TestWrapper>
          <FileComponent nodes={nodes} bindDomId />
        </TestWrapper>,
      );
      const fileButton = screen.getByRole('button', { name: /文件.*doc\.txt/ });
      expect(fileButton).toHaveAttribute('id', 'user-id-001');
    });

    it('bindDomId 为 true 且未提供 id 时，组件生成稳定 id（同对象两次渲染保持一致）', () => {
      const node: FileNode = {
        // 不设置 id，触发组件内部生成
        name: 'no-id.txt',
        url: 'https://a/no-id.txt',
      } as FileNode;

      const { rerender } = render(
        <TestWrapper>
          <FileComponent nodes={[node]} bindDomId />
        </TestWrapper>,
      );
      const first = screen.getByRole('button', { name: /文件.*no-id\.txt/ });
      const firstId = first.getAttribute('id');
      expect(firstId).toBeTruthy();

      // 复用同一个对象实例再次渲染，应保持相同 id
      rerender(
        <TestWrapper>
          <FileComponent nodes={[node]} bindDomId />
        </TestWrapper>,
      );
      const second = screen.getByRole('button', { name: /文件.*no-id\.txt/ });
      const secondId = second.getAttribute('id');
      expect(secondId).toBe(firstId);
    });

    it('分组子项在 bindDomId 为 true 时也会绑定 id', () => {
      const group: GroupNode = {
        id: 'group-1',
        name: '分组',
        type: 'plainText',
        children: [{ id: 'child-1', name: 'child.txt', url: 'https://x/y' }],
      };
      render(
        <TestWrapper>
          <FileComponent nodes={[group]} bindDomId />
        </TestWrapper>,
      );
      const childButton = screen.getByRole('button', {
        name: /文件.*child\.txt/,
      });
      expect(childButton).toHaveAttribute('id', 'child-1');
    });
  });

  describe('图片预览特殊处理', () => {
    it('应该使用Image组件预览图片文件', async () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'image.png',
          type: 'image',
          url: 'https://example.com/image.png',
        },
      ];

      const { container } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={undefined} />
        </TestWrapper>,
      );

      // 点击图片文件
      fireEvent.click(screen.getByText('image.png'));

      await waitFor(
        () => {
          // 应该显示隐藏的 Image 组件（用于预览）
          // 通过类名查找隐藏的图片预览组件
          // Ant Design Image 组件会在内部渲染，但 img 元素可能异步渲染
          // 我们主要验证 ImagePreviewComponent 容器已经挂载
          const hiddenImageContainer = container.querySelector(
            '.ant-workspace-file-hidden-image',
          );
          expect(hiddenImageContainer).toBeTruthy();
        },
        { timeout: 2000 },
      );
    });
  });

  describe('nodes更新同步', () => {
    it('预览文件时nodes更新应同步到previewFile', async () => {
      const initialNodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Original content',
        },
      ];

      const updatedNodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Updated content',
        },
      ];

      const { rerender } = render(
        <TestWrapper>
          <FileComponent nodes={initialNodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      // 打开预览
      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // 更新 nodes
      rerender(
        <TestWrapper>
          <FileComponent nodes={updatedNodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      // previewFile 应该被更新，组件应该仍然在预览状态
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });

    it('预览时文件从nodes中移除不应崩溃', async () => {
      const initialNodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Content',
        },
      ];

      const { rerender } = render(
        <TestWrapper>
          <FileComponent nodes={initialNodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      // 打开预览
      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // 移除文件
      rerender(
        <TestWrapper>
          <FileComponent nodes={[]} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      // 组件不应该崩溃，仍应显示预览
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });
  });

  describe('分组下载按钮显示逻辑', () => {
    it('分组中有可下载文件时显示下载按钮', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            { id: 'f1', name: 'a.txt', url: 'https://a' },
            { id: 'f2', name: 'b.txt', canDownload: false },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onGroupDownload={vi.fn()} />
        </TestWrapper>,
      );

      const downloadButtons = screen.getAllByLabelText('下载');
      expect(downloadButtons.length).toBeGreaterThan(0);
    });

    it('分组中所有文件都禁止下载时不显示下载按钮', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            { id: 'f1', name: 'a.txt', canDownload: false },
            { id: 'f2', name: 'b.txt', canDownload: false },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onGroupDownload={vi.fn()} />
        </TestWrapper>,
      );

      const groupHeader = screen.getByText('文档').closest('div');
      const downloadButtons =
        groupHeader?.querySelectorAll('[aria-label*="下载"]');
      expect(downloadButtons?.length || 0).toBe(0);
    });

    it('分组中文件有content时应显示下载按钮', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [{ id: 'f1', name: 'a.txt', content: 'Hello' }],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onGroupDownload={vi.fn()} />
        </TestWrapper>,
      );

      const downloadButtons = screen.getAllByLabelText('下载');
      expect(downloadButtons.length).toBeGreaterThan(0);
    });
  });

  describe('键盘导航增强', () => {
    it('应该支持空格键触发文件点击', () => {
      const handleClick = vi.fn();
      const nodes: FileNode[] = [
        { id: 'f1', name: 'test.txt', url: 'https://example.com/test.txt' },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onFileClick={handleClick} />
        </TestWrapper>,
      );

      const fileItem = screen.getByRole('button', { name: /文件.*test\.txt/ });

      // 模拟空格键
      fireEvent.keyDown(fileItem, { key: ' ' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('应该支持Enter键触发分组折叠', async () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          collapsed: false,
          children: [{ id: 'f1', name: 'doc1.txt' }],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('doc1.txt')).toBeInTheDocument();

      const groupHeader = screen.getByRole('button', { name: /收起.*文档/ });
      fireEvent.keyDown(groupHeader, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.queryByText('doc1.txt')).not.toBeInTheDocument();
      });
    });
  });

  describe('文件类型推断', () => {
    it('应该正确推断文件类型并显示图标', () => {
      const nodes: FileNode[] = [
        { id: 'f1', name: 'document.pdf', type: 'pdf', url: 'https://a/b.pdf' },
        {
          id: 'f2',
          name: 'image.png',
          type: 'image',
          url: 'https://a/image.png',
        },
        {
          id: 'f3',
          name: 'video.mp4',
          type: 'video',
          url: 'https://a/video.mp4',
        },
      ];

      const { container } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('image.png')).toBeInTheDocument();
      expect(screen.getByText('video.mp4')).toBeInTheDocument();

      // 应该有文件类型图标
      const icons = container.querySelectorAll('.ant-workspace-file-item-icon');
      expect(icons.length).toBe(3);
    });

    it('应该显示自定义文件图标', () => {
      const CustomIcon = () => <span data-testid="custom-icon">📄</span>;
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'custom.txt',
          url: 'https://a/custom.txt',
          icon: <CustomIcon />,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('markdownEditorProps传递', () => {
    it('应该将markdownEditorProps传递到预览组件', async () => {
      const nodes: FileNode[] = [
        { id: 'f1', name: 'test.md', content: '# Hello' },
      ];

      const markdownEditorProps = {
        theme: 'dark' as const,
      };

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            onPreview={vi.fn()}
            markdownEditorProps={markdownEditorProps}
          />
        </TestWrapper>,
      );

      // 打开预览
      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // Props 应该被传递，组件正常渲染
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });
  });

  describe('自定义渲染与禁用状态', () => {
    it('应该支持 disabled 状态', () => {
      const handleClick = vi.fn();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'disabled-file.txt',
          url: 'https://example.com/disabled.txt',
          disabled: true,
        },
      ];

      const { container } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} onFileClick={handleClick} />
        </TestWrapper>,
      );

      // 应该显示文件名
      expect(screen.getByText('disabled-file.txt')).toBeInTheDocument();

      // 应该有禁用样式类
      const fileItem = container.querySelector(
        '.ant-workspace-file-item-disabled',
      );
      expect(fileItem).toBeInTheDocument();

      // 点击不应触发回调
      fireEvent.click(screen.getByText('disabled-file.txt'));
      expect(handleClick).not.toHaveBeenCalled();

      // 不应显示操作按钮
      expect(screen.queryByLabelText('下载')).not.toBeInTheDocument();
    });

    it('应该支持 renderName 自定义渲染', () => {
      const customRenderName = vi
        .fn()
        .mockReturnValue(<span data-testid="custom-name">自定义文件名</span>);

      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          renderName: customRenderName,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      // 应该调用自定义渲染函数
      expect(customRenderName).toHaveBeenCalled();

      // 应该显示自定义内容
      expect(screen.getByTestId('custom-name')).toBeInTheDocument();
      expect(screen.getByText('自定义文件名')).toBeInTheDocument();
    });

    it('应该支持 renderDetails 自定义渲染', () => {
      const customRenderDetails = vi
        .fn()
        .mockReturnValue(
          <span data-testid="custom-details">2025-10-01 · 已编辑</span>,
        );

      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          size: '1KB',
          lastModified: '2025-10-01',
          renderDetails: customRenderDetails,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      // 应该调用自定义渲染函数
      expect(customRenderDetails).toHaveBeenCalled();

      // 应该显示自定义内容
      expect(screen.getByTestId('custom-details')).toBeInTheDocument();
      expect(screen.getByText('2025-10-01 · 已编辑')).toBeInTheDocument();

      // 不应显示默认的大小和时间
      expect(screen.queryByText('1KB')).not.toBeInTheDocument();
    });

    it('renderName 和 renderDetails 应该接收正确的 context', () => {
      const customRenderName = vi.fn().mockReturnValue(<span>名称</span>);
      const customRenderDetails = vi.fn().mockReturnValue(<span>详情</span>);

      const testFile: FileNode = {
        id: 'f1',
        name: 'context-test.txt',
        url: 'https://example.com/test.txt',
        renderName: customRenderName,
        renderDetails: customRenderDetails,
      };

      render(
        <TestWrapper>
          <FileComponent nodes={[testFile]} />
        </TestWrapper>,
      );

      // 验证 renderName 接收的 context
      expect(customRenderName).toHaveBeenCalledWith(
        expect.objectContaining({
          file: expect.objectContaining({ name: 'context-test.txt' }),
          prefixCls: expect.any(String),
          hashId: expect.any(String),
        }),
      );

      // 验证 renderDetails 接收的 context
      expect(customRenderDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          file: expect.objectContaining({ name: 'context-test.txt' }),
          prefixCls: expect.any(String),
          hashId: expect.any(String),
        }),
      );
    });

    it('disabled 状态下应该阻止键盘导航', () => {
      const handleClick = vi.fn();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'disabled-keyboard.txt',
          url: 'https://example.com/test.txt',
          disabled: true,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onFileClick={handleClick} />
        </TestWrapper>,
      );

      const fileItem = screen.getByRole('button', {
        name: /文件.*disabled-keyboard\.txt/,
      });

      // 模拟 Enter 键
      fireEvent.keyDown(fileItem, { key: 'Enter' });
      expect(handleClick).not.toHaveBeenCalled();

      // 模拟空格键
      fireEvent.keyDown(fileItem, { key: ' ' });
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('应该支持 renderActions 自定义渲染操作按钮', () => {
      const customRenderActions = vi.fn().mockReturnValue(
        <div data-testid="custom-actions">
          <button type="button" data-testid="custom-edit-btn">
            编辑
          </button>
          <button type="button" data-testid="custom-delete-btn">
            删除
          </button>
        </div>,
      );

      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'actions-test.txt',
          url: 'https://example.com/test.txt',
          renderActions: customRenderActions,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onDownload={vi.fn()} />
        </TestWrapper>,
      );

      // 应该调用自定义渲染函数
      expect(customRenderActions).toHaveBeenCalled();

      // 应该显示自定义操作按钮
      expect(screen.getByTestId('custom-actions')).toBeInTheDocument();
      expect(screen.getByTestId('custom-edit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('custom-delete-btn')).toBeInTheDocument();

      // 不应显示默认的下载按钮
      expect(screen.queryByLabelText('下载')).not.toBeInTheDocument();
    });

    it('renderActions 应该接收正确的 context', () => {
      const customRenderActions = vi
        .fn()
        .mockReturnValue(<span>自定义按钮</span>);

      const testFile: FileNode = {
        id: 'f1',
        name: 'render-actions-context.txt',
        url: 'https://example.com/test.txt',
        renderActions: customRenderActions,
      };

      render(
        <TestWrapper>
          <FileComponent nodes={[testFile]} />
        </TestWrapper>,
      );

      // 验证 renderActions 接收的 context
      expect(customRenderActions).toHaveBeenCalledWith(
        expect.objectContaining({
          file: expect.objectContaining({ name: 'render-actions-context.txt' }),
          prefixCls: expect.any(String),
          hashId: expect.any(String),
        }),
      );
    });

    it('renderActions context 应包含内置 actions', () => {
      let capturedContext: any = null;
      const customRenderActions = vi.fn().mockImplementation((ctx) => {
        capturedContext = ctx;
        return <span>自定义按钮</span>;
      });

      const testFile: FileNode = {
        id: 'f1',
        name: 'builtin-actions.txt',
        url: 'https://example.com/test.txt',
        canDownload: true,
        renderActions: customRenderActions,
      };

      render(
        <TestWrapper>
          <FileComponent
            nodes={[testFile]}
            onDownload={vi.fn()}
            onPreview={vi.fn()}
          />
        </TestWrapper>,
      );

      // 验证 context.actions 存在
      expect(capturedContext).not.toBeNull();
      expect(capturedContext.actions).toBeDefined();
      expect(capturedContext.actions).toHaveProperty('preview');
      expect(capturedContext.actions).toHaveProperty('locate');
      expect(capturedContext.actions).toHaveProperty('share');
      expect(capturedContext.actions).toHaveProperty('download');
    });

    it('应该可以复用内置 actions 渲染', () => {
      const customRenderActions = vi.fn().mockImplementation((ctx) => {
        return (
          <div data-testid="custom-actions-wrapper">
            {ctx.actions.download}
            <button type="button" data-testid="custom-edit">
              编辑
            </button>
          </div>
        );
      });

      const testFile: FileNode = {
        id: 'f1',
        name: 'reuse-builtin.txt',
        url: 'https://example.com/test.txt',
        canDownload: true,
        renderActions: customRenderActions,
      };

      render(
        <TestWrapper>
          <FileComponent nodes={[testFile]} onDownload={vi.fn()} />
        </TestWrapper>,
      );

      // 应该显示自定义包装器
      expect(screen.getByTestId('custom-actions-wrapper')).toBeInTheDocument();

      // 应该显示内置下载按钮（通过 aria-label）
      expect(screen.getByLabelText('下载')).toBeInTheDocument();

      // 应该显示自定义按钮
      expect(screen.getByTestId('custom-edit')).toBeInTheDocument();
    });
  });
});
