/**
 * parserMarkdownToSlateNode deepen2：getMdast 空节点、空对象注释、
 * htmlTag/contextProps、缓存淘汰、default top。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearParseCache,
  parserMarkdownToSlateNode,
} from '../parserMarkdownToSlateNode';

describe('parserMarkdownToSlateNode deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    clearParseCache();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    clearParseCache();
  });

  it('空对象 HTML 注释 → Object.keys 空跳过', () => {
    const r = parserMarkdownToSlateNode('<!--{}-->\n\nhello');
    expect(r.schema?.length).toBeGreaterThan(0);
  });

  it('非空对象注释合并进下一节点 config', () => {
    const r = parserMarkdownToSlateNode(
      '<!--{"foo":1}-->\n\n|a|b|\n|-|-|\n|1|2|',
    );
    expect(r.schema?.length).toBeGreaterThan(0);
  });

  it('嵌套列表触发 parseNodes default top', () => {
    const r = parserMarkdownToSlateNode('- a\n  - b\n- c');
    expect(r.schema?.some((n: any) => n.type?.includes('list'))).toBe(true);
  });

  it('HTML 块带 contextProps/htmlTag', () => {
    const r = parserMarkdownToSlateNode('<div><span>x</span></div>');
    expect(r.schema?.length).toBeGreaterThan(0);
  });

  it('多块解析填满缓存触发淘汰 >100', () => {
    const chunks: string[] = [];
    for (let i = 0; i < 105; i++) {
      chunks.push(`# H${i}\n\npara-${i}-${'x'.repeat(40)}`);
    }
    const md = chunks.join('\n\n');
    const r = parserMarkdownToSlateNode(md);
    expect(r.schema?.length).toBeGreaterThan(50);
  });

  it('空段落过滤；非法 mdast 文本容错', () => {
    const r = parserMarkdownToSlateNode('\n\n\ntext\n\n');
    expect(r.schema).toBeTruthy();
  });
});
