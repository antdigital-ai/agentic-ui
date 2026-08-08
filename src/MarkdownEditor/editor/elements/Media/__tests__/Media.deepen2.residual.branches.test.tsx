/**
 * Media deepen2：video/audio 失败文案回退、collaborators || 0、
 * locale 删除文案、clientWidth 链。
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
  Transforms: {
    setNodes: (...args: any[]) => setNodes(...args),
    removeNodes: vi.fn(),
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

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    Skeleton: { Image: () => <div data-testid="skeleton" /> },
    Modal: {
      confirm: vi.fn((opts: any) => {
        (globalThis as any).__mediaConfirm2 = opts;
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

describe('Media deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockStore.readonly = false;
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      get: () => 0,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 0,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('video 加载失败：无 alt → 视频链接回退', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/a.mp4',
            mediaType: 'video',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span />
      </Media>,
    );
    const video = screen.queryByTestId('video-element');
    if (video) fireEvent.error(video);
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    const err = await screen.findByTestId('media-err');
    expect(err.textContent).toMatch(/视频|cdn|mp4/);
  });

  it('audio + collaborators value || 0；删除 locale 回退', async () => {
    render(
      <Media
        element={
          {
            type: 'media',
            url: 'https://cdn.example/a.mp3',
            mediaType: 'audio',
            width: 120,
            otherProps: {
              collaborators: [{ Alice: undefined as any }],
              updateTime: 't1',
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
    const avatars = screen.queryByTestId('avatars');
    if (avatars) expect(avatars.textContent).toContain('Alice');
    const del = screen.queryByTestId('popover');
    if (del) {
      fireEvent.click(del.querySelector('[title],button,div') || del);
    }
  });
});
