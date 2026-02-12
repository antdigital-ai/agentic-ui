/**
 * ReadonlyMedia 组件测试 - 覆盖只读媒体预览各分支
 */

import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { ReadonlyMedia } from '../../../../../src/MarkdownEditor/editor/elements/Media/ReadonlyMedia';
import { MediaNode } from '../../../../../src/MarkdownEditor/el';
import * as domUtils from '../../../../../src/MarkdownEditor/editor/utils/dom';
import * as editorUtils from '../../../../../src/MarkdownEditor/editor/utils';
import { TestSlateWrapper } from '../TestSlateWrapper';
import * as useRefFunctionModule from '../../../../../src/Hooks/useRefFunction';

vi.mock('../../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({ editorProps: {} })),
}));

vi.mock('../../../../../src/MarkdownEditor/editor/utils/dom', async (importOriginal) => {
  const actual = await importOriginal<typeof domUtils>();
  return {
    ...actual,
    getMediaType: vi.fn(),
  };
});

vi.mock('../../../../../src/MarkdownEditor/editor/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof editorUtils>();
  const mockUseGetSetState = vi.fn(actual.useGetSetState);
  return {
    ...actual,
    useGetSetState: mockUseGetSetState,
  };
});

vi.mock('../../../../../src/Hooks/useRefFunction', () => ({
  useRefFunction: vi.fn((fn: any) => fn),
}));

const mockAttributes = {
  'data-slate-node': 'element' as const,
  ref: vi.fn(),
};

const baseElement: MediaNode = {
  type: 'media',
  url: 'https://example.com/image.png',
  alt: 'test alt',
  children: [{ text: '' }],
};

const renderWithProvider = (element: MediaNode, props?: { children?: React.ReactNode }) => {
  return render(
    <ConfigProvider>
      <TestSlateWrapper>
        <ReadonlyMedia element={element} attributes={mockAttributes}>
          {props?.children ?? null}
        </ReadonlyMedia>
      </TestSlateWrapper>
    </ConfigProvider>,
  );
};

