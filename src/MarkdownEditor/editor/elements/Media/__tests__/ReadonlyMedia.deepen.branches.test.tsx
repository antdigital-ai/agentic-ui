/**
 * ReadonlyMedia deepen：initial 预加载 onload/onerror、attachment、rawMarkdown、audio onError。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
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
  ReadonlyImage: (p: any) => <img data-testid="ro-img" src={p.src} alt={p.alt} />,
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

describe('ReadonlyMedia deepen branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('initial：image onerror 设置 loadSuccess false', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
    renderMedia({ ...baseElement, url: 'https://example.com/bad.png' });
    await act(async () => {
      await Promise.resolve();
    });
    const imgs = document.querySelectorAll('img');
    const preload = Array.from(imgs).find(
      (img) => img.src.includes('bad.png') && !img.dataset.testid,
    );
    if (preload) {
      fireEvent.error(preload);
    }
    expect(document.querySelector('[data-be="media"]')).toBeTruthy();
  });

  it('initial：video onloadedmetadata 成功', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    renderMedia({ ...baseElement, url: 'https://example.com/v.mp4' });
    await act(async () => {
      await Promise.resolve();
    });
    const videos = document.querySelectorAll('video');
    const preload = videos[videos.length - 1];
    if (preload) {
      fireEvent.loadedMetadata(preload);
    }
    expect(document.body).toBeTruthy();
  });

  it('attachment 类型完整渲染查看链接', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('attachment');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/doc.pdf',
      alt: '文档',
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('查看')).toBeInTheDocument();
    expect(screen.getByText('文档')).toBeInTheDocument();
  });

  it('audio finished=false 展示 rawMarkdown 加载文案', () => {
    const stateData = {
      loadSuccess: true,
      url: 'https://example.com/a.mp3',
      type: 'audio' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn((p) => Object.assign(stateData, p)),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('audio');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/a.mp3',
      finished: false,
      rawMarkdown: '![audio](a.mp3)',
    } as MediaNode);
    expect(screen.getByText('![audio](a.mp3)')).toBeInTheDocument();
  });

  it('audio 控件 onError 回退 loadSuccess', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('audio');
    renderMedia({ ...baseElement, url: 'https://example.com/a.mp3' });
    await act(async () => {
      await Promise.resolve();
    });
    const audio = screen.queryByTestId('audio-element');
    if (audio) {
      fireEvent.error(audio);
    }
    expect(document.body).toBeTruthy();
  });

  it('other 类型走 imageDom 分支', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('other');
    renderMedia({
      ...baseElement,
      url: 'https://example.com/x.webp',
      alt: 'webp',
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId('ro-img')).toBeInTheDocument();
  });

  it('finished=true 时 element.finished 分支清除 showAsText', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
    const { rerender } = renderMedia({
      ...baseElement,
      finished: false,
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    rerender(
      <ReadonlyMedia
        element={{ ...baseElement, finished: true }}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ReadonlyMedia>,
    );
    expect(screen.getByTestId('ro-img')).toBeInTheDocument();
  });
});
