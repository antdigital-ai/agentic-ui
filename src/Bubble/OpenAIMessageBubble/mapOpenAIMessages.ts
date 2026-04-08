import type { MessageBubbleData } from '../../Types/message';
import type { RoleType } from '../../Types/common';
import type {
  OpenAIChatContentPart,
  OpenAIChatMessage,
  OpenAIChatMessageAssistant,
  OpenAIMessagesMapMessage,
  OpenAIMessagesMapOptions,
} from './types';

const DEFAULT_TOOL_ROLE: RoleType = 'assistant';

/** @internal exported for OpenClaw 归一化复用 */
export function extractTextFromContent(
  content: string | OpenAIChatContentPart[] | null | undefined,
): string {
  if (content === undefined || content === null) {
    return '';
  }
  if (typeof content === 'string') {
    return content;
  }
  const parts: string[] = [];
  for (const part of content) {
    if (part.type === 'text' && typeof (part as { text?: string }).text === 'string') {
      parts.push((part as { text: string }).text);
      continue;
    }
    if ('refusal' in part && typeof (part as { refusal?: string }).refusal === 'string') {
      parts.push((part as { refusal: string }).refusal);
      continue;
    }
    if (part.type === 'image_url') {
      parts.push('[image]');
      continue;
    }
    parts.push(`[${part.type}]`);
  }
  return parts.join('\n');
}

function mapOpenAIRoleToRoleType(
  msg: OpenAIChatMessage,
  toolRoleAs: RoleType,
): RoleType {
  switch (msg.role) {
    case 'user':
      return 'user';
    case 'system':
      return 'system';
    case 'assistant':
      return 'assistant';
    case 'tool':
    case 'function':
      return toolRoleAs;
    default:
      return 'assistant';
  }
}

function appendAssistantExtras(
  msg: OpenAIChatMessageAssistant,
  base: string,
  appendToolCalls: boolean,
): string {
  if (!appendToolCalls) {
    return base;
  }
  let out = base;
  if (msg.tool_calls?.length) {
    out += `\n\n[tool_calls]\n${JSON.stringify(msg.tool_calls, null, 2)}`;
  }
  if (msg.function_call) {
    out += `\n\n[function_call]\n${JSON.stringify(msg.function_call, null, 2)}`;
  }
  return out;
}

function defaultGetMessageId(msg: OpenAIChatMessage, index: number): string {
  return msg.id ?? `openai-msg-${index}`;
}

/**
 * 将 OpenAI Chat Completions 风格的 messages 转为 MessageBubbleData[]
 */
export function mapOpenAIMessagesToMessageBubbleData(
  messages: OpenAIChatMessage[],
  options?: OpenAIMessagesMapOptions,
  mapMessage?: OpenAIMessagesMapMessage,
): MessageBubbleData[] {
  const {
    baseTime = Date.now(),
    timeStepMs = 1,
    bumpUpdateAtOnLastMessage = false,
    getMessageId = defaultGetMessageId,
    toolRoleAs = DEFAULT_TOOL_ROLE,
    appendToolCallsToContent = true,
    preserveRawInExtra = true,
  } = options ?? {};

  const lastIndex = messages.length - 1;

  return messages.map((msg, index) => {
    const id = getMessageId(msg, index);
    const role = mapOpenAIRoleToRoleType(msg, toolRoleAs);
    const createAt = baseTime + index * timeStepMs;
    let updateAt = createAt;
    if (bumpUpdateAtOnLastMessage && index === lastIndex) {
      updateAt = Date.now();
    }

    let text = '';
    if (msg.role === 'assistant') {
      const a = msg as OpenAIChatMessageAssistant;
      text = extractTextFromContent(a.content);
      text = appendAssistantExtras(a, text, appendToolCallsToContent);
    } else if (msg.role === 'user' || msg.role === 'system') {
      text = extractTextFromContent(msg.content as string | OpenAIChatContentPart[] | null);
    } else if (msg.role === 'tool') {
      const prefix = msg.tool_call_id ? `[tool_call_id: ${msg.tool_call_id}]\n` : '';
      text = prefix + (msg.content ?? '');
    } else if (msg.role === 'function') {
      const prefix = msg.name ? `[function: ${msg.name}]\n` : '';
      text = prefix + (msg.content ?? '');
    }

    const originContent = text;
    const extra: MessageBubbleData['extra'] & {
      openai?: { role: string; raw?: OpenAIChatMessage };
    } = preserveRawInExtra
      ? {
          openai: {
            role: msg.role,
            raw: msg,
          },
        }
      : {};

    let draft: MessageBubbleData = {
      id,
      role,
      content: text,
      originContent,
      createAt,
      updateAt,
      ...(Object.keys(extra).length ? { extra } : {}),
    };

    if (mapMessage) {
      draft = mapMessage(msg, index, draft);
    }

    return draft;
  });
}
