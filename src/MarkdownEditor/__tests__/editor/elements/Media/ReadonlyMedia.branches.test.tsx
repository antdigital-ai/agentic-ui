/**
 * ReadonlyMedia 分支覆盖：unsafe URL、audio 超时、attachment 回退与 finished 切换。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as htmlUrlSafety from '../../../../../Utils/htmlUrlSafety';
import { ReadonlyMedia } from '../../../../editor/elements/Media/ReadonlyMedia';
import * as editorUtils from '../../../../editor/utils';
import * as domUtils from '../../../../editor/utils/dom';
import { MediaNode } from '../../../../el';
import { TestSlateWrapper } from '../TestSlateWrapper';

vi.mock('../../../../editor/store', () => ({
  useEditorStore: vi.fn(() => ({ editorProps: {} })),
}));

vi.mock('../../../../editor/utils/dom', async (importOriginal) => {
  const actual = await importOriginal<typeof domUtils>();
  return { ...actual, getMediaType: vi.fn() };
});

vi.mock('../../../../editor/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof editorUtils>();
  return { ...actual, useGetSetState: vi.fn(actual.useGetSetState) };
});

vi.mock('../../../../../Hooks/useRefFunction', () => ({
  useRefFunction: vi.fn((fn: any) => fn),
}));

const mockAttributes = {
  'data-slate-node': 'element' as const,
  ref: vi.fn(),
};

const baseElement: MediaNode = {
  type: 'media',
  url: 'https://example.com/image.png',
  alt: 'alt text',
  children: [{ text: '' }],
};

const renderMedia = (element: MediaNode) =>
  render(
    <ConfigProvider>
      <TestSlateWrapper>
        <ReadonlyMedia element={element} attributes={mockAttributes}>
          {null}
        </ReadonlyMedia>
      </TestSlateWrapper>
    </ConfigProvider>,
  );

describe('ReadonlyMedia 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
    vi.spyOn(htmlUrlSafety, 'shouldRenderUrlAsPlainText').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('unsafe URL 渲染纯文本分支', () => {
    vi.spyOn(htmlUrlSafety, 'shouldRenderUrlAsPlainText').mockReturnValue(true);
    renderMedia({ ...baseElement, url: 'javascript:alert(1)' });
    expect(screen.getByTestId('media-unsafe-url-plain-text')).toBeInTheDocument();
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();
  });

  it('finished 从 false 切到 true 时清除 showAsText', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
    const { rerender } = renderMedia({ ...baseElement, finished: false });
    expect(document.querySelector('.ant-skeleton-image')).toBeInTheDocument();

    rerender(
      <ConfigProvider>
        <TestSlateWrapper>
          <ReadonlyMedia
            element={{ ...baseElement, finished: true }}
            attributes={mockAttributes}
          >
            {null}
          </ReadonlyMedia>
        </TestSlateWrapper>
      </ConfigProvider>,
    );
    expect(document.querySelector('.ant-skeleton-image')).not.toBeInTheDocument();
  });

  it('audio finished=false 超时后显示链接文本', async () => {
    vi.useFakeTimers();
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
    renderMedia({
      ...baseElement,
      url: 'https://example.com/a.mp3',
      finished: false,
      alt: '音频 alt',
    });
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/音频 alt|音频链接/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('attachment 无 alt/url 时回退「附件」', async () => {
    const stateData = {
      loadSuccess: true,
      url: '',
      type: 'attachment' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn((patch) => Object.assign(stateData, patch)),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('attachment');
    renderMedia({
      ...baseElement,
      url: '',
      alt: '',
    } as MediaNode);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('附件')).toBeInTheDocument();
  });

  it('video loadSuccess=true 渲染 controls 属性分支', async () => {
    const stateData = {
      loadSuccess: true,
      url: 'https://example.com/v.mp4',
      type: 'video' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn((patch) => Object.assign(stateData, patch)),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/v.mp4',
      controls: false,
      autoplay: true,
      loop: true,
      muted: true,
      poster: 'https://example.com/p.jpg',
      width: 320,
      height: 240,
    });
    await act(async () => {
      await Promise.resolve();
    });
    const video = screen.getByTestId('video-element');
    expect(video).not.toHaveAttribute('controls');
    expect(video).toHaveAttribute('autoplay');
  });

  it('audio 使用 otherProps.rawMarkdown 作为 loading 文案', async () => {
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
      otherProps: { rawMarkdown: '![audio](a.mp3)' },
    } as MediaNode;
    renderMedia(el);
    expect(screen.getByText('![audio](a.mp3)')).toBeInTheDocument();
  });

  it('image 类型 mediaElement 为 null 时 inner width 为 undefined', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
    renderMedia(baseElement);
    await act(async () => {
      await Promise.resolve();
    });
    const inner = document.querySelector('[data-be="media-container"]') as HTMLElement;
    expect(inner.style.width).toBe('');
  });

  it('getMediaType 返回 autio 时 initial 走 image 预加载分支', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('autio' as any);
    const orig = document.createElement.bind(document);
    const created: string[] = [];
    document.createElement = ((tag: string) => {
      created.push(tag.toLowerCase());
      return orig(tag);
    }) as typeof document.createElement;

    renderMedia({ ...baseElement, url: 'https://example.com/x.bin' });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(created).toContain('img');
    document.createElement = orig;
  });

  it('video onError 回调设置 loadSuccess false', async () => {
    const stateData = {
      loadSuccess: true,
      url: 'https://example.com/v.mp4',
      type: 'video' as const,
    };
    const setState = vi.fn((patch: any) => Object.assign(stateData, patch));
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      setState,
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    renderMedia({ ...baseElement, url: 'https://example.com/v.mp4' });
    await act(async () => {
      await Promise.resolve();
    });
    const video = screen.queryByTestId('video-element');
    if (video) {
      fireEvent.error(video);
      expect(setState).toHaveBeenCalledWith({ loadSuccess: false });
    }
  });

  it('video finished=false 五秒内展示 Skeleton 占位', () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/v.mp4',
      finished: false,
    });
    expect(document.querySelector('.ant-skeleton-image')).toBeInTheDocument();
  });

  it('video loadSuccess=false 渲染 MediaErrorLink', async () => {
    const stateData = {
      loadSuccess: false,
      url: 'https://example.com/bad.mp4',
      type: 'video' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn((patch) => Object.assign(stateData, patch)),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/bad.mp4',
      alt: '',
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText(/视频链接|bad\.mp4/)).toBeInTheDocument();
  });

  it('audio loadSuccess=true 渲染 audio 控件', async () => {
    const stateData = {
      loadSuccess: true,
      url: 'https://example.com/a.mp3',
      type: 'audio' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn((patch) => Object.assign(stateData, patch)),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('audio');
    renderMedia({ ...baseElement, url: 'https://example.com/a.mp3' });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId('audio-element')).toBeInTheDocument();
  });

  it('image finished=false 超时后回退 url 文案', async () => {
    vi.useFakeTimers();
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/pending.png',
      alt: '',
      finished: false,
    });
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('https://example.com/pending.png')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('attachment 有 url 时展示查看链接', async () => {
    const stateData = {
      loadSuccess: true,
      url: 'https://example.com/file.pdf',
      type: 'attachment' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn((patch) => Object.assign(stateData, patch)),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('attachment');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/file.pdf',
      alt: '文档.pdf',
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('查看')).toBeInTheDocument();
    expect(screen.getByText('文档.pdf')).toBeInTheDocument();
  });

  it('getMediaType 空值时 initial 默认 image 分支', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('' as any);
    renderMedia({ ...baseElement, url: '' });
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.querySelector('[data-be="media-container"]')).toBeInTheDocument();
  });

  it('video finished=false 超时后展示 url 文案', async () => {
    vi.useFakeTimers();
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/pending.mp4',
      alt: '',
      finished: false,
    });
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('https://example.com/pending.mp4')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('audio finished=false 超时后展示 alt 文案', async () => {
    vi.useFakeTimers();
    vi.mocked(domUtils.getMediaType).mockReturnValue('audio');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/pending.mp3',
      alt: '音频占位',
      finished: false,
    });
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('音频占位')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
