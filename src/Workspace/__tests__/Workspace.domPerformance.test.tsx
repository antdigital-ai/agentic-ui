import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrowserList, type BrowserItem } from '../Browser';
import { FileComponent } from '../File/FileComponent';
import { FileItem } from '../File/components/FileItem';
import type { FileNode, GroupNode } from '../types';

afterEach(cleanup);

const files: FileNode[] = Array.from({ length: 50 }, (_, index) => ({
  id: `file-${index}`,
  name: `file-${index}.txt`,
  size: 1024,
  lastModified: '2026-01-01T00:00:00Z',
  canPreview: false,
  canDownload: false,
}));

describe('Workspace DOM and rendering budgets', () => {
  it('keeps all file names and metadata without empty action or preview elements', () => {
    const { container } = render(<FileComponent nodes={files} />);

    expect(
      screen.getAllByRole('button', { name: /^文件：file-/ }),
    ).toHaveLength(50);
    expect(screen.getAllByText('1.00 KB')).toHaveLength(50);
    console.info('File list DOM:', container.querySelectorAll('*').length);
    expect(
      container.querySelectorAll('.ant-workspace-file-item-actions'),
    ).toHaveLength(0);
    expect(
      container.querySelector('.ant-workspace-file-hidden-image'),
    ).toBeNull();
  });

  it('keeps tree leaf names in two elements per row without empty action wrappers', () => {
    const { container } = render(
      <>
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            layout="tree"
            prefixCls="ant-workspace-file"
            hashId=""
          />
        ))}
      </>,
    );

    console.info('Tree leaf DOM:', container.querySelectorAll('*').length);
    expect(screen.getByText('file-49.txt')).toHaveAttribute(
      'title',
      'file-49.txt',
    );
    expect(container.querySelectorAll('*').length).toBeLessThanOrEqual(100);
  });

  it('does not rerender another group when a group collapses', () => {
    const renderName = vi.fn(({ file }: { file: FileNode }) => file.name);
    const groups: GroupNode[] = [
      {
        id: 'group-one',
        name: 'First',
        type: 'text',
        children: files.slice(0, 25),
      },
      {
        id: 'group-two',
        name: 'Second',
        type: 'text',
        children: files.slice(25).map((file) => ({ ...file, renderName })),
      },
    ];
    render(<FileComponent nodes={groups} />);
    renderName.mockClear();

    fireEvent.click(screen.getByRole('button', { name: '收起First分组' }));

    expect(screen.getByText('file-49.txt')).toBeInTheDocument();
    expect(renderName).not.toHaveBeenCalled();
  });

  it('renders updated names and action callbacks after data changes', async () => {
    const onDownload = vi.fn();
    const { rerender } = render(<FileComponent nodes={files.slice(0, 1)} />);

    const updated = {
      ...files[0],
      name: 'updated.txt',
      canDownload: true,
    };
    rerender(<FileComponent nodes={[updated]} onDownload={onDownload} />);

    expect(screen.queryByText('file-0.txt')).toBeNull();
    await act(async () => fireEvent.click(screen.getByLabelText('下载')));
    expect(onDownload).toHaveBeenCalledWith(updated);

    const nextDownload = vi.fn();
    rerender(<FileComponent nodes={[updated]} onDownload={nextDownload} />);
    await act(async () => fireEvent.click(screen.getByLabelText('下载')));
    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(nextDownload).toHaveBeenCalledWith(updated);
  });

  it('keeps progressive file disclosure and stable generated IDs', () => {
    const nodes = Array.from({ length: 60 }, (_, index) => ({
      name: `generated-${index}.txt`,
      canPreview: false,
      canDownload: false,
    }));
    const { rerender } = render(<FileComponent nodes={nodes} bindDomId />);
    const firstId = screen.getByRole('button', {
      name: '文件：generated-0.txt',
    }).id;
    expect(firstId).not.toBe('');
    expect(screen.queryByText('generated-59.txt')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /查看更多/ }));
    expect(screen.getByText('generated-59.txt')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /查看更多/ })).toBeNull();
    expect(
      screen.getByRole('button', { name: '文件：generated-0.txt' }),
    ).toHaveAttribute('id', firstId);

    rerender(<FileComponent nodes={nodes} bindDomId keyword="generated" />);
    expect(screen.queryByText('generated-59.txt')).toBeNull();
    expect(
      screen.getByRole('button', { name: '文件：generated-0.txt' }),
    ).toHaveAttribute('id', firstId);
  });

  it('keeps search result links and removes disabled header and title wrappers', () => {
    const onOpen = vi.fn();
    const items: BrowserItem[] = Array.from({ length: 50 }, (_, index) => ({
      id: `result-${index}`,
      title: `Result ${index}`,
      site: 'example.com',
      url: `https://example.com/${index}`,
    }));
    const { container } = render(
      <BrowserList
        items={items}
        activeLabel="Results"
        showHeader={false}
        onOpen={onOpen}
      />,
    );

    console.info('Browser list DOM:', container.querySelectorAll('*').length);
    expect(container.querySelector('header')).toBeNull();
    const link = screen.getByRole('link', { name: 'Result 0' });
    expect(link).toHaveClass('ant-browser-result-item-title');
    fireEvent.click(link);
    expect(onOpen).toHaveBeenCalledWith(items[0]);
  });
});
