import { extractTextFromContent } from './mapOpenAIMessages';
import type { OpenAIChatMessage } from './types';
import type { OpenClawChatMessage, OpenClawChatMessageToolResult } from './openClawTypes';

/**
 * 将单条 OpenClaw 风格消息转为可与 {@link mapOpenAIMessagesToMessageBubbleData} 兼容的 OpenAI 形状（`toolResult` → `tool`）。
 */
export function normalizeOpenClawMessageToOpenAI(
  msg: OpenClawChatMessage,
): OpenAIChatMessage {
  if (msg.role === 'toolResult') {
    const m = msg as OpenClawChatMessageToolResult;
    const content =
      m.content === undefined || m.content === null
        ? ''
        : typeof m.content === 'string'
          ? m.content
          : extractTextFromContent(m.content);
    return {
      role: 'tool',
      id: m.id,
      name: m.name,
      content,
      tool_call_id: m.tool_call_id,
    };
  }

  const { timestamp: _ts, ...rest } = msg as OpenAIChatMessage & {
    timestamp?: number;
  };
  return rest as OpenAIChatMessage;
}

/**
 * 批量将 OpenClaw transcript 消息转为 OpenAI Chat Completions 兼容结构
 */
export function normalizeOpenClawMessagesToOpenAI(
  messages: OpenClawChatMessage[],
): OpenAIChatMessage[] {
  return messages.map(normalizeOpenClawMessageToOpenAI);
}
