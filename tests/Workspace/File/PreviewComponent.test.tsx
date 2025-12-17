import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvide } from '../../../src/I18n';
import { PreviewComponent } from '../../../src/Workspace/File/PreviewComponent';
import type { FileNode } from '../../../src/Workspace/types';

// Mock fetch
global.fetch = vi.fn();

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <I18nProvide>{children}</I18nProvide>
  </ConfigProvider>
);

describe('PreviewComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  describe('基础渲染', () => {
    it('应该渲染预览头部', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello World',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onBack={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    it('应该显示返回按钮', () => {
      const handleBack = vi.fn();
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onBack={handleBack} />
        </TestWrapper>,
      );

      const backBtn = screen.getByLabelText('返回文件列表');
      expect(backBtn).toBeInTheDocument();

      fireEvent.click(backBtn);
      expect(handleBack).toHaveBeenCalled();
    });

    it('应该显示下载按钮', () => {
      const handleDownload = vi.fn();
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onDownload={handleDownload} />
        </TestWrapper>,
      );

      const downloadBtn = screen.getByLabelText('下载');
      expect(downloadBtn).toBeInTheDocument();

      fireEvent.click(downloadBtn);
      expect(handleDownload).toHaveBeenCalledWith(file);
    });

    it('应该显示分享按钮', () => {
      const handleShare = vi.fn();
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        canShare: true,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onShare={handleShare} />
        </TestWrapper>,
      );

      const shareBtn = screen.getByLabelText('分享');
      expect(shareBtn).toBeInTheDocument();

      fireEvent.click(shareBtn);
      expect(handleShare).toHaveBeenCalledWith(
        file,
        expect.objectContaining({ origin: 'preview' }),
      );
    });

    it('应该显示文件生成时间', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        lastModified: new Date('2023-12-21 10:30:56'),
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      expect(screen.getByText(/生成时间/)).toBeInTheDocument();
    });

    it('应该支持自定义头部', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      const customHeader = <div data-testid="custom-header">Custom Header</div>;

      render(
        <TestWrapper>
          <PreviewComponent file={file} customHeader={customHeader} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });

    it('应该支持自定义操作按钮', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      const customActions = (
        <button data-testid="custom-action" type="button">
          Custom Action
        </button>
      );

      render(
        <TestWrapper>
          <PreviewComponent file={file} customActions={customActions} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });

    it('应该支持覆盖标题文件信息', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      const headerFileOverride = {
        name: 'override.txt',
      };

      render(
        <TestWrapper>
          <PreviewComponent
            file={file}
            headerFileOverride={headerFileOverride}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('override.txt')).toBeInTheDocument();
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });
  });

  describe('文本文件预览', () => {
    it('应该从URL加载文本内容', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('Fetched content'),
      });

      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        type: 'plainText',
        url: 'https://example.com/test.txt',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://example.com/test.txt',
        );
      });
    });

    it('应该处理URL加载失败', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        type: 'plainText',
        url: 'https://example.com/test.txt',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText(/文件处理失败/)).toBeInTheDocument();
      });
    });

    it('应该处理网络错误', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        type: 'plainText',
        url: 'https://example.com/test.txt',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText(/文件处理失败/)).toBeInTheDocument();
      });
    });
  });

  describe('HTML文件预览', () => {
    it('应该预览HTML文件', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'index.html',
        type: 'plainText',
        content: '<h1>Hello</h1>',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('预览')).toBeInTheDocument();
        expect(screen.getByText('代码')).toBeInTheDocument();
      });
    });

    it('应该切换HTML预览模式', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'index.html',
        type: 'plainText',
        content: '<h1>Hello</h1>',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('预览')).toBeInTheDocument();
      });

      // Click to switch to code view
      fireEvent.click(screen.getByText('代码'));

      expect(screen.getByText('代码')).toBeInTheDocument();
    });

    it('应该识别.htm扩展名', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'page.htm',
        type: 'plainText',
        content: '<div>Content</div>',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('预览')).toBeInTheDocument();
        expect(screen.getByText('代码')).toBeInTheDocument();
      });
    });
  });

  describe('图片预览', () => {
    it('应该预览图片', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'image.png',
        type: 'image',
        url: 'https://example.com/image.png',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(() => {
        const img = container.querySelector(
          'img[src="https://example.com/image.png"]',
        );
        expect(img).toBeTruthy();
      });
    });

    it('应该处理没有预览URL的图片', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'image.png',
        type: 'image',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          // 应该显示占位符内容
          const placeholder = container.querySelector(
            '.ant-workspace-file-preview-placeholder',
          );
          expect(placeholder).toBeTruthy();
        },
        { timeout: 2000 },
      );
    });
  });

  describe('视频预览', () => {
    it('应该显示视频预览组件', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'video.mp4',
        type: 'video',
        url: 'https://example.com/video.mp4',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      // 组件应该正常渲染
      await waitFor(() => {
        expect(container.firstChild).toBeTruthy();
        const fileNames = screen.getAllByText('video.mp4');
        expect(fileNames.length).toBeGreaterThan(0);
      });
    });

    it('应该处理没有预览URL的视频', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'video.mp4',
        type: 'video',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          const placeholder = container.querySelector(
            '.ant-workspace-file-preview-placeholder',
          );
          expect(placeholder).toBeTruthy();
        },
        { timeout: 2000 },
      );
    });
  });

  describe('PDF预览', () => {
    it('应该显示PDF预览组件', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'document.pdf',
        type: 'pdf',
        url: 'https://example.com/document.pdf',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      // 组件应该正常渲染
      await waitFor(() => {
        expect(container.firstChild).toBeTruthy();
        const fileNames = screen.getAllByText('document.pdf');
        expect(fileNames.length).toBeGreaterThan(0);
      });
    });

    it('应该处理没有预览URL的PDF', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'document.pdf',
        type: 'pdf',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          const placeholder = container.querySelector(
            '.ant-workspace-file-preview-placeholder',
          );
          expect(placeholder).toBeTruthy();
        },
        { timeout: 2000 },
      );
    });
  });

  describe('音频预览', () => {
    it('应该显示音频预览组件', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'audio.mp3',
        type: 'audio',
        url: 'https://example.com/audio.mp3',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(container.firstChild).toBeTruthy();
        const fileNames = screen.getAllByText('audio.mp3');
        expect(fileNames.length).toBeGreaterThan(0);
      });
    });

    it('应该处理没有预览URL的音频', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'audio.mp3',
        type: 'audio',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          const placeholder = container.querySelector(
            '.ant-workspace-file-preview-placeholder',
          );
          expect(placeholder).toBeTruthy();
        },
        { timeout: 2000 },
      );
    });
  });

  describe('不支持的文件类型', () => {
    it('应该显示不支持预览的提示', async () => {
      const file: FileNode = {
        id: 'f1',
        name: 'archive.zip',
        type: 'archive',
        url: 'https://example.com/archive.zip',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onDownload={vi.fn()} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText(/此文件无法预览/)).toBeInTheDocument();
      });
    });

    it('应该显示下载按钮', async () => {
      const handleDownload = vi.fn();
      const file: FileNode = {
        id: 'f1',
        name: 'data.bin',
        type: 'archive',
        url: 'https://example.com/data.bin',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onDownload={handleDownload} />
        </TestWrapper>,
      );

      await waitFor(() => {
        const downloadBtn = screen.getByText('下载');
        expect(downloadBtn).toBeInTheDocument();
      });
    });
  });

  describe('自定义预览内容', () => {
    it('应该显示自定义内容', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      const customContent = (
        <div data-testid="custom-content">Custom Preview</div>
      );

      render(
        <TestWrapper>
          <PreviewComponent file={file} customContent={customContent} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });

    it('自定义内容应该覆盖默认预览', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello World',
      };

      const customContent = <div data-testid="custom">Custom</div>;

      render(
        <TestWrapper>
          <PreviewComponent file={file} customContent={customContent} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom')).toBeInTheDocument();
    });
  });

  describe('加载状态', () => {
    it('应该显示文件加载状态', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Generating...',
        loading: true,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      expect(screen.getByText('正在生成')).toBeInTheDocument();
    });

    it('应该正常渲染文本文件内容', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        type: 'plainText',
        content: 'Hello',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      // 组件应该正常渲染
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    it('应该从URL加载内容', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('Loaded Content'),
      });

      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        type: 'plainText',
        url: 'https://example.com/test.txt',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      // 应该调用fetch加载内容
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://example.com/test.txt',
        );
      });
    });
  });

  describe('组件配置', () => {
    it('应该传递markdownEditorProps', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.md',
        type: 'markdown',
        content: '# Hello',
      };

      const markdownEditorProps = {
        theme: 'dark' as const,
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent
            file={file}
            markdownEditorProps={markdownEditorProps}
          />
        </TestWrapper>,
      );

      // 组件应该正常渲染
      expect(container.firstChild).toBeTruthy();
    });

    it('应该支持没有onBack的场景', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      // 返回按钮不应该显示
      expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
    });

    it('应该支持没有onDownload的场景', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      // 下载按钮不应该显示
      expect(screen.queryByLabelText('下载')).not.toBeInTheDocument();
    });

    it('应该根据canShare控制分享按钮显示', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        canShare: false,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onShare={vi.fn()} />
        </TestWrapper>,
      );

      // 分享按钮不应该显示
      expect(screen.queryByLabelText('分享')).not.toBeInTheDocument();
    });

    it('应该在canShare为true时显示分享按钮', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        canShare: true,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onShare={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('分享')).toBeInTheDocument();
    });
  });

  describe('操作按钮', () => {
    it('应该显示定位按钮并触发回调', () => {
      const handleLocate = vi.fn();
      const file: FileNode = {
        id: 'f1',
        name: 'locate.txt',
        content: 'Locate me',
        canLocate: true,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onLocate={handleLocate} />
        </TestWrapper>,
      );

      const locateBtn = screen.getByLabelText('定位');
      expect(locateBtn).toBeInTheDocument();

      fireEvent.click(locateBtn);
      expect(handleLocate).toHaveBeenCalledWith(file);
    });

    it('canDownload 为 false 时不显示下载按钮', () => {
      const handleDownload = vi.fn();
      const file: FileNode = {
        id: 'f1',
        name: 'secret.txt',
        content: 'Top secret',
        canDownload: false,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onDownload={handleDownload} />
        </TestWrapper>,
      );

      expect(screen.queryByLabelText('下载')).not.toBeInTheDocument();
    });
  });

  describe('边缘情况', () => {
    it('应该处理空内容', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'empty.txt',
        type: 'plainText',
        content: '',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      // 组件应该正常渲染
      expect(container.firstChild).toBeTruthy();
    });

    it('应该处理特殊字符文件名', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'file with spaces & special.txt',
        content: 'Hello',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      expect(
        screen.getByText('file with spaces & special.txt'),
      ).toBeInTheDocument();
    });

    it('应该处理中文文件名', () => {
      const file: FileNode = {
        id: 'f1',
        name: '测试文档.txt',
        content: '你好',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      expect(screen.getByText('测试文档.txt')).toBeInTheDocument();
    });

    it('应该处理覆盖lastModified', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        lastModified: new Date('2023-01-01'),
      };

      const headerFileOverride = {
        lastModified: new Date('2023-12-21'),
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent
            file={file}
            headerFileOverride={headerFileOverride}
          />
        </TestWrapper>,
      );

      // 应该显示生成时间标签
      expect(screen.getByText(/生成时间/)).toBeInTheDocument();
      // 验证组件正常渲染，时间信息存在于DOM中
      const timeElement = container.querySelector(
        '.ant-workspace-file-preview-generate-time',
      );
      expect(timeElement).toBeTruthy();
    });
  });

  describe('无障碍性', () => {
    it('应该为返回按钮提供aria-label', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onBack={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });

    it('应该为下载按钮提供aria-label', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onDownload={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('下载')).toBeInTheDocument();
    });

    it('应该为分享按钮提供aria-label', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        canShare: true,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onShare={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('分享')).toBeInTheDocument();
    });

    it('应该正常渲染视频预览组件', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'video.mp4',
        type: 'video',
        url: 'https://example.com/video.mp4',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      // 组件应该正常渲染
      expect(container.firstChild).toBeTruthy();
      const fileNames = screen.getAllByText('video.mp4');
      expect(fileNames.length).toBeGreaterThan(0);
    });

    it('应该为定位按钮提供aria-label', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        canLocate: true,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onLocate={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('定位')).toBeInTheDocument();
    });
  });

  describe('定位功能', () => {
    it('应该触发定位回调', () => {
      const handleLocate = vi.fn();
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        canLocate: true,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onLocate={handleLocate} />
        </TestWrapper>,
      );

      const locateBtn = screen.getByLabelText('定位');
      fireEvent.click(locateBtn);

      expect(handleLocate).toHaveBeenCalledWith(file);
    });

    it('不应该显示定位按钮当canLocate为false', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        canLocate: false,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onLocate={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.queryByLabelText('定位')).not.toBeInTheDocument();
    });

    it('不应该显示定位按钮当未提供onLocate', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        canLocate: true,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      expect(screen.queryByLabelText('定位')).not.toBeInTheDocument();
    });
  });

  describe('代码文件预览', () => {
    it('应该预览代码文件', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'index.js',
        type: 'code',
        content: 'console.log("Hello");',
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText('index.js')).toBeInTheDocument();
    });

    it('应该从URL加载代码文件', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('const x = 1;'),
      });

      const file: FileNode = {
        id: 'f1',
        name: 'app.ts',
        type: 'code',
        url: 'https://example.com/app.ts',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('https://example.com/app.ts');
      });
    });
  });

  describe('下载控制', () => {
    it('canDownload为false时不显示下载按钮', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        canDownload: false,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onDownload={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.queryByLabelText('下载')).not.toBeInTheDocument();
    });

    it('canDownload为true时显示下载按钮', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
        canDownload: true,
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onDownload={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('下载')).toBeInTheDocument();
    });

    it('canDownload未设置时默认显示下载按钮（当有onDownload）', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello',
      };

      render(
        <TestWrapper>
          <PreviewComponent file={file} onDownload={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('下载')).toBeInTheDocument();
    });
  });

  describe('Markdown编辑器配置', () => {
    it('应该传递markdownEditorProps到编辑器', () => {
      const file: FileNode = {
        id: 'f1',
        name: 'test.md',
        type: 'markdown',
        content: '# Title',
      };

      const markdownEditorProps = {
        theme: 'dark' as const,
        contentStyle: { padding: '10px' },
      };

      const { container } = render(
        <TestWrapper>
          <PreviewComponent
            file={file}
            markdownEditorProps={markdownEditorProps}
          />
        </TestWrapper>,
      );

      expect(container.firstChild).toBeTruthy();
    });
  });
});
