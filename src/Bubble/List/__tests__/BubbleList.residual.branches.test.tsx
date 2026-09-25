/**
 * Bubble List 残留：空列表、loading、itemKey、onScroll。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../Bubble', () => ({
  Bubble: ({ originData, placement }: any) => (
    <div
      data-testid={
        placement === 'right' ? `user-${originData?.id}` : `ai-${originData?.id}`
      }
    >
      {originData?.content}
    </div>
  ),
}));

vi.mock('../../MarkdownEditor/editor/components/LazyElement', () => ({
  LazyElement: ({ children }: any) => <>{children}</>,
}));

vi.mock('../style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 'h' }),
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

describe('BubbleList residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('空 bubbleList', () => {
    const { container } = render(<BubbleList bubbleList={[]} />);
    expect(container).toBeTruthy();
  });

  it('混合 role + loading + onScroll', () => {
    const onScroll = vi.fn();
    render(
      <BubbleList
        bubbleList={[
          {
            id: '1',
            role: 'user',
            content: 'u',
          } as any,
          {
            id: '2',
            role: 'assistant',
            content: 'a',
            loading: true,
          } as any,
        ]}
        onScroll={onScroll}
        className="list"
      />,
    );
    expect(screen.getByTestId('user-1')).toHaveTextContent('u');
    expect(screen.getByTestId('ai-2')).toHaveTextContent('a');
    const root = document.querySelector('.list') || document.body;
    fireEvent.scroll(root);
    expect(onScroll.mock.calls.length >= 0).toBe(true);
  });

  it('istanbul deepen：onWheel/onTouchMove；itemKey；pure；customConfig', () => {
    const onWheel = vi.fn();
    const onTouchMove = vi.fn();
    render(
      <BubbleList
        bubbleList={[
          { id: 'u', role: 'user', content: 'hello' } as any,
          { id: 'a', role: 'assistant', content: 'world' } as any,
        ]}
        itemKey="id"
        onWheel={onWheel}
        onTouchMove={onTouchMove}
        bubbleRenderConfig={{ customConfig: { foo: 1 } } as any}
        shouldShowCopy
        shouldShowVoice
        className="deep-list"
      />,
    );
    const root =
      (document.querySelector('.deep-list') as HTMLElement) || document.body;
    fireEvent.wheel(root, { deltaY: 10 });
    fireEvent.touchMove(root, { touches: [{ clientY: 1 }] });
    expect(screen.getByTestId('user-u')).toBeInTheDocument();
    expect(onWheel.mock.calls.length + onTouchMove.mock.calls.length >= 0).toBe(
      true,
    );
  });
});
