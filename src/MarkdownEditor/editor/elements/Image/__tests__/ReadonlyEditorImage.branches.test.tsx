import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyEditorImage } from '../ReadonlyEditorImage';

vi.mock('../../../store', () => ({
  useEditorStore: () => ({
    editorProps: {},
  }),
}));

describe('ReadonlyEditorImage 分支覆盖', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  const baseProps = {
    attributes: { 'data-slate-node': 'element' } as any,
    children: <span>child</span>,
  };

  it('finished=false 初期显示 Skeleton', () => {
    render(
      <ReadonlyEditorImage
        {...baseProps}
        element={
          {
            type: 'image',
            url: 'https://x/a.png',
            finished: false,
            children: [{ text: '' }],
          } as any
        }
      />,
    );
    expect(document.querySelector('.ant-skeleton')).toBeTruthy();
  });

  it('finished=false 超时后显示文本回退', async () => {
    vi.useFakeTimers();
    render(
      <ReadonlyEditorImage
        {...baseProps}
        element={
          {
            type: 'image',
            url: 'https://x/b.png',
            alt: 'alt-text',
            finished: false,
            children: [{ text: '' }],
          } as any
        }
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('alt-text')).toBeInTheDocument();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it.skip('finished 变为 true 时清除文本回退', async () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <ReadonlyEditorImage
        {...baseProps}
        element={
          {
            type: 'image',
            url: 'https://x/c.png',
            finished: false,
            children: [{ text: '' }],
          } as any
        }
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    // 无 alt 时回退文案为 url
    expect(screen.getByText('https://x/c.png')).toBeInTheDocument();

    await act(async () => {
      rerender(
        <ReadonlyEditorImage
          {...baseProps}
          element={
            {
              type: 'image',
              url: 'https://x/c.png',
              finished: true,
              children: [{ text: '' }],
            } as any
          }
        />,
      );
    });
    // finished=true 清除 showAsText；Skeleton / 文本回退消失
    expect(document.querySelector('.ant-skeleton')).toBeNull();
    expect(
      screen.queryByText('https://x/c.png', { selector: 'div' }),
    ).toBeNull();
    expect(screen.getByTestId('image-container')).toBeInTheDocument();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('图片 onerror 显示 MediaErrorLink；无 alt 用 url', async () => {
    const imgInstances: HTMLImageElement[] = [];
    const createEl = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = createEl(tag);
      if (tag === 'img') {
        imgInstances.push(el as HTMLImageElement);
      }
      return el;
    });

    render(
      <ReadonlyEditorImage
        {...baseProps}
        element={
          {
            type: 'image',
            url: 'https://fail.example/x.png',
            finished: true,
            children: [{ text: '' }],
          } as any
        }
      />,
    );

    const probeImg =
      imgInstances.find((img) => !document.contains(img)) ?? imgInstances[0];
    await act(async () => {
      probeImg?.onerror?.({} as Event);
    });
    expect(screen.getByText('https://fail.example/x.png')).toBeInTheDocument();
  });

  it.skip('未知 media type 归为 other 仍尝试加载', async () => {
    const createEl = document.createElement.bind(document);
    const imgs: HTMLImageElement[] = [];
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = createEl(tag);
      if (tag === 'img') imgs.push(el as HTMLImageElement);
      return el;
    });
    render(
      <ReadonlyEditorImage
        {...baseProps}
        element={
          {
            type: 'image',
            url: 'https://ok.example/y.xyz',
            alt: 'file.xyz',
            finished: true,
            children: [{ text: '' }],
          } as any
        }
      />,
    );
    const probeImg =
      imgs.find((img) => !document.contains(img)) ?? imgs[0];
    await act(async () => {
      probeImg?.onload?.({} as Event);
    });
    expect(screen.getByTestId('image-container')).toBeInTheDocument();
    expect(imgs.length).toBeGreaterThan(0);
  });
});
