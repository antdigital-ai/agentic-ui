/**
 * BubbleList deepen2：默认 bubbleList、style 浅比较、LOADING_FLAT Date.now。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOADING_FLAT } from '../../MessagesContent';

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

vi.mock('../../../MarkdownEditor/editor/components/LazyElement', () => ({
  LazyElement: ({ children }: any) => (
    <div data-testid="lazy-wrap">{children}</div>
  ),
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

describe('BubbleList deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('省略 bubbleList 默认为空数组', () => {
    expect(() => render(<BubbleList />)).not.toThrow();
    expect(document.querySelector('[data-chat-list]')).toBeTruthy();
  });

  it('style undefined→有值→浅相等新对象：deps 稳定', () => {
    const { rerender } = render(
      <BubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'a' } as any]}
      />,
    );
    expect(screen.getByTestId('ai-1')).toHaveTextContent('a');

    rerender(
      <BubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'a' } as any]}
        style={{ padding: 1 }}
      />,
    );
    rerender(
      <BubbleList
        bubbleList={[{ id: '1', role: 'assistant', content: 'a' } as any]}
        style={{ padding: 1 }}
      />,
    );
    expect(screen.getByTestId('ai-1')).toBeInTheDocument();
  });

  it('LOADING_FLAT 无 createAt 走 Date.now 缓存键', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(42_000);
    render(
      <BubbleList
        bubbleList={
          [
            {
              id: LOADING_FLAT,
              role: 'assistant',
              content: '',
            },
          ] as any
        }
      />,
    );
    expect(nowSpy).toHaveBeenCalled();
    expect(screen.getByTestId(`ai-${LOADING_FLAT}`)).toBeInTheDocument();
    nowSpy.mockRestore();
  });
});
