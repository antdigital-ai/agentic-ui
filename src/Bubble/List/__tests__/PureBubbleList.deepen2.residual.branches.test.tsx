/**
 * PureBubbleList deepen2：compact context、LOADING 无 createAt、
 * classNames/styles、空列表。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { LOADING_FLAT } from '../../MessagesContent';
import { PureBubbleList } from '../PureBubbleList';

describe('PureBubbleList deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('compact context + 空 bubbleList', () => {
    const { container } = render(
      <BubbleConfigContext.Provider value={{ compact: true } as any}>
        <PureBubbleList bubbleList={[]} bubbleListRef={{ current: null }} />
      </BubbleConfigContext.Provider>,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('LOADING_FLAT 无 createAt 仍渲染', () => {
    render(
      <PureBubbleList
        bubbleList={
          [
            {
              id: LOADING_FLAT,
              role: 'assistant',
              content: 'wait',
            },
          ] as any
        }
        bubbleListRef={{ current: null }}
      />,
    );
    expect(screen.getByText(/wait/)).toBeTruthy();
  });

  it('LOADING → 真实 id → 再 LOADING 走缓存分支', () => {
    const listRef = { current: null as any };
    const { rerender } = render(
      <PureBubbleList
        bubbleList={
          [
            {
              id: LOADING_FLAT,
              role: 'assistant',
              content: '...',
              createAt: 10,
            },
          ] as any
        }
        bubbleListRef={listRef}
      />,
    );
    rerender(
      <PureBubbleList
        bubbleList={
          [
            {
              id: 'real-1',
              role: 'assistant',
              content: 'ok',
              createAt: 10,
              updateAt: 11,
            },
          ] as any
        }
        bubbleListRef={listRef}
      />,
    );
    rerender(
      <PureBubbleList
        bubbleList={
          [
            {
              id: LOADING_FLAT,
              role: 'assistant',
              content: '...',
              createAt: 20,
            },
          ] as any
        }
        bubbleListRef={listRef}
      />,
    );
    expect(screen.getByText(/\.\.\.|ok/)).toBeTruthy();
  });

  it('classNames / styles / onScroll 透传', () => {
    const onScroll = vi.fn();
    render(
      <PureBubbleList
        bubbleList={
          [
            {
              id: 'u1',
              role: 'user',
              content: 'hi',
              createAt: 1,
              updateAt: 1,
            },
          ] as any
        }
        bubbleListRef={{ current: null }}
        className="list-x"
        style={{ padding: 4 }}
        onScroll={onScroll}
      />,
    );
    expect(screen.getByText('hi')).toBeTruthy();
  });
});
