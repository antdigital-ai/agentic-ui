import { describe, expect, it } from 'vitest';
import type { CodeNode } from '../../../el';
import {
  getCodeBlockPlainText,
  getSlateElementPlainText,
} from '../codeBlockPlainText';

describe('getSlateElementPlainText / getCodeBlockPlainText', () => {
  it('mermaid 等非 code 类型仍应优先使用子节点文本', () => {
    const element = {
      type: 'mermaid' as const,
      language: 'mermaid',
      value: 'gr',
      children: [{ text: 'graph TD\n  A-->B' }],
    };

    expect(getSlateElementPlainText(element)).toBe('graph TD\n  A-->B');
  });

  it('应优先使用 Slate 子节点文本（value 滞后时仍返回正文）', () => {
    const element = {
      type: 'code' as const,
      language: 'markdown',
      value: '普',
      children: [{ text: '普通文本\n第二行' }],
    } satisfies CodeNode;

    expect(getCodeBlockPlainText(element)).toBe('普通文本\n第二行');
  });

  it('子节点为空时应回退到 value', () => {
    const element = {
      type: 'code' as const,
      language: 'javascript',
      value: 'const x = 1;',
      children: [{ text: '' }],
    } satisfies CodeNode;

    expect(getCodeBlockPlainText(element)).toBe('const x = 1;');
  });
});
