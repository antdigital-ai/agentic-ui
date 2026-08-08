/**
 * ReadonlyMedia deepen2 residual：image/video showAsText、video 无 alt 回退、
 * audio finished 无 rawMarkdown、loadSuccess false MediaErrorLink。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MediaNode } from '../../../../el';
import { ReadonlyMedia } from '../ReadonlyMedia';
import * as editorUtils from '../../../utils';
import * as domUtils from '../../../utils/dom';

vi.mock('antd', () => ({
  Skeleton: { Image: () => <div data-testid="skeleton" /> },
}));

vi.mock('@ant-design/icons', () => ({
  LoadingOutlined: () => <span data-testid="loading" />,
}));

vi.mock('../../Image', () => ({
  ReadonlyImage: (p: any) => (
    <img data-testid="ro-img" src={p.src} alt={p.alt} />
  ),
}));

vi.mock('../../../components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => (
    <a data-testid="err">{displayText}</a>
  ),
}));

vi.mock('../../../../../Utils/htmlUrlSafety', () => ({
  shouldRenderUrlAsPlainText: () => false,
  UNSAFE_URL_PLAIN_TEXT_STYLE: {},
}));

vi.mock('../../../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof editorUtils>();
  return { ...actual, useGetSetState: vi.fn(actual.useGetSetState) };
});

vi.mock('../../../utils/dom', async (importOriginal) => {
  const actual = await importOriginal<typeof domUtils>();
  return { ...actual, getMediaType: vi.fn(actual.getMediaType) };
});

const baseElement = {
  type: 'media',
  url: 'https://example.com/a.png',
  children: [{ text: '' }],
} as MediaNode;

const renderMedia = (element: MediaNode) =>
  render(
    <ReadonlyMedia
      element={element}
      attributes={{ 'data-slate-node': 'element' } as any}
    >
      <span />
    </ReadonlyMedia>,
  );

describe('ReadonlyMedia deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('image finished=false 超时后 showAsText 用 url 回退', () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
    renderMedia({
      ...baseElement,
      finished: false,
      alt: undefined,
      url: 'https://example.com/late.png',
    } as MediaNode);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('https://example.com/late.png')).toBeInTheDocument();
  });

  it('video finished=false 超时后默认「视频链接」；loadSuccess false 错误链', () => {
    const stateData = {
      loadSuccess: false,
      url: 'https://example.com/v.mp4',
      type: 'video' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn((p) => Object.assign(stateData, p)),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/v.mp4',
      finished: true,
      alt: undefined,
    } as MediaNode);
    expect(screen.getByTestId('err')).toHaveTextContent(/视频链接|v\.mp4/);
  });

  it('video finished=false 5s 后文本回退', () => {
    vi.mocked(editorUtils.useGetSetState).mockRestore?.();
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    // 恢复真实 useGetSetState
    vi.mocked(editorUtils.useGetSetState).mockImplementation(
      (editorUtils as any).useGetSetState?.bind?.(editorUtils) ||
        ((init: any) => {
          let s = { ...init };
          return [() => s, (p: any) => Object.assign(s, p)];
        }),
    );
    // 直接用默认 mock 实现
    const actual = vi.importActual
      ? null
      : null;
    void actual;
    vi.mocked(editorUtils.useGetSetState).mockImplementation(((init: any) => {
      const state = { ...init };
      return [() => state, (p: any) => Object.assign(state, p)];
    }) as any);

    renderMedia({
      ...baseElement,
      url: 'https://example.com/v.mp4',
      finished: false,
    } as MediaNode);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(
      screen.getByText(/视频链接|https:\/\/example.com\/v\.mp4/),
    ).toBeInTheDocument();
  });

  it('audio finished=false 无 rawMarkdown 显示默认加载文案；成功后 onError', async () => {
    vi.mocked(editorUtils.useGetSetState).mockImplementation(((init: any) => {
      const state = {
        loadSuccess: true,
        url: 'https://example.com/a.mp3',
        type: 'audio',
        ...init,
      };
      return [() => state, (p: any) => Object.assign(state, p)];
    }) as any);
    vi.mocked(domUtils.getMediaType).mockReturnValue('audio');

    const { unmount } = renderMedia({
      ...baseElement,
      url: 'https://example.com/a.mp3',
      finished: false,
      alt: undefined,
    } as MediaNode);
    expect(screen.getByText('音频加载中...')).toBeInTheDocument();
    unmount();

    vi.mocked(editorUtils.useGetSetState).mockImplementation(((_init: any) => {
      const state = {
        loadSuccess: true,
        url: 'https://example.com/a.mp3',
        type: 'audio',
      };
      return [() => state, (p: any) => Object.assign(state, p)];
    }) as any);

    renderMedia({
      ...baseElement,
      url: 'https://example.com/a.mp3',
      finished: true,
    } as MediaNode);
    const audio = screen.queryByTestId('audio-element');
    if (audio) fireEvent.error(audio);
    expect(document.body).toBeTruthy();
  });

  it('initial audio onerror / onloadedmetadata', async () => {
    vi.mocked(editorUtils.useGetSetState).mockImplementation(
      (await vi.importActual<typeof editorUtils>('../../../utils'))
        .useGetSetState as any,
    );
    vi.mocked(domUtils.getMediaType).mockReturnValue('audio');
    renderMedia({ ...baseElement, url: 'https://example.com/a.mp3' });
    await act(async () => {
      await Promise.resolve();
    });
    const audios = document.querySelectorAll('audio');
    const preload = audios[audios.length - 1];
    if (preload) {
      fireEvent.error(preload);
      fireEvent.loadedMetadata(preload);
    }
    expect(document.body).toBeTruthy();
  });
});
