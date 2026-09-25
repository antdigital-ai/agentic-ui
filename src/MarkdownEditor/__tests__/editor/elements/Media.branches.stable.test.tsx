/**
 * Media/index.tsx 稳定分支覆盖（不使用 fake timers）
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Media, ResizeImage } from '../../../editor/elements/Media';

const mocks = vi.hoisted(() => ({
  modalConfirmMock: vi.fn(),
  getMediaTypeMock: vi.fn(() => 'image'),
  setNodesSpy: vi.fn(),
  removeNodesSpy: vi.fn(),
  shouldRenderUrlAsPlainTextMock: vi.fn(() => false),
  forcedMediaType: undefined as string | undefined,
}));

vi.mock('@ant-design/icons', () => ({
  DeleteFilled: () => <span data-testid="delete-icon" />,
  EyeOutlined: ({ onClick }: any) => (
    <button data-testid="eye-icon" type="button" onClick={onClick}>
      eye
    </button>
  ),
  LoadingOutlined: () => <span data-testid="loading-icon" />,
}));

vi.mock('antd', () => ({
  Modal: { confirm: mocks.modalConfirmMock },
  Popover: ({ children, content }: any) => (
    <div data-testid="popover-root">
      {content}
      {children}
    </div>
  ),
  Skeleton: Object.assign(() => <div data-testid="skeleton" />, {
    Image: () => <div data-testid="skeleton-image" />,
  }),
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children, onResizeStop, onResize }: any) => (
    <div data-testid="rnd-wrap">
      <button type="button" data-testid="rnd-stop" onClick={() => onResizeStop?.()}>
        stop
      </button>
      <button
        type="button"
        data-testid="rnd-resize"
        onClick={() => onResize?.({}, 'right', { clientWidth: 420 })}
      >
        resize
      </button>
      {children}
    </div>
  ),
}));

vi.mock('../../../../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: any) => ({ run: fn, cancel: vi.fn() }),
}));

vi.mock('../../../editor/utils', async () => {
  const ReactModule = await import('react');
  return {
    useGetSetState: (initial: any) => {
      const ref = ReactModule.useRef({
        ...initial,
        type: mocks.forcedMediaType ?? initial.type,
      });
      const [, force] = ReactModule.useState(0);
      const get = () => ref.current;
      const set = (updates: any) => {
        const next = { ...updates };
        if (mocks.forcedMediaType && next.type === 'other') {
          next.type = mocks.forcedMediaType;
        }
        ref.current = { ...ref.current, ...next };
        force((n) => n + 1);
      };
      return [get, set];
    },
  };
});

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

vi.mock('../../../../Utils/htmlUrlSafety', () => ({
  shouldRenderUrlAsPlainText: (...args: any[]) =>
    mocks.shouldRenderUrlAsPlainTextMock(...args),
  UNSAFE_URL_PLAIN_TEXT_STYLE: { color: 'red' },
}));

vi.mock('../../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

vi.mock('../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ onClick, children }: any) => (
    <button type="button" data-testid="delete-action" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('../../../editor/components/ContributorAvatar', () => ({
  AvatarList: () => <div data-testid="avatar-list" />,
}));

vi.mock('../../../editor/components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => (
    <div data-testid="media-error">{displayText}</div>
  ),
}));

vi.mock('../../../editor/elements/Image', () => ({
  ReadonlyImage: (props: any) => (
    <img data-testid="readonly-image" alt={props.alt} src={props.src} />
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

describe('Media stable branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.forcedMediaType = undefined;
    currentStore = {
      markdownEditorRef: { current: { editor: true } },
      readonly: false,
    };
    mocks.getMediaTypeMock.mockReturnValue('image');
    mocks.shouldRenderUrlAsPlainTextMock.mockReturnValue(false);
  });

  it('unsafe url renders plain text fallback', () => {
    mocks.shouldRenderUrlAsPlainTextMock.mockReturnValue(true);
    render(
      <Media element={{ ...baseElement, url: 'javascript:alert(1)' }} attributes={{} as any}>
        {null}
      </Media>,
    );
    expect(screen.getByTestId('media-unsafe-url-plain-text')).toBeInTheDocument();
  });

  it('readonly image uses ReadonlyImage', () => {
    currentStore.readonly = true;
    render(
      <Media
        element={{ ...baseElement, mediaType: 'image' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByTestId('readonly-image')).toBeInTheDocument();
  });

  it('video onError logs warning and updates error state branch', () => {
    mocks.getMediaTypeMock.mockReturnValue('video');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Media
        element={{ ...baseElement, url: 'https://example.com/v.mp4', finished: true }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    fireEvent.error(screen.getByTestId('video-element'));
    expect(warnSpy).toHaveBeenCalledWith(
      'Video failed to load:',
      expect.any(String),
    );
    warnSpy.mockRestore();
  });

  it('attachment renders collaborators and updateTime', () => {
    mocks.getMediaTypeMock.mockReturnValue('attachment');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/file.pdf',
          alt: 'attachment:file.pdf',
          otherProps: {
            collaborators: [{ Alice: 2 }],
            updateTime: '2026-01-01',
          },
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByTestId('avatar-list')).toBeInTheDocument();
    expect(screen.getByText('2026-01-01')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('eye-icon'));
  });

  it('other media type falls back to image pipeline', () => {
    mocks.getMediaTypeMock.mockReturnValue('other');
    render(
      <Media element={{ ...baseElement, mediaType: 'other' }} attributes={{} as any}>
        {null}
      </Media>,
    );
    expect(screen.getByTestId('resize-image-container')).toBeInTheDocument();
  });

  it('finished true shows skeleton before probe completes for image', () => {
    mocks.getMediaTypeMock.mockReturnValue('image');
    render(
      <Media
        element={{ ...baseElement, finished: false }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByTestId('skeleton-image')).toBeInTheDocument();
  });

  it('ResizeImage onLoad clears loading state', () => {
    render(<ResizeImage src="https://example.com/a.png" />);
    const img = screen.getByTestId('resize-image') as HTMLImageElement;
    Object.defineProperty(img, 'naturalWidth', { value: 800 });
    Object.defineProperty(img, 'naturalHeight', { value: 400 });
    fireEvent.load(img);
    expect(img.style.display).not.toBe('none');
  });

  it('ResizeImage onResizeStop forwards size callback', () => {
    const onResizeStop = vi.fn();
    render(
      <ResizeImage src="https://example.com/a.png" onResizeStop={onResizeStop} />,
    );
    fireEvent.click(screen.getByTestId('rnd-stop'));
    expect(onResizeStop).toHaveBeenCalled();
  });

  it('delete confirm removes node', () => {
    render(
      <Media element={{ ...baseElement, mediaType: 'image' }} attributes={{} as any}>
        {null}
      </Media>,
    );

    fireEvent.click(screen.getAllByTestId('delete-action')[0]);
    const config = mocks.modalConfirmMock.mock.calls[0]?.[0];
    config.onOk?.();
    expect(mocks.removeNodesSpy).toHaveBeenCalled();
  });

  it('audio element renders when state type is audio', () => {
    mocks.getMediaTypeMock.mockReturnValue('audio');
    mocks.forcedMediaType = 'audio';
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
    expect(screen.getByTestId('audio-element')).toBeInTheDocument();
  });

  it('audio onError logs warning', () => {
    mocks.getMediaTypeMock.mockReturnValue('audio');
    mocks.forcedMediaType = 'audio';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/broken.mp3',
          mediaType: 'audio',
          finished: true,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    fireEvent.error(screen.getByTestId('audio-element'));
    expect(warnSpy).toHaveBeenCalledWith(
      'Audio failed to load:',
      expect.any(String),
    );
    warnSpy.mockRestore();
  });

  it('unfinished audio shows dashed loading placeholder', () => {
    mocks.getMediaTypeMock.mockReturnValue('audio');
    mocks.forcedMediaType = 'audio';
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/pending.mp3',
          mediaType: 'audio',
          finished: false,
          alt: 'pending audio',
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByText('pending audio')).toBeInTheDocument();
  });

  it('video probe onloadedmetadata keeps video element', () => {
    mocks.getMediaTypeMock.mockReturnValue('video');
    const created: HTMLVideoElement[] = [];
    const originalCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
    ) => {
      const el = originalCreate(tagName) as HTMLVideoElement;
      if (tagName === 'video') created.push(el);
      return el;
    }) as typeof document.createElement);

    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/v.mp4',
          finished: true,
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );

    created[0]?.onloadedmetadata?.(new Event('loadedmetadata') as any);
    expect(screen.getByTestId('video-element')).toBeInTheDocument();
    createSpy.mockRestore();
  });

  it('edit mode image ResizeImage onResizeStop updates node', () => {
    mocks.getMediaTypeMock.mockReturnValue('image');
    render(
      <Media element={{ ...baseElement, finished: true }} attributes={{} as any}>
        {null}
      </Media>,
    );
    fireEvent.click(screen.getByTestId('rnd-stop'));
    expect(mocks.setNodesSpy).toHaveBeenCalled();
  });

  it('readonly mode uses ReadonlyImage instead of ResizeImage', () => {
    currentStore.readonly = true;
    mocks.getMediaTypeMock.mockReturnValue('image');
    render(
      <Media element={{ ...baseElement, finished: true }} attributes={{} as any}>
        {null}
      </Media>,
    );
    expect(screen.getByTestId('readonly-image')).toBeInTheDocument();
    expect(screen.queryByTestId('resize-image')).not.toBeInTheDocument();
  });

  it('attachment without collaborators still renders link', () => {
    mocks.getMediaTypeMock.mockReturnValue('attachment');
    render(
      <Media
        element={{
          ...baseElement,
          url: 'https://example.com/file.zip',
          alt: 'attachment:archive.zip',
        }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    expect(screen.getByText('archive.zip')).toBeInTheDocument();
  });

  it('ResizeImage onResize debounce path', () => {
    render(<ResizeImage src="https://example.com/a.png" />);
    const img = screen.getByTestId('resize-image') as HTMLImageElement;
    Object.defineProperty(img, 'naturalWidth', { value: 640 });
    Object.defineProperty(img, 'naturalHeight', { value: 320 });
    fireEvent.load(img);
    fireEvent.click(screen.getByTestId('rnd-resize'));
    expect(screen.getByTestId('resize-image-container')).toBeInTheDocument();
  });
});
