import type { OpenAIMessagesMapOptions } from './types';

/**
 * Ollama Chat API 中 ToolCall（见官方 OpenAPI `ToolCall`）
 */
export interface OllamaToolCall {
  function?: {
    name: string;
    description?: string;
    arguments?: Record<string, unknown>;
  };
  /** 部分实现会带 id */
  id?: string;
  type?: string;
}

/**
 * Ollama POST /api/chat 请求体中的单条 `messages[]`（见官方 `ChatMessage`）
 */
export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  /** 流式片段可能为空字符串 */
  content: string;
  /** 客户端为稳定列表 key 可带 id */
  id?: string;
  /** 多模态：base64 图片列表 */
  images?: string[];
  /** assistant 上模型发起的工具调用 */
  tool_calls?: OllamaToolCall[];
  /** `think` 开启时的思考过程（流式或完整响应） */
  thinking?: string;
  /** `role: tool` 时常用，与 OpenAI 的 tool 名称对应 */
  tool_name?: string;
  tool_call_id?: string;
}

/** Ollama 映射选项 */
export interface OllamaMessagesMapOptions extends OpenAIMessagesMapOptions {
  /**
   * 为 true（默认）时，将 `thinking` 拼入展示用正文（映射后的 OpenAI assistant 文本）
   */
  appendThinkingToContent?: boolean;
  /**
   * 为 true（默认）时，若有 `images`，在正文中追加占位说明（不嵌入 base64）
   */
  appendImagesPlaceholder?: boolean;
  /**
   * 为 true（默认）时，在 `extra.ollama.raw` 保留原始 Ollama 消息
   */
  preserveOllamaRawInExtra?: boolean;
}
