import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
          <FileComponent nodes={nodes} onToggleGroup={handleToggle} />
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
});
