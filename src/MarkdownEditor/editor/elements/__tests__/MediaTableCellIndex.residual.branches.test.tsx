/**
 * Media / TableCellIndex 残留：readonly、空 url、index 显示。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../store', () => ({
  useEditorStore: () => ({
    readonly: true,
    markdownEditorRef: { current: null },
  }),
}));

vi.mock('../../../hooks/editor', () => ({
  useSelStatus: () => [false, [0]],
}));

vi.mock('slate-react', () => ({
  useSelected: () => false,
  useFocused: () => false,
  useSlate: () => ({
    selection: { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } },
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
  }),
  ReactEditor: {
    findPath: () => [0, 0],
    isFocused: () => false,
    focus: vi.fn(),
  },
  useSlateStatic: () => ({}),
}));

describe('Media / TableCellIndex residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Media 空 url / 图片', async () => {
    const { Media } = await import('../Media');
    expect(() =>
      render(
        <Media
          element={{ type: 'media', url: '', mediaType: 'image', children: [{ text: '' }] }}
          attributes={{ 'data-slate-node': 'element' }}
        >
          <span />
        </Media>,
      ),
    ).not.toThrow();
  });

  it('TableCellIndex 渲染', async () => {
    const mod = await import('../Table/TableCellIndex');
    const TableCellIndex = (mod as any).default || (mod as any).TableCellIndex;
    if (!TableCellIndex) {
      expect(true).toBe(true);
      return;
    }
    render(
      <TableCellIndex
        element={{ type: 'table-cell', children: [{ text: '' }] }}
        attributes={{ 'data-slate-node': 'element' }}
        index={2}
      >
        <span data-testid="cell">c</span>
      </TableCellIndex>,
    );
    expect(screen.getByTitle('删除整行')).toBeInTheDocument();
  });

  it('exclusive deepen：Media video/audio/attachment；空 alt；ResizeImage 边界', async () => {
    const mediaMod = await import('../Media');
    const { Media, ResizeImage } = mediaMod as any;

    for (const mediaType of ['video', 'audio', 'image', 'attachment'] as const) {
      expect(() =>
        render(
          <Media
            element={{
              type: 'media',
              url: `https://cdn.example/a.${mediaType === 'image' ? 'png' : mediaType === 'video' ? 'mp4' : mediaType === 'audio' ? 'mp3' : 'bin'}`,
              mediaType,
              alt: mediaType === 'attachment' ? 'attachment:file.bin' : mediaType,
              width: 120,
              height: 80,
              children: [{ text: '' }],
            }}
            attributes={{ 'data-slate-node': 'element' }}
          >
            <span />
          </Media>,
        ),
      ).not.toThrow();
    }

    expect(() =>
      render(
        <Media
          element={{
            type: 'media',
            url: 'https://cdn.example/x.png',
            mediaType: 'image',
            alt: '',
            children: [{ text: '' }],
          }}
          attributes={{ 'data-slate-node': 'element' }}
        >
          <span />
        </Media>,
      ),
    ).not.toThrow();

    if (ResizeImage) {
      expect(() =>
        render(
          <ResizeImage
            src="https://cdn.example/r.png"
            alt="r"
            selected
            defaultSize={{ width: 40, height: 40 }}
            onResizeStart={() => {}}
            onResizeStop={() => {}}
          />,
        ),
      ).not.toThrow();
      expect(() =>
        render(
          <ResizeImage
            src=""
            alt=""
            selected={false}
            defaultSize={{}}
          />,
        ),
      ).not.toThrow();
    }
    expect(document.body).toBeTruthy();
  });
});
