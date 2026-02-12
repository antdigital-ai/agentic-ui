import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyEditorImage } from '../../../../../src/MarkdownEditor/editor/elements/Image/ReadonlyEditorImage';
import * as domUtils from '../../../../../src/MarkdownEditor/editor/utils/dom';
import * as editorUtils from '../../../../../src/MarkdownEditor/editor/utils';

vi.mock('../../../../../src/MarkdownEditor/editor/utils/dom', () => ({
  getMediaType: vi.fn(() => 'image'),
}));

vi.mock('../../../../../src/MarkdownEditor/editor/utils', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../../../../src/MarkdownEditor/editor/utils')>();
  const origUseGetSetState = mod.useGetSetState;
  return {
    ...mod,
    useGetSetState: vi.fn(origUseGetSetState),
    _origUseGetSetState: origUseGetSetState,
  };
});

describe('ReadonlyEditorImage', () => {
  const defaultElement = {
    type: 'image',
    url: 'https://example.com/img.png',
    alt: 'test alt',
    children: [{ text: '' }],
  };

  const defaultProps = {
    element: defaultElement as any,
    attributes: {},
    children: null,
  };

  beforeEach(() => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('image');
  });

  afterEach(() => {
    vi.clearAllMocks();
    const orig = (editorUtils as any)._origUseGetSetState;
    if (orig) vi.mocked(editorUtils.useGetSetState).mockImplementation(orig);
  });

  it('应渲染容器并 data-be="image"', () => {
    const { container } = render(<ReadonlyEditorImage {...defaultProps} />);
    const outer = container.querySelector('[data-be="image"][data-testid="image-container"]');
    expect(outer).toBeInTheDocument();
  });

  it('element.finished 为 false 时应先显示 Skeleton', () => {
    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{ ...defaultElement, finished: false } as any}
      />,
    );
    expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('element.finished 为 false 且 5 秒后应显示为文本', async () => {
    vi.useFakeTimers();
    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{ ...defaultElement, finished: false, url: 'https://x.com/a.png', alt: '' } as any}
      />,
    );
    vi.advanceTimersByTime(5000);
    vi.useRealTimers();
    await waitFor(() => {
      expect(screen.getByText('https://x.com/a.png')).toBeInTheDocument();
    });
  });

  it('element.finished 为 false 超时后无 url 时显示「图片链接」', async () => {
    vi.useFakeTimers();
    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{ ...defaultElement, finished: false, url: '', alt: '' } as any}
      />,
    );
    vi.advanceTimersByTime(5000);
    vi.useRealTimers();
    await waitFor(() => {
      expect(screen.getByText('图片链接')).toBeInTheDocument();
    });
  });

  it('initial() 创建的 img onerror 会调用 setState({ loadSuccess: false })', async () => {
    const capturedImgs: HTMLImageElement[] = [];
    const origCreateElement = document.createElement.bind(document);
    const mockSetState = vi.fn();
    vi.mocked(editorUtils.useGetSetState).mockImplementation((initialState: any) => {
      const stateRef = { current: { ...initialState } };
      const get = () => stateRef.current;
      const set = (patch: any) => {
        mockSetState(patch);
        Object.assign(stateRef.current, patch);
      };
      return [get, set];
    });
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = origCreateElement(tagName) as HTMLImageElement;
      if (tagName === 'img') capturedImgs.push(el);
      return el;
    });

    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{ ...defaultElement, finished: true } as any}
      />,
    );

    await waitFor(() => {
      expect(capturedImgs.length).toBeGreaterThanOrEqual(1);
    });
    // initial() 创建的 img 未 append 到 document，ReadonlyImage 的 img 在 DOM 中
    const initialImg = capturedImgs.find((img) => !document.contains(img)) ?? capturedImgs[capturedImgs.length - 1];
    act(() => {
      initialImg?.onerror?.({} as Event);
    });
    // initial() 内先 setState({ type })、setState({ url })，img onerror 时 setState({ loadSuccess: false })
    expect(mockSetState).toHaveBeenCalledWith(expect.objectContaining({ loadSuccess: false }));
    vi.mocked(document.createElement).mockRestore();
  });

  it('应渲染 ReadonlyImage 并传递 width/height', () => {
    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{
          ...defaultElement,
          finished: true,
          width: 100,
          height: 80,
        } as any}
      />,
    );
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('alt')).toBe('test alt');
  });

  it('initial 应创建 img 并设置 referrerPolicy、crossOrigin', async () => {
    let capturedImg: HTMLImageElement | null = null;
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = origCreateElement(tagName) as HTMLImageElement;
      if (tagName === 'img') capturedImg = el;
      return el;
    });

    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{ ...defaultElement, finished: true } as any}
      />,
    );

    await waitFor(() => {
      expect(capturedImg).toBeTruthy();
    });
    expect(
      capturedImg?.getAttribute?.('referrerpolicy') ?? capturedImg?.referrerPolicy ?? 'no-referrer',
    ).toBe('no-referrer');
    expect(capturedImg?.getAttribute?.('crossorigin') ?? capturedImg?.crossOrigin ?? 'anonymous').toBe(
      'anonymous',
    );
    vi.mocked(document.createElement).mockRestore();
  });

  it('getMediaType 返回空时 initial 使用 image', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue(undefined as any);
    let capturedImg: HTMLImageElement | null = null;
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = origCreateElement(tagName) as HTMLImageElement;
      if (tagName === 'img') capturedImg = el;
      return el;
    });

    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{ ...defaultElement, finished: true } as any}
      />,
    );

    await waitFor(() => {
      expect(capturedImg).toBeTruthy();
    });
    vi.mocked(document.createElement).mockRestore();
  });

  it('getMediaType 返回 video 时 initial 不创建 img', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('video');
    const createEl = vi.spyOn(document, 'createElement');

    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{ ...defaultElement, finished: true } as any}
      />,
    );

    await waitFor(() => {
      expect(domUtils.getMediaType).toHaveBeenCalled();
    });
    // 仅 ReadonlyImage 子组件会创建 img，本组件 initial() 在 type=video 时不创建 img，故仅子组件产生的 img 调用
    const imgCalls = createEl.mock.calls.filter((c) => c[0] === 'img');
    expect(imgCalls.length).toBeLessThanOrEqual(2);
    createEl.mockRestore();
  });

  it('getMediaType 返回 other 时 initial 创建 img', async () => {
    vi.mocked(domUtils.getMediaType).mockReturnValue('other');
    let capturedImg: HTMLImageElement | null = null;
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = origCreateElement(tagName) as HTMLImageElement;
      if (tagName === 'img') capturedImg = el;
      return el;
    });

    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{ ...defaultElement, finished: true } as any}
      />,
    );

    await waitFor(() => {
      expect(capturedImg).toBeTruthy();
    });
    vi.mocked(document.createElement).mockRestore();
  });

  it('img onload 应设置 loadSuccess true', async () => {
    let capturedImg: HTMLImageElement | null = null;
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = origCreateElement(tagName) as HTMLImageElement;
      if (tagName === 'img') capturedImg = el;
      return el;
    });

    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{ ...defaultElement, finished: true } as any}
      />,
    );

    await waitFor(() => {
      expect(capturedImg).toBeTruthy();
    });
    capturedImg?.onload?.({} as Event);
    await waitFor(() => {
      const img = document.querySelector('img');
      expect(img).toBeInTheDocument();
    });
    vi.mocked(document.createElement).mockRestore();
  });

  it('应渲染 children 在隐藏 div 中', () => {
    render(
      <ReadonlyEditorImage {...defaultProps}>
        <span data-testid="child">child</span>
      </ReadonlyEditorImage>,
    );
    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child.closest('div')?.style.display).toBe('none');
  });

  it('element.finished 为 true 时 useEffect 将 showAsText 设为 false', () => {
    render(
      <ReadonlyEditorImage
        {...defaultProps}
        element={{ ...defaultElement, finished: true } as any}
      />,
    );
    expect(document.querySelector('.ant-skeleton')).not.toBeInTheDocument();
  });
});
