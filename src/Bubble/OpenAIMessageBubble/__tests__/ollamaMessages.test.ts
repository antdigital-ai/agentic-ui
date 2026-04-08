import { describe, expect, it } from 'vitest';

import { mapOllamaMessagesToMessageBubbleData } from '../mapOllamaMessages';
import { mapOpenAIMessagesToMessageBubbleData } from '../mapOpenAIMessages';
import {
  normalizeOllamaMessageToOpenAI,
  normalizeOllamaMessagesToOpenAI,
} from '../normalizeOllamaMessages';
import type { OllamaChatMessage } from '../ollamaTypes';

describe('normalizeOllamaMessagesToOpenAI', () => {
  it('maps basic user and assistant', () => {
    const u = normalizeOllamaMessageToOpenAI({
      role: 'user',
      content: 'hi',
    });
    expect(u).toEqual({ role: 'user', content: 'hi' });
    const a = normalizeOllamaMessageToOpenAI({
      role: 'assistant',
      content: 'yo',
    });
    expect(a).toEqual({ role: 'assistant', content: 'yo' });
  });

  it('appends thinking and image placeholder when enabled', () => {
    const out = normalizeOllamaMessageToOpenAI(
      {
        role: 'user',
        content: 'see',
        thinking: 'think',
        images: ['abc', 'def'],
      },
      { appendThinkingToContent: true, appendImagesPlaceholder: true },
    );
    expect(out.content).toContain('[thinking]');
    expect(out.content).toContain('think');
    expect(out.content).toContain('[images: 2 attached]');
  });

  it('passes tool_calls on assistant', () => {
    const tc = [{ function: { name: 'fn', arguments: { x: 1 } } }];
    const out = normalizeOllamaMessageToOpenAI({
      role: 'assistant',
      content: 'call',
      tool_calls: tc,
    });
    expect(out.role).toBe('assistant');
    expect((out as { tool_calls?: unknown }).tool_calls).toEqual(tc);
  });

  it('maps tool role with tool_name prefix', () => {
    const out = normalizeOllamaMessageToOpenAI({
      role: 'tool',
      content: 'result',
      tool_name: 'get_weather',
    });
    expect(out.role).toBe('tool');
    expect(out.content).toContain('get_weather');
    expect(out.content).toContain('result');
  });
});

describe('mapOllamaMessagesToMessageBubbleData', () => {
  const baseTime = 1_700_000_000_000;

  it('uses ollama-msg id prefix by default', () => {
    const out = mapOllamaMessagesToMessageBubbleData(
      [{ role: 'user', content: 'x' }],
      { baseTime },
    );
    expect(out[0].id).toBe('ollama-msg-0');
  });

  it('respects message id when set', () => {
    const out = mapOllamaMessagesToMessageBubbleData(
      [{ role: 'user', content: 'x', id: 'm1' }],
      { baseTime },
    );
    expect(out[0].id).toBe('m1');
  });

  it('preserves ollama raw in extra by default', () => {
    const row: OllamaChatMessage = { role: 'assistant', content: 'a' };
    const out = mapOllamaMessagesToMessageBubbleData([row], { baseTime });
    expect(out[0].extra?.ollama?.raw).toEqual(row);
  });

  it('matches openai path after normalize when skipping extras', () => {
    const ollama: OllamaChatMessage[] = [{ role: 'user', content: 'u' }];
    const openai = normalizeOllamaMessagesToOpenAI(ollama);
    const a = mapOllamaMessagesToMessageBubbleData(ollama, {
      baseTime,
      preserveOllamaRawInExtra: false,
    });
    const b = mapOpenAIMessagesToMessageBubbleData(openai, {
      baseTime,
      getMessageId: (_, i) => ollama[i]?.id ?? `ollama-msg-${i}`,
      preserveRawInExtra: true,
    });
    expect(a[0].originContent).toBe(b[0].originContent);
  });

  it('keeps id stable when assistant content grows (stream)', () => {
    const short: OllamaChatMessage[] = [{ role: 'assistant', content: 'a' }];
    const long: OllamaChatMessage[] = [{ role: 'assistant', content: 'a'.repeat(50) }];
    const o1 = mapOllamaMessagesToMessageBubbleData(short, { baseTime });
    const o2 = mapOllamaMessagesToMessageBubbleData(long, { baseTime });
    expect(o1[0].id).toBe(o2[0].id);
  });
});
