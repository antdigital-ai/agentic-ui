import type {
  OpenAIChatContentPart,
  OpenAIChatMessageAssistant,
  OpenAIChatMessageFunction,
  OpenAIChatMessageSystem,
  OpenAIChatMessageTool,
  OpenAIChatMessageUser,
  OpenAIMessagesMapOptions,
} from './types';

/**
 * OpenClaw 会话 / transcript 常见字段：毫秒时间戳
 */
export type OpenClawChatMeta = {
  id?: string;
  timestamp?: number;
  name?: string;
};

/** OpenClaw transcript 中工具结果常用 `toolResult`，与 OpenAI 的 `tool` 对应 */
export interface OpenClawChatMessageToolResult extends OpenClawChatMeta {
  role: 'toolResult';
  content: string | OpenAIChatContentPart[] | null;
  tool_call_id?: string;
}

export type OpenClawChatMessage =
  | (OpenAIChatMessageSystem & OpenClawChatMeta)
  | (OpenAIChatMessageUser & OpenClawChatMeta)
  | (OpenAIChatMessageAssistant & OpenClawChatMeta)
  | (OpenAIChatMessageTool & OpenClawChatMeta)
  | (OpenAIChatMessageFunction & OpenClawChatMeta)
  | OpenClawChatMessageToolResult;

/** OpenClaw 映射选项（在 OpenAI 选项基础上增加 transcript 行为） */
export interface OpenClawMessagesMapOptions extends OpenAIMessagesMapOptions {
  /**
   * 为 true（默认）时，若消息含 `timestamp`（毫秒），写入 `createAt` / `updateAt`
   */
  useOpenClawTimestamps?: boolean;
  /**
   * 为 true（默认）时，在 `extra.openclaw.raw` 保留原始 OpenClaw 消息
   */
  preserveOpenClawRawInExtra?: boolean;
}
