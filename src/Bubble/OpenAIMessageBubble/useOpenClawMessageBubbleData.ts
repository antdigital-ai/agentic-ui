import { useMemo } from 'react';

import type { MessageBubbleData } from '../../Types/message';
import { mapOpenClawMessagesToMessageBubbleData } from './mapOpenClawMessages';
import type { OpenAIMessagesMapMessage } from './types';
import type {
  OpenClawChatMessage,
  OpenClawMessagesMapOptions,
} from './openClawTypes';

/**
 * 将 OpenClaw 会话 / transcript 风格的 messages 转为 MessageBubbleData[]（与 {@link mapOpenClawMessagesToMessageBubbleData} 一致，带 memo）。
 */
export function useOpenClawMessageBubbleData(
  messages: OpenClawChatMessage[],
  mapOptions?: OpenClawMessagesMapOptions,
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
    useOpenClawTimestamps,
    preserveOpenClawRawInExtra,
  } = mapOptions ?? {};

  return useMemo(
    () =>
      mapOpenClawMessagesToMessageBubbleData(messages, mapOptions, mapMessage),
    [
      messages,
      baseTime,
      timeStepMs,
      bumpUpdateAtOnLastMessage,
      getMessageId,
      toolRoleAs,
      appendToolCallsToContent,
      preserveRawInExtra,
      useOpenClawTimestamps,
      preserveOpenClawRawInExtra,
      mapMessage,
    ],
  );
}
