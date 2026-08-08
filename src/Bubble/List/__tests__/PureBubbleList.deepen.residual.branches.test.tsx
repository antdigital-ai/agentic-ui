/**
 * PureBubbleList deepen：LOADING_FLAT 稳定 key；user/assistant。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOADING_FLAT } from '../../MessagesContent';
import { PureBubbleList } from '../PureBubbleList';

describe('PureBubbleList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('LOADING_FLAT 与真实 id 切换保持渲染', () => {
    const listRef = { current: null as any };
    const { rerender } = render(
      <PureBubbleList
        bubbleList={
          [
            {
              id: LOADING_FLAT,
              role: 'assistant',
              content: '...',
              createAt: 1,
              updateAt: 1,
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
              id: 'msg-1',
              role: 'assistant',
              content: 'done',
              createAt: 1,
              updateAt: 2,
            },
          ] as any
        }
        bubbleListRef={listRef}
      />,
    );
    expect(screen.getByText(/done|\.\.\./)).toBeTruthy();
  });

  it('user + assistant 混合列表', () => {
    render(
      <PureBubbleList
        bubbleList={
          [
            {
              id: 'u1',
              role: 'user',
              content: 'q',
              createAt: 1,
              updateAt: 1,
            },
            {
              id: 'a1',
              role: 'assistant',
              content: 'a',
              createAt: 2,
              updateAt: 2,
            },
          ] as any
        }
        bubbleListRef={{ current: null }}
        userMeta={{ title: 'U' }}
        assistantMeta={{ title: 'A' }}
      />,
    );
    expect(screen.getByText('q')).toBeTruthy();
    expect(screen.getByText('a')).toBeTruthy();
  });
});
