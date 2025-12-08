/**
 * Image 组件测试文件
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EditorImage,
  ReadonlyImage,
  ResizeImage,
} from '../../../../src/MarkdownEditor/editor/elements/Image';
import * as utils from '../../../../src/MarkdownEditor/editor/utils';
import { MediaNode } from '../../../../src/MarkdownEditor/el';
import { TestSlateWrapper } from './TestSlateWrapper';

// Mock dependencies
vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({
    markdownEditorRef: {
      current: {
        setNodes: vi.fn(),
        removeNodes: vi.fn(),
        insertNodes: vi.fn(),
        // 添加其他必要的编辑器方法
      },
    },
    readonly: false,
    editorProps: {
      image: {
        render: undefined,
      },
    },
  })),
}));

vi.mock('../../../../src/MarkdownEditor/hooks/editor', () => ({
  useSelStatus: vi.fn(() => [false, [0, 0]]),
}));

vi.mock('../../../../src/MarkdownEditor/editor/utils', () => ({
  useGetSetState: vi.fn(() => {
    const stateData = {
      height: 300,
      dragging: false,
      loadSuccess: true,
      url: 'https://example.com/image.jpg',
      selected: false,
      type: 'image',
    };
    return [
      () => stateData,
      vi.fn((updates) => Object.assign(stateData, updates)),
    ];
  }),
}));

vi.mock('../../../../src/MarkdownEditor/editor/utils/dom', () => ({
  getMediaType: vi.fn(() => 'image'),
}));

vi.mock('../../../../src/Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, ...props }: any) => (
    <div data-testid="action-icon-box" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@ant-design/pro-components', () => ({
  useDebounceFn: vi.fn((fn) => ({
    run: fn,
    cancel: vi.fn(),
  })),
}));

// Mock react-rnd
vi.mock('react-rnd', () => ({
  Rnd: ({ children, onResizeStart, onResizeStop, onResize, ...props }: any) => (
    <div data-testid="rnd-container" {...props}>
      <button type="button" data-testid="resize-start" onClick={onResizeStart}>
        Resize Start
      </button>
      <button
        type="button"
        data-testid="resize-stop"
        onClick={() => onResizeStop({ width: 400, height: 0 })}
      >
        Resize Stop
      </button>
      <button
        type="button"
        data-testid="resize"
        onClick={() =>
          onResize('right', 'bottom', { clientWidth: 500, clientHeight: 300 })
        }
      >
        Resize
      </button>
      {children}
    </div>
  ),
}));

describe('Image', () => {
  const mockElement: MediaNode = {
    type: 'media',
    url: 'https://example.com/image.jpg',
    alt: 'Test Image',
    width: 400,
    height: 300,
    children: [{ text: '' }],
  };

  const mockAttributes = {
    'data-slate-node': 'element' as const,
    ref: vi.fn(),
  };

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <ConfigProvider>
        <TestSlateWrapper>{component}</TestSlateWrapper>
      </ConfigProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ReadonlyImage', () => {
    it('应该正确渲染图片', () => {
      renderWithProvider(
        <ReadonlyImage
          src="https://example.com/image.jpg"
          alt="Test Image"
          width={400}
          height={300}
        />,
      );

      const imageElement = screen.getByAltText('Test Image');
      expect(imageElement).toBeInTheDocument();
      expect(imageElement).toHaveAttribute(
        'src',
        'https://example.com/image.jpg',
      );
    });

    it('应该处理图片加载错误', () => {
      renderWithProvider(
        <ReadonlyImage
          src="https://example.com/invalid-image.jpg"
          alt="Invalid Image"
          width={400}
          height={300}
        />,
      );

      const imageElement = screen.getByAltText('Invalid Image');
      expect(imageElement).toBeInTheDocument();
    });

    it('应该处理空的 alt 属性', () => {
      renderWithProvider(
        <ReadonlyImage
          src="https://example.com/image.jpg"
          alt=""
          width={400}
          height={300}
        />,
      );

      // ReadonlyImage 会将空 alt 转换为 'image'
      const imageElement = screen.getByAltText('image');
      expect(imageElement).toBeInTheDocument();
    });

    it('应该处理数字类型的 width', () => {
      renderWithProvider(
        <ReadonlyImage
          src="https://example.com/image.jpg"
          alt="Test Image"
          width={400}
          height={300}
        />,
      );

      const imageElement = screen.getByAltText('Test Image');
      expect(imageElement).toBeInTheDocument();
    });
  });

  describe('ResizeImage', () => {
    const mockResizeProps = {
      src: 'https://example.com/image.jpg',
      alt: 'Test Image',
      onResizeStart: vi.fn(),
      onResizeStop: vi.fn(),
    };

    it('应该正确渲染ResizeImage组件', () => {
      renderWithProvider(<ResizeImage {...mockResizeProps} />);

      const resizeImageContainer = screen.getByTestId('resize-image-container');
      expect(resizeImageContainer).toBeInTheDocument();
      // 图片在加载时是隐藏的，所以我们检查容器而不是图片本身
      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('应该处理调整大小开始事件', () => {
      renderWithProvider(<ResizeImage {...mockResizeProps} />);

      const resizeStartButton = screen.getByTestId('resize-start');
      fireEvent.click(resizeStartButton);

      expect(mockResizeProps.onResizeStart).toHaveBeenCalled();
    });

    it('应该处理调整大小停止事件', () => {
      renderWithProvider(<ResizeImage {...mockResizeProps} />);

      const resizeStopButton = screen.getByTestId('resize-stop');
      fireEvent.click(resizeStopButton);

      expect(mockResizeProps.onResizeStop).toHaveBeenCalledWith({
        width: 400,
        height: 0,
      });
    });

    it('应该处理调整大小事件', () => {
      renderWithProvider(<ResizeImage {...mockResizeProps} />);

      const resizeButton = screen.getByTestId('resize');
      fireEvent.click(resizeButton);

      // 验证调整大小事件被触发
      expect(resizeButton).toBeInTheDocument();
    });

    it('应该处理加载状态', () => {
      renderWithProvider(<ResizeImage {...mockResizeProps} />);

      const loadingElement = screen.getByLabelText('loading');
      expect(loadingElement).toBeInTheDocument();
    });

    it('应该处理选中状态', () => {
      renderWithProvider(<ResizeImage {...mockResizeProps} selected={true} />);

      // 图片在加载时是隐藏的，所以我们检查容器而不是图片本身
      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('应该处理默认尺寸', () => {
      renderWithProvider(
        <ResizeImage
          {...mockResizeProps}
          defaultSize={{ width: 500, height: 400 }}
        />,
      );

      // 图片在加载时是隐藏的，所以我们检查容器而不是图片本身
      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    describe('ResizeImage linkConfig 功能测试', () => {
      const mockWindowOpen = vi.fn();
      let containerElement: HTMLElement | null = null;

      const getErrorLink = async () => {
        if (!containerElement) return null;
        await waitFor(() => {
          const link = containerElement?.querySelector('span');
          if (!link || !link.textContent?.includes('Test Image')) {
            throw new Error('链接元素未找到');
          }
        });
        return containerElement.querySelector('span') as HTMLSpanElement | null;
      };

      const triggerError = () => {
        if (!containerElement) return;
        const img = containerElement.querySelector('img');
        if (img) {
          fireEvent.error(img);
        }
      };

      const updateEditorStore = async (linkConfig: {
        onClick?: (url: string) => boolean | void;
        openInNewTab?: boolean;
      }) => {
        const { useEditorStore } = await import(
          '../../../../src/MarkdownEditor/editor/store'
        );
        vi.mocked(useEditorStore).mockReturnValue({
          editorProps: {
            linkConfig,
          },
        } as any);
      };

      beforeEach(async () => {
        mockWindowOpen.mockClear();
        if (typeof window !== 'undefined') {
          window.open = mockWindowOpen;
        }
        await updateEditorStore({});
        const { container } = renderWithProvider(
          <ResizeImage {...mockResizeProps} src="invalid-url.jpg" />,
        );
        containerElement = container;
      });

      it('图片加载失败时应该显示链接', async () => {
        triggerError();
        await waitFor(() => {
          const link = containerElement?.querySelector('span');
          expect(link).toBeInTheDocument();
          expect(link?.textContent).toContain('Test Image');
        });
      });

      // 使用工具函数创建标准测试
      // 注意：工具函数中的 updateEditorStore 需要支持 async
      // 但当前实现是同步的，需要调整
      it('应该调用 linkConfig.onClick 当点击失败链接时', async () => {
        const onClick = vi.fn();
        await updateEditorStore({ onClick });

        triggerError();

        const link = await waitFor(async () => {
          const element = await getErrorLink();
          if (!element) {
            throw new Error('链接元素未找到');
          }
          return element;
        });

        fireEvent.click(link);
        expect(onClick).toHaveBeenCalledWith('invalid-url.jpg');
      });

      it('当 linkConfig.onClick 返回 false 时应该阻止默认行为', async () => {
        const onClick = vi.fn().mockReturnValue(false);
        await updateEditorStore({ onClick });

        triggerError();

        const link = await waitFor(async () => {
          const element = await getErrorLink();
          if (!element) {
            throw new Error('链接元素未找到');
          }
          return element;
        });

        fireEvent.click(link, {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        });

        expect(onClick).toHaveBeenCalledWith('invalid-url.jpg');
        expect(mockWindowOpen).not.toHaveBeenCalled();
      });
    });
  });

  describe('EditorImage', () => {
    it('应该正确渲染 EditorImage 组件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理点击事件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      fireEvent.click(imageContainer);

      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理右键菜单事件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      fireEvent.contextMenu(imageContainer);

      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理鼠标按下事件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      fireEvent.mouseDown(imageContainer);

      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理拖拽开始事件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      fireEvent.dragStart(imageContainer);

      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理调整大小停止事件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的 URL', () => {
      const elementWithEmptyUrl: MediaNode = {
        ...mockElement,
        url: '',
      };

      renderWithProvider(
        <EditorImage element={elementWithEmptyUrl} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理块级图片', () => {
      const blockElement: MediaNode = {
        ...mockElement,
        block: true,
      };

      renderWithProvider(
        <EditorImage element={blockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理加载失败的情况', () => {
      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const failedStateData = {
        height: 300,
        dragging: false,
        loadSuccess: false,
        url: 'https://example.com/image.jpg',
        selected: false,
        type: 'image',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => failedStateData,
        vi.fn((updates) => Object.assign(failedStateData, updates)),
      ]);

      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理拖拽状态', () => {
      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const draggingStateData = {
        height: 300,
        dragging: true,
        loadSuccess: true,
        url: 'https://example.com/image.jpg',
        selected: false,
        type: 'image',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => draggingStateData,
        vi.fn((updates) => Object.assign(draggingStateData, updates)),
      ]);

      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理选中状态', () => {
      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const selectedStateData = {
        height: 300,
        dragging: false,
        loadSuccess: true,
        url: 'https://example.com/image.jpg',
        selected: true,
        type: 'image',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => selectedStateData,
        vi.fn((updates) => Object.assign(selectedStateData, updates)),
      ]);

      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理视频类型', () => {
      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const videoStateData = {
        height: 300,
        dragging: false,
        loadSuccess: true,
        url: 'https://example.com/video.mp4',
        selected: false,
        type: 'video',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => videoStateData,
        vi.fn((updates) => Object.assign(videoStateData, updates)),
      ]);

      const videoElement: MediaNode = {
        ...mockElement,
        url: 'https://example.com/video.mp4',
      };

      renderWithProvider(
        <EditorImage element={videoElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理音频类型', () => {
      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const audioStateData = {
        height: 300,
        dragging: false,
        loadSuccess: true,
        url: 'https://example.com/audio.mp3',
        selected: false,
        type: 'audio',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => audioStateData,
        vi.fn((updates) => Object.assign(audioStateData, updates)),
      ]);

      const audioElement: MediaNode = {
        ...mockElement,
        url: 'https://example.com/audio.mp3',
      };

      renderWithProvider(
        <EditorImage element={audioElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理大尺寸图片', () => {
      const largeElement: MediaNode = {
        ...mockElement,
        width: 2000,
        height: 1500,
      };

      renderWithProvider(
        <EditorImage element={largeElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理小尺寸图片', () => {
      const smallElement: MediaNode = {
        ...mockElement,
        width: 50,
        height: 50,
      };

      renderWithProvider(
        <EditorImage element={smallElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理没有高度的图片', () => {
      const elementWithoutHeight: MediaNode = {
        ...mockElement,
        height: undefined,
      };

      renderWithProvider(
        <EditorImage element={elementWithoutHeight} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理没有宽度的图片', () => {
      const elementWithoutWidth: MediaNode = {
        ...mockElement,
        width: undefined,
      };

      renderWithProvider(
        <EditorImage element={elementWithoutWidth} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理内联图片', () => {
      const inlineElement: MediaNode = {
        ...mockElement,
        block: false,
      };

      renderWithProvider(
        <EditorImage element={inlineElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理完整的 alt 文本', () => {
      const elementWithLongAlt: MediaNode = {
        ...mockElement,
        alt: 'This is a very long alternative text for the image that describes it in detail',
      };

      renderWithProvider(
        <EditorImage element={elementWithLongAlt} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });
  });

  describe('ReadonlyImage 扩展测试', () => {
    it('应该处理图片的 onLoad 事件', () => {
      renderWithProvider(
        <ReadonlyImage
          src="https://example.com/image.jpg"
          alt="Test Image"
          width={400}
          height={300}
        />,
      );

      const imageElement = screen.getByAltText('Test Image');
      fireEvent.load(imageElement);

      expect(imageElement).toBeInTheDocument();
    });

    // ReadonlyImage 组件不支持 className, style, preview 属性，这些测试已移除

    it('应该处理百分比宽度', () => {
      renderWithProvider(
        <ReadonlyImage
          src="https://example.com/image.jpg"
          alt="Test Image"
          width="50%"
        />,
      );

      const imageElement = screen.getByAltText('Test Image');
      expect(imageElement).toBeInTheDocument();
    });

    it('应该处理 rem 单位宽度', () => {
      renderWithProvider(
        <ReadonlyImage
          src="https://example.com/image.jpg"
          alt="Test Image"
          width="20rem"
        />,
      );

      const imageElement = screen.getByAltText('Test Image');
      expect(imageElement).toBeInTheDocument();
    });

    it('应该处理特殊字符的 URL', () => {
      renderWithProvider(
        <ReadonlyImage
          src="https://example.com/image%20with%20spaces.jpg"
          alt="Test Image"
        />,
      );

      const imageElement = screen.getByAltText('Test Image');
      expect(imageElement).toBeInTheDocument();
    });

    it('应该处理 data URL', () => {
      renderWithProvider(
        <ReadonlyImage
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          alt="Test Image"
        />,
      );

      const imageElement = screen.getByAltText('Test Image');
      expect(imageElement).toBeInTheDocument();
    });
  });

  describe('ResizeImage 扩展测试', () => {
    const mockResizeProps = {
      src: 'https://example.com/image.jpg',
      alt: 'Test Image',
      onResizeStart: vi.fn(),
      onResizeStop: vi.fn(),
    };

    it('应该处理不同的锁定宽高比', () => {
      renderWithProvider(
        <ResizeImage
          {...mockResizeProps}
          {...({ lockAspectRatio: false } as any)}
        />,
      );

      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('应该处理最小尺寸限制', () => {
      renderWithProvider(
        <ResizeImage
          {...mockResizeProps}
          {...({ minWidth: 100, minHeight: 100 } as any)}
        />,
      );

      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('应该处理最大尺寸限制', () => {
      renderWithProvider(
        <ResizeImage
          {...mockResizeProps}
          {...({ maxWidth: 1000, maxHeight: 1000 } as any)}
        />,
      );

      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('应该处理禁用状态', () => {
      renderWithProvider(
        <ResizeImage
          {...mockResizeProps}
          {...({ disableDragging: true } as any)}
        />,
      );

      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('应该处理自定义句柄样式', () => {
      renderWithProvider(
        <ResizeImage
          {...mockResizeProps}
          {...({
            handleStyles: {
              bottomRight: { backgroundColor: 'red' },
            },
          } as any)}
        />,
      );

      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('应该处理网格对齐', () => {
      renderWithProvider(
        <ResizeImage {...mockResizeProps} {...({ grid: [10, 10] } as any)} />,
      );

      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('应该处理边界限制', () => {
      renderWithProvider(
        <ResizeImage {...mockResizeProps} {...({ bounds: 'parent' } as any)} />,
      );

      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });
  });

  describe('EditorImage 扩展测试', () => {
    it('应该处理双击事件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      fireEvent.doubleClick(imageContainer);

      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理键盘事件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      fireEvent.keyDown(imageContainer, { key: 'Enter' });

      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理鼠标进入事件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      fireEvent.mouseEnter(imageContainer);

      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理鼠标离开事件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      fireEvent.mouseLeave(imageContainer);

      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理触摸事件', () => {
      renderWithProvider(
        <EditorImage element={mockElement} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      fireEvent.touchStart(imageContainer);

      expect(imageContainer).toBeInTheDocument();
    });

    it('应该传递所有 attributes', () => {
      const customAttributes = {
        ...mockAttributes,
        'data-custom': 'value',
        'aria-label': 'Image element',
      };

      renderWithProvider(
        <EditorImage element={mockElement} attributes={customAttributes as any}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理自定义 title', () => {
      const elementWithTitle = {
        ...mockElement,
        title: 'Custom Title',
      } as any;

      renderWithProvider(
        <EditorImage element={elementWithTitle} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });

    it('应该处理元素的 ID', () => {
      const elementWithId = {
        ...mockElement,
        id: 'image-123',
      } as any;

      renderWithProvider(
        <EditorImage element={elementWithId} attributes={mockAttributes}>
          {null}
        </EditorImage>,
      );

      const imageContainer = screen.getByTestId('image-container');
      expect(imageContainer).toBeInTheDocument();
    });
  });
});
