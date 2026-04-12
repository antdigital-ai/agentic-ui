import { describe, expect, it } from 'vitest';

import {
  extractTextFromContent,
  mapOpenAIMessagesToMessageBubbleData,
} from '../mapOpenAIMessages';
import type { OpenAIChatMessage } from '../types';

describe('mapOpenAIMessagesToMessageBubbleData', () => {
  const baseTime = 1_700_000_000_000;

  it('maps user and assistant string content', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello' },
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out).toHaveLength(2);
    expect(out[0].role).toBe('user');
    expect(out[0].originContent).toBe('Hi');
    expect(out[0].id).toBe('openai-msg-0');
    expect(out[0].createAt).toBe(baseTime);
    expect(out[1].role).toBe('assistant');
    expect(out[1].originContent).toBe('Hello');
    expect(out[1].createAt).toBe(baseTime + 1);
  });

  it('uses msg.id when present', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'user', id: 'u-1', content: 'x' },
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out[0].id).toBe('u-1');
  });

  it('keeps same id when content grows at same index (SSE)', () => {
    const short: OpenAIChatMessage[] = [
      { role: 'assistant', content: 'a' },
    ];
    const long: OpenAIChatMessage[] = [
      { role: 'assistant', content: 'a'.repeat(100) },
    ];
    const o1 = mapOpenAIMessagesToMessageBubbleData(short, { baseTime });
    const o2 = mapOpenAIMessagesToMessageBubbleData(long, { baseTime });
    expect(o1[0].id).toBe(o2[0].id);
    expect(o1[0].id).toBe('openai-msg-0');
  });

  it('extracts multipart user content', () => {
    const messages: OpenAIChatMessage[] = [
      {
        role: 'user',
        content: [{ type: 'text', text: 'A' }, { type: 'text', text: 'B' }],
      },
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out[0].originContent).toBe('A\nB');
  });

  it('maps tool role to assistant by default and preserves openai role in extra', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'tool', content: 'result', tool_call_id: 'call_1' },
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, {
      baseTime,
      preserveRawInExtra: true,
    });
    expect(out[0].role).toBe('assistant');
    expect(out[0].extra?.openai?.role).toBe('tool');
    expect(out[0].originContent).toContain('call_1');
    expect(out[0].originContent).toContain('result');
  });

  it('appends tool_calls for assistant when enabled', () => {
    const messages: OpenAIChatMessage[] = [
      {
        role: 'assistant',
        content: 'ok',
        tool_calls: [{ id: '1', type: 'function', function: { name: 'fn', arguments: '{}' } }],
      },
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, {
      baseTime,
      appendToolCallsToContent: true,
    });
    expect(out[0].originContent).toContain('[tool_calls]');
    expect(out[0].originContent).toContain('fn');
  });

  it('applies mapMessage override', () => {
    const messages: OpenAIChatMessage[] = [{ role: 'user', content: 'u' }];
    const out = mapOpenAIMessagesToMessageBubbleData(
      messages,
      { baseTime },
      (_msg, _index, draft) => ({
        ...draft,
        name: 'override',
      }),
    );
    expect(out[0].name).toBe('override');
  });

  it('sets bumpUpdateAtOnLastMessage on last item only', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
    ];
    const before = Date.now();
    const out = mapOpenAIMessagesToMessageBubbleData(messages, {
      baseTime,
      bumpUpdateAtOnLastMessage: true,
    });
    const after = Date.now();
    expect(out[0].updateAt).toBe(baseTime + 0);
    expect(out[1].updateAt).toBeGreaterThanOrEqual(before);
    expect(out[1].updateAt).toBeLessThanOrEqual(after);
  });

  // --- New tests covering remaining branches ---

  describe('extractTextFromContent', () => {
    it('returns empty string for null content', () => {
      expect(extractTextFromContent(null)).toBe('');
    });

    it('returns empty string for undefined content', () => {
      expect(extractTextFromContent(undefined)).toBe('');
    });

    it('extracts refusal text from content parts', () => {
      const parts = [{ type: 'other', refusal: 'I cannot help' } as any];
      expect(extractTextFromContent(parts)).toBe('I cannot help');
    });

    it('renders image_url parts as [image]', () => {
      const parts = [{ type: 'image_url', image_url: { url: 'http://x' } } as any];
      expect(extractTextFromContent(parts)).toBe('[image]');
    });

    it('falls back to [type] for unknown part types', () => {
      const parts = [{ type: 'audio' } as any];
      expect(extractTextFromContent(parts)).toBe('[audio]');
    });
  });

  it('maps system role correctly', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'system', content: 'You are a bot' },
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out[0].role).toBe('system');
    expect(out[0].originContent).toBe('You are a bot');
  });

  it('maps unknown role to assistant', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'developer' as any, content: 'hidden' },
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out[0].role).toBe('assistant');
  });

  it('skips tool_calls append when appendToolCallsToContent is false', () => {
    const messages: OpenAIChatMessage[] = [
      {
        role: 'assistant',
        content: 'ok',
        tool_calls: [{ id: '1', type: 'function', function: { name: 'fn', arguments: '{}' } }],
      },
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, {
      baseTime,
      appendToolCallsToContent: false,
    });
    expect(out[0].originContent).toBe('ok');
    expect(out[0].originContent).not.toContain('[tool_calls]');
  });

  it('appends function_call for assistant message', () => {
    const messages: OpenAIChatMessage[] = [
      {
        role: 'assistant',
        content: 'calling',
        function_call: { name: 'get_weather', arguments: '{"city":"SF"}' },
      } as any,
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out[0].originContent).toContain('[function_call]');
    expect(out[0].originContent).toContain('get_weather');
  });

  it('uses default options when options is undefined', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'user', content: 'hi' },
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages);
    expect(out).toHaveLength(1);
    expect(out[0].role).toBe('user');
    expect(out[0].extra?.openai).toBeDefined();
  });

  it('handles tool message without tool_call_id', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'tool', content: 'result' } as any,
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out[0].originContent).toBe('result');
    expect(out[0].originContent).not.toContain('tool_call_id');
  });

  it('handles tool message without content', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'tool', tool_call_id: 'call_2' } as any,
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out[0].originContent).toContain('call_2');
  });

  it('handles function role message with name and content', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'function', name: 'get_weather', content: '{"temp":72}' } as any,
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out[0].originContent).toContain('[function: get_weather]');
    expect(out[0].originContent).toContain('{"temp":72}');
  });

  it('handles function role message without name and without content', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'function' } as any,
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out[0].originContent).toBe('');
  });

  it('omits extra when preserveRawInExtra is false', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'user', content: 'hi' },
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, {
      baseTime,
      preserveRawInExtra: false,
    });
    expect(out[0].extra).toBeUndefined();
  });

  it('handles assistant with null content', () => {
    const messages: OpenAIChatMessage[] = [
      { role: 'assistant', content: null } as any,
    ];
    const out = mapOpenAIMessagesToMessageBubbleData(messages, { baseTime });
    expect(out[0].originContent).toBe('');
  });
});
