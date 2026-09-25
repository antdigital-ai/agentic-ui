/**
 * Image deepen3 residual：clientWidth/innerWidth 全 0→600、finished 文本兜底、
 * 删除 Popover 无 locale 默认文案、getMediaType 空→image。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorImage, ResizeImage } from '../index';

const storeState: any = {
  markdownEditorRef: { current: {} },
  editorProps: {},
  readonly: false,
};

vi.mock('antd', () => {
  const confirm = vi.fn((opts: any) => {
    (globalThis as any).__imgConfirm = opts;
  });
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
  LoadingOutlined: () => <span />,
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children, onResizeStop }: any) => (
    <div data-testid="rnd">
      <button
        type="button"
        data-testid="rnd-stop"
        onClick={() => onResizeStop?.({ width: 200, height: 100 })}
      >
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
  I18nContext: React.createContext({ locale: {} }),
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
  getMediaType: vi.fn(() => ''),
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
  MediaErrorLink: ({ displayText }: any) => (
    <span data-testid="media-error-link">{displayText}</span>
  ),
}));

const attrs: any = { 'data-slate-node': 'element' };

describe('Image deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    storeState.markdownEditorRef = { current: {} };
    vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {});
    vi.spyOn(Transforms, 'removeNodes').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('ResizeImage onLoad：clientWidth 与 innerWidth 皆 0 → 600', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 0,
    });

    render(
      <ResizeImage
        src="https://x.png"
        alt="load"
        defaultSize={undefined as any}
        selected={false}
      />,
    );
    const img = screen.getByAltText('load') as HTMLImageElement;
    Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 800 });
    Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 400 });
    fireEvent.load(img);
    expect(img).toBeInTheDocument();
  });

  it('EditorImage：finished=false 超时 showAsText；无 alt/url → 图片链接', () => {
    render(
      <EditorImage
        element={
          {
            type: 'media',
            url: '',
            alt: '',
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
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('图片链接')).toBeInTheDocument();
  });

  it('EditorImage：删除确认无 locale 走默认文案', () => {
    render(
      <EditorImage
        element={
          {
            type: 'media',
            url: 'https://ok.png',
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
    fireEvent.click(screen.getByTestId('action-删除'));
    const opts = (globalThis as any).__imgConfirm;
    expect(opts?.title).toBe('删除媒体');
    expect(opts?.content).toBe('确定删除该媒体吗？');
    opts?.onOk?.();
    expect(Transforms.removeNodes).toHaveBeenCalled();
  });
});
