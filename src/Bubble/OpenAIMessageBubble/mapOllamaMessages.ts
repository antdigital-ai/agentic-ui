import type { MessageBubbleData } from '../../Types/message';
import { mapOpenAIMessagesToMessageBubbleData } from './mapOpenAIMessages';
import { normalizeOllamaMessagesToOpenAI } from './normalizeOllamaMessages';
import type { OpenAIChatMessage, OpenAIMessagesMapMessage } from './types';
import type { OllamaChatMessage, OllamaMessagesMapOptions } from './ollamaTypes';

function defaultOllamaGetMessageId(
  msg: OpenAIChatMessage,
  index: number,
  originals: OllamaChatMessage[],
): string {
  return originals[index]?.id ?? msg.id ?? `ollama-msg-${index}`;
}

/**
 * 将 Ollama `/api/chat` 的 `messages` 转为 `MessageBubbleData[]`
 */
export function mapOllamaMessagesToMessageBubbleData(
  messages: OllamaChatMessage[],
  options?: OllamaMessagesMapOptions,
  mapMessage?: OpenAIMessagesMapMessage,
): MessageBubbleData[] {
  const {
    appendThinkingToContent = true,
    appendImagesPlaceholder = true,
    preserveOllamaRawInExtra = true,
    getMessageId: userGetMessageId,
    ...rest
  } = options ?? {};

  const openai = normalizeOllamaMessagesToOpenAI(messages, {
    appendThinkingToContent,
    appendImagesPlaceholder,
  });

  const getMessageId =
    userGetMessageId ??
    ((msg, index) => defaultOllamaGetMessageId(msg, index, messages));

  if (!preserveOllamaRawInExtra && !mapMessage) {
    return mapOpenAIMessagesToMessageBubbleData(openai, {
      ...rest,
      getMessageId,
    });
  }

  const innerMap: OpenAIMessagesMapMessage = (msg, index, draft) => {
    let d = draft;
    if (preserveOllamaRawInExtra && messages[index]) {
      d = {
        ...d,
        extra: {
          ...d.extra,
          ollama: { raw: messages[index] },
        },
      };
    }
    if (mapMessage) {
      d = mapMessage(msg, index, d);
    }
    return d;
  };

  return mapOpenAIMessagesToMessageBubbleData(
    openai,
    { ...rest, getMessageId },
    innerMap,
  );
}
