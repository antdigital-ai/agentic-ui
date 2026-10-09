import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResizeImage as ImageResize } from '../../../editor/elements/Image';
import { Media, ResizeImage } from '../../../editor/elements/Media';
import type { MediaNode } from '../../../el';

const state = vi.hoisted(() => ({
  editorProps: {} as Record<string, unknown>,
  readonly: false,
}));
vi.mock('../../../editor/store', () => ({ useEditorStore: () => state }));
vi.mock('../../../hooks/editor', () => ({
  useElementSelected: () => false,
}));
vi.mock('slate-react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('slate-react')>()),
  useSelected: () => false,
}));
const node = (type: string, extra: Partial<MediaNode> = {}): MediaNode => ({
  type: 'media',
  mediaType: type,
  url: 'https://example.com/resource',
  alt: 'Resource',
  children: [{ text: '' }],
  ...extra,
});
const view = (element: MediaNode) => (
  <Media
    element={element}
    attributes={{ 'data-slate-node': 'element', ref: () => {} }}
  >
    <span />
  </Media>
);
beforeEach(() => {
  vi.clearAllMocks();
  state.editorProps = {};
  state.readonly = false;
});
afterEach(() => vi.restoreAllMocks());

describe('Media resource links and stable exports', () => {
  it('preserves the shared ResizeImage export', () => {
    expect(ResizeImage).toBe(ImageResize);
  });
  it.each(['video', 'audio'])(
    'opens a failed %s URL using linkConfig and the requested target',
    (type) => {
      const onClick = vi.fn();
      const open = vi.spyOn(window, 'open').mockReturnValue(null);
      state.editorProps = { linkConfig: { onClick, openInNewTab: false } };
      render(view(node(type)));
      fireEvent.error(screen.getByTestId(`${type}-element`));
      fireEvent.click(screen.getByText('Resource'));
      expect(onClick).toHaveBeenCalledExactlyOnceWith(
        'https://example.com/resource',
      );
      expect(open).toHaveBeenCalledWith(
        'https://example.com/resource',
        '_self',
      );
    },
  );
  it('allows linkConfig to cancel opening a failed resource', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    state.editorProps = { linkConfig: { onClick: () => false } };
    render(view(node('video')));
    fireEvent.error(screen.getByTestId('video-element'));
    fireEvent.click(screen.getByText('Resource'));
    expect(open).not.toHaveBeenCalled();
  });
  it('opens failed resources in a new tab by default', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    render(view(node('audio')));
    fireEvent.error(screen.getByTestId('audio-element'));
    fireEvent.click(screen.getByText('Resource'));
    expect(open).toHaveBeenCalledWith('https://example.com/resource', '_blank');
  });
  it('does not open a missing resource URL', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    render(view(node('audio', { url: '' })));
    fireEvent.click(screen.getByText('Resource'));
    expect(open).not.toHaveBeenCalled();
  });
  it('keeps explicit mediaType authoritative for extensionless sources', () => {
    render(view(node('audio', { url: 'https://cdn.example/download?id=1' })));
    expect(screen.getByTestId('audio-element')).toHaveAttribute(
      'src',
      'https://cdn.example/download?id=1',
    );
    expect(screen.queryByAltText('Resource')).toBeNull();
  });
  it('renders an unknown resource as an editable image', () => {
    render(view(node('unknown')));
    expect(screen.getByAltText('Resource')).toHaveAttribute(
      'src',
      'https://example.com/resource',
    );
    expect(screen.getByTestId('resize-image-container')).toBeInTheDocument();
  });
  it('keeps safe attachment view links independent of editor selection', () => {
    render(view(node('attachment', { alt: 'attachment:document.pdf' })));
    const link = screen.getByRole('link', { name: '查看' });
    expect(fireEvent.mouseDown(link)).toBe(true);
    expect(link).toHaveAttribute('href', 'https://example.com/resource');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
  it('uses the default attachment name when its label is empty', () => {
    render(view(node('attachment', { alt: '' })));
    expect(screen.getByRole('link', { name: 'attachment' })).toHaveAttribute(
      'download',
      'attachment',
    );
  });
  it('shows attachment metadata without creating an image or player', () => {
    const { container } = render(
      view(
        node('attachment', {
          otherProps: { collaborators: [{ Alice: 0 }], updateTime: 'Updated' },
        }),
      ),
    );
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(container.querySelector('img, video, audio')).toBeNull();
  });
});
