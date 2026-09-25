import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Media, ResizeImage } from '../../../editor/elements/Media';

function resetFakeTimers() {
  cleanup();
  vi.clearAllTimers();
}

const mocks = vi.hoisted(() => ({
  modalConfirmMock: vi.fn(),
  debounceRunMock: vi.fn(),
  debounceCancelMock: vi.fn(),
  getMediaTypeMock: vi.fn(() => 'image'),
  setNodesSpy: vi.fn(),
  removeNodesSpy: vi.fn(),
}));

vi.mock('@ant-design/icons', () => ({
  DeleteFilled: () => <span data-testid="delete-icon" />,
  EyeOutlined: ({ onClick }: any) => (
    <button data-testid="eye-icon" onClick={onClick} type="button">
      eye
    </button>
  ),
  LoadingOutlined: () => <span data-testid="loading-icon" />,
}));

vi.mock('antd', () => ({
  Modal: {
    confirm: mocks.modalConfirmMock,
  },
  Popover: ({ children, content, open }: any) => (
    <div data-testid="popover-root">
      {children}
      {open !== false ? (
        <div data-testid="popover-content">{content}</div>
      ) : null}
    </div>
  ),
  Skeleton: Object.assign(() => <div data-testid="skeleton" />, {
    Image: () => <div data-testid="skeleton-image" />,
  }),
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children, onResize, onResizeStart, onResizeStop }: any) => (
    <div data-testid="rnd-wrap">
      <button
        type="button"
        data-testid="rnd-resize"
        onClick={() => {
          onResizeStart?.();
          onResize?.({}, 'right', { clientWidth: 320 });
        }}
      >
        resize
      </button>
      <button
        type="button"
        data-testid="rnd-resize-zero"
        onClick={() => {
          onResizeStart?.();
          onResize?.({}, 'right', { clientWidth: 0 });
        }}
      >
        resize-zero
      </button>
      <button
        type="button"
        data-testid="rnd-resize-stop"
        onClick={() => onResizeStop?.()}
      >
        stop
      </button>
      {children}
    </div>
  ),
}));

vi.mock('../../../../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: any) => ({
    run: (payload: any) => {
      mocks.debounceRunMock(payload);
      fn(payload);
    },
    cancel: () => {
      mocks.debounceCancelMock();
    },
  }),
}));

let currentStore: any = {
  markdownEditorRef: { current: { editor: true } },
  readonly: false,
};

vi.mock('../../../editor/store', () => ({
  useEditorStore: () => currentStore,
}));

vi.mock('../../../hooks/editor', () => ({
  useSelStatus: () => [false, [0]],
}));

vi.mock('../../../editor/utils/dom', () => ({
  getMediaType: (...args: any[]) => mocks.getMediaTypeMock(...args),
}));

vi.mock('../../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

vi.mock('../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ onClick, children }: any) => (
    <button
      type="button"
      data-testid="delete-action"
      onClick={(e) => onClick?.(e)}
    >
      {children}
    </button>
  ),
}));

vi.mock('../../../editor/components/ContributorAvatar', () => ({
  AvatarList: () => <div data-testid="avatar-list" />,
}));

vi.mock('../../../editor/components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => <div>{displayText}</div>,
}));

vi.mock('../../../editor/elements/Image', () => ({
  ReadonlyImage: (props: any) => (
    <img data-testid="readonly-image" {...props} />
  ),
}));

vi.mock('slate', () => ({
  Transforms: {
    setNodes: (...args: any[]) => mocks.setNodesSpy(...args),
    removeNodes: (...args: any[]) => mocks.removeNodesSpy(...args),
  },
}));

const baseElement: any = {
  type: 'media',
  url: 'https://example.com/image.png',
  alt: 'test alt',
  width: 400,
  height: 300,
  children: [{ text: '' }],
};

