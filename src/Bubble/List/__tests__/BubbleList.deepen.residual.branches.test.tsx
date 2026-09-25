/**
 * BubbleList deepen residual：loading、context、lazy、key 过渡、renderMode 合并。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { LOADING_FLAT } from '../../MessagesContent';

vi.mock('../../Bubble', () => ({
  Bubble: ({
    originData,
    placement,
    markdownRenderConfig,
    deps,
  }: any) => (
    <div
      data-testid={
        placement === 'right' ? `user-${originData?.id}` : `ai-${originData?.id}`
      }
      data-render-mode={markdownRenderConfig?.renderMode}
      data-deps-len={deps?.length ?? 0}
    >
      {originData?.content}
    </div>
  ),
}));

const lazyElementSpy = vi.fn(({ children, renderPlaceholder, elementInfo }: any) => {
  if (renderPlaceholder) {
    renderPlaceholder({
      height: 100,
      style: {},
      isIntersecting: false,
      elementInfo,
    });
  }
  return <div data-testid="lazy-wrap">{children}</div>;
});

vi.mock('../../../MarkdownEditor/editor/components/LazyElement', () => ({
  LazyElement: (props: any) => lazyElementSpy(props),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 'hash' }),
}));

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>();
  return {
    ...antd,
    ConfigProvider: {
      ...antd.ConfigProvider,
      ConfigContext: React.createContext({
        getPrefixCls: (s: string) => `ant-${s}`,
      }),
    },
  };
});

import { BubbleList } from '../index';

describe('BubbleList deepen residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    lazyElementSpy.mockClear();
  });

  it('isLoading 渲染 SkeletonList；legacy loading 兼容', () => {
    const { rerender } = render(<BubbleList bubbleList={[]} isLoading />);
    expect(document.querySelector('.ant-agentic-bubble-list-loading')).toBeTruthy();

    rerender(<BubbleList bubbleList={[]} loading />);
    expect(document.querySelector('.ant-agentic-bubble-list-loading')).toBeTruthy();
  });

  it('BubbleConfigContext 合并 extraShowOnHover；compact readonly 类名', () => {
    render(
      <BubbleConfigContext.Provider
        value={{ standalone: true, compact: true, extraShowOnHover: true } as any}
      >
        <BubbleList
          bubbleList={[{ id: '1', role: 'user', content: 'u' } as any]}
          readonly
          extraShowOnHover={false}
        />
      </BubbleConfigContext.Provider>,
    );
    const root = document.querySelector('[data-chat-list="1"]');
    expect(root?.className).toContain('-readonly');
    expect(root?.className).toContain('-compact');
  });

  it('无 parentContext 时使用 standalone false 默认 context', () => {
    render(
      <BubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'a' } as any]}
        extraShowOnHover
      />,
    );
    expect(screen.getByTestId('ai-1')).toBeInTheDocument();
  });

  it('renderMode / renderType 合并进 markdownRenderConfig', () => {
    render(
      <BubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'a' } as any]}
        renderType="markdown"
      />,
    );
    expect(screen.getByTestId('ai-1')).toHaveAttribute(
      'data-render-mode',
      'markdown',
    );
  });

  it('renderType 优先于 markdownRenderConfig.renderMode', () => {
    render(
      <BubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'a' } as any]}
        renderType="markdown"
        markdownRenderConfig={{ renderMode: 'slate' } as any}
      />,
    );
    expect(screen.getByTestId('ai-1')).toHaveAttribute(
      'data-render-mode',
      'markdown',
    );
  });

  it('LOADING_FLAT 使用 cacheKey；loading→real 过渡保持 key', () => {
    const { rerender } = render(
      <BubbleList
        bubbleList={[
          { id: LOADING_FLAT, role: 'assistant', content: '', createAt: 99 } as any,
        ]}
      />,
    );
    expect(screen.getByTestId('ai-...')).toBeInTheDocument();

    rerender(
      <BubbleList
        bubbleList={[
          { id: 'real-1', role: 'assistant', content: 'done', createAt: 99 } as any,
        ]}
      />,
    );
    expect(screen.getByTestId('ai-real-1')).toBeInTheDocument();
  });

  it('realId 复用 stable key 映射', () => {
    const { rerender } = render(
      <BubbleList
        bubbleList={[
          { id: LOADING_FLAT, role: 'assistant', content: '', createAt: 1 } as any,
        ]}
      />,
    );
    rerender(
      <BubbleList
        bubbleList={[
          { id: 'stable-id', role: 'assistant', content: 'x', createAt: 1 } as any,
        ]}
      />,
    );
    rerender(
      <BubbleList
        bubbleList={[
          { id: 'stable-id', role: 'assistant', content: 'y', createAt: 1 } as any,
        ]}
      />,
    );
    expect(screen.getByTestId('ai-stable-id')).toHaveTextContent('y');
  });

  it('lazy 启用且 shouldLazyLoad 为 true 时走 LazyElement', () => {
    render(
      <BubbleList
        bubbleList={[
          { id: '1', role: 'assistant', content: 'a' } as any,
          { id: '2', role: 'user', content: 'u' } as any,
        ]}
        lazy={{
          enable: true,
          placeholderHeight: 80,
          rootMargin: '100px',
          shouldLazyLoad: () => true,
        }}
      />,
    );
    expect(lazyElementSpy).toHaveBeenCalled();
    expect(screen.getAllByTestId('lazy-wrap').length).toBeGreaterThan(0);
  });

  it('lazy renderPlaceholder 适配 elementInfo 含 role', () => {
    const renderPlaceholder = vi.fn(() => <div data-testid="ph" />);
    render(
      <BubbleList
        bubbleList={[{ id: '1', role: 'user', content: 'u' } as any]}
        lazy={{
          enable: true,
          renderPlaceholder,
        }}
      />,
    );
    expect(renderPlaceholder).toHaveBeenCalledWith(
      expect.objectContaining({
        elementInfo: expect.objectContaining({ role: 'user' }),
      }),
    );
  });

  it('lazy renderPlaceholder 无 elementInfo 时不注入 role', () => {
    const renderPlaceholder = vi.fn(() => <div data-testid="ph2" />);
    lazyElementSpy.mockImplementationOnce(({ renderPlaceholder: rp }: any) => {
      rp?.({
        height: 50,
        style: {},
        isIntersecting: true,
        elementInfo: undefined,
      });
      return <div data-testid="lazy-no-info" />;
    });
    render(
      <BubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'a' } as any]}
        lazy={{ enable: true, renderPlaceholder }}
      />,
    );
    expect(renderPlaceholder).toHaveBeenCalledWith(
      expect.objectContaining({ elementInfo: undefined }),
    );
  });

  it('lazy shouldLazyLoad 返回 false 时不包裹 LazyElement', () => {
    render(
      <BubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'a' } as any]}
        lazy={{ enable: true, shouldLazyLoad: () => false }}
      />,
    );
    expect(screen.queryByTestId('lazy-wrap')).not.toBeInTheDocument();
    expect(screen.getByTestId('ai-1')).toBeInTheDocument();
  });

  it('移除行时清理 styles/avatar 缓存', () => {
    const { rerender } = render(
      <BubbleList
        bubbleList={[
          { id: 'a', role: 'assistant', content: '1' } as any,
          { id: 'b', role: 'user', content: '2' } as any,
        ]}
        userMeta={{ title: 'U' } as any}
        assistantMeta={{ title: 'A' } as any}
        styles={{
          bubbleListLeftItemContentStyle: { color: 'blue' },
          bubbleListRightItemContentStyle: { color: 'green' },
        }}
      />,
    );
    rerender(
      <BubbleList
        bubbleList={[{ id: 'a', role: 'assistant', content: '1' } as any]}
        userMeta={{ title: 'U' } as any}
        assistantMeta={{ title: 'A' } as any}
      />,
    );
    expect(screen.getByTestId('ai-a')).toBeInTheDocument();
    expect(screen.queryByTestId('user-b')).not.toBeInTheDocument();
  });

  it('style 浅相等时不更新 prevStyleRef deps', () => {
    const style = { margin: 1 };
    const { rerender } = render(
      <BubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'a' } as any]}
        style={style}
      />,
    );
    rerender(
      <BubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'a' } as any]}
        style={{ margin: 1 }}
      />,
    );
    expect(screen.getByTestId('ai-1')).toHaveAttribute('data-deps-len', '1');
  });

  it('onWheel/onTouchMove 传入 bubbleListRef.current', () => {
    const onWheel = vi.fn();
    const onTouchMove = vi.fn();
    const ref = React.createRef<HTMLDivElement>();
    render(
      <BubbleList
        bubbleList={[{ id: '1', role: 'user', content: 'u' } as any]}
        bubbleListRef={ref}
        onWheel={onWheel}
        onTouchMove={onTouchMove}
      />,
    );
    const root = ref.current!;
    fireEvent.wheel(root, { deltaY: 5 });
    fireEvent.touchMove(root, { touches: [{ clientY: 0 }] });
    expect(onWheel).toHaveBeenCalledWith(expect.anything(), root);
    expect(onTouchMove).toHaveBeenCalledWith(expect.anything(), root);
  });
});
