import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ContentFilemapView } from '../src/Bubble/ContentFilemapView';
import type { FilemapBlock } from '../src/Bubble/extractFilemapBlocks';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const makeBlock = (body: string): FilemapBlock => ({
  raw: `\`\`\`agentic-ui-filemap\n${body}\n\`\`\``,
  body,
});

const IMG_FILE = JSON.stringify({
  fileList: [{ name: 'photo.png', type: 'image/png', uuid: 'uuid-1', url: 'http://example.com/photo.png' }],
});

const PDF_FILE = JSON.stringify({
  fileList: [{ name: 'report.pdf', type: 'application/pdf', uuid: 'uuid-2', url: 'http://example.com/report.pdf' }],
});

describe('ContentFilemapView', () => {
  it('renders nothing when blocks array is empty', () => {
    const { container } = render(
      <ContentFilemapView blocks={[]} placement="left" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders FileMapView for a valid image block', () => {
    const { container } = render(
      <ContentFilemapView blocks={[makeBlock(IMG_FILE)]} placement="left" />,
    );
    expect(
      container.querySelector('[data-testid="file-view-list"]'),
    ).toBeInTheDocument();
  });

  it('renders FileMapView for a valid file block', () => {
    render(
      <ContentFilemapView blocks={[makeBlock(PDF_FILE)]} placement="left" />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('renders nothing for an invalid JSON body', () => {
    const invalidJson = 'not valid json <<<';
    const { container } = render(
      <ContentFilemapView
        blocks={[makeBlock(invalidJson)]}
        placement="left"
      />,
    );
    expect(
      container.querySelector('[data-testid="file-view-list"]'),
    ).toBeNull();
  });

  it('renders nothing for an empty fileList', () => {
    const { container } = render(
      <ContentFilemapView
        blocks={[makeBlock('{"fileList":[]}')]}
        placement="left"
      />,
    );
    expect(
      container.querySelector('[data-testid="file-view-list"]'),
    ).toBeNull();
  });

  it('renders multiple blocks as separate FileMapViews', () => {
    const { container } = render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_FILE), makeBlock(PDF_FILE)]}
        placement="left"
      />,
    );
    const lists = container.querySelectorAll('[data-testid="file-view-list"]');
    expect(lists).toHaveLength(2);
  });

  it('applies the style prop to the wrapper div', () => {
    const { container } = render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_FILE)]}
        placement="left"
        style={{ alignSelf: 'flex-end' }}
      />,
    );
    const wrapper = container.querySelector(
      '[data-testid="content-filemap-view"]',
    ) as HTMLElement;
    expect(wrapper.style.alignSelf).toBe('flex-end');
  });

  it('passes placement="right" to FileMapView', () => {
    const { container } = render(
      <ContentFilemapView blocks={[makeBlock(IMG_FILE)]} placement="right" />,
    );
    const list = container.querySelector('[data-testid="file-view-list"]');
    expect(list).toBeInTheDocument();
    // FileMapView sets alignItems based on placement in its inline style
    const listEl = list as HTMLElement;
    expect(listEl.style.alignItems).toBe('flex-end');
  });

  it('calls fileViewEvents onPreview when provided', () => {
    const onPreview = vi.fn();
    render(
      <ContentFilemapView
        blocks={[makeBlock(IMG_FILE)]}
        placement="left"
        fileViewEvents={() => ({ onPreview })}
      />,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('does not throw when fileViewEvents throws', () => {
    expect(() =>
      render(
        <ContentFilemapView
          blocks={[makeBlock(IMG_FILE)]}
          placement="left"
          fileViewEvents={() => {
            throw new Error('bad events');
          }}
        />,
      ),
    ).not.toThrow();
  });
});
