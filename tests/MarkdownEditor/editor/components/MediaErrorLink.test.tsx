import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaErrorLink } from '../../../../src/MarkdownEditor/editor/components/MediaErrorLink';
import * as editorStore from '../../../../src/MarkdownEditor/editor/store';
import { createLinkConfigTestSuite } from '../elements/__testUtils__/linkConfig.testUtils';

vi.mock('../../../../src/MarkdownEditor/editor/store.ts');

// Mock window.open
const mockWindowOpen = vi.fn();
beforeEach(() => {
  window.open = mockWindowOpen;
  mockWindowOpen.mockClear();
});

describe('MediaErrorLink Component', () => {
  beforeEach(() => {
    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: {},
    } as any);
  });

  it('应该渲染基本链接', () => {
    const { container } = render(
      <MediaErrorLink
        url="https://example.com/image.jpg"
        displayText="测试链接"
      />,
    );

    const link = container.querySelector('span');
    expect(link).toBeDefined();
    expect(link?.textContent).toContain('测试链接');
  });

  it('应该显示警告图标和外部链接图标', () => {
    const { container } = render(
      <MediaErrorLink
        url="https://example.com/image.jpg"
        displayText="测试链接"
      />,
    );

    const link = container.querySelector('span');
    expect(link).toBeDefined();
    // 检查是否包含图标（通过 SVG 元素）
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('应该使用 fallbackUrl 当 url 为空时', () => {
    const { container } = render(
      <MediaErrorLink
        url={undefined}
        fallbackUrl="https://fallback.com/image.jpg"
        displayText="备用链接"
      />,
    );

    const link = container.querySelector('span');
    expect(link).toBeDefined();
    expect(link?.textContent).toContain('备用链接');
  });

  it('应该支持自定义样式', () => {
    const customStyle = {
      fontSize: '16px',
      color: 'red',
    };

    const { container } = render(
      <MediaErrorLink
        url="https://example.com/image.jpg"
        displayText="测试链接"
        style={customStyle}
      />,
    );

    const link = container.querySelector('span');
    expect(link).toBeDefined();
    const computedStyle = window.getComputedStyle(link!);
    expect(computedStyle.fontSize).toBe('16px');
    // CSS 会将 'red' 转换为 RGB 值
    expect(computedStyle.color).toMatch(/rgb\(255,\s*0,\s*0\)|red/);
  });

  it('当 url 和 fallbackUrl 都为空时不应该打开链接', () => {
    const { container } = render(
      <MediaErrorLink url={undefined} displayText="无链接" />,
    );

    const link = container.querySelector('span');
    expect(link).toBeDefined();

    fireEvent.click(link!);
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it('应该阻止事件冒泡和默认行为', () => {
    const { container } = render(
      <MediaErrorLink
        url="https://example.com/image.jpg"
        displayText="测试链接"
      />,
    );

    const link = container.querySelector('span');
    const stopPropagationSpy = vi.fn();
    const preventDefaultSpy = vi.fn();

    const clickEvent = new MouseEvent('click', { bubbles: true });
    clickEvent.stopPropagation = stopPropagationSpy;
    clickEvent.preventDefault = preventDefaultSpy;

    link?.dispatchEvent(clickEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  describe('linkConfig 功能测试', () => {
    let containerElement: HTMLElement | null = null;
    let rerender: (ui: React.ReactElement) => void;

    const getErrorLink = async () => {
      if (!containerElement) return null;
      return containerElement.querySelector('span');
    };

    const triggerError = () => {
      // MediaErrorLink 直接渲染，不需要触发错误
    };

    const updateEditorStore = async (linkConfig: {
      onClick?: (url: string) => boolean | void;
      openInNewTab?: boolean;
    }) => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {
          linkConfig,
        },
      } as any);
      // 重新渲染以应用新的配置，通过改变 key 强制重新渲染
      if (rerender) {
        rerender(
          <MediaErrorLink
            key={Date.now()}
            url="https://example.com/test.jpg"
            displayText="测试链接"
          />,
        );
        // 等待 React 重新渲染完成
        await waitFor(() => {
          const element = containerElement?.querySelector('span');
          expect(element).toBeInTheDocument();
        }, { timeout: 1000 });
      }
    };

    beforeEach(() => {
      mockWindowOpen.mockClear();
      if (typeof window !== 'undefined') {
        window.open = mockWindowOpen;
      }
      const result = render(
        <MediaErrorLink
          url="https://example.com/test.jpg"
          displayText="测试链接"
        />,
      );
      containerElement = result.container;
      rerender = result.rerender;
    });

    createLinkConfigTestSuite({
      getErrorLink: async () => {
        const element = await getErrorLink();
        return element as HTMLElement | null;
      },
      triggerError,
      testUrl: 'https://example.com/test.jpg',
      mockWindowOpen,
      updateEditorStore,
    });
  });
});

