import { describe, expect, it } from 'vitest';

import { mapOpenClawMessagesToMessageBubbleData } from '../mapOpenClawMessages';
import { mapOpenAIMessagesToMessageBubbleData } from '../mapOpenAIMessages';
import {
  normalizeOpenClawMessageToOpenAI,
  normalizeOpenClawMessagesToOpenAI,
} from '../normalizeOpenClawMessages';
import type { OpenClawChatMessage } from '../openClawTypes';

describe('normalizeOpenClawMessagesToOpenAI', () => {
  it('maps toolResult to OpenAI tool', () => {
    const out = normalizeOpenClawMessageToOpenAI({
      role: 'toolResult',
      content: 'ok',
      tool_call_id: 'call_1',
      id: 't1',
    });
    expect(out.role).toBe('tool');
    expect(out.content).toBe('ok');
    expect((out as { tool_call_id?: string }).tool_call_id).toBe('call_1');
    expect(out.id).toBe('t1');
  });

  it('strips timestamp from OpenAI-compatible rows', () => {
    const out = normalizeOpenClawMessageToOpenAI({
      role: 'user',
      content: 'hi',
      timestamp: 999,
    } as OpenClawChatMessage);
    expect(out).toEqual({ role: 'user', content: 'hi' });
  });

  it('normalizes array', () => {
    const arr: OpenClawChatMessage[] = [
      { role: 'user', content: 'a', timestamp: 1 },
      { role: 'toolResult', content: 'b', tool_call_id: 'x' },
    ];
    const openai = normalizeOpenClawMessagesToOpenAI(arr);
    expect(openai).toHaveLength(2);
    expect(openai[1].role).toBe('tool');
    expect(openai[1].content).toBe('b');
  });
});

describe('mapOpenClawMessagesToMessageBubbleData', () => {
  const baseTime = 1_700_000_000_000;

  it('maps toolResult like tool (left / assistant tool role)', () => {
    const out = mapOpenClawMessagesToMessageBubbleData(
      [{ role: 'toolResult', content: 'result', tool_call_id: 'c1' }],
      { baseTime },
    );
    expect(out[0].role).toBe('assistant');
    expect(out[0].extra?.openai?.role).toBe('tool');
    expect(out[0].extra?.openclaw?.raw?.role).toBe('toolResult');
  });

  it('applies timestamp to createAt when useOpenClawTimestamps is true', () => {
    const ts = 1_700_000_012_345;
    const out = mapOpenClawMessagesToMessageBubbleData(
      [{ role: 'user', content: 'x', timestamp: ts }],
      { baseTime, useOpenClawTimestamps: true },
    );
    expect(out[0].createAt).toBe(ts);
    expect(out[0].updateAt).toBe(ts);
  });

  it('skips timestamp when useOpenClawTimestamps is false', () => {
    const ts = 1_700_000_012_345;
    const out = mapOpenClawMessagesToMessageBubbleData(
      [{ role: 'user', content: 'x', timestamp: ts }],
      { baseTime, useOpenClawTimestamps: false },
    );
    expect(out[0].createAt).toBe(baseTime);
  });

  it('keeps message id stable when content grows (SSE)', () => {
    const short: OpenClawChatMessage[] = [
      { role: 'assistant', content: 'a' },
    ];
    const long: OpenClawChatMessage[] = [
      { role: 'assistant', content: 'a'.repeat(80) },
    ];
    const o1 = mapOpenClawMessagesToMessageBubbleData(short, { baseTime });
    const o2 = mapOpenClawMessagesToMessageBubbleData(long, { baseTime });
    expect(o1[0].id).toBe(o2[0].id);
  });

  it('matches OpenAI path after normalize when no claw extras', () => {
    const claw: OpenClawChatMessage[] = [{ role: 'user', content: 'u' }];
    const openai = normalizeOpenClawMessagesToOpenAI(claw);
    const a = mapOpenClawMessagesToMessageBubbleData(claw, {
      baseTime,
      useOpenClawTimestamps: false,
      preserveOpenClawRawInExtra: false,
    });
    const b = mapOpenAIMessagesToMessageBubbleData(openai, {
      baseTime,
      preserveRawInExtra: true,
    });
    expect(a[0].id).toBe(b[0].id);
    expect(a[0].originContent).toBe(b[0].originContent);
  });
});
