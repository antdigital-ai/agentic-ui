/**
 * Image/index.tsx 稳定分支覆盖（不使用 fake timers）
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EditorImage,
  ReadonlyImage,
  ResizeImage,
} from '../../../editor/elements/Image';

const mocks = vi.hoisted(() => ({
  modalConfirmMock: vi.fn(),
  getMediaTypeMock: vi.fn(() => 'image'),
  setNodesSpy: vi.fn(),
  removeNodesSpy: vi.fn(),
}));

vi.mock('@ant-design/icons', () => ({
  BlockOutlined: () => <span data-testid="block-icon" />,
  DeleteFilled: () => <span data-testid="delete-icon" />,
  LoadingOutlined: () => <span data-testid="loading-icon" />,
}));

vi.mock('antd', () => ({
  Image: (props: any) => (
    <img
      data-testid="antd-image"
      alt={props.alt}
      src={props.src}
      onError={props.onError}
    />
  ),
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
  Space: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children, onResizeStart, onResizeStop, onResize }: any) => (
    <div data-testid="rnd-wrap">
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

let currentStore: any = {
  markdownEditorRef: { current: {} },
  readonly: false,
  editorProps: {},
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

vi.mock('../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ onClick, children, title }: any) => (
    <button type="button" data-testid={`action-${title}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('../../../editor/components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => (
    <div data-testid="media-error">{displayText}</div>
  ),
}));

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

vi.mock('slate', async () => {
  const actual = await vi.importActual<typeof import('slate')>('slate');
  return {
    ...actual,
    Transforms: {
      ...actual.Transforms,
      setNodes: (...args: any[]) => mocks.setNodesSpy(...args),
      removeNodes: (...args: any[]) => mocks.removeNodesSpy(...args),
    },
  };
});

const baseElement: any = {
  type: 'media',
  url: 'https://example.com/image.png',
  alt: 'test alt',
  width: 400,
  height: 300,
  finished: true,
  mediaType: 'image',
  children: [{ text: '' }],
};

describe('Image stable branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentStore = {
      markdownEditorRef: { current: {} },
      readonly: false,
      editorProps: {},
    };
    mocks.getMediaTypeMock.mockReturnValue('image');
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1000,
    });
  });

  it('ResizeImage onLoad 计算尺寸并显示图片', () => {
    render(<ResizeImage src="https://example.com/a.png" />);
    const img = screen.getByAltText('image') as HTMLImageElement;
    Object.defineProperty(img, 'naturalWidth', { value: 800 });
    Object.defineProperty(img, 'naturalHeight', { value: 400 });
    fireEvent.load(img);
    expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
  });

  it('ResizeImage onError 显示 MediaErrorLink', () => {
    render(<ResizeImage src="https://example.com/broken.png" />);
    fireEvent.error(screen.getByAltText('image'));
    expect(screen.getByTestId('media-error')).toBeInTheDocument();
  });

  it('ResizeImage onResize 触发 debounce 调整', () => {
    render(<ResizeImage src="https://example.com/a.png" />);
    const img = screen.getByAltText('image') as HTMLImageElement;
    Object.defineProperty(img, 'naturalWidth', { value: 600 });
    Object.defineProperty(img, 'naturalHeight', { value: 300 });
    fireEvent.load(img);
    fireEvent.click(screen.getByTestId('rnd-resize'));
    expect(screen.getByTestId('resize-image-container')).toBeInTheDocument();
  });

  it('EditorImage 图片探测 onerror 显示错误链接', async () => {
    const createdImgs: HTMLImageElement[] = [];
    const originalCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
    ) => {
      const el = originalCreate(tagName) as HTMLImageElement;
      if (tagName === 'img') createdImgs.push(el);
      return el;
    }) as typeof document.createElement);

    render(
      <EditorImage element={baseElement} attributes={{} as any}>
        {null}
      </EditorImage>,
    );

    const probe = createdImgs.find((img) => img.crossOrigin === 'anonymous');
    probe?.onerror?.(new Event('error') as any);
    await waitFor(() => {
      expect(screen.getByTestId('media-error')).toBeInTheDocument();
    });
    createSpy.mockRestore();
  });

  it('EditorImage finished=false 显示 skeleton 占位', () => {
    render(
      <EditorImage
        element={{ ...baseElement, finished: false }}
        attributes={{} as any}
      >
        {null}
      </EditorImage>,
    );
    expect(screen.getByTestId('skeleton-image')).toBeInTheDocument();
  });

  it('EditorImage onResizeStop 更新 slate 节点尺寸', () => {
    render(
      <EditorImage element={baseElement} attributes={{} as any}>
        {null}
      </EditorImage>,
    );
    fireEvent.click(screen.getByTestId('rnd-start'));
    fireEvent.click(screen.getByTestId('rnd-stop'));
    expect(mocks.setNodesSpy).toHaveBeenCalled();
  });

  it('EditorImage 删除确认后 removeNodes', () => {
    render(
      <EditorImage element={baseElement} attributes={{} as any}>
        {null}
      </EditorImage>,
    );
    fireEvent.click(screen.getByTestId('action-删除'));
    const config = mocks.modalConfirmMock.mock.calls[0]?.[0];
    config.onOk?.();
    expect(mocks.removeNodesSpy).toHaveBeenCalled();
  });

  it('EditorImage block 切换调用 setNodes', () => {
    render(
      <EditorImage
        element={{ ...baseElement, block: false }}
        attributes={{} as any}
      >
        {null}
      </EditorImage>,
    );
    fireEvent.click(screen.getByTestId('action-行内图片'));
    expect(mocks.setNodesSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('EditorImage 无 mediaType 时写入 mediaType', () => {
    render(
      <EditorImage
        element={{ ...baseElement, mediaType: undefined }}
        attributes={{} as any}
      >
        {null}
      </EditorImage>,
    );
    expect(mocks.setNodesSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ mediaType: 'image' }),
      expect.anything(),
    );
  });

  it('ReadonlyImage 加载失败显示链接', async () => {
    render(<ReadonlyImage src="https://example.com/x.png" alt="RO" />);
    fireEvent.error(screen.getByTestId('antd-image'));
    await waitFor(() => {
      expect(screen.getByTestId('media-error')).toHaveTextContent('RO');
    });
  });

  it('ReadonlyImage 支持自定义 render', () => {
    currentStore.editorProps = {
      image: {
        render: (_props: any, node: React.ReactNode) => (
          <div data-testid="custom-render">{node}</div>
        ),
      },
    };
    render(<ReadonlyImage src="https://example.com/x.png" />);
    expect(screen.getByTestId('custom-render')).toBeInTheDocument();
  });
});
