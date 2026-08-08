/**
 * Midtail batch D：Bubble maps / Schema bridge / MarkdownFormatter。
 */
import { describe, expect, it, vi } from 'vitest';
import { mapOllamaMessagesToMessageBubbleData } from '../Bubble/OpenAIMessageBubble/mapOllamaMessages';
import { mapOpenClawMessagesToMessageBubbleData } from '../Bubble/OpenAIMessageBubble/mapOpenClawMessages';
import { SchemaEditorBridgeManager } from '../Bubble/schema-editor/SchemaEditorBridgeManager';
import { MarkdownFormatter } from '../Plugins/formatter';

describe('midtail batch D branches', () => {
  it('mapOllama / mapOpenClaw 空与基础消息', () => {
    expect(mapOllamaMessagesToMessageBubbleData([])).toEqual([]);
    expect(
      mapOllamaMessagesToMessageBubbleData([
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'yo' },
      ] as any).length,
    ).toBeGreaterThanOrEqual(1);

    expect(mapOpenClawMessagesToMessageBubbleData([])).toEqual([]);
    expect(
      mapOpenClawMessagesToMessageBubbleData([
        { role: 'user', content: 'q' },
        {
          role: 'toolResult',
          id: '1',
          name: 't',
          tool_call_id: 'c',
          content: 'r',
        },
      ] as any).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('SchemaEditorBridgeManager：启用后 register / unregister', () => {
    const mgr = SchemaEditorBridgeManager.getInstance();
    mgr.setEnabled(false);
    const handler = {
      getContent: () => 'x',
      setContent: vi.fn(),
    };
    mgr.register('midtail-k1', handler);
    mgr.unregister('midtail-k1');
    mgr.setEnabled(true);
    mgr.register('midtail-k2', handler);
    mgr.unregister('midtail-k2');
    mgr.setEnabled(false);
  });

  it('MarkdownFormatter：空串 / 中英混排 / 表格行', () => {
    expect(MarkdownFormatter.format('')).toBe('');
    const mixed = MarkdownFormatter.format('中文English混排');
    expect(mixed).toContain('English');
    const table = MarkdownFormatter.format('| a | b |\n| - | - |\n| 1 | 2 |');
    expect(table).toContain('|');
  });
});
