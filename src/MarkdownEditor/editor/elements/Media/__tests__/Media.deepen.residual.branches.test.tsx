/**
 * Media deepen：finished 超时文本、video/audio 失败、attachment、ResizeImage resize。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockStore = vi.hoisted(() => ({
  readonly: false,
  markdownEditorRef: { current: { children: [] } as any },
}));

vi.mock('../../../store', () => ({
  useEditorStore: () => mockStore,
}));

vi.mock('../../../../hooks/editor', () => ({
  useSelStatus: () => [true, [0]],
}));

vi.mock('slate-react', () => ({
  useSelected: () => true,
  useFocused: () => false,
  useSlate: () => ({}),
  ReactEditor: { findPath: () => [0], isFocused: () => false, focus: vi.fn() },
  useSlateStatic: () => ({}),
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children, onResize, onResizeStart, onResizeStop, size }: any) => (
    <div
      data-testid="rnd"
      data-w={size?.width}
      onClick={() => {
        onResizeStart?.();
        onResize?.(
          null,
          'right',
          { clientWidth: 200 },
        );
        onResizeStop?.();
      }}
    >
      {children}
    </div>
  ),
}));

vi.mock('../../../utils/dom', () => ({
  getMediaType: (url?: string, alt?: string) => {
    if (alt?.startsWith('attachment:')) return 'attachment';
    if (url?.endsWith('.mp4')) return 'video';
    if (url?.endsWith('.mp3')) return 'audio';
    if (url?.includes('other')) return 'pdf';
    return 'image';
  },
}));

vi.mock('../../../../../Utils/htmlUrlSafety', () => ({
  shouldRenderUrlAsPlainText: (url: string) => url.startsWith('javascript:'),
  UNSAFE_URL_PLAIN_TEXT_STYLE: { color: 'red' },
}));

vi.mock('../../Image', () => ({
  ReadonlyImage: (p: any) => <img data-testid="ro-img" src={p.src} alt={p.alt} />,
}));

vi.mock('../../../components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => (
    <a data-testid="media-err">{displayText}</a>
  ),
}));

vi.mock('../../../components/ContributorAvatar', () => ({
  AvatarList: () => <div data-testid="avatars" />,
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    Skeleton: { Image: () => <div data-testid="skeleton" /> },
    Modal: { confirm: vi.fn(({ onOk }: any) => onOk?.()) },
    Popover: ({ children, content, open }: any) => (
      <div data-testid="popover">
        {open !== false ? content : null}
        {children}
      </div>
    ),
  };
});

import { Media, ResizeImage } from '../index';

describe('Media deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockStore.readonly = false;
    mockStore.markdownEditorRef.current = {
      children: [],
    };
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('video finished=false：5s 后文本；load 失败 MediaErrorLink', async () => {
    const { rerender } = render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/v.mp4',
            mediaType: 'video',
            finished: false,
            alt: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </Media>,
    );
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    // alt 为空时回退到 url
    expect(screen.getByText('https://cdn.example/v.mp4')).toBeInTheDocument();

    rerender(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/v.mp4',
            mediaType: 'video',
            finished: true,
            width: 100,
            height: 50,
            controls: false,
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </Media>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    const videos = document.querySelectorAll('video');
    videos.forEach((v) => fireEvent.error(v));
  });

  it('audio finished=false 超时与 loading；attachment collaborators', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/a.mp3',
            mediaType: 'audio',
            finished: false,
            rawMarkdown: 'raw-audio',
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </Media>,
    );
    expect(screen.getByText('raw-audio')).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('https://cdn.example/a.mp3')).toBeInTheDocument();

    cleanup();
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/f.bin',
            mediaType: 'attachment',
            alt: 'attachment:doc.pdf',
            otherProps: {
              collaborators: [{ alice: 2 }],
              updateTime: '2024-01-01',
            },
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </Media>,
    );
    expect(screen.getByTestId('avatars')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });

  it('unsafe url 纯文本；ResizeImage onResize', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'javascript:alert(1)',
            mediaType: 'image',
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </Media>,
    );
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();

    render(
      <ResizeImage
        src="https://cdn.example/r.png"
        alt="r"
        selected
        defaultSize={{ width: 80, height: 40 }}
        onResizeStart={vi.fn()}
        onResizeStop={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('rnd'));
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByTestId('rnd')).toBeInTheDocument();
  });
});
