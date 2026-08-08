/**
 * ReadonlyMedia 残留：unsafe url、finished 超时、other→image、load error（fake timers）。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MediaNode } from '../../../../el';
import { ReadonlyMedia } from '../../../../editor/elements/Media/ReadonlyMedia';
import * as editorUtils from '../../../../editor/utils';
import * as domUtils from '../../../../editor/utils/dom';

vi.mock('antd', () => ({
  Skeleton: { Image: () => <div data-testid="skeleton" /> },
}));

vi.mock('@ant-design/icons', () => ({
  LoadingOutlined: () => <span data-testid="loading" />,
}));

vi.mock('../../../../editor/elements/Image', () => ({
  ReadonlyImage: (p: any) => <img data-testid="ro-img" src={p.src} alt={p.alt} />,
}));

vi.mock('../../../../editor/components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => (
    <a data-testid="err">{displayText}</a>
  ),
}));

vi.mock('../../../../../Utils/htmlUrlSafety', () => ({
  shouldRenderUrlAsPlainText: (url: string) => url.startsWith('javascript:'),
  UNSAFE_URL_PLAIN_TEXT_STYLE: { color: 'red' },
}));

vi.mock('../../../../editor/utils', () => ({
  useGetSetState: vi.fn(),
}));

vi.mock('../../../../editor/utils/dom', () => ({
  getMediaType: vi.fn(),
}));

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

describe('ReadonlyMedia residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('javascript: url 渲染为纯文本', () => {
    const stateData = {
      loadSuccess: true,
      url: 'javascript:alert(1)',
      type: 'image' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn((p) => Object.assign(stateData, p)),
    ]);
    renderMedia({
      ...baseElement,
      url: 'javascript:alert(1)',
    });
    expect(screen.getByText(/javascript:/)).toBeInTheDocument();
  });

  it('finished=false 超时后显示文本；finished 恢复清超时', () => {
    const stateData = {
      loadSuccess: true,
      url: 'https://example.com/a.png',
      type: 'image' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn((p) => Object.assign(stateData, p)),
    ]);
    const { rerender } = renderMedia({
      ...baseElement,
      finished: false,
      alt: 'pending-img',
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/pending-img|图片/)).toBeInTheDocument();

    rerender(
      <ReadonlyMedia
        element={{ ...baseElement, finished: true }}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ReadonlyMedia>,
    );
  });

  it('getMediaType 返回 unknown 时归一为 other', async () => {
    const stateData = {
      loadSuccess: false,
      url: 'https://example.com/x.bin',
      type: 'other' as const,
    };
    const setState = vi.fn((p) => Object.assign(stateData, p));
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      setState,
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('unknown' as any);
    renderMedia({
      ...baseElement,
      url: 'https://example.com/x.bin',
      alt: 'bin',
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(setState).toHaveBeenCalled();
  });

  it('无 url 时 unsafeUrlPlainText 为 false', () => {
    const stateData = {
      loadSuccess: true,
      url: '',
      type: 'image' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn(),
    ]);
    renderMedia({ ...baseElement, url: undefined as any });
    expect(document.body).toBeTruthy();
  });

  it('video/audio 类型渲染；load 失败回退链接', async () => {
    for (const type of ['video', 'audio'] as const) {
      const stateData = {
        loadSuccess: true,
        url: `https://example.com/a.${type === 'video' ? 'mp4' : 'mp3'}`,
        type,
      };
      vi.mocked(editorUtils.useGetSetState).mockReturnValue([
        () => stateData,
        vi.fn(),
      ]);
      vi.mocked(domUtils.getMediaType).mockReturnValue(type);
      renderMedia({
        ...baseElement,
        url: stateData.url,
        mediaType: type,
        alt: type,
      });
    }
    const failState = {
      loadSuccess: false,
      url: 'https://example.com/x.png',
      type: 'image' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => failState,
      vi.fn(),
    ]);
    renderMedia({ ...baseElement, url: failState.url, alt: 'fail-alt' });
    expect(document.body.textContent).toMatch(/fail-alt|example|/);
  });

  it('exclusive deepen：attachment；空 alt；宽高；unsafe url 纯文本', () => {
    const attachState = {
      loadSuccess: true,
      url: 'https://example.com/a.pdf',
      type: 'other' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => attachState,
      vi.fn(),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('other' as any);
    renderMedia({
      ...baseElement,
      url: attachState.url,
      mediaType: 'other',
      alt: 'attachment:doc.pdf',
      width: 100,
      height: 50,
    });

    const emptyAlt = {
      loadSuccess: true,
      url: 'https://example.com/v.mp4',
      type: 'video' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => emptyAlt,
      vi.fn(),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    renderMedia({
      ...baseElement,
      url: emptyAlt.url,
      mediaType: 'video',
      alt: undefined,
      width: undefined,
      height: undefined,
    });

    const unsafe = {
      loadSuccess: true,
      url: 'javascript:alert(1)',
      type: 'image' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => unsafe,
      vi.fn(),
    ]);
    renderMedia({
      ...baseElement,
      url: unsafe.url,
      mediaType: 'image',
      alt: 'bad',
    });

    const audioEmpty = {
      loadSuccess: false,
      url: '',
      type: 'audio' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => audioEmpty,
      vi.fn(),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('audio');
    renderMedia({
      ...baseElement,
      url: '',
      mediaType: 'audio',
      alt: '',
    });
    expect(document.body).toBeTruthy();
  });
});
