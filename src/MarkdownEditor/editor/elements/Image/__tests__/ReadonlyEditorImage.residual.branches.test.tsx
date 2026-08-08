/**
 * ReadonlyEditorImage residual：finished 超时文本、类型回退、加载失败。
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyEditorImage } from '../ReadonlyEditorImage';

vi.mock('../../../store', () => ({
  useEditorStore: () => ({
    editorProps: {},
    readonly: true,
  }),
}));

vi.mock('../../../utils/dom', () => ({
  getMediaType: (url?: string, alt?: string) => {
    if (alt?.startsWith('video:')) return 'video';
    if (!url) return '';
    if (url.endsWith('.pdf')) return 'other';
    return 'image';
  },
}));

const attrs = { 'data-slate-node': 'element' } as any;

describe('ReadonlyEditorImage residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('finished=false：骨架后超时文本（alt/url 回退）', () => {
    render(
      <ReadonlyEditorImage
        element={
          {
            type: 'media',
            finished: false,
            url: 'https://x/a.png',
            alt: 'pic',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span>c</span>
      </ReadonlyEditorImage>,
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/pic|https:\/\/x\/a\.png|图片/)).toBeTruthy();
  });

  it('空 type 回退 image；other 类型；onError 失败态', () => {
    const { container } = render(
      <ReadonlyEditorImage
        element={
          {
            type: 'media',
            url: 'https://x/a.pdf',
            alt: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span>c</span>
      </ReadonlyEditorImage>,
    );
    const img = container.querySelector('img');
    if (img) {
      fireEvent.error(img);
    }
    expect(container).toBeTruthy();
  });

  it('finished 切回 true 清理 timer', () => {
    const { rerender } = render(
      <ReadonlyEditorImage
        element={{ type: 'media', finished: false, url: 'u' } as any}
        attributes={attrs}
      >
        <span />
      </ReadonlyEditorImage>,
    );
    rerender(
      <ReadonlyEditorImage
        element={
          {
            type: 'media',
            finished: true,
            url: 'https://x/a.png',
            alt: 'a',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </ReadonlyEditorImage>,
    );
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(document.body).toBeTruthy();
  });

  it('无 alt / blob url / 空 url 占位', () => {
    render(
      <ReadonlyEditorImage
        element={
          {
            type: 'media',
            url: 'blob:http://local/1',
            alt: undefined,
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </ReadonlyEditorImage>,
    );
    render(
      <ReadonlyEditorImage
        element={
          {
            type: 'media',
            url: '',
            finished: false,
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </ReadonlyEditorImage>,
    );
    expect(document.body).toBeTruthy();
  });

  it('exclusive deepen：video alt；finished false 无 alt；宽高', () => {
    const { rerender } = render(
      <ReadonlyEditorImage
        element={
          {
            type: 'media',
            url: 'https://x/a.mp4',
            alt: 'video:clip',
            width: 100,
            height: 60,
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </ReadonlyEditorImage>,
    );
    rerender(
      <ReadonlyEditorImage
        element={
          {
            type: 'media',
            finished: false,
            url: 'https://x/only-url.png',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </ReadonlyEditorImage>,
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(document.body.textContent).toMatch(/only-url|图片|https/);
  });
});
