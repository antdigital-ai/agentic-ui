import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyMedia } from '../../../../editor/elements/Media/ReadonlyMedia';
import type { MediaNode } from '../../../../el';

vi.mock('../../../../editor/store', () => ({
  useEditorStore: () => ({ editorProps: {} }),
}));
const view = (extra: Partial<MediaNode> = {}) => (
  <ReadonlyMedia
    element={{
      type: 'media',
      mediaType: 'video',
      url: 'https://example.com/video.mp4',
      alt: 'Video',
      children: [{ text: '' }],
      ...extra,
    }}
    attributes={{ 'data-slate-node': 'element', ref: () => {} }}
  >
    <span />
  </ReadonlyMedia>
);
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('ReadonlyMedia resource transitions', () => {
  it.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>'])(
    'renders unsafe %s as plain text',
    (url) => {
      const { container } = render(view({ url }));
      expect(
        screen.getByTestId('media-unsafe-url-plain-text'),
      ).toHaveTextContent(url);
      expect(container.querySelector('video, audio, img, a')).toBeNull();
    },
  );
  it('cancels an unfinished resource timer when its URL is replaced', () => {
    vi.useFakeTimers();
    const { rerender } = render(view({ finished: false, alt: 'First' }));
    act(() => vi.advanceTimersByTime(4000));
    rerender(
      view({
        finished: false,
        url: 'https://example.com/new.mp4',
        alt: 'Second',
      }),
    );
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Second')).toBeNull();
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.queryByText('First')).toBeNull();
  });
  it('cleans up the streaming timeout on unmount', () => {
    vi.useFakeTimers();
    const clearTimeout = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = render(view({ finished: false }));
    const before = clearTimeout.mock.calls.length;
    unmount();
    expect(clearTimeout.mock.calls.length).toBeGreaterThan(before);
  });
  it('changes player type when the mediaType changes for the same URL', () => {
    const { rerender } = render(view());
    const video = screen.getByTestId('video-element');
    rerender(view({ mediaType: 'audio' }));
    expect(screen.queryByTestId('video-element')).toBeNull();
    expect(screen.getByTestId('audio-element')).not.toBe(video);
  });
  it('retains a failed resource link during unrelated attribute updates', () => {
    const { rerender } = render(view());
    fireEvent.error(screen.getByTestId('video-element'));
    rerender(view({ width: 500 }));
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.queryByTestId('video-element')).toBeNull();
  });
  it('preserves optional attachment update information and download filename', () => {
    render(
      view({
        mediaType: 'attachment',
        alt: 'attachment:report.pdf',
        otherProps: { updateTime: '2026-10-09' },
      }),
    );
    expect(screen.getByText('2026-10-09')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'attachment:report.pdf' }),
    ).toHaveAttribute('download', 'report.pdf');
  });
});
