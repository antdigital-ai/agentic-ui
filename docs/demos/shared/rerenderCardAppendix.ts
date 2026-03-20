/**
 * Rerender 演示末尾追加的卡片示例（```agentar-card）。
 * MarkdownRenderer 经 SchemaBlockRenderer 渲染，与 MarkdownEditor 只读态的 agentar-card 对齐。
 */
export const RERENDER_CARD_APPENDIX = `
## 卡片渲染示例（agentar-card）

\`\`\`agentar-card
{"type":"form","properties":{"title":{"type":"string","title":"标题","default":"演示卡片"}},"initialValues":{"title":"Rerender 流式演示"}}
\`\`\`
`;
