import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyMedia } from '../../../../editor/elements/Media/ReadonlyMedia';
import type { MediaNode } from '../../../../el';

vi.mock('../../../../editor/store', () => ({
  useEditorStore: () => ({ editorProps: {} }),
}));
const node = (type: string, extra: Partial<MediaNode> = {}): MediaNode => ({
  type: 'media',
  mediaType: type,
  url: 'https://example.com/media',
  alt: 'Media label',
  children: [{ text: '' }],
  ...extra,
});
const view = (element: MediaNode) => (
  <ReadonlyMedia
    element={element}
    attributes={{ 'data-slate-node': 'element', ref: () => {} }}
  >
    <span>Slate leaf</span>
  </ReadonlyMedia>
);
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('ReadonlyMedia displayed resources', () => {
  it('keeps Slate attributes and children outside its noneditable content', () => {
    const { container } = render(view(node('image')));
    expect(container.firstElementChild).toHaveAttribute(
      'data-slate-node',
      'element',
    );
    expect(
      container.querySelector('[data-be="media-container"]'),
    ).toHaveAttribute('contenteditable', 'false');
    expect(screen.getByText('Slate leaf').parentElement).toHaveStyle({
      display: 'none',
    });
    expect(screen.getByTestId('media-container')).not.toHaveAttribute(
      'data-drag-el',
    );
  });
  it('uses the readonly image with explicit dimensions', () => {
    render(view(node('image', { width: 320, height: 160 })));
    expect(screen.getByAltText('Media label')).toHaveAttribute(
      'src',
      'https://example.com/media',
    );
    expect(screen.queryByTestId('resize-image-container')).toBeNull();
  });
  it.each(['video', 'audio'])(
    'renders the visible %s player without a probe',
    (type) => {
      render(view(node(type)));
      expect(screen.getByTestId(`${type}-element`)).toHaveAttribute(
        'src',
        'https://example.com/media',
      );
      expect(screen.getByTestId(`${type}-element`)).toHaveAttribute(
        'preload',
        'none',
      );
    },
  );
  it.each(['video', 'audio'])(
    'keeps the visible %s DOM when metadata arrives',
    (type) => {
      render(view(node(type)));
      const player = screen.getByTestId(`${type}-element`);
      fireEvent.loadedMetadata(player);
      expect(screen.getByTestId(`${type}-element`)).toBe(player);
    },
  );
  it('retains eager metadata for explicitly requested autoplay', () => {
    render(view(node('video', { autoplay: true })));
    expect(screen.getByTestId('video-element')).toHaveAttribute(
      'preload',
      'metadata',
    );
    expect(screen.getByTestId('video-element')).toHaveAttribute('autoplay');
  });
  it.each(['video', 'audio'])(
    'replaces a failed %s with its clickable label',
    (type) => {
      render(view(node(type)));
      fireEvent.error(screen.getByTestId(`${type}-element`));
      expect(screen.queryByTestId(`${type}-element`)).toBeNull();
      expect(screen.getByText('Media label')).toBeInTheDocument();
    },
  );
  it('renders the attachment download and view links', () => {
    render(view(node('attachment', { alt: 'attachment:guide.pdf' })));
    expect(
      screen.getByRole('link', { name: 'attachment:guide.pdf' }),
    ).toHaveAttribute('download', 'guide.pdf');
    expect(screen.getByRole('link', { name: '查看' })).toHaveAttribute(
      'target',
      '_blank',
    );
  });
  it('shows unsafe media URLs as text without mounting a resource', () => {
    const { container } = render(
      view(node('video', { url: 'javascript:alert(1)' })),
    );
    expect(screen.getByTestId('media-unsafe-url-plain-text')).toHaveTextContent(
      'javascript:alert(1)',
    );
    expect(container.querySelector('img, video, audio, a')).toBeNull();
  });
  it.each(['image', 'video'])(
    'shows an unfinished %s skeleton, then its fallback text',
    (type) => {
      vi.useFakeTimers();
      const { container } = render(view(node(type, { finished: false })));
      expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(4999));
      expect(screen.queryByText('Media label')).toBeNull();
      act(() => vi.advanceTimersByTime(1));
      expect(screen.getByText('Media label')).toBeInTheDocument();
      expect(container.querySelector('img, video')).toBeNull();
    },
  );
  it('shows the unfinished audio label and starts its player when finished', () => {
    const { rerender } = render(
      view(
        node('audio', {
          finished: false,
          otherProps: { rawMarkdown: 'Streaming audio...' },
        }),
      ),
    );
    expect(screen.getByText('Streaming audio...')).toBeInTheDocument();
    expect(screen.queryByTestId('audio-element')).toBeNull();
    rerender(view(node('audio', { finished: true })));
    expect(screen.getByTestId('audio-element')).toBeInTheDocument();
  });
  it('resets a failed player when the resource URL changes', () => {
    const { rerender } = render(view(node('video')));
    fireEvent.error(screen.getByTestId('video-element'));
    rerender(view(node('video', { url: 'https://example.com/replacement' })));
    expect(screen.getByTestId('video-element')).toHaveAttribute(
      'src',
      'https://example.com/replacement',
    );
  });
  it('updates a player attribute without remounting its DOM', () => {
    const { rerender } = render(view(node('video')));
    const player = screen.getByTestId('video-element') as HTMLVideoElement;
    rerender(view(node('video', { controls: false, loop: true, width: 300 })));
    expect(screen.getByTestId('video-element')).toBe(player);
    expect(player.controls).toBe(false);
    expect(player.loop).toBe(true);
    expect(player).toHaveStyle({ width: '300px' });
  });
});
