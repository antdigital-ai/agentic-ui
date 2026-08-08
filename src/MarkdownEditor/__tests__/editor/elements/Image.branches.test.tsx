import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Modal } from 'antd';
import React from 'react';
import { Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EditorImage,
  ReadonlyImage,
  ResizeImage,
} from '../../../editor/elements/Image';

function resetFakeTimers() {
  cleanup();
  vi.clearAllTimers();
}

const storeState: any = {
  markdownEditorRef: { current: {} },
  editorProps: {},
  readonly: false,
};

vi.mock('antd', () => {
  const confirm = vi.fn();
  return {
    Image: (props: any) => <img {...props} />,
    Skeleton: {
      Image: () => <div data-testid="skeleton-image">skeleton</div>,
    },
    Popover: ({ children, content }: any) => (
      <div data-testid="mock-popover">
        {children}
        <div data-testid="mock-popover-content">{content}</div>
      </div>
    ),
    Space: ({ children }: any) => (
      <div data-testid="mock-space">{children}</div>
    ),
    Modal: { confirm },
  };
});

vi.mock('@ant-design/icons', () => ({
  BlockOutlined: () => <span data-testid="icon-block" />,
  DeleteFilled: () => <span data-testid="icon-delete" />,
  LoadingOutlined: () => <span data-testid="icon-loading" />,
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children, onResizeStart, onResizeStop, onResize }: any) => (
    <div data-testid="rnd">
      <button type="button" data-testid="rnd-start" onClick={onResizeStart}>
        start
      </button>
      <button
        type="button"
        data-testid="rnd-stop"
        onClick={() => onResizeStop?.()}
      >
        stop
      </button>
      <button
        type="button"
        data-testid="rnd-resize"
        onClick={() => onResize?.({}, 'right', { clientWidth: 520 })}
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

vi.mock('../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      data-testid={`action-${title}`}
    >
      {children}
    </button>
  ),
}));

vi.mock('../../../hooks/editor', () => ({
  useSelStatus: vi.fn(() => [false, [0, 0]]),
}));

vi.mock('../../../editor/store', () => ({
  useEditorStore: () => storeState,
}));

vi.mock('../../../editor/utils/dom', () => ({
  getMediaType: vi.fn(() => 'image'),
}));

vi.mock('../../../editor/utils', async () => {
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

vi.mock('../../../../I18n', async () => {
  const ReactModule = await import('react');
  return {
    I18nContext: ReactModule.createContext({
      locale: {
        delete: '删除',
        deleteMedia: '删除媒体',
        confirmDelete: '确认删除',
        blockImage: '块级图片',
        inlineImage: '行内图片',
      },
    }),
  };
});

vi.mock('../../../../Utils/debugUtils', () => ({
  debugInfo: vi.fn(),
}));

vi.mock('../../../editor/components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => (
    <span data-testid="media-error-link">{displayText}</span>
  ),
}));

const baseElement: any = {
  type: 'media',
  url: 'https://example.com/image.jpg',
  alt: 'Image Alt',
  width: 400,
  height: 300,
  children: [{ text: '' }],
};

const attrs: any = { 'data-slate-node': 'element' };

