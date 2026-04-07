# OpenAI → BubbleList 适配任务

- [x] OpenAI 对齐类型 + `mapOpenAIMessagesToMessageBubbleData` + 单测（含 SSE 稳定 id）
- [x] `useOpenAIMessageBubbleData` Hook
- [x] Bubble / 包入口导出 + 文档 demo + 中英文 changelog
- [x] OpenClaw 风格（`timestamp`、`toolResult`）+ `useOpenClawMessageBubbleData` / `mapOpenClawMessagesToMessageBubbleData` / `normalizeOpenClawMessagesToOpenAI`
- [x] Ollama `/api/chat`（`images`、`tool_calls`、`thinking`）+ `useOllamaMessageBubbleData` / `mapOllamaMessagesToMessageBubbleData` / `normalizeOllamaMessagesToOpenAI`
