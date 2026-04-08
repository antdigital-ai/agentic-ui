import type { MessageBubbleData } from '../../Types/message';
import { mapOpenAIMessagesToMessageBubbleData } from './mapOpenAIMessages';
import { normalizeOpenClawMessagesToOpenAI } from './normalizeOpenClawMessages';
import type { OpenAIMessagesMapMessage } from './types';
import type {
  OpenClawChatMessage,
  OpenClawMessagesMapOptions,
} from './openClawTypes';

/**
 * 将 OpenClaw 会话 / transcript 风格的 `messages` 转为 `MessageBubbleData[]`
 *（内部先归一化为 OpenAI 形状再复用 {@link mapOpenAIMessagesToMessageBubbleData}）。
 */
export function mapOpenClawMessagesToMessageBubbleData(
  messages: OpenClawChatMessage[],
  options?: OpenClawMessagesMapOptions,
  mapMessage?: OpenAIMessagesMapMessage,
): MessageBubbleData[] {
  const openai = normalizeOpenClawMessagesToOpenAI(messages);
  const {
    useOpenClawTimestamps = true,
    preserveOpenClawRawInExtra = true,
    ...rest
  } = options ?? {};

  if (!useOpenClawTimestamps && !preserveOpenClawRawInExtra && !mapMessage) {
    return mapOpenAIMessagesToMessageBubbleData(openai, rest);
  }

  const innerMap: OpenAIMessagesMapMessage = (msg, index, draft) => {
    let d = draft;
    const rawClaw = messages[index];

    if (
      useOpenClawTimestamps &&
      rawClaw &&
      typeof rawClaw.timestamp === 'number' &&
      Number.isFinite(rawClaw.timestamp)
    ) {
      d = {
        ...d,
        createAt: rawClaw.timestamp,
        updateAt: rawClaw.timestamp,
      };
    }

    if (preserveOpenClawRawInExtra && rawClaw) {
      d = {
        ...d,
        extra: {
          ...d.extra,
          openclaw: { raw: rawClaw },
        },
      };
    }

    if (mapMessage) {
      d = mapMessage(msg, index, d);
    }

    return d;
  };

  return mapOpenAIMessagesToMessageBubbleData(openai, rest, innerMap);
}
