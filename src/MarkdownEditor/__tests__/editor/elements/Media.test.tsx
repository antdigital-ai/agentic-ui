import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { createEditor, Node } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Media } from '../../../editor/elements/Media';
import type { MediaNode } from '../../../el';

const context = vi.hoisted(() => ({
  readonly: false,
  editorProps: {} as Record<string, unknown>,
}));
vi.mock('../../../editor/store', () => ({ useEditorStore: () => context }));
vi.mock('../../../hooks/editor', () => ({
  useElementSelected: () => false,
}));
vi.mock('slate-react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('slate-react')>()),
  useSelected: () => false,
}));

const element = (type: string, extra: Partial<MediaNode> = {}): MediaNode => ({
  type: 'media',
  mediaType: type,
  url: `https://example.com/file.${type === 'image' ? 'png' : type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : 'pdf'}`,
  alt: 'Test media',
  children: [{ text: '' }],
  ...extra,
});
const view = (node: MediaNode) => (
  <Media
    element={node}
    attributes={{ 'data-slate-node': 'element', ref: () => {} }}
  >
    <span>hidden Slate leaf</span>
  </Media>
);

beforeEach(() => {
  context.readonly = false;
  context.editorProps = {};
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Media visible content', () => {
  it('preserves Slate attributes and its hidden children', () => {
    const { container } = render(view(element('image')));
    expect(container.firstElementChild).toHaveAttribute(
      'data-slate-node',
      'element',
    );
    expect(screen.getByText('hidden Slate leaf').parentElement).toHaveStyle({
      display: 'none',
    });
    expect(screen.getByTestId('media-container')).toHaveAttribute(
      'data-drag-el',
    );
  });

  it('loads the displayed editable image without resize controls while unselected', () => {
    const { container } = render(view(element('image')));
    const image = screen.getByAltText('Test media');
    expect(image).toHaveAttribute('src', 'https://example.com/file.png');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(container.querySelector('.react-resizable')).toBeNull();
    fireEvent.load(image);
    expect(image).not.toHaveStyle({ visibility: 'hidden' });
  });

  it.each(['video', 'audio'])(
    'mounts a %s player immediately with metadata preload',
    (type) => {
      render(view(element(type)));
      const player = screen.getByTestId(`${type}-element`);
      expect(player).toHaveAttribute('controls');
      expect(player).toHaveAttribute('preload', 'metadata');
      expect(player).toHaveAttribute('src', element(type).url);
      fireEvent.loadedMetadata(player);
      expect(screen.getByTestId(`${type}-element`)).toBe(player);
    },
  );

  it.each(['video', 'audio'])(
    'falls back to a link when the visible %s player fails',
    (type) => {
      render(view(element(type)));
      fireEvent.error(screen.getByTestId(`${type}-element`));
      expect(screen.queryByTestId(`${type}-element`)).toBeNull();
      expect(screen.getByText('Test media')).toBeInTheDocument();
    },
  );

  it('shows an error link when the displayed image fails', () => {
    render(view(element('image')));
    fireEvent.error(screen.getByAltText('Test media'));
    expect(screen.queryByAltText('Test media')).toBeNull();
    expect(screen.getByText('Test media')).toBeInTheDocument();
  });

  it('retries a failed player when its URL changes', () => {
    const { rerender } = render(view(element('video')));
    fireEvent.error(screen.getByTestId('video-element'));
    rerender(
      view(element('video', { url: 'https://example.com/replacement.mp4' })),
    );
    expect(screen.getByTestId('video-element')).toHaveAttribute(
      'src',
      'https://example.com/replacement.mp4',
    );
    expect(screen.queryByText('Test media')).toBeNull();
  });

  it('passes native video controls and dimensions to the player', () => {
    render(
      view(
        element('video', {
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

  it('shows unsafe URLs as text without creating resource or download elements', () => {
    const { container } = render(
      view(element('image', { url: 'javascript:alert(1)' })),
    );
    expect(screen.getByTestId('media-unsafe-url-plain-text')).toHaveTextContent(
      'javascript:alert(1)',
    );
    expect(container.querySelector('img, video, audio, a')).toBeNull();
  });

  it('renders an attachment name, download URL, and safe view link', () => {
    render(view(element('attachment', { alt: 'attachment:report.pdf' })));
    const download = screen.getByRole('link', { name: 'report.pdf' });
    expect(download).toHaveAttribute('href', 'https://example.com/file.pdf');
    expect(download).toHaveAttribute('download', 'report.pdf');
    expect(screen.getByRole('link', { name: '查看' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });

  it('renders optional attachment update information', () => {
    render(
      view(
        element('attachment', {
          otherProps: {
            updateTime: 'Updated today',
            collaborators: [{ Alice: 2 }],
          },
        }),
      ),
    );
    expect(screen.getByText('Updated today')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Test media' }),
    ).toBeInTheDocument();
  });

  it('keeps rendering an attachment without optional metadata', () => {
    render(view(element('attachment', { alt: '', url: '' })));
    expect(screen.getByText('attachment')).toHaveAttribute(
      'download',
      'attachment',
    );
  });

  it('does not modify an imported document to fill in a missing mediaType', () => {
    const node = element('video');
    delete node.mediaType;
    const editor = createEditor();
    editor.children = [node];
    const before = JSON.stringify(editor.children);
    render(view(node));
    expect(screen.getByTestId('video-element')).toBeInTheDocument();
    expect(JSON.stringify(editor.children)).toBe(before);
    expect(Node.string(editor)).toBe('');
  });

  it('uses the readonly image renderer and removes editing affordances', () => {
    context.readonly = true;
    render(view(element('image')));
    expect(screen.getByAltText('Test media')).toHaveAttribute(
      'src',
      'https://example.com/file.png',
    );
    expect(screen.queryByTestId('resize-image-container')).toBeNull();
    expect(screen.getByTestId('media-container')).not.toHaveAttribute(
      'data-drag-el',
    );
  });

  it.each(['video', 'audio', 'image'])(
    'shows unfinished %s as text after five seconds',
    (type) => {
      vi.useFakeTimers();
      const { container } = render(view(element(type, { finished: false })));
      expect(container.querySelector('img, video, audio')).toBeNull();
      act(() => vi.advanceTimersByTime(5000));
      expect(screen.getByText('Test media')).toBeInTheDocument();
    },
  );

  it('replaces the streaming placeholder as soon as media is finished', () => {
    const { rerender, container } = render(
      view(element('video', { finished: false })),
    );
    expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
    rerender(view(element('video', { finished: true })));
    expect(screen.getByTestId('video-element')).toBeInTheDocument();
    expect(container.querySelector('.ant-skeleton')).toBeNull();
  });

  it('prevents dragging the editor media wrapper', () => {
    render(view(element('video')));
    expect(fireEvent.dragStart(screen.getByTestId('media-container'))).toBe(
      false,
    );
  });
});