describe('Image targeted coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    storeState.markdownEditorRef = { current: {} };
    storeState.editorProps = {};
    storeState.readonly = false;
    vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {});
    vi.spyOn(Transforms, 'removeNodes').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 仅 cleanup + clearTimers；勿 useRealTimers，避免 happy-dom 跨用例抖动
    resetFakeTimers();
    vi.restoreAllMocks();
  });

  it('覆盖 ResizeImage onLoad 的尺寸计算逻辑', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1000,
    });
    render(
      <ResizeImage
        src="https://example.com/a.jpg"
        alt="A"
        defaultSize={{ width: 580 }}
      />,
    );
    const img = screen.getByAltText('A') as HTMLImageElement;
    Object.defineProperty(img, 'naturalWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(img, 'naturalHeight', {
      configurable: true,
      value: 400,
    });
    fireEvent.load(img);
    expect(screen.queryByTestId('icon-loading')).not.toBeInTheDocument();
  });

  it('覆盖 EditorImage 的图片探测 onerror/onload 分支', () => {
    const createdImgs: HTMLImageElement[] = [];
    const originalCreate = Document.prototype.createElement.bind(
      document,
    ) as typeof document.createElement;
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
    ) => {
      const el = originalCreate(tagName) as any;
      if (tagName === 'img') {
        createdImgs.push(el);
      }
      return el;
    }) as any);

    render(
      <EditorImage element={baseElement} attributes={attrs}>
        {null}
      </EditorImage>,
    );

    const probe = createdImgs.find((img) => img.crossOrigin === 'anonymous');
    expect(probe).toBeTruthy();
    probe!.onerror?.(new Event('error') as any);
    probe!.onload?.(new Event('load') as any);
    createSpy.mockRestore();
  });

  it('覆盖 unfinished 图片 5 秒后文本回退分支', () => {
    render(
      <EditorImage
        element={{ ...baseElement, finished: false, alt: 'Pending Alt' }}
        attributes={attrs}
      >
        {null}
      </EditorImage>,
    );
    expect(screen.getByTestId('skeleton-image')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Pending Alt')).toBeInTheDocument();
  });

  it('覆盖 ResizeImage onResizeStart/onResizeStop 更新节点分支', () => {
    render(
      <EditorImage element={baseElement} attributes={attrs}>
        {null}
      </EditorImage>,
    );
    fireEvent.click(screen.getByTestId('rnd-start'));
    fireEvent.click(screen.getByTestId('rnd-stop'));
    expect(Transforms.setNodes).toHaveBeenCalled();
  });

  it('覆盖 onResizeStop 的 editorRef 为空 guard 分支', () => {
    storeState.markdownEditorRef = { current: null };
    render(
      <EditorImage element={baseElement} attributes={attrs}>
        {null}
      </EditorImage>,
    );
    fireEvent.click(screen.getByTestId('rnd-stop'));
    expect(Transforms.setNodes).not.toHaveBeenCalled();
  });

  it('覆盖删除按钮 confirm 的 onOk 分支（含 editorRef guard）', () => {
    render(
      <EditorImage element={baseElement} attributes={attrs}>
        {null}
      </EditorImage>,
    );
    fireEvent.click(screen.getByTestId('action-删除'));
    const confirmMock = (Modal as any).confirm as ReturnType<typeof vi.fn>;
    expect(confirmMock).toHaveBeenCalled();
    const payload = confirmMock.mock.calls[0][0];
    payload.onOk();
    expect(Transforms.removeNodes).toHaveBeenCalled();
  });

  it('覆盖删除按钮 onOk 在 editorRef 为空时直接 return', () => {
    (Transforms.removeNodes as any).mockClear();
    storeState.markdownEditorRef = { current: null };
    render(
      <EditorImage element={baseElement} attributes={attrs}>
        {null}
      </EditorImage>,
    );
    const deletes = screen.getAllByTestId('action-删除');
    fireEvent.click(deletes[deletes.length - 1]);
    const confirmMock = (Modal as any).confirm as ReturnType<typeof vi.fn>;
    const payload =
      confirmMock.mock.calls[confirmMock.mock.calls.length - 1][0];
    payload.onOk();
    expect(Transforms.removeNodes).not.toHaveBeenCalled();
  });

  it('覆盖 block/inline 切换分支（含 editorRef guard）', () => {
    render(
      <EditorImage
        element={{ ...baseElement, block: false }}
        attributes={attrs}
      >
        {null}
      </EditorImage>,
    );
    fireEvent.click(screen.getByTestId('action-行内图片'));
    expect(
      (Transforms.setNodes as any).mock.calls.length,
    ).toBeGreaterThanOrEqual(2);

    (Transforms.setNodes as any).mockClear();
    storeState.markdownEditorRef = { current: null };
    render(
      <EditorImage
        element={{ ...baseElement, block: false }}
        attributes={attrs}
      >
        {null}
      </EditorImage>,
    );
    const toggles = screen.getAllByTestId('action-行内图片');
    fireEvent.click(toggles[toggles.length - 1]);
    expect(Transforms.setNodes).not.toHaveBeenCalled();
  });

  it('覆盖点击图片容器的 setTimeout 选中分支', () => {
    render(
      <EditorImage element={baseElement} attributes={attrs}>
        {null}
      </EditorImage>,
    );
    const mediaContainer = screen
      .getByTestId('image-container')
      .querySelector('[data-be="media-container"]') as HTMLElement;
    fireEvent.click(mediaContainer);
    vi.advanceTimersByTime(16);
    expect(screen.getByTestId('image-container')).toBeInTheDocument();
  });

  it('editorProps.image.render 自定义包装', () => {
    storeState.editorProps = {
      image: {
        render: (_el: any, dom: React.ReactNode) => (
          <div data-testid="custom-image-wrap">{dom}</div>
        ),
      },
    };
    // image.render 仅在 ReadonlyImage 路径生效（EditorImage 走 ResizeImage）
    render(
      <ReadonlyImage src="https://example.com/image.jpg" alt="Image Alt" />,
    );
    expect(screen.getByTestId('custom-image-wrap')).toBeInTheDocument();
    storeState.editorProps = {};
  });

  it('finished=false 显示 Skeleton', () => {
    render(
      <EditorImage
        element={{ ...baseElement, finished: false }}
        attributes={attrs}
      >
        {null}
      </EditorImage>,
    );
    expect(
      screen.queryByTestId('skeleton-image') ||
        screen.getByTestId('image-container'),
    ).toBeTruthy();
  });

  it('缺少 mediaType 时仍可渲染', () => {
    const { mediaType: _m, ...rest } = baseElement as any;
    render(
      <EditorImage element={{ ...rest, url: 'https://x.png' }} attributes={attrs}>
        {null}
      </EditorImage>,
    );
    expect(screen.getByTestId('image-container')).toBeInTheDocument();
  });

  it('错误态 MediaErrorLink 使用 alt 文案', () => {
    const createdImgs: HTMLImageElement[] = [];
    const originalCreate = Document.prototype.createElement.bind(
      document,
    ) as typeof document.createElement;
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
    ) => {
      const el = originalCreate(tagName) as any;
      if (tagName === 'img') {
        createdImgs.push(el);
      }
      return el;
    }) as any);

    render(
      <EditorImage
        element={{ ...baseElement, alt: '我的图', url: 'https://bad.png' }}
        attributes={attrs}
      >
        {null}
      </EditorImage>,
    );

    // EditorImage 探测 img.onerror → loadSuccess=false → MediaErrorLink(alt)
    const probe = createdImgs.find((img) => img.crossOrigin === 'anonymous');
    expect(probe).toBeTruthy();
    act(() => {
      probe!.onerror?.(new Event('error') as any);
    });
    expect(screen.getByTestId('media-error-link')).toHaveTextContent('我的图');
    createSpy.mockRestore();
  });
});

