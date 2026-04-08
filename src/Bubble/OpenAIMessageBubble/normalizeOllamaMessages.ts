import type { OpenAIChatMessage } from './types';
import type { OllamaChatMessage } from './ollamaTypes';

function buildDisplayContent(
  msg: OllamaChatMessage,
  appendThinking: boolean,
  appendImagesPlaceholder: boolean,
): string {
  let text = msg.content ?? '';
  if (appendThinking && msg.thinking) {
    text += `${text ? '\n\n' : ''}[thinking]\n${msg.thinking}`;
  }
  if (appendImagesPlaceholder && msg.images && msg.images.length > 0) {
    text += `${text ? '\n\n' : ''}[images: ${msg.images.length} attached]`;
  }
  return text;
}

/**
 * 将单条 Ollama `ChatMessage` 转为 {@link OpenAIChatMessage}，供统一映射层使用。
 */
export function normalizeOllamaMessageToOpenAI(
  msg: OllamaChatMessage,
  options?: {
    appendThinkingToContent?: boolean;
    appendImagesPlaceholder?: boolean;
  },
): OpenAIChatMessage {
  const appendThinking = options?.appendThinkingToContent !== false;
  const appendImages = options?.appendImagesPlaceholder !== false;

  const content = buildDisplayContent(msg, appendThinking, appendImages);

  const base = { id: msg.id };

  if (msg.role === 'assistant') {
    return {
      ...base,
      role: 'assistant',
      content,
      ...(msg.tool_calls?.length ? { tool_calls: msg.tool_calls as unknown[] } : {}),
    };
  }

  if (msg.role === 'tool') {
    const prefix = msg.tool_name ? `[tool_name: ${msg.tool_name}]\n` : '';
    return {
      ...base,
      role: 'tool',
      content: prefix + content,
      ...(msg.tool_call_id ? { tool_call_id: msg.tool_call_id } : {}),
      ...(msg.tool_name ? { name: msg.tool_name } : {}),
    };
  }

  if (msg.role === 'system') {
    return { ...base, role: 'system', content };
  }

  return { ...base, role: 'user', content };
}

/**
 * 批量将 Ollama `messages` 转为 OpenAI 形状
 */
export function normalizeOllamaMessagesToOpenAI(
  messages: OllamaChatMessage[],
  options?: {
    appendThinkingToContent?: boolean;
    appendImagesPlaceholder?: boolean;
  },
): OpenAIChatMessage[] {
  return messages.map((m) => normalizeOllamaMessageToOpenAI(m, options));
}
