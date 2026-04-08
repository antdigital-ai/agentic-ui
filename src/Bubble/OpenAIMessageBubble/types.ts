import type { MessageBubbleData } from '../../Types/message';
import type { RoleType } from '../../Types/common';

/**
 * OpenAI Chat Completions 风格的多段 content（与官方结构兼容，库内自建）
 */
export interface OpenAIChatTextPart {
  type: 'text';
  text: string;
}

export interface OpenAIChatRefusalPart {
  type?: 'refusal';
  refusal?: string;
}

/** 多模态等其它 part 以弱类型保留 */
export interface OpenAIChatContentPartFallback {
  type: string;
  [key: string]: unknown;
}

export type OpenAIChatContentPart =
  | OpenAIChatTextPart
  | OpenAIChatRefusalPart
  | OpenAIChatContentPartFallback;

export interface OpenAIChatMessageBase {
  id?: string;
  name?: string;
  tool_calls?: unknown[];
  function_call?: { name?: string; arguments?: string } | null;
}

export interface OpenAIChatMessageSystem extends OpenAIChatMessageBase {
  role: 'system';
  content: string | null;
}

export interface OpenAIChatMessageUser extends OpenAIChatMessageBase {
  role: 'user';
  content: string | OpenAIChatContentPart[] | null;
}

export interface OpenAIChatMessageAssistant extends OpenAIChatMessageBase {
  role: 'assistant';
  content: string | OpenAIChatContentPart[] | null;
  tool_calls?: unknown[];
  function_call?: OpenAIChatMessageBase['function_call'];
}

export interface OpenAIChatMessageTool extends OpenAIChatMessageBase {
  role: 'tool';
  content: string | null;
  tool_call_id?: string;
}

export interface OpenAIChatMessageFunction extends OpenAIChatMessageBase {
  role: 'function';
  content: string | null;
  name?: string;
}

export type OpenAIChatMessage =
  | OpenAIChatMessageSystem
  | OpenAIChatMessageUser
  | OpenAIChatMessageAssistant
  | OpenAIChatMessageTool
  | OpenAIChatMessageFunction;

/** 单条映射覆盖 */
export type OpenAIMessagesMapMessage = (
  msg: OpenAIChatMessage,
  index: number,
  draft: MessageBubbleData,
) => MessageBubbleData;

export interface OpenAIMessagesMapOptions {
  /** createAt / updateAt 基准（毫秒） */
  baseTime?: number;
  /** 第 i 条：createAt = baseTime + i * timeStepMs */
  timeStepMs?: number;
  /** 为 true 时最后一条的 updateAt 使用 Date.now()（流式可选） */
  bumpUpdateAtOnLastMessage?: boolean;
  /** 生成 MessageBubbleData.id，默认不用 content，避免 SSE 抖动 */
  getMessageId?: (msg: OpenAIChatMessage, index: number) => string;
  /** tool / function 行映射到的 RoleType */
  toolRoleAs?: RoleType;
  /** assistant 是否将 tool_calls 等拼入展示文案 */
  appendToolCallsToContent?: boolean;
  /** 在 extra.openai 中保留原始 role 与 raw */
  preserveRawInExtra?: boolean;
}
