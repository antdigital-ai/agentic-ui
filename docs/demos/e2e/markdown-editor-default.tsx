import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

/**
 * E2E MarkdownEditor 默认配置：验证不传 `matchInputToNode` 时
 * 正文段落（非首段）的 `# ` / `- ` 即时转换，且首段保持纯文本（#59）
 */
export default () => <MarkdownEditor width="100%" height="70vh" initValue="" />;
