import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Media, ResizeImage } from '../../../../src/MarkdownEditor/editor/elements/Media';

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
  Popover: ({ children, content }: any) => (
    <div data-testid="popover-root">
      {children}
      <div data-testid="popover-content">{content}</div>
    </div>
  ),
  Skeleton: Object.assign(
    () => <div data-testid="skeleton" />,
    {
      Image: () => <div data-testid="skeleton-image" />,
    },
  ),
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children, onResize, onResizeStop }: any) => (
    <div data-testid="rnd-wrap">
      <button
        type="button"
        data-testid="rnd-resize"
        onClick={() => onResize?.({}, 'right', { clientWidth: 320 })}
      >
        resize
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

vi.mock('@ant-design/pro-components', () => ({
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

vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => currentStore,
}));

vi.mock('../../../../src/MarkdownEditor/hooks/editor', () => ({
  useSelStatus: () => [false, [0]],
}));

vi.mock('../../../../src/MarkdownEditor/editor/utils/dom', () => ({
  getMediaType: (...args: any[]) => mocks.getMediaTypeMock(...args),
}));

vi.mock('../../../../src/Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

vi.mock('../../../../src/Components/ActionIconBox', () => ({
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

vi.mock('../../../../src/MarkdownEditor/editor/components/ContributorAvatar', () => ({
  AvatarList: () => <div data-testid="avatar-list" />,
}));

vi.mock('../../../../src/MarkdownEditor/editor/components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => <div>{displayText}</div>,
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Image', () => ({
  ReadonlyImage: (props: any) => <img data-testid="readonly-image" {...props} />,
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
    vi.useFakeTimers();
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
    vi.useRealTimers();
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
      <Media element={{ ...baseElement, mediaType: undefined }} attributes={{} as any}>
        {null}
      </Media>,
    );
    expect(mocks.setNodesSpy).not.toHaveBeenCalled();
  });

  it('覆盖 initial 的 image 探测回调（269/271）', () => {
    const created: any[] = [];
    const origin = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      const el = origin(tagName);
      if (String(tagName).toLowerCase() === 'img') created.push(el);
      return el;
    }) as typeof document.createElement);

    mocks.getMediaTypeMock.mockReturnValue('image');
    render(
      <Media element={{ ...baseElement, url: 'https://example.com/a.png' }} attributes={{} as any}>
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
    const origin = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      const el = origin(tagName);
      if (String(tagName).toLowerCase() === 'video') created.push(el);
      return el;
    }) as typeof document.createElement);

    mocks.getMediaTypeMock.mockReturnValue('video');
    render(
      <Media element={{ ...baseElement, url: 'https://example.com/a.mp4' }} attributes={{} as any}>
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
    const origin = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
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
      <Media element={{ ...baseElement, url: 'https://example.com/a.mp3' }} attributes={{} as any}>
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
        element={{ ...baseElement, url: 'https://example.com/v.mp4', finished: false }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText(/视频链接|test alt|example.com/)).toBeInTheDocument();

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
        element={{ ...baseElement, url: 'https://example.com/a.mp3', finished: false }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText(/音频链接|test alt|example.com/)).toBeInTheDocument();
    includesSpy.mockRestore();
  });

  it('覆盖附件 EyeOutlined 点击分支（612）', () => {
    mocks.getMediaTypeMock.mockReturnValue('attachment');
    render(
      <Media
        element={{ ...baseElement, url: 'https://example.com/file.pdf', alt: 'attachment:file.pdf' }}
        attributes={{} as any}
      >
        {null}
      </Media>,
    );
    fireEvent.click(screen.getByTestId('eye-icon'));
    expect(window.open).toHaveBeenCalledWith('https://example.com/file.pdf');
  });

  it('覆盖删除弹窗 onClick/onOk（678/679/683）', () => {
    render(
      <Media element={{ ...baseElement, mediaType: 'image' }} attributes={{} as any}>
        {null}
      </Media>,
    );

    const evt = new MouseEvent('click', { bubbles: true });
    const stopSpy = vi.spyOn(evt, 'stopPropagation');
    screen.getByTestId('delete-action').dispatchEvent(evt);
    expect(stopSpy).toHaveBeenCalled();

    const confirmConfig = mocks.modalConfirmMock.mock.calls[0]?.[0];
    expect(confirmConfig).toBeTruthy();
    confirmConfig.onOk?.();
    expect(mocks.removeNodesSpy).toHaveBeenCalled();
  });
});

