import { useMemo } from 'react';

import type { MessageBubbleData } from '../../Types/message';
import { mapOpenAIMessagesToMessageBubbleData } from './mapOpenAIMessages';
import type {
  OpenAIChatMessage,
  OpenAIMessagesMapMessage,
  OpenAIMessagesMapOptions,
} from './types';

/**
 * 将 OpenAI Chat Completions 风格的 messages 转为 MessageBubbleData[]（与 {@link mapOpenAIMessagesToMessageBubbleData} 一致，带 memo）。
 */
export function useOpenAIMessageBubbleData(
  messages: OpenAIChatMessage[],
  mapOptions?: OpenAIMessagesMapOptions,
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
  } = mapOptions ?? {};

  return useMemo(
    () =>
      mapOpenAIMessagesToMessageBubbleData(messages, mapOptions, mapMessage),
    [
      messages,
      baseTime,
      timeStepMs,
      bumpUpdateAtOnLastMessage,
      getMessageId,
      toolRoleAs,
      appendToolCallsToContent,
      preserveRawInExtra,
      mapMessage,
    ],
  );
}
