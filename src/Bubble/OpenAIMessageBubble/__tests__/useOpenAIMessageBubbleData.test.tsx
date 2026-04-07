import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useOpenAIMessageBubbleData } from '../useOpenAIMessageBubbleData';
import type { OpenAIChatMessage } from '../types';

describe('useOpenAIMessageBubbleData', () => {
  it('returns mapped bubble list', () => {
    const messages: OpenAIChatMessage[] = [{ role: 'user', content: 'hi' }];
    const { result } = renderHook(() =>
      useOpenAIMessageBubbleData(messages, { baseTime: 1000 }),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].role).toBe('user');
    expect(result.current[0].originContent).toBe('hi');
  });

  it('updates when messages reference changes', () => {
    const messages1: OpenAIChatMessage[] = [{ role: 'user', content: 'a' }];
    const messages2: OpenAIChatMessage[] = [{ role: 'user', content: 'b' }];
    const { result, rerender } = renderHook(
      ({ msgs }: { msgs: OpenAIChatMessage[] }) =>
        useOpenAIMessageBubbleData(msgs, { baseTime: 1000 }),
      { initialProps: { msgs: messages1 } },
    );
    expect(result.current[0].originContent).toBe('a');
    rerender({ msgs: messages2 });
    expect(result.current[0].originContent).toBe('b');
  });
});
