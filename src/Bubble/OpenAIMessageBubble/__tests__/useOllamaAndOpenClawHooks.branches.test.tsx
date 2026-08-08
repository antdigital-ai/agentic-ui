/**
 * useOllama / useOpenClaw MessageBubbleData：mapOptions ?? {} 与 mapMessage。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOllamaMessageBubbleData } from '../useOllamaMessageBubbleData';
import { useOpenClawMessageBubbleData } from '../useOpenClawMessageBubbleData';

describe('useOllamaMessageBubbleData branches', () => {
  it('无 mapOptions 时仍映射消息', () => {
    const { result } = renderHook(() =>
      useOllamaMessageBubbleData([{ role: 'user', content: 'hi' }]),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].role).toBe('user');
  });

  it('带 mapOptions 与 mapMessage', () => {
    const { result } = renderHook(() =>
      useOllamaMessageBubbleData(
        [{ role: 'assistant', content: 'ok' }],
        { baseTime: 1000, timeStepMs: 10 },
        (msg, mapped) => ({ ...mapped, originContent: `x:${msg.content}` }),
      ),
    );
    expect(result.current[0].originContent).toBe('x:ok');
  });
});

describe('useOpenClawMessageBubbleData branches', () => {
  it('无 mapOptions 时仍映射消息', () => {
    const { result } = renderHook(() =>
      useOpenClawMessageBubbleData([{ role: 'user', content: 'claw' }]),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].originContent).toBe('claw');
  });

  it('useOpenClawTimestamps false 与 mapMessage', () => {
    const { result } = renderHook(() =>
      useOpenClawMessageBubbleData(
        [{ role: 'user', content: 'a', timestamp: 99 }],
        { useOpenClawTimestamps: false, baseTime: 500 },
        (msg, mapped) => ({ ...mapped, id: `id-${msg.content}` }),
      ),
    );
    expect(result.current[0].id).toBe('id-a');
  });
});
