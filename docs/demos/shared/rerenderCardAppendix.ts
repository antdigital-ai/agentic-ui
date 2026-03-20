/**
 * Rerender 演示末尾追加的卡片示例（```agentar-card）。
 * MarkdownRenderer 经 SchemaBlockRenderer 渲染，与 MarkdownEditor 只读态的 agentar-card 对齐。
 */
const AGENTAR_CARD_SAMPLE = {
  version: '1.0.0',
  name: 'Simple Card Component',
  description: '可自定义的卡片组件',
  author: 'Schema Team',
  createTime: '2024-03-30T10:00:00Z',
  updateTime: '2024-03-30T10:00:00Z',
  component: {
    properties: {
      title: {
        title: '标题',
        type: 'string',
        default: '卡片标题',
      },
      content: {
        title: '内容',
        type: 'string',
        format: 'textarea',
        default: '这是卡片的内容区域，可以输入任意文本。',
      },
      bgColor: {
        title: '背景颜色',
        type: 'string',
        default: '#f5f5f5',
        format: 'color',
      },
    },
    type: 'html',
    schema: `
        <div style="background-color: {{bgColor}}; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 400px;">
          <h2 style="margin-top: 0; color: #333;">{{title}}</h2>
          <div style="color: #666;">{{content}}</div>
        </div>
      `,
  },
};

export const RERENDER_CARD_APPENDIX = `
## 卡片渲染示例（agentar-card）

\`\`\`agentar-card
${JSON.stringify(AGENTAR_CARD_SAMPLE, null, 2)}
\`\`\`
`;
