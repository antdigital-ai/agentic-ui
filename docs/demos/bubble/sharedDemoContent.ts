/**
 * 与「消息前后插槽」类演示配套的助手正文：说明 API 分工并给出可粘贴示例，
 * 同时覆盖标题、强调、列表与代码块等常见 Markdown。
 */
export const bubbleDemoMarkdownSample = `## 插槽与正文的关系

**正文**仍由 \`originData.content\` 驱动；前后条带分别对应：

| 场景 | 推荐 API |
| --- | --- |
| 模型名、耗时、标签等元信息 | \`beforeMessageRender\` |
| 复制、反馈、免责声明等操作区 | \`afterMessageRender\` |

若只需包一层「内容区」而不是整条消息，再看 \`beforeContentRender\` / \`afterContentRender\`（与消息布局策略有关）。

示例（节选）：

\`\`\`tsx
<Bubble
  originData={message}
  bubbleRenderConfig={{
    beforeMessageRender: (p) => <MetaStrip data={p.originData} />,
    afterMessageRender: () => <Toolbar />,
  }}
/>
\`\`\`

1. 前后插槽里避免再放大块 Markdown，以免与正文视觉重复  
2. 需要与正文同宽的装饰，优先用内容级插槽或自定义 \`contentRender\`
`;