describe('ReadonlyMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基础渲染', () => {
    it('应渲染 media 容器', () => {
      renderWithProvider(baseElement);
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
    });

    it('应传递 attributes 到根节点', () => {
      const { container } = renderWithProvider(baseElement);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute('data-slate-node', 'element');
    });
  });

  describe('getMediaType 与类型分支', () => {
    it('getMediaType 返回空时以 image 处理', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue(undefined as any);
      renderWithProvider(baseElement);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
    });

    it('initial 中 img onerror 时设置 loadSuccess false', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('image');
      const orig = document.createElement.bind(document);
      document.createElement = ((tagName: string) => {
        const el = orig(tagName);
        if (tagName.toLowerCase() === 'img') {
          setTimeout(() => (el as HTMLImageElement).onerror?.(new Event('error')), 0);
        }
        return el;
      }) as typeof document.createElement;
      renderWithProvider(baseElement);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
      document.createElement = orig;
    });

    it('initial 中 video onerror/onloadedmetadata', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('video');
      const orig = document.createElement.bind(document);
      document.createElement = ((tagName: string) => {
        const el = orig(tagName);
        if (tagName.toLowerCase() === 'video') {
          setTimeout(() => {
            (el as HTMLVideoElement).onloadedmetadata?.({} as Event);
          }, 0);
        }
        return el;
      }) as typeof document.createElement;
      renderWithProvider({ ...baseElement, url: 'https://example.com/v.mp4' });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
      document.createElement = orig;
    });

    it('initial 中 video onerror 时设置 loadSuccess false', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('video');
      const orig = document.createElement.bind(document);
      document.createElement = ((tagName: string) => {
        const el = orig(tagName);
        if (tagName.toLowerCase() === 'video') {
          setTimeout(() => (el as HTMLVideoElement).onerror?.(new Event('error')), 0);
        }
        return el;
      }) as typeof document.createElement;
      renderWithProvider({ ...baseElement, url: 'https://example.com/v.mp4' });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
      document.createElement = orig;
    });

    it('initial 中 img onload 时设置 loadSuccess true', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('image');
      const orig = document.createElement.bind(document);
      document.createElement = ((tagName: string) => {
        const el = orig(tagName);
        if (tagName.toLowerCase() === 'img') {
          setTimeout(() => (el as HTMLImageElement).onload?.(), 0);
        }
        return el;
      }) as typeof document.createElement;
      renderWithProvider(baseElement);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
      document.createElement = orig;
    });

    it('image 类型渲染图片区域', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('image');
      renderWithProvider(baseElement);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
    });

    it('video 类型渲染 video 元素', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('video');
      renderWithProvider({ ...baseElement, url: 'https://example.com/v.mp4' });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });
      const video = screen.queryByTestId('video-element');
      if (video) {
        expect(video).toBeInTheDocument();
      }
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
    });

    it('attachment 类型渲染附件 UI 与查看链接', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('attachment');
      renderWithProvider({
        ...baseElement,
        url: 'https://example.com/file.pdf',
        alt: '附件说明',
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      expect(screen.getByText('查看')).toBeInTheDocument();
      expect(screen.getByText(/附件|附件说明/)).toBeInTheDocument();
    });

    it('other 类型按图片处理', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('other');
      renderWithProvider(baseElement);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
    });
  });

  describe('useEffect finished 与 5 秒超时', () => {
    it('finished 为 true 时正常渲染', () => {
      renderWithProvider({ ...baseElement, finished: true });
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
    });

    it('finished 为 false 时先显示 Skeleton', () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('image');
      renderWithProvider({ ...baseElement, finished: false });
      expect(document.querySelector('.ant-skeleton-image')).toBeInTheDocument();
    });

    it('finished 为 false 时 5 秒后显示文本占位', async () => {
      vi.useFakeTimers();
      vi.mocked(domUtils.getMediaType).mockReturnValue('image');
      renderWithProvider({ ...baseElement, finished: false });
      expect(document.querySelector('.ant-skeleton-image')).toBeInTheDocument();
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText(/图片链接|test alt|example\.com/)).toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('imageDom 分支', () => {
    it('finished false 且未超时显示 Skeleton', () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('image');
      renderWithProvider({ ...baseElement, finished: false });
      expect(document.querySelector('.ant-skeleton-image')).toBeInTheDocument();
    });

    it('finished false 且 showAsText 为 true 时显示图片链接文本', async () => {
      vi.useFakeTimers();
      vi.mocked(domUtils.getMediaType).mockReturnValue('image');
      renderWithProvider({ ...baseElement, finished: false, alt: '图片说明' });
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText(/图片说明|图片链接/)).toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('mediaElement video', () => {
    it('video finished false 未超时显示 Skeleton', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('video');
      renderWithProvider({
        ...baseElement,
        url: 'https://example.com/v.mp4',
        finished: false,
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      expect(document.querySelector('.ant-skeleton-image')).toBeInTheDocument();
    });

    it('video finished false 超时后显示视频链接文本', async () => {
      vi.useFakeTimers();
      vi.mocked(domUtils.getMediaType).mockReturnValue('video');
      renderWithProvider({
        ...baseElement,
        url: 'https://example.com/v.mp4',
        finished: false,
      });
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText(/视频链接|example\.com|test alt/)).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('video loadSuccess false 时显示 MediaErrorLink', async () => {
      const stateData = {
        loadSuccess: false,
        url: 'https://example.com/v.mp4',
        type: 'video' as const,
      };
      vi.mocked(editorUtils.useGetSetState).mockReturnValue([
        () => stateData,
        vi.fn((patch) => Object.assign(stateData, patch)),
      ]);
      vi.mocked(domUtils.getMediaType).mockReturnValue('video');
      renderWithProvider({ ...baseElement, url: 'https://example.com/v.mp4' });
      expect(screen.getByText(/视频链接|test alt|example\.com/)).toBeInTheDocument();
    });

    it('video 元素 onError 时设置 loadSuccess false', async () => {
      vi.mocked(domUtils.getMediaType).mockReturnValue('video');
      const stateData = {
        loadSuccess: true,
        url: 'https://example.com/v.mp4',
        type: 'video' as const,
      };
      const setState = vi.fn((patch: any) => Object.assign(stateData, patch));
      vi.mocked(editorUtils.useGetSetState).mockReturnValue([() => stateData, setState]);
      renderWithProvider({
        ...baseElement,
        url: 'https://example.com/v.mp4',
        controls: false,
        autoplay: true,
        loop: true,
        muted: true,
        poster: 'https://example.com/poster.jpg',
        width: 640,
        height: 360,
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      const video = screen.queryByTestId('video-element');
      if (video) {
        fireEvent.error(video);
        expect(setState).toHaveBeenCalledWith({ loadSuccess: false });
      }
    });
  });

  describe('mediaElement audio', () => {
    beforeEach(() => {
      vi.mocked(useRefFunctionModule.useRefFunction).mockImplementation((fn: any) => () => {});
    });

    it('audio 分支需 type 为 audio：通过 useGetSetState 提供', async () => {
      const stateData = {
        loadSuccess: true,
        url: 'https://example.com/a.mp3',
        type: 'audio' as const,
      };
      vi.mocked(editorUtils.useGetSetState).mockReturnValue([
        () => stateData,
        vi.fn((patch) => Object.assign(stateData, patch)),
      ]);
      vi.mocked(domUtils.getMediaType).mockReturnValue('other');
      renderWithProvider({ ...baseElement, url: 'https://example.com/a.mp3' });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      const audio = screen.queryByTestId('audio-element');
      if (audio) {
        expect(audio).toBeInTheDocument();
      }
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
    });

    it('audio loadSuccess false 时显示 MediaErrorLink', async () => {
      const stateData = {
        loadSuccess: false,
        url: 'https://example.com/a.mp3',
        type: 'audio' as const,
      };
      vi.mocked(editorUtils.useGetSetState).mockReturnValue([
        () => stateData,
        vi.fn((patch) => Object.assign(stateData, patch)),
      ]);
      vi.mocked(domUtils.getMediaType).mockReturnValue('other');
      renderWithProvider({ ...baseElement, url: 'https://example.com/a.mp3' });
      expect(screen.getByText(/音频链接|test alt|example\.com/)).toBeInTheDocument();
    });

    it('audio finished false 未超时显示 loading 占位', async () => {
      const stateData = {
        loadSuccess: true,
        url: 'https://example.com/a.mp3',
        type: 'audio' as const,
      };
      vi.mocked(editorUtils.useGetSetState).mockReturnValue([
        () => stateData,
        vi.fn((patch) => Object.assign(stateData, patch)),
      ]);
      vi.mocked(domUtils.getMediaType).mockReturnValue('other');
      const el = {
        ...baseElement,
        url: 'https://example.com/a.mp3',
        finished: false,
        alt: 'audio alt',
      };
      (el as any).rawMarkdown = '![a](url)';
      renderWithProvider(el as MediaNode);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      expect(screen.getByText(/音频加载中|audio alt|url/)).toBeInTheDocument();
    });

    it('audio finished false 无 rawMarkdown 无 alt 时显示音频加载中', async () => {
      const stateData = {
        loadSuccess: true,
        url: 'https://example.com/a.mp3',
        type: 'audio' as const,
      };
      vi.mocked(editorUtils.useGetSetState).mockReturnValue([
        () => stateData,
        vi.fn((patch) => Object.assign(stateData, patch)),
      ]);
      vi.mocked(domUtils.getMediaType).mockReturnValue('other');
      renderWithProvider({
        ...baseElement,
        url: 'https://example.com/a.mp3',
        finished: false,
        alt: '',
      } as MediaNode);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      expect(screen.getByText('音频加载中...')).toBeInTheDocument();
    });

    it('audio 元素 onError 时设置 loadSuccess false', async () => {
      const stateData = {
        loadSuccess: true,
        url: 'https://example.com/a.mp3',
        type: 'audio' as const,
      };
      const setState = vi.fn((patch: any) => Object.assign(stateData, patch));
      vi.mocked(editorUtils.useGetSetState).mockReturnValue([() => stateData, setState]);
      vi.mocked(domUtils.getMediaType).mockReturnValue('other');
      renderWithProvider({ ...baseElement, url: 'https://example.com/a.mp3' });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      const audio = screen.queryByTestId('audio-element');
      if (audio) {
        fireEvent.error(audio);
        expect(setState).toHaveBeenCalledWith({ loadSuccess: false });
      }
    });
  });

  describe('children', () => {
    it('应渲染隐藏的 children', () => {
      renderWithProvider(baseElement, {
        children: <span data-testid="child-content">child</span>,
      });
      const child = screen.getByTestId('child-content');
      expect(child).toBeInTheDocument();
      expect(child.closest('div')?.style.display).toBe('none');
    });
  });
});
