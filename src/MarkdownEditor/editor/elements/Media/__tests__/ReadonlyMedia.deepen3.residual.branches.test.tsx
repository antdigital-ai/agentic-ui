/**
 * ReadonlyMedia deepen3：audio/video/image showAsText 默认文案、
 * video MediaErrorLink displayText 回退。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MediaNode } from '../../../../el';
import * as editorUtils from '../../../utils';
import * as domUtils from '../../../utils/dom';
import { ReadonlyMedia } from '../ReadonlyMedia';

vi.mock('antd', () => ({
  Skeleton: { Image: () => <div data-testid="skeleton3" /> },
}));

vi.mock('@ant-design/icons', () => ({
  LoadingOutlined: () => <span data-testid="loading3" />,
}));

vi.mock('../../Image', () => ({
  ReadonlyImage: (p: any) => (
    <img data-testid="ro-img3" src={p.src} alt={p.alt} />
  ),
}));

vi.mock('../../../components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => (
    <a data-testid="err3">{displayText}</a>
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

const renderMedia = (element: MediaNode) =>
  render(
    <ReadonlyMedia
      element={element}
      attributes={{ 'data-slate-node': 'element' } as any}
    >
      <span />
    </ReadonlyMedia>,
  );

describe('ReadonlyMedia deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('audio finished=false 超时：url 回退文案', () => {
    vi.mocked(editorUtils.useGetSetState).mockImplementation(((init: any) => {
      const state = { ...init, type: 'audio' };
      return [() => state, (p: any) => Object.assign(state, p)];
    }) as any);
    vi.mocked(domUtils.getMediaType).mockReturnValue('audio');
    renderMedia({
      type: 'media',
      url: 'https://example.com/a.mp3',
      finished: false,
      children: [{ text: '' }],
    } as MediaNode);
    act(() => {
      vi.advanceTimersByTime(5100);
    });
    expect(
      screen.getByText(/音频链接|https:\/\/example.com\/a\.mp3/),
    ).toBeInTheDocument();
  });

  it('video finished=false 超时：url 回退文案', () => {
    vi.mocked(editorUtils.useGetSetState).mockImplementation(((init: any) => {
      const state = { ...init, type: 'video' };
      return [() => state, (p: any) => Object.assign(state, p)];
    }) as any);
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    renderMedia({
      type: 'media',
      url: 'https://example.com/v.mp4',
      finished: false,
      children: [{ text: '' }],
    } as MediaNode);
    act(() => {
      vi.advanceTimersByTime(5100);
    });
    expect(
      screen.getByText(/视频链接|https:\/\/example.com\/v\.mp4/),
    ).toBeInTheDocument();
  });

  it('image finished=false 超时无 alt/url →「图片链接」', () => {
    vi.mocked(editorUtils.useGetSetState).mockImplementation(((init: any) => {
      const state = { ...init, type: 'image', url: '' };
      return [() => state, (p: any) => Object.assign(state, p)];
    }) as any);
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
    renderMedia({
      type: 'media',
      url: '',
      finished: false,
      children: [{ text: '' }],
    } as MediaNode);
    act(() => {
      vi.advanceTimersByTime(5100);
    });
    expect(screen.getByText('图片链接')).toBeInTheDocument();
  });

  it('video loadSuccess=false：MediaErrorLink 默认「视频链接」', () => {
    const stateData = {
      loadSuccess: false,
      url: '',
      type: 'video' as const,
    };
    vi.mocked(editorUtils.useGetSetState).mockReturnValue([
      () => stateData,
      vi.fn((p) => Object.assign(stateData, p)),
    ]);
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    renderMedia({
      type: 'media',
      url: '',
      finished: true,
      children: [{ text: '' }],
    } as MediaNode);
    expect(screen.getByTestId('err3')).toHaveTextContent('视频链接');
  });
});
