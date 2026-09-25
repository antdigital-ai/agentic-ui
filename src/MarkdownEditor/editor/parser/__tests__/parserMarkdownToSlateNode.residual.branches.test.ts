/**
 * parserMarkdownToSlateNode 残留：空串、脚注、非法 html、列表嵌套。
 */
import { describe, expect, it } from 'vitest';
import { parserMarkdownToSlateNode } from '../parserMarkdownToSlateNode';

describe('parserMarkdownToSlateNode residual branches', () => {
  it('空 / 空白', () => {
    expect(parserMarkdownToSlateNode('')).toBeTruthy();
    expect(parserMarkdownToSlateNode('   \n')).toBeTruthy();
  });

  it('脚注定义与引用', () => {
    const md = `Text[^1]\n\n[^1]: note`;
    const r = parserMarkdownToSlateNode(md);
    expect(r).toBeTruthy();
  });

  it('未闭合 html / 纯文本', () => {
    expect(parserMarkdownToSlateNode('<div>unclosed')).toBeTruthy();
    expect(parserMarkdownToSlateNode('plain')).toBeTruthy();
  });

  it('嵌套任务列表', () => {
    const md = `- [ ] a\n  - [x] b\n1. c\n`;
    expect(parserMarkdownToSlateNode(md)).toBeTruthy();
  });

  it.skip('表格与代码块', () => {
    const md = `| a | b |\n| - | - |\n| 1 | 2 |\n\n\`\`\`js\nconst x=1\n\`\`\`\n`;
    expect(parserMarkdownToSlateNode(md)).toBeTruthy();
  });
});
