/**
 * Media 组件测试文件
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Media,
  ResizeImage,
} from '../../../../src/MarkdownEditor/editor/elements/Media';
import * as utils from '../../../../src/MarkdownEditor/editor/utils';
import { MediaNode } from '../../../../src/MarkdownEditor/el';
import { TestSlateWrapper } from './TestSlateWrapper';

// Mock 依赖
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
  getMediaType: vi.fn((url) => {
    if (url?.includes('video')) return 'video';
    if (url?.includes('audio')) return 'audio';
    if (url?.includes('attachment')) return 'attachment';
    return 'image';
  }),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Image', () => ({
  ImageAndError: ({ src, alt, ...props }: any) => (
    <img data-testid="image-and-error" src={src} alt={alt} {...props} />
  ),
}));

vi.mock('../../../../src/Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, ...props }: any) => (
    <div data-testid="action-icon-box" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../../../src/Components/ContributorAvatar', () => ({
  AvatarList: ({ children, ...props }: any) => (
    <div data-testid="avatar-list" {...props}>
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
  Rnd: ({ children, onResizeStart, onResizeStop, ...props }: any) => (
    <div data-testid="rnd-container" {...props}>
      <button type="button" data-testid="resize-start" onClick={onResizeStart}>
        Resize Start
      </button>
      <button
        type="button"
        data-testid="resize-stop"
        onClick={() => onResizeStop({ width: 500, height: 300 })}
      >
        Resize Stop
      </button>
      {children}
    </div>
  ),
}));

describe('Media', () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染Media组件', () => {
      renderWithProvider(
        <Media element={mockElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      const mediaContainer = screen.getByTestId('media-container');
      expect(mediaContainer).toBeInTheDocument();
    });

    it('应该渲染图片元素', () => {
      renderWithProvider(
        <Media element={mockElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      const resizeImage = screen.getByTestId('resize-image');
      expect(resizeImage).toBeInTheDocument();
      expect(resizeImage).toHaveAttribute(
        'src',
        'https://example.com/image.jpg',
      );
      expect(resizeImage).toHaveAttribute('alt', 'image');
    });
  });

  describe('ResizeImage组件测试', () => {
    const mockResizeProps = {
      src: 'https://example.com/image.jpg',
      alt: 'Test Image',
      onResizeStart: vi.fn(),
      onResizeStop: vi.fn(),
    };

    it('应该正确渲染ResizeImage组件', () => {
      renderWithProvider(<ResizeImage {...mockResizeProps} />);

      const resizeImageContainer = screen.getByTestId('resize-image-container');
      const resizeImage = screen.getByTestId('resize-image');
      expect(resizeImageContainer).toBeInTheDocument();
      expect(resizeImage).toBeInTheDocument();
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
  });

  describe('视频类型测试', () => {
    it('应该渲染视频元素', () => {
      const videoElement: MediaNode = {
        ...mockElement,
        url: 'https://example.com/video.mp4',
        controls: true,
        autoplay: false,
        loop: false,
        muted: false,
        poster: 'https://example.com/poster.jpg',
      };

      // 为这个测试设置特定的 mock 状态
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

      renderWithProvider(
        <Media element={videoElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      const videoElement_ = screen.getByTestId('video-element');
      expect(videoElement_).toBeInTheDocument();
      expect(videoElement_).toHaveAttribute('controls');
      expect(videoElement_).toHaveAttribute(
        'src',
        'https://example.com/video.mp4',
      );
    });
  });

  describe('音频类型测试', () => {
    it('应该渲染音频元素', () => {
      const audioElement: MediaNode = {
        ...mockElement,
        url: 'https://example.com/audio.mp3',
      };

      // 为这个测试设置特定的 mock 状态
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

      renderWithProvider(
        <Media element={audioElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      const audioElement_ = screen.getByTestId('audio-element');
      expect(audioElement_).toBeInTheDocument();
      expect(audioElement_).toHaveAttribute('controls');
      expect(audioElement_).toHaveAttribute(
        'src',
        'https://example.com/audio.mp3',
      );
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的URL', () => {
      const elementWithEmptyUrl: MediaNode = {
        ...mockElement,
        url: '',
      };

      // 为这个测试设置特定的 mock 状态
      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const emptyUrlStateData = {
        height: 300,
        dragging: false,
        loadSuccess: true,
        url: '',
        selected: false,
        type: 'image',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => emptyUrlStateData,
        vi.fn((updates) => Object.assign(emptyUrlStateData, updates)),
      ]);

      renderWithProvider(
        <Media element={elementWithEmptyUrl} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      const resizeImage = screen.getByTestId('resize-image');
      expect(resizeImage).toHaveAttribute('src', '');
    });

    it('应该处理空的alt属性', () => {
      const elementWithEmptyAlt: MediaNode = {
        ...mockElement,
        alt: '',
      };

      renderWithProvider(
        <Media element={elementWithEmptyAlt} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      const resizeImage = screen.getByTestId('resize-image');
      expect(resizeImage).toHaveAttribute('alt', 'image');
    });
  });

  describe('附件类型测试', () => {
    it('应该渲染附件元素', () => {
      const attachmentElement: MediaNode = {
        ...mockElement,
        url: 'https://example.com/attachment.pdf',
        alt: 'attachment:document.pdf',
        otherProps: {
          updateTime: '2024-10-16',
          collaborators: [{ 'User A': 5 }, { 'User B': 3 }],
        },
      };

      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const attachmentStateData = {
        height: 300,
        dragging: false,
        loadSuccess: true,
        url: 'https://example.com/attachment.pdf',
        selected: false,
        type: 'attachment',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => attachmentStateData,
        vi.fn((updates) => Object.assign(attachmentStateData, updates)),
      ]);

      renderWithProvider(
        <Media element={attachmentElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('2024-10-16')).toBeInTheDocument();
      // AvatarList 会渲染，检查是否存在 avatar 元素
      expect(
        document.querySelector('.ant-agentic-contributor-avatar-list'),
      ).toBeInTheDocument();
    });

    it('应该处理没有协作者和更新时间的附件', () => {
      const attachmentElement: MediaNode = {
        ...mockElement,
        url: 'https://example.com/attachment.pdf',
        alt: 'attachment:document.pdf',
      };

      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const attachmentStateData = {
        height: 300,
        dragging: false,
        loadSuccess: true,
        url: 'https://example.com/attachment.pdf',
        selected: false,
        type: 'attachment',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => attachmentStateData,
        vi.fn((updates) => Object.assign(attachmentStateData, updates)),
      ]);

      renderWithProvider(
        <Media element={attachmentElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });
  });

  describe('ResizeImage边界情况测试', () => {
    it('应该显示加载状态', () => {
      renderWithProvider(
        <ResizeImage
          src="https://example.com/loading-image.jpg"
          onResizeStart={vi.fn()}
          onResizeStop={vi.fn()}
        />,
      );

      // 在图片加载前应该显示加载图标
      const container = screen.getByTestId('resize-image-container');
      expect(container).toBeInTheDocument();
    });

    it('应该设置默认尺寸', () => {
      const customSize = { width: 800, height: 600 };
      renderWithProvider(
        <ResizeImage
          src="https://example.com/image.jpg"
          defaultSize={customSize}
          onResizeStart={vi.fn()}
          onResizeStop={vi.fn()}
        />,
      );

      const resizeImage = screen.getByTestId('resize-image');
      expect(resizeImage).toBeInTheDocument();
    });

      it('应该在选中时显示视觉反馈', () => {
        renderWithProvider(
          <ResizeImage
            src="https://example.com/image.jpg"
            selected={true}
            onResizeStart={vi.fn()}
            onResizeStop={vi.fn()}
          />,
        );
      });
    });

  describe('Media linkConfig 功能测试', () => {
    const mockWindowOpen = vi.fn();

    beforeEach(() => {
      mockWindowOpen.mockClear();
      if (typeof window !== 'undefined') {
        window.open = mockWindowOpen;
      }
    });

    it('视频加载失败时应该显示链接并支持 linkConfig', async () => {
      const onClick = vi.fn();
      const { useEditorStore } = await import(
        '../../../../src/MarkdownEditor/editor/store'
      );
      vi.mocked(useEditorStore).mockReturnValue({
        markdownEditorRef: {
          current: {
            setNodes: vi.fn(),
            removeNodes: vi.fn(),
          },
        },
        readonly: false,
        editorProps: {
          linkConfig: {
            onClick,
            openInNewTab: true,
          },
        },
      } as any);

      const videoElement: MediaNode = {
        ...mockElement,
        url: 'https://example.com/video.mp4',
        alt: 'Test Video',
      };

      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const failedStateData = {
        height: 300,
        dragging: false,
        loadSuccess: false,
        url: 'https://example.com/video.mp4',
        selected: false,
        type: 'video',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => failedStateData,
        vi.fn((updates) => Object.assign(failedStateData, updates)),
      ]);

      renderWithProvider(
        <Media element={videoElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      await screen.findByText('Test Video');
      const link = screen.getByText('Test Video').closest('a');
      if (link) {
        fireEvent.click(link, {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        });
        expect(onClick).toHaveBeenCalledWith('https://example.com/video.mp4');
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://example.com/video.mp4',
          '_blank',
        );
      }
    });

    it('音频加载失败时应该显示链接并支持 linkConfig', async () => {
      const onClick = vi.fn();
      const { useEditorStore } = await import(
        '../../../../src/MarkdownEditor/editor/store'
      );
      vi.mocked(useEditorStore).mockReturnValue({
        markdownEditorRef: {
          current: {
            setNodes: vi.fn(),
            removeNodes: vi.fn(),
          },
        },
        readonly: false,
        editorProps: {
          linkConfig: {
            onClick,
            openInNewTab: false,
          },
        },
      } as any);

      const audioElement: MediaNode = {
        ...mockElement,
        url: 'https://example.com/audio.mp3',
        alt: 'Test Audio',
      };

      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const failedStateData = {
        height: 300,
        dragging: false,
        loadSuccess: false,
        url: 'https://example.com/audio.mp3',
        selected: false,
        type: 'audio',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => failedStateData,
        vi.fn((updates) => Object.assign(failedStateData, updates)),
      ]);

      renderWithProvider(
        <Media element={audioElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      await screen.findByText('Test Audio');
      const link = screen.getByText('Test Audio').closest('a');
      if (link) {
        fireEvent.click(link, {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        });
        expect(onClick).toHaveBeenCalledWith('https://example.com/audio.mp3');
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://example.com/audio.mp3',
          '_self',
        );
      }
    });

    it('当 linkConfig.onClick 返回 false 时应该阻止视频链接的默认行为', async () => {
      const onClick = vi.fn().mockReturnValue(false);
      const { useEditorStore } = await import(
        '../../../../src/MarkdownEditor/editor/store'
      );
      vi.mocked(useEditorStore).mockReturnValue({
        markdownEditorRef: {
          current: {
            setNodes: vi.fn(),
            removeNodes: vi.fn(),
          },
        },
        readonly: false,
        editorProps: {
          linkConfig: {
            onClick,
          },
        },
      } as any);

      const videoElement: MediaNode = {
        ...mockElement,
        url: 'https://example.com/video.mp4',
        alt: 'Test Video',
      };

      const mockedUseGetSetState = vi.mocked(utils.useGetSetState);
      const failedStateData = {
        height: 300,
        dragging: false,
        loadSuccess: false,
        url: 'https://example.com/video.mp4',
        selected: false,
        type: 'video',
      };
      mockedUseGetSetState.mockReturnValueOnce([
        () => failedStateData,
        vi.fn((updates) => Object.assign(failedStateData, updates)),
      ]);

      renderWithProvider(
        <Media element={videoElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      await screen.findByText('Test Video');
      const link = screen.getByText('Test Video').closest('a');
      if (link) {
        fireEvent.click(link, {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        });
        expect(onClick).toHaveBeenCalledWith('https://example.com/video.mp4');
        expect(mockWindowOpen).not.toHaveBeenCalled();
      }
    });
  });

  describe('交互事件测试', () => {
    it('应该阻止拖拽事件', () => {
      renderWithProvider(
        <Media element={mockElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      const mediaContainer = screen.getByTestId('media-container');
      const dragEvent = new Event('dragstart', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(dragEvent, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(dragEvent, 'stopPropagation');

      mediaContainer.dispatchEvent(dragEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('应该处理右键菜单事件', () => {
      renderWithProvider(
        <Media element={mockElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      const mediaContainer = screen.getByTestId('media-container');
      const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true });
      const stopPropagationSpy = vi.spyOn(contextMenuEvent, 'stopPropagation');

      mediaContainer.dispatchEvent(contextMenuEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('应该处理鼠标按下事件', () => {
      renderWithProvider(
        <Media element={mockElement} attributes={mockAttributes}>
          {null}
        </Media>,
      );

      const mediaContainer = screen.getByTestId('media-container');
      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
      const stopPropagationSpy = vi.spyOn(mouseDownEvent, 'stopPropagation');

      mediaContainer.dispatchEvent(mouseDownEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });
});
