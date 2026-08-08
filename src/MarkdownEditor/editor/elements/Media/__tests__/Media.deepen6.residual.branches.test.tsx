/**
 * Media deepen6：空 url、video/audio 失败回退文案、
 * collaborators 假值、clientWidth 链、locale 删除文案缺省。
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
  AvatarList: ({ displayList }: any) => (
    <div data-testid="avatars">{JSON.stringify(displayList)}</div>
  ),
}));

vi.mock('../../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ title, onClick, children }: any) => (
    <button type="button" data-testid="media-delete-btn" title={String(title)} onClick={onClick}>
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
        (globalThis as any).__mediaConfirm6 = opts;
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

describe('Media deepen6 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockStore.readonly = false;
    mockStore.markdownEditorRef.current = { children: [] };
    setNodes.mockClear();
    removeNodes.mockClear();
    (globalThis as any).__mediaConfirm6 = undefined;
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      get: () => undefined as any,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 url：getMediaType 空串仍可挂载容器', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: '',
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
    expect(screen.getByTestId('media-container')).toBeInTheDocument();
  });

  it('video 失败无 alt：视频链接回退；locale 删除文案缺省', async () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <Media
          element={
            {
              type: 'media',
              url: 'https://cdn.example/deepen6.mp4',
              mediaType: 'video',
              children: [{ text: '' }],
            } as any
          }
          attributes={attrs}
        >
          <span />
        </Media>
      </I18nContext.Provider>,
    );
    const video = document.querySelector('video');
    if (video) fireEvent.error(video);
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    const err = await screen.findByTestId('media-err');
    expect(err.textContent).toMatch(/视频|cdn|mp4/);

    const delBtn = screen.getByTestId('media-delete-btn');
    expect(delBtn).toHaveAttribute('title', '删除');
    fireEvent.click(delBtn);
    const confirmOpts = (globalThis as any).__mediaConfirm6;
    expect(confirmOpts?.title).toMatch(/删除媒体/);
    expect(confirmOpts?.content).toMatch(/确定删除/);
  });

  it('audio 失败无 alt：音频链接；collaborators 假值不渲染 AvatarList', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/deepen6.mp3',
            mediaType: 'audio',
            width: 100,
            otherProps: {
              collaborators: null,
              updateTime: undefined,
            },
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </Media>,
    );
    const audio = document.querySelector('audio');
    if (audio) fireEvent.error(audio);
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    const err = await screen.findByTestId('media-err');
    expect(err.textContent).toMatch(/音频|cdn|mp3/);
    expect(screen.queryByTestId('avatars')).toBeNull();
  });

  it('image：clientWidth/innerWidth 未定义时回退默认宽度链', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/deepen6.png',
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
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByTestId('media-container')).toBeInTheDocument();
  });
});
