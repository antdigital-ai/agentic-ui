import { describe, expect, it } from 'vitest';
import {
  normalizeOllamaMessageToOpenAI,
  normalizeOllamaMessagesToOpenAI,
} from '../normalizeOllamaMessages';
import type { OllamaChatMessage } from '../ollamaTypes';

describe('normalizeOllamaMessages 分支覆盖', () => {
  it('assistant：thinking / images / tool_calls', () => {
    const msg: OllamaChatMessage = {
      role: 'assistant',
      content: 'ans',
      thinking: 'plan',
      images: ['a', 'b'],
      tool_calls: [{ id: 't1' } as any],
    };
    const out = normalizeOllamaMessageToOpenAI(msg);
    expect(out.role).toBe('assistant');
    expect(out.content).toContain('[thinking]');
    expect(out.content).toContain('[images: 2 attached]');
    expect((out as any).tool_calls).toHaveLength(1);

    const muted = normalizeOllamaMessageToOpenAI(msg, {
      appendThinkingToContent: false,
      appendImagesPlaceholder: false,
    });
    expect(muted.content).toBe('ans');
  });

  it('assistant 空 content 时 thinking 不加双换行', () => {
    const out = normalizeOllamaMessageToOpenAI({
      role: 'assistant',
      content: '',
      thinking: 'only',
    });
    expect(out.content).toBe('[thinking]\nonly');
  });

  it('tool：tool_name / tool_call_id 可选', () => {
    const withMeta = normalizeOllamaMessageToOpenAI({
      role: 'tool',
      content: 'result',
      tool_name: 'search',
      tool_call_id: 'c1',
    });
    expect(withMeta.role).toBe('tool');
    expect(withMeta.content).toContain('[tool_name: search]');
    expect((withMeta as any).tool_call_id).toBe('c1');
    expect((withMeta as any).name).toBe('search');

    const bare = normalizeOllamaMessageToOpenAI({
      role: 'tool',
      content: 'result',
    });
    expect(bare.content).toBe('result');
  });

  it('system / user / 批量', () => {
    expect(
      normalizeOllamaMessageToOpenAI({ role: 'system', content: 's' }).role,
    ).toBe('system');
    expect(
      normalizeOllamaMessageToOpenAI({ role: 'user', content: 'u', id: '1' }),
    ).toMatchObject({ role: 'user', id: '1', content: 'u' });
    expect(
      normalizeOllamaMessagesToOpenAI([
        { role: 'user', content: 'a' },
        { role: 'assistant', content: 'b' },
      ]),
    ).toHaveLength(2);
  });

  it('content 缺省视为空串；仅 images 时前缀不加双换行', () => {
    const out = normalizeOllamaMessageToOpenAI({
      role: 'user',
      images: ['x'],
    } as OllamaChatMessage);
    expect(out.content).toBe('[images: 1 attached]');
  });
});
