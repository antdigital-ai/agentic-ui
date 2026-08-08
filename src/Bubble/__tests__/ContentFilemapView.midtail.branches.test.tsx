/**
 * ContentFilemapView midtail：空 blocks、download 回退 previewUrl、uuid/name key。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentFilemapView } from '../ContentFilemapView';

let lastProps: any = {};

vi.mock('../../MarkdownInputField/FileMapView', () => ({
  FileMapView: (props: any) => {
    lastProps = props;
    return <div data-testid="file-view-list" />;
  },
}));

describe('ContentFilemapView midtail branches', () => {
  beforeEach(() => {
    lastProps = {};
  });

  it('空 blocks 返回 null', () => {
    const { container } = render(
      <ContentFilemapView blocks={[]} placement="left" />,
    );
    expect(container.querySelector('[data-testid="content-filemap-view"]')).toBeNull();
  });

  it('无 uuid 用 name 作 key；onDownload 回退 previewUrl', () => {
    const body = JSON.stringify({
      fileList: [{ name: 'n.png', previewUrl: 'https://p/n.png' }],
    });
    render(
      <ContentFilemapView
        blocks={[{ raw: body, body } as any]}
        placement="left"
      />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
    expect(lastProps.fileMap instanceof Map).toBe(true);
    expect(lastProps.fileMap.has('n.png')).toBe(true);

    const click = vi.fn();
    const link = { href: '', download: '', click } as any;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(link);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => link);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => link);
    lastProps.onDownload({ previewUrl: 'https://p/n.png', name: 'n.png' });
    expect(link.href).toBe('https://p/n.png');
    expect(click).toHaveBeenCalled();
  });

  it('fileViewEvents 抛错时 warn 并回退 default', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const body = JSON.stringify({
      fileList: [{ uuid: 'u1', name: 'a.png', url: 'https://a' }],
    });
    render(
      <ContentFilemapView
        blocks={[{ raw: body, body } as any]}
        fileViewEvents={() => {
          throw new Error('bad');
        }}
      />,
    );
    expect(warn).toHaveBeenCalled();
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
    warn.mockRestore();
  });
});