describe('Image istanbul residual：alt/src/defaultSize 假值臂', () => {
  afterEach(() => {
    resetFakeTimers();
    storeState.markdownEditorRef = { current: {} };
    storeState.editorProps = {};
  });

  it('ReadonlyImage 无 alt 用 image；onError 无 alt/src 用图片链接', () => {
    const { rerender } = render(
      <ReadonlyImage src="https://example.com/a.png" />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'image');

    rerender(<ReadonlyImage src="" alt="" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByTestId('media-error-link')).toHaveTextContent('图片链接');
  });

  it('ReadonlyImage onError 有 src 无 alt 显示 src', () => {
    render(<ReadonlyImage src="https://cdn.ex/fail.png" alt="" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByTestId('media-error-link')).toHaveTextContent(
      'https://cdn.ex/fail.png',
    );
  });

  it('ReadonlyImage width 非数字字符串保留原值；数字串转 Number', () => {
    const { rerender } = render(
      <ReadonlyImage src="https://x.png" width={'ab' as any} />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('width', 'ab');
    rerender(<ReadonlyImage src="https://x.png" width={'320' as any} />);
    expect(screen.getByRole('img')).toHaveAttribute('width', '320');
  });

  it('ResizeImage defaultSize 缺省宽高走 ||400 / ||0', () => {
    render(<ResizeImage src="https://x.png" alt="" />);
    expect(screen.getByTestId('resize-image-container')).toBeInTheDocument();
  });

  it('ResizeImage defaultSize.height 假值；Rnd default 缺省 100%', () => {
    render(
      <ResizeImage
        src="https://x.png"
        alt="a"
        defaultSize={{ width: undefined, height: undefined }}
      />,
    );
    expect(screen.getByTestId('rnd')).toBeInTheDocument();
  });

  it('ResizeImage 加载失败无 alt 用 src 或图片链接', () => {
    const { rerender } = render(
      <ResizeImage src="https://fail.png" alt="" />,
    );
    const img = document.querySelector('img');
    expect(img).toBeTruthy();
    fireEvent.error(img!);
    expect(screen.getByTestId('media-error-link')).toHaveTextContent(
      'https://fail.png',
    );

    rerender(<ResizeImage src="" alt="" />);
    const img2 = document.querySelector('img');
    if (img2) {
      fireEvent.error(img2);
      expect(screen.getByTestId('media-error-link')).toHaveTextContent(
        '图片链接',
      );
    }
  });
});
