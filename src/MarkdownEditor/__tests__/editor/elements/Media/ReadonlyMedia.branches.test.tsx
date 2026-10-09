import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyMedia } from '../../../../editor/elements/Media/ReadonlyMedia';
import type { MediaNode } from '../../../../el';

vi.mock('../../../../editor/store', () => ({
  useEditorStore: () => ({ editorProps: {} }),
}));
const node = (extra: Partial<MediaNode> = {}): MediaNode => ({
  type: 'media',
  mediaType: 'video',
  url: 'https://example.com/video',
  alt: '',
  children: [{ text: '' }],
  ...extra,
});
const view = (element: MediaNode) => (
  <ReadonlyMedia
    element={element}
    attributes={{ 'data-slate-node': 'element', ref: () => {} }}
  >
    <span />
  </ReadonlyMedia>
);
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('ReadonlyMedia loading and native player options', () => {
  it('uses explicit mediaType for extensionless audio URLs', () => {
    render(
      view(
        node({ mediaType: 'audio', url: 'https://cdn.example/resource?id=7' }),
      ),
    );
    expect(screen.getByTestId('audio-element')).toHaveAttribute(
      'src',
      'https://cdn.example/resource?id=7',
    );
    expect(screen.queryByTestId('video-element')).toBeNull();
  });
  it('uses the file extension when mediaType is missing', () => {
    render(
      view(
        node({ mediaType: undefined, url: 'https://example.com/audio.mp3' }),
      ),
    );
    expect(screen.getByTestId('audio-element')).toBeInTheDocument();
  });
  it('falls back to the readonly image for an unrecognized resource type', () => {
    render(
      view(node({ mediaType: 'unknown', url: 'https://example.com/unknown' })),
    );
    expect(screen.getByAltText('image')).toHaveAttribute(
      'src',
      'https://example.com/unknown',
    );
  });
  it('passes all native video options and pixel dimensions', () => {
    render(
      view(
        node({
          controls: false,
          autoplay: true,
          loop: true,
          muted: true,
          poster: 'poster.png',
          width: 640,
          height: 360,
        }),
      ),
    );
    const player = screen.getByTestId('video-element') as HTMLVideoElement;
    expect(player.controls).toBe(false);
    expect(player.autoplay).toBe(true);
    expect(player.loop).toBe(true);
    expect(player.muted).toBe(true);
    expect(player).toHaveAttribute('poster', 'poster.png');
    expect(player).toHaveStyle({ width: '640px', height: '360px' });
  });
  it('uses responsive dimensions when width and height are omitted', () => {
    render(view(node()));
    expect(screen.getByTestId('video-element')).toHaveStyle({
      width: '100%',
      height: 'auto',
    });
  });
  it.each(['video', 'audio'])(
    'uses the URL as a failed %s label when alt is empty',
    (type) => {
      render(view(node({ mediaType: type })));
      fireEvent.error(screen.getByTestId(`${type}-element`));
      expect(screen.getByText('https://example.com/video')).toBeInTheDocument();
    },
  );
  it.each([
    ['video', '视频链接'],
    ['audio', '音频链接'],
  ])('handles missing %s URLs without attempting playback', (type, label) => {
    render(view(node({ mediaType: type, url: '' })));
    expect(screen.queryByTestId(`${type}-element`)).toBeNull();
    expect(screen.getByText(label)).toBeInTheDocument();
  });
  it('uses otherProps.rawMarkdown as the unfinished audio label', () => {
    render(
      view(
        node({
          mediaType: 'audio',
          finished: false,
          otherProps: { rawMarkdown: 'audio markdown' },
        }),
      ),
    );
    expect(screen.getByText('audio markdown')).toBeInTheDocument();
  });
  it('uses a default label for unfinished audio without text', () => {
    render(view(node({ mediaType: 'audio', url: '', finished: false })));
    expect(screen.getByText('音频加载中...')).toBeInTheDocument();
  });
  it.each([
    ['video', '视频链接'],
    ['audio', '音频链接'],
    ['image', '图片链接'],
  ])('uses the default %s fallback after five seconds', (type, label) => {
    vi.useFakeTimers();
    render(view(node({ mediaType: type, url: '', finished: false })));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText(label)).toBeInTheDocument();
  });
  it('returns from timed-out text to the player when streaming finishes', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      view(node({ finished: false, alt: 'Pending video' })),
    );
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('Pending video')).toBeInTheDocument();
    rerender(view(node({ finished: true })));
    expect(screen.getByTestId('video-element')).toBeInTheDocument();
    expect(screen.queryByText('Pending video')).toBeNull();
  });
  it('uses the readonly attachment fallback name when no text is supplied', () => {
    render(view(node({ mediaType: 'attachment', url: '', alt: '' })));
    expect(screen.getByText('附件')).toHaveAttribute('download', 'attachment');
  });
});
