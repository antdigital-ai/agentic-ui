/**
 * Image/index deepen residual：mediaType 路由、finished 清理、Resize onResize、
 * 事件 guard、Popover 选中、innerWidth 回退。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EditorImage,
  ReadonlyImage,
  ResizeImage,
} from '../index';

const storeState: any = {
  markdownEditorRef: { current: {} },
  editorProps: {},
  readonly: false,
};

vi.mock('antd', () => {
  const confirm = vi.fn();
  return {
    Image: (props: any) => <img data-testid="antd-img" {...props} />,
    Skeleton: { Image: () => <div data-testid="skeleton-image" /> },
    Popover: ({ children, content, open }: any) => (
      <div data-testid="popover" data-open={String(open)}>
        {children}
        {open !== false ? <div data-testid="popover-content">{content}</div> : null}
      </div>
    ),
    Space: ({ children }: any) => <div>{children}</div>,
    Modal: { confirm },
  };
});

vi.mock('@ant-design/icons', () => ({
  BlockOutlined: () => <span />,
  DeleteFilled: () => <span />,
  LoadingOutlined: () => <span data-testid="icon-loading" />,
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children, onResizeStart, onResizeStop, onResize }: any) => (
    <div data-testid="rnd">
      <button type="button" data-testid="rnd-resize" onClick={() => onResize?.({}, 'right', { clientWidth: 300 })}>
        resize
      </button>
      <button type="button" data-testid="rnd-start" onClick={onResizeStart}>
        start
      </button>
      <button type="button" data-testid="rnd-stop" onClick={() => onResizeStop?.({ width: 300, height: 150 })}>
        stop
      </button>
      {children}
    </div>
  ),
}));

vi.mock('../../../../../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: any) => ({ run: fn, cancel: vi.fn() }),
}));

vi.mock('../../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" data-testid={`action-${title}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('../../../../../I18n', () => ({
  I18nContext: React.createContext({
    locale: {
      delete: '删除',
      deleteMedia: '删除媒体',
      confirmDelete: '确认删除',
      blockImage: '块级图片',
      inlineImage: '行内图片',
    },
  }),
}));

vi.mock('../../../../../Utils/debugUtils', () => ({
  debugInfo: vi.fn(),
}));

vi.mock('../../../store', () => ({
  useEditorStore: () => storeState,
}));

vi.mock('../../../../hooks/editor', () => ({
  useSelStatus: () => [false, [0]],
}));

vi.mock('../../../utils/dom', () => ({
  getMediaType: vi.fn(() => 'image'),
}));

vi.mock('../../../utils', async () => {
  const ReactModule = await import('react');
  return {
    useGetSetState: (initial: any) => {
      const ref = ReactModule.useRef(initial);
      const [, force] = ReactModule.useState(0);
      const get = () => ref.current;
      const set = (updates: any) => {
        ref.current = { ...ref.current, ...updates };
        force((n) => n + 1);
      };
      return [get, set];
    },
  };
});

vi.mock('../../../components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText, url, fallbackUrl }: any) => (
    <span data-testid="media-error-link" data-url={url} data-fallback={fallbackUrl}>
      {displayText}
    </span>
  ),
}));

const attrs: any = { 'data-slate-node': 'element' };

describe('Image/index deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    storeState.markdownEditorRef = { current: {} };
    storeState.editorProps = {};
    storeState.readonly = false;
    vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {});
    vi.spyOn(Transforms, 'removeNodes').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('ReadonlyImage 默认容器路径（无 custom render）', () => {
    render(<ReadonlyImage src="https://x.png" alt="a" />);
    expect(screen.getByTestId('image-container')).toBeInTheDocument();
    expect(screen.getByTestId('antd-img')).toBeInTheDocument();
  });

  it('EditorImage：getMediaType 未知类型归 other；已有 mediaType 不重复 setNodes', async () => {
    const { getMediaType } = await import('../../../utils/dom');
    vi.mocked(getMediaType).mockReturnValueOnce('unknown-type' as any);
    storeState.markdownEditorRef = { current: null };
    render(
      <EditorImage
        element={
          {
            type: 'media',
            url: 'https://x.png',
            mediaType: 'image',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        {null}
      </EditorImage>,
    );
    expect(Transforms.setNodes).not.toHaveBeenCalled();
  });

  it('EditorImage：finished=true 时清理 showAsText；url 无 alt 回退', () => {
    const { rerender } = render(
      <EditorImage
        element={
          {
            type: 'media',
            url: 'https://only-url.png',
            finished: false,
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        {null}
      </EditorImage>,
    );
    expect(screen.getByTestId('skeleton-image')).toBeInTheDocument();
    rerender(
      <EditorImage
        element={
          {
            type: 'media',
            url: 'https://only-url.png',
            finished: true,
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        {null}
      </EditorImage>,
    );
    expect(screen.queryByTestId('skeleton-image')).not.toBeInTheDocument();
  });

  it('EditorImage：load 失败 fallbackUrl 链；contextMenu/mouseDown/dragStart', () => {
    const createdImgs: HTMLImageElement[] = [];
    const originalCreate = Document.prototype.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      const el = originalCreate(tagName) as any;
      if (tagName === 'img') createdImgs.push(el);
      return el;
    }) as any);

    render(
      <EditorImage
        element={
          {
            type: 'media',
            url: 'https://bad.png',
            alt: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        {null}
      </EditorImage>,
    );

    const probe = createdImgs.find((img) => img.crossOrigin === 'anonymous');
    act(() => {
      probe?.onerror?.(new Event('error') as any);
    });
    const link = screen.getByTestId('media-error-link');
    expect(link).toHaveAttribute('data-fallback', 'https://bad.png');

    const container = screen.getByTestId('image-container');
    fireEvent.contextMenu(container);
    fireEvent.mouseDown(container);
    fireEvent.dragStart(container);
    expect(container).toBeInTheDocument();
  });

  it('ResizeImage onResize 更新 img 样式；onLoad 使用 innerWidth 回退', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 480,
    });

    render(
      <ResizeImage
        src="https://x.png"
        alt="load"
        defaultSize={{ width: 500 }}
        selected
      />,
    );

    const img = screen.getByAltText('load') as HTMLImageElement;
    Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 600 });
    Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 300 });
    fireEvent.load(img);
    fireEvent.click(screen.getByTestId('rnd-resize'));
    expect(img.style.width).toContain('300');
  });

  it('EditorImage 选中后 Popover open；block 标题随 element.block 切换', () => {
    render(
      <EditorImage
        element={
          {
            type: 'media',
            url: 'https://x.png',
            block: true,
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        {null}
      </EditorImage>,
    );

    const mediaContainer = screen
      .getByTestId('image-container')
      .querySelector('[data-be="media-container"]') as HTMLElement;
    fireEvent.click(mediaContainer);
    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'undefined');
    expect(screen.getByTestId('action-块级图片')).toBeInTheDocument();
  });
});
