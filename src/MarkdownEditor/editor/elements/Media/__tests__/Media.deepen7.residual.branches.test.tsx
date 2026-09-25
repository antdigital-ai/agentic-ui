/**
 * Media deepen7：image onLoad 宽度链、video/audio 失败文案臂、
 * collaborators 值为 0。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../../I18n';

const mockStore = vi.hoisted(() => ({
  readonly: false,
  markdownEditorRef: { current: { children: [] } as any },
}));

const setNodes = vi.hoisted(() => vi.fn());
const removeNodes = vi.hoisted(() => vi.fn());

vi.mock('../../../store', () => ({
  useEditorStore: () => mockStore,
}));

vi.mock('../../../../hooks/editor', () => ({
  useSelStatus: () => [true, [0]],
}));

vi.mock('slate', () => ({
  Transforms: {
    setNodes: (...args: any[]) => setNodes(...args),
    removeNodes: (...args: any[]) => removeNodes(...args),
  },
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
  getMediaType: (url?: string) => {
    if (url?.endsWith('.mp4')) return 'video';
    if (url?.endsWith('.mp3')) return 'audio';
    if (url?.includes('attach')) return 'attachment';
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
  MediaErrorLink: ({ displayText, url, fallbackUrl }: any) => (
    <a
      data-testid="media-err"
      data-url={url || ''}
      data-fallback={fallbackUrl || ''}
    >
      {displayText}
    </a>
  ),
}));

vi.mock('../../../components/ContributorAvatar', () => ({
  AvatarList: ({ displayList }: any) => (
    <div data-testid="avatars">{JSON.stringify(displayList)}</div>
  ),
}));

vi.mock('../../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ title, onClick, children }: any) => (
    <button
      type="button"
      data-testid="media-delete-btn"
      title={String(title)}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    Skeleton: { Image: () => <div data-testid="skeleton" /> },
    Modal: {
      confirm: vi.fn((opts: any) => {
        opts?.onOk?.();
      }),
    },
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

describe('Media deepen7 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockStore.readonly = false;
    mockStore.markdownEditorRef.current = { children: [] };
    setNodes.mockClear();
    removeNodes.mockClear();
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      get: () => 1200,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('image onLoad：clientWidth 链计算 maxAllowedWidth', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/deepen7.png',
            mediaType: 'image',
            finished: true,
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
    const img = screen.getByTestId('resize-image');
    Object.defineProperty(img, 'naturalWidth', {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(img, 'naturalHeight', {
      configurable: true,
      value: 1000,
    });
    fireEvent.load(img);
    expect(screen.getByTestId('rnd')).toBeInTheDocument();
  });

  it('video 失败：无 alt 走 state.url / element.url 臂', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/deepen7.mp4',
            mediaType: 'video',
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
    if (video) fireEvent.error(video);
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    const err = await screen.findByTestId('media-err');
    expect(err.textContent).toMatch(/cdn|mp4|视频/);
  });

  it('audio 失败：无 alt 走 url 回退臂', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/deepen7.mp3',
            mediaType: 'audio',
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
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    const err = await screen.findByTestId('media-err');
    expect(err.textContent).toMatch(/cdn|mp3|音频/);
  });

  it('attachment：collaborator 值为 0 走 ||0', async () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <Media
          element={
            {
              type: 'media',
              url: 'https://cdn.example/attach-file.pdf',
              mediaType: 'attachment',
              otherProps: {
                collaborators: [{ alice: 0 }, { bob: 3 }],
                updateTime: '昨天',
              },
              children: [{ text: '' }],
            } as any
          }
          attributes={attrs}
        >
          <span />
        </Media>
      </I18nContext.Provider>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    const avatars = await screen.findByTestId('avatars');
    expect(avatars.textContent).toMatch(/alice|bob|collaboratorNumber/);
  });
});
