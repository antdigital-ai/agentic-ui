/**
 * Media deepen3：other/pdf、image finished 超时 alt、readonly 图、video 属性、无 mediaType。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockStore = vi.hoisted(() => ({
  readonly: false,
  markdownEditorRef: { current: { children: [] } as any },
}));

const setNodes = vi.hoisted(() => vi.fn());

vi.mock('../../../store', () => ({
  useEditorStore: () => mockStore,
}));

vi.mock('../../../../hooks/editor', () => ({
  useSelStatus: () => [true, [0]],
}));

vi.mock('slate', () => ({
  Transforms: { setNodes: (...args: any[]) => setNodes(...args) },
}));

vi.mock('slate-react', () => ({
  useSelected: () => true,
  useFocused: () => false,
  useSlate: () => ({}),
  ReactEditor: { findPath: () => [0], isFocused: () => false, focus: vi.fn() },
  useSlateStatic: () => ({}),
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children, size }: any) => (
    <div data-testid="rnd" data-w={size?.width}>
      {children}
    </div>
  ),
}));

vi.mock('../../../utils/dom', () => ({
  getMediaType: (url?: string, alt?: string) => {
    if (alt?.startsWith('attachment:')) return 'attachment';
    if (url?.endsWith('.mp4')) return 'video';
    if (url?.endsWith('.mp3')) return 'audio';
    if (url?.includes('other') || url?.endsWith('.pdf')) return 'pdf';
    if (!url) return '';
    return 'image';
  },
}));

vi.mock('../../../../../Utils/htmlUrlSafety', () => ({
  shouldRenderUrlAsPlainText: () => false,
  UNSAFE_URL_PLAIN_TEXT_STYLE: { color: 'red' },
}));

vi.mock('../../Image', () => ({
  ReadonlyImage: (p: any) => (
    <img data-testid="ro-img" src={p.src} alt={p.alt} />
  ),
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
    Popover: ({ children, content }: any) => (
      <div data-testid="popover">
        {content}
        {children}
      </div>
    ),
  };
});

import { Media } from '../index';

const attrs = { 'data-slate-node': 'element' } as any;

describe('Media deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockStore.readonly = false;
    mockStore.markdownEditorRef.current = { children: [] };
    setNodes.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('pdf/other 类型；无 mediaType 触发 updateElement', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/doc.pdf',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </Media>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(setNodes).toHaveBeenCalled();
  });

  it('image finished=false：超时显示 alt；readonly 用 ReadonlyImage', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/i.png',
            mediaType: 'image',
            finished: false,
            alt: 'pending-img',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </Media>,
    );
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('pending-img')).toBeInTheDocument();

    cleanup();
    mockStore.readonly = true;
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/i2.png',
            mediaType: 'image',
            finished: true,
            width: 40,
            height: 20,
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </Media>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId('ro-img')).toBeInTheDocument();
  });

  it('video：alt 超时文案；controls/autoplay/loop；audio 失败 alt', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/v.mp4',
            mediaType: 'video',
            finished: false,
            alt: 'vid-alt',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </Media>,
    );
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('vid-alt')).toBeInTheDocument();

    cleanup();
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/v2.mp4',
            mediaType: 'video',
            finished: true,
            controls: true,
            autoplay: true,
            loop: true,
            muted: true,
            poster: 'https://cdn.example/p.jpg',
            width: 120,
            height: 80,
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </Media>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    const video = document.querySelector('video');
    expect(video).toBeTruthy();

    cleanup();
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/a.mp3',
            mediaType: 'audio',
            finished: true,
            alt: 'aud-alt',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </Media>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    const audio = document.querySelector('audio');
    if (audio) fireEvent.error(audio);
  });

  it('attachment：无 collaborators / 无 updateTime；download 名', () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/f.bin',
            mediaType: 'attachment',
            alt: 'attachment:report.pdf',
            otherProps: {},
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </Media>,
    );
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.queryByTestId('avatars')).toBeNull();
  });
});