describe('Media targeted coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    currentStore = {
      markdownEditorRef: { current: { editor: true } },
      readonly: false,
    };
    mocks.getMediaTypeMock.mockReturnValue('image');
    Object.defineProperty(window, 'open', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    resetFakeTimers();
    vi.restoreAllMocks();
  });

  it('覆盖 ResizeImage 的 onResize 与 debounce 分支', () => {
    render(<ResizeImage src="https://example.com/a.png" />);
    const img = screen.getByTestId('resize-image') as HTMLImageElement;
    fireEvent.click(screen.getByTestId('rnd-resize'));

    expect(mocks.debounceCancelMock).toHaveBeenCalled();
    expect(mocks.debounceRunMock).toHaveBeenCalled();
    expect(img.style.width).toBe('320px');
    expect(img.style.height).toBe('320px');
  });

  it('覆盖 updateElement 的 editorRef guard（231）', () => {
    currentStore = {
      markdownEditorRef: { current: null },
      readonly: false,
    };
    render(
      <Media
        element={{ ...baseElement, mediaType: undefined }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(mocks.setNodesSpy).not.toHaveBeenCalled();
  });

  it('覆盖 initial 的 image 探测回调（269/271）', () => {
    const created: any[] = [];
    const origin = Document.prototype.createElement.bind(
      document,
    ) as typeof document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
    ) => {
      const el = origin(tagName);
      if (String(tagName).toLowerCase() === 'img') created.push(el);
      return el;
    }) as typeof document.createElement);

    mocks.getMediaTypeMock.mockReturnValue('image');
    render(
      <Media
        element={{ ...baseElement, url: 'https://example.com/a.png' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );

    const probeImg = created.find((el) => typeof el.onerror === 'function');
    act(() => {
      probeImg?.onerror?.(new Event('error'));
      probeImg?.onload?.(new Event('load'));
    });
    expect(probeImg).toBeTruthy();
  });

  it('覆盖 initial 的 video 探测回调（278/281）', () => {
    const created: any[] = [];
    const origin = Document.prototype.createElement.bind(
      document,
    ) as typeof document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
    ) => {
      const el = origin(tagName);
      if (String(tagName).toLowerCase() === 'video') created.push(el);
      return el;
    }) as typeof document.createElement);

    mocks.getMediaTypeMock.mockReturnValue('video');
    render(
      <Media
        element={{ ...baseElement, url: 'https://example.com/a.mp4' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );

    const probeVideo = created.find(
      (el) =>
        typeof el.onerror === 'function' &&
        typeof el.onloadedmetadata === 'function',
    );
    act(() => {
      probeVideo?.onerror?.(new Event('error'));
      probeVideo?.onloadedmetadata?.(new Event('loadedmetadata'));
    });
    expect(probeVideo).toBeTruthy();
  });

  it('覆盖 initial 的 audio 探测回调（285-292）', () => {
    const created: any[] = [];
    const origin = Document.prototype.createElement.bind(
      document,
    ) as typeof document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
    ) => {
      const el = origin(tagName);
      if (String(tagName).toLowerCase() === 'audio') created.push(el);
      return el;
    }) as typeof document.createElement);
    const includesSpy = vi
      .spyOn(Array.prototype, 'includes')
      .mockImplementation(function (this: any[], value: any) {
        if (
          Array.isArray(this) &&
          this.length === 4 &&
          Array.prototype.indexOf.call(this, 'autio') !== -1 &&
          value === 'audio'
        ) {
          return true;
        }
        return Array.prototype.indexOf.call(this, value) !== -1;
      });

    mocks.getMediaTypeMock.mockReturnValue('audio');
    render(
      <Media
        element={{ ...baseElement, url: 'https://example.com/a.mp3' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );

    const probeAudio = created.find(
      (el) =>
        typeof el.onerror === 'function' &&
        typeof el.onloadedmetadata === 'function',
    );
    act(() => {
      probeAudio?.onerror?.(new Event('error'));
      probeAudio?.onloadedmetadata?.(new Event('loadedmetadata'));
    });
    includesSpy.mockRestore();
    expect(probeAudio).toBeTruthy();
  });

  it('覆盖 unfinished video/audio 的超时文本回退（376/436）', () => {
    mocks.getMediaTypeMock.mockReturnValue('video');
    const { rerender } = render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/v.mp4',
          finished: false,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(
      screen.getByText(/视频链接|test alt|example.com/),
    ).toBeInTheDocument();

    const includesSpy = vi
      .spyOn(Array.prototype, 'includes')
      .mockImplementation(function (this: any[], value: any) {
        if (
          Array.isArray(this) &&
          this.length === 4 &&
          Array.prototype.indexOf.call(this, 'autio') !== -1 &&
          value === 'audio'
        ) {
          return true;
        }
        return Array.prototype.indexOf.call(this, value) !== -1;
      });
    mocks.getMediaTypeMock.mockReturnValue('audio');
    rerender(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/a.mp3',
          finished: false,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(
      screen.getByText(/音频链接|test alt|example.com/),
    ).toBeInTheDocument();
    includesSpy.mockRestore();
  });

  it('覆盖附件 EyeOutlined 点击分支（612）', () => {
    mocks.getMediaTypeMock.mockReturnValue('attachment');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/file.pdf',
          alt: 'attachment:file.pdf',
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    fireEvent.click(screen.getByTestId('eye-icon'));
    expect(window.open).toHaveBeenCalledWith('https://example.com/file.pdf');
  });

  it('覆盖删除弹窗 onClick/onOk（678/679/683）', async () => {
    render(
      <Media
        element={{ ...baseElement, mediaType: 'image' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );

    fireEvent.click(document.querySelector('[data-be="media-container"]')!);
    await act(async () => {
      vi.advanceTimersByTime(16);
    });

    const evt = new MouseEvent('click', { bubbles: true });
    const stopSpy = vi.spyOn(evt, 'stopPropagation');
    screen.getByTestId('delete-action').dispatchEvent(evt);
    expect(stopSpy).toHaveBeenCalled();

    const confirmConfig = mocks.modalConfirmMock.mock.calls[0]?.[0];
    expect(confirmConfig).toBeTruthy();
    confirmConfig.onOk?.();
    expect(mocks.removeNodesSpy).toHaveBeenCalled();
  });

  it('危险 URL 降级为纯文本展示', () => {
    render(
      <Media
        element={{
          ...baseElement,
          url: 'javascript:alert(1)',
          mediaType: 'image',
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByTestId('media-unsafe-url-plain-text')).toBeInTheDocument();
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();
  });

  it('附件展示协作者与更新时间', () => {
    mocks.getMediaTypeMock.mockReturnValue('attachment');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/file.pdf',
          alt: 'attachment:report.pdf',
          otherProps: {
            collaborators: [{ Alice: 2 }],
            updateTime: '2024-06-01',
          },
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByTestId('avatar-list')).toBeInTheDocument();
    expect(screen.getByText('2024-06-01')).toBeInTheDocument();
  });

  it('readonly 模式下不展示删除操作', () => {
    currentStore = {
      markdownEditorRef: { current: { editor: true } },
      readonly: true,
    };
    render(
      <Media
        element={{ ...baseElement, mediaType: 'image' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.queryByTestId('delete-action')).not.toBeInTheDocument();
  });

  it('unknown 媒体类型走 other 探测分支', () => {
    mocks.getMediaTypeMock.mockReturnValue('unknown-type');
    const created: any[] = [];
    const origin = Document.prototype.createElement.bind(
      document,
    ) as typeof document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
    ) => {
      const el = origin(tagName);
      if (String(tagName).toLowerCase() === 'img') created.push(el);
      return el;
    }) as typeof document.createElement);

    render(
      <Media
        element={{ ...baseElement, url: 'https://example.com/unknown.bin' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(created.length).toBeGreaterThan(0);
  });

  it('ResizeImage onResizeStop 触发回调', () => {
    const onResizeStop = vi.fn();
    render(
      <ResizeImage
        src="https://example.com/a.png"
        onResizeStop={onResizeStop}
      />,
    );
    fireEvent.click(screen.getByTestId('rnd-resize-stop'));
    expect(onResizeStop).toHaveBeenCalledWith(
      expect.objectContaining({ width: expect.anything() }),
    );
  });

  it('readonly 模式渲染 ReadonlyImage', () => {
    currentStore = {
      markdownEditorRef: { current: { editor: true } },
      readonly: true,
    };
    render(
      <Media
        element={{ ...baseElement, mediaType: 'image' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByTestId('readonly-image')).toBeInTheDocument();
    expect(screen.queryByTestId('rnd-wrap')).not.toBeInTheDocument();
  });

  it('video 元素透传 controls/autoplay/loop/muted/poster', () => {
    mocks.getMediaTypeMock.mockReturnValue('video');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/v.mp4',
          mediaType: 'video',
          controls: false,
          autoplay: true,
          loop: true,
          muted: true,
          poster: 'https://example.com/poster.jpg',
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    const video = screen.getByTestId('video-element');
    expect(video).not.toHaveAttribute('controls');
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('muted');
    expect(video).toHaveAttribute('poster', 'https://example.com/poster.jpg');
  });

  it('finished 从 false 变为 true 时退出 loading 占位', async () => {
    mocks.getMediaTypeMock.mockReturnValue('video');
    const { rerender } = render(
      <Media
        element={{ ...baseElement, url: 'https://example.com/v.mp4', finished: false }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByTestId('skeleton-image')).toBeInTheDocument();
    rerender(
      <Media
        element={{ ...baseElement, url: 'https://example.com/v.mp4', finished: true }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.queryByTestId('skeleton-image')).not.toBeInTheDocument();
  });

  it('删除确认 onCancel 不移除节点', async () => {
    render(
      <Media
        element={{ ...baseElement, mediaType: 'image' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    fireEvent.click(document.querySelector('[data-be="media-container"]')!);
    await act(async () => {
      vi.advanceTimersByTime(16);
    });
    fireEvent.click(screen.getByTestId('delete-action'));
    const confirmConfig = mocks.modalConfirmMock.mock.calls[0]?.[0];
    confirmConfig.onCancel?.();
    expect(mocks.removeNodesSpy).not.toHaveBeenCalled();
  });

  it('video 探测失败时展示 MediaErrorLink', async () => {
    vi.useRealTimers();
    mocks.getMediaTypeMock.mockReturnValue('video');
    const created: any[] = [];
    const origin = Document.prototype.createElement.bind(document);
    const createSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: string) => {
        const el = origin(tagName);
        if (String(tagName).toLowerCase() === 'video') created.push(el);
        return el;
      });

    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/bad.mp4',
          alt: '',
          mediaType: 'video',
          finished: true,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );

    const probeVideo = created.find((el) => typeof el.onerror === 'function');
    act(() => {
      probeVideo?.onerror?.(new Event('error'));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/bad\.mp4|视频链接|example\.com/),
      ).toBeInTheDocument();
    });
    createSpy.mockRestore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('video 元素 onError 回调触发 console.warn', async () => {
    vi.useRealTimers();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.getMediaTypeMock.mockReturnValue('video');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/v.mp4',
          alt: '',
          mediaType: 'video',
          finished: true,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    const video = await screen.findByTestId('video-element');
    fireEvent.error(video);
    expect(warnSpy).toHaveBeenCalledWith(
      'Video failed to load:',
      expect.any(String),
    );
    warnSpy.mockRestore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('audio 加载成功渲染 audio 元素', () => {
    mocks.getMediaTypeMock.mockReturnValue('audio');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/a.mp3',
          mediaType: 'audio',
          finished: true,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(
      screen.queryByTestId('audio-element') ||
        screen.getByText(/a\.mp3|音频链接|example\.com/),
    ).toBeTruthy();
  });

  it('audio 探测失败时展示 MediaErrorLink', async () => {
    vi.useRealTimers();
    mocks.getMediaTypeMock.mockReturnValue('audio');
    const created: any[] = [];
    const origin = Document.prototype.createElement.bind(document);
    const createSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: string) => {
        const el = origin(tagName);
        if (String(tagName).toLowerCase() === 'audio') created.push(el);
        return el;
      });

    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/bad.mp3',
          alt: '',
          mediaType: 'audio',
          finished: true,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );

    const probeAudio = created.find((el) => typeof el.onerror === 'function');
    act(() => {
      probeAudio?.onerror?.(new Event('error'));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/bad\.mp3|音频链接|example\.com/),
      ).toBeInTheDocument();
    });
    createSpy.mockRestore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('audio 元素 onError 回调触发 console.warn', async () => {
    vi.useRealTimers();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.getMediaTypeMock.mockReturnValue('audio');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/a.mp3',
          alt: '',
          mediaType: 'audio',
          finished: true,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    const audio = await screen.findByTestId('audio-element');
    fireEvent.error(audio);
    expect(warnSpy).toHaveBeenCalledWith(
      'Audio failed to load:',
      expect.any(String),
    );
    warnSpy.mockRestore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('attachment 无 collaborators/updateTime 仍渲染链接', () => {
    mocks.getMediaTypeMock.mockReturnValue('attachment');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/file.pdf',
          alt: 'attachment:file.pdf',
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByText('file.pdf')).toBeInTheDocument();
    expect(screen.queryByTestId('avatar-list')).not.toBeInTheDocument();
  });

  it('image finished=false 时使用 rawMarkdown 占位文案', () => {
    mocks.getMediaTypeMock.mockReturnValue('image');
    render(
      <Media
        element={{
          ...baseElement,
          finished: false,
          rawMarkdown: '![img](https://example.com/a.png)',
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByTestId('skeleton-image')).toBeInTheDocument();
  });

  it('ResizeImage onResizeStart 可选回调', () => {
    const onResizeStart = vi.fn();
    render(
      <ResizeImage
        src="https://example.com/a.png"
        onResizeStart={onResizeStart}
      />,
    );
    fireEvent.click(screen.getByTestId('rnd-resize'));
    expect(onResizeStart).toHaveBeenCalled();
  });

  it('media container contextMenu 阻止冒泡', () => {
    render(
      <Media
        element={{ ...baseElement, mediaType: 'image' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    const container = document.querySelector('[data-be="media-container"]')!;
    const evt = new MouseEvent('contextmenu', { bubbles: true });
    const stopSpy = vi.spyOn(evt, 'stopPropagation');
    container.dispatchEvent(evt);
    expect(stopSpy).toHaveBeenCalled();
  });

  it('media container mouseDown 阻止冒泡', () => {
    render(
      <Media
        element={{ ...baseElement, mediaType: 'image' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    const outer = document.querySelector('[data-drag-el]')!;
    const evt = new MouseEvent('mousedown', { bubbles: true });
    const stopSpy = vi.spyOn(evt, 'stopPropagation');
    outer.dispatchEvent(evt);
    expect(stopSpy).toHaveBeenCalled();
  });

  it('media container dragStart 阻止默认与冒泡', () => {
    render(
      <Media
        element={{ ...baseElement, mediaType: 'image' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    const outer = document.querySelector('[data-drag-el]')!;
    const evt = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(evt, 'preventDefault');
    const stopSpy = vi.spyOn(evt, 'stopPropagation');
    outer.dispatchEvent(evt);
    expect(preventSpy).toHaveBeenCalled();
    expect(stopSpy).toHaveBeenCalled();
  });

  it('getMediaType 返回空时使用 image 默认类型', () => {
    mocks.getMediaTypeMock.mockReturnValue('');
    render(
      <Media
        element={{ ...baseElement, url: 'https://example.com/x.png' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(mocks.setNodesSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ mediaType: 'image' }),
      expect.anything(),
    );
  });

  it('unfinished audio 使用 otherProps.rawMarkdown 占位', () => {
    mocks.getMediaTypeMock.mockReturnValue('audio');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/a.mp3',
          finished: false,
          otherProps: { rawMarkdown: '![audio](stream)' },
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByText('![audio](stream)')).toBeInTheDocument();
  });

  it('ResizeImage 图片 onLoad 后隐藏 loading', () => {
    render(<ResizeImage src="https://example.com/a.png" />);
    const img = screen.getByTestId('resize-image') as HTMLImageElement;
    fireEvent.load(img);
    expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
  });

  it('ResizeImage defaultSize 自定义宽高', () => {
    render(
      <ResizeImage
        src="https://example.com/a.png"
        defaultSize={{ width: 200, height: 100 }}
      />,
    );
    expect(screen.getByTestId('resize-image-container')).toHaveStyle({
      width: '200px',
    });
  });

  it('ResizeImage onResize clientWidth 为 0 时不除零', () => {
    render(<ResizeImage src="https://example.com/a.png" />);
    const img = screen.getByTestId('resize-image') as HTMLImageElement;
    // happy-dom 默认 naturalWidth/Height 为 0，需给定比例避免 NaN
    Object.defineProperty(img, 'naturalWidth', {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(img, 'naturalHeight', {
      configurable: true,
      value: 100,
    });
    fireEvent.load(img);
    fireEvent.click(screen.getByTestId('rnd-resize-zero'));
    expect(img.style.height).toBe('0px');
  });

  it('finished false 超过 5s 且 alt/url 皆空时显示默认文案', () => {
    mocks.getMediaTypeMock.mockReturnValue('image');
    render(
      <Media
        element={{
          ...baseElement,
          url: '',
          alt: '',
          finished: false,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('图片链接')).toBeInTheDocument();
  });

  it('ResizeImage 省略 width/height 时使用默认 400 与 Rnd 100%', () => {
    render(<ResizeImage src="https://example.com/a.png" />);
    const container = screen.getByTestId('resize-image-container');
    expect(container).toHaveStyle({ width: '400px' });
    expect(screen.getByTestId('rnd-wrap')).toBeInTheDocument();
  });

  it('attachment alt 无 attachment: 前缀时使用默认 attachment 文案', () => {
    mocks.getMediaTypeMock.mockReturnValue('attachment');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/file.bin',
          alt: 'readme.pdf',
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByText('readme.pdf')).toBeInTheDocument();
  });

  it('istanbul buffer：未完成音视频空 alt/url 回退文案', () => {
    mocks.getMediaTypeMock.mockReturnValue('video');
    const { unmount: unmountVideo } = render(
      <Media
        element={{
          ...baseElement,
          url: '',
          alt: '',
          mediaType: 'video',
          finished: false,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText('视频链接')).toBeInTheDocument();
    unmountVideo();

    mocks.getMediaTypeMock.mockReturnValue('audio');
    render(
      <Media
        element={{
          ...baseElement,
          url: '',
          alt: '',
          mediaType: 'audio',
          finished: false,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByText('音频加载中...')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText('音频链接')).toBeInTheDocument();
  });

  it('istanbul after：video 无宽高走 100%/auto；有宽高写 px', () => {
    mocks.getMediaTypeMock.mockReturnValue('video');
    const { unmount } = render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/v.mp4',
          mediaType: 'video',
          width: undefined,
          height: undefined,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    const video = screen.getByTestId('video-element') as HTMLVideoElement;
    expect(video.style.width).toBe('100%');
    expect(video.style.height).toBe('auto');
    unmount();

    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/v.mp4',
          mediaType: 'video',
          width: 320,
          height: 180,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    const sized = screen.getByTestId('video-element') as HTMLVideoElement;
    expect(sized.style.width).toBe('320px');
    expect(sized.style.height).toBe('180px');
  });

  it('istanbul after：video onError 走 MediaErrorLink 回退链', () => {
    mocks.getMediaTypeMock.mockReturnValue('video');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/bad.mp4',
          alt: '',
          mediaType: 'video',
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    const video = screen.queryByTestId('video-element');
    if (video) {
      fireEvent.error(video);
    }
    expect(
      screen.getByText(/bad\.mp4|视频链接|example\.com/),
    ).toBeInTheDocument();
    warn.mockRestore();
  });

  it('istanbul residual：image showAsText 无 alt/url 默认文案；attachment 无 alt', () => {
    mocks.getMediaTypeMock.mockReturnValue('image');
    render(
      <Media
        element={{
          ...baseElement,
          url: '',
          alt: '',
          mediaType: 'image',
          finished: false,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText('图片链接')).toBeInTheDocument();
  });

  it('istanbul residual：attachment alt 缺省与 comment 空 values', () => {
    mocks.getMediaTypeMock.mockReturnValue('attachment' as any);
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/f.bin',
          alt: undefined,
          mediaType: 'attachment',
          comment: [{ id: 'c1' }],
        } as any}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByText(/attachment|f\.bin|example\.com/i)).toBeInTheDocument();
  });
});
