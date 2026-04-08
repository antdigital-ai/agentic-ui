import { useMemo } from 'react';

import type { MessageBubbleData } from '../../Types/message';
import { mapOllamaMessagesToMessageBubbleData } from './mapOllamaMessages';
import type { OpenAIMessagesMapMessage } from './types';
import type { OllamaChatMessage, OllamaMessagesMapOptions } from './ollamaTypes';

/**
 * 将 Ollama `/api/chat` 的 messages 转为 MessageBubbleData[]（与 {@link mapOllamaMessagesToMessageBubbleData} 一致，带 memo）。
 */
export function useOllamaMessageBubbleData(
  messages: OllamaChatMessage[],
  mapOptions?: OllamaMessagesMapOptions,
  mapMessage?: OpenAIMessagesMapMessage,
): MessageBubbleData[] {
  const {
    baseTime,
    timeStepMs,
    bumpUpdateAtOnLastMessage,
    getMessageId,
    toolRoleAs,
    appendToolCallsToContent,
    preserveRawInExtra,
    appendThinkingToContent,
    appendImagesPlaceholder,
    preserveOllamaRawInExtra,
  } = mapOptions ?? {};

  return useMemo(
    () => mapOllamaMessagesToMessageBubbleData(messages, mapOptions, mapMessage),
    [
      messages,
      baseTime,
      timeStepMs,
      bumpUpdateAtOnLastMessage,
      getMessageId,
      toolRoleAs,
      appendToolCallsToContent,
      preserveRawInExtra,
      appendThinkingToContent,
      appendImagesPlaceholder,
      preserveOllamaRawInExtra,
      mapMessage,
    ],
  );
}
