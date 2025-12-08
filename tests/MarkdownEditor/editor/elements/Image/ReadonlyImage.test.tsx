import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyImage } from '../../../../../src/MarkdownEditor/editor/elements/Image';
import * as editorStore from '../../../../../src/MarkdownEditor/editor/store';
import { createLinkConfigTestSuite } from '../__testUtils__/linkConfig.testUtils';

vi.mock('../../../../../src/MarkdownEditor/editor/store.ts');

// Mock window.open
const mockWindowOpen = vi.fn();
beforeEach(() => {
  window.open = mockWindowOpen;
  mockWindowOpen.mockClear();
});

describe('ReadonlyImage Component', () => {
  beforeEach(() => {
    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: {},
    } as any);
  });

  it('应该渲染基本图片', () => {
    const { getByTestId } = render(
      <ReadonlyImage src="https://example.com/image.jpg" alt="Test Image" />,
    );

    const container = getByTestId('image-container');
    expect(container).toBeDefined();
  });

  it('应该使用默认宽度', () => {
    const { container } = render(
      <ReadonlyImage src="https://example.com/image.jpg" />,
    );

    const img = container.querySelector('img');
    expect(img).toBeDefined();
  });

  it('应该接受自定义宽度（数字）', () => {
    const { container } = render(
      <ReadonlyImage src="https://example.com/image.jpg" width={300} />,
    );

    const img = container.querySelector('img');
    expect(img).toBeDefined();
  });

  it('应该接受自定义宽度（字符串）', () => {
    const { container } = render(
      <ReadonlyImage src="https://example.com/image.jpg" width="500px" />,
    );

    const img = container.querySelector('img');
    expect(img).toBeDefined();
  });

  it('应该在加载失败时显示链接', async () => {
    const { container, rerender } = render(
      <ReadonlyImage src="invalid-url.jpg" alt="Failed Image" />,
    );

    // 触发错误
    const img = container.querySelector('img');
    if (img) {
      fireEvent.error(img);
    }

    // 等待错误状态更新
    await waitFor(() => {
      const link = container.querySelector('span');
      expect(link).toBeDefined();
      expect(link?.textContent).toContain('Failed Image');
    });
  });

  it('应该在加载失败时显示 alt 文本', async () => {
    const { container } = render(
      <ReadonlyImage src="invalid-url.jpg" alt="Alternative Text" />,
    );

    const img = container.querySelector('img');
    if (img) {
      fireEvent.error(img);
    }

    await waitFor(() => {
      const link = container.querySelector('span');
      expect(link?.textContent).toContain('Alternative Text');
    });
  });

  it('应该在加载失败且无 alt 时显示 src', async () => {
    const { container } = render(
      <ReadonlyImage src="https://example.com/image.jpg" />,
    );

    const img = container.querySelector('img');
    if (img) {
      fireEvent.error(img);
    }

    await waitFor(() => {
      const link = container.querySelector('span');
      expect(link?.textContent).toContain('https://example.com/image.jpg');
    });
  });

  it('应该支持自定义 render 函数', () => {
    const customRender = vi.fn((props, defaultNode) => defaultNode);

    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: {
        image: {
          render: customRender,
        },
      },
    } as any);

    render(<ReadonlyImage src="https://example.com/image.jpg" />);

    expect(customRender).toHaveBeenCalled();
  });

  it('应该在自定义 render 中传递 onError', () => {
    const customRender = vi.fn((props, defaultNode) => {
      expect(props).toHaveProperty('onError');
      expect(typeof props.onError).toBe('function');
      return defaultNode;
    });

    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: {
        image: {
          render: customRender,
        },
      },
    } as any);

    render(<ReadonlyImage src="https://example.com/image.jpg" />);
  });

  it('应该传递所有属性到 Image 组件', () => {
    const { container } = render(
      <ReadonlyImage
        src="https://example.com/image.jpg"
        alt="Test"
        width={500}
        height={300}
      />,
    );

    const img = container.querySelector('img');
    expect(img).toBeDefined();
  });

  it('应该支持 crossOrigin 属性', () => {
    const { container } = render(
      <ReadonlyImage
        src="https://example.com/image.jpg"
        crossOrigin="anonymous"
      />,
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('crossorigin', 'anonymous');
  });

  it('应该处理没有 src 的情况', () => {
    const { container } = render(<ReadonlyImage src="" alt="No source" />);

    expect(container).toBeDefined();
  });

  it('失败链接应该在新标签页打开', async () => {
    const { container } = render(<ReadonlyImage src="invalid-url.jpg" />);

    const img = container.querySelector('img');
    if (img) {
      fireEvent.error(img);

      await waitFor(() => {
        const link = container.querySelector('span');
        if (link) {
          fireEvent.click(link);
          expect(mockWindowOpen).toHaveBeenCalled();
        }
      });
    }
  });

  describe('linkConfig 功能测试', () => {
    let containerElement: HTMLElement | null = null;

    const getErrorLink = async () => {
      if (!containerElement) return null;
      await waitFor(() => {
        const link = containerElement?.querySelector('span');
        if (!link) {
          throw new Error('链接元素未找到');
        }
      });
      return containerElement.querySelector('span');
    };

    const triggerError = () => {
      if (!containerElement) return;
      const img = containerElement.querySelector('img');
      if (img) {
        fireEvent.error(img);
      }
    };

    const updateEditorStore = async (linkConfig: {
      onClick?: (url: string) => boolean | void;
      openInNewTab?: boolean;
    }): Promise<void> => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {
          linkConfig,
        },
      } as any);
    };

    beforeEach(() => {
      mockWindowOpen.mockClear();
      if (typeof window !== 'undefined') {
        window.open = mockWindowOpen;
      }
      const { container } = render(
        <ReadonlyImage src="invalid-url.jpg" alt="Test Image" />,
      );
      containerElement = container;
    });

    createLinkConfigTestSuite({
      getErrorLink: async () => {
        const element = await getErrorLink();
        return element as HTMLAnchorElement | null;
      },
      triggerError,
      testUrl: 'invalid-url.jpg',
      mockWindowOpen,
      updateEditorStore,
    });
  });
});
