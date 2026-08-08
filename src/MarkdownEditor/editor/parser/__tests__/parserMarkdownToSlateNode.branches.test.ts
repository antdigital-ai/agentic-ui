import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearParseCache,
  MarkdownToSlateParser,
  parserMarkdownToSlateNode,
  simpleHash,
} from '../parserMarkdownToSlateNode';

describe('parserMarkdownToSlateNode.branches', () => {
  beforeEach(() => {
    clearParseCache();
  });

  it('simpleHash 稳定；空串与非空', () => {
    expect(simpleHash('')).toBe(simpleHash(''));
    expect(simpleHash('abc')).not.toBe(simpleHash('abd'));
  });

  it('空 md / 仅空白；缓存命中二次解析', () => {
    expect(parserMarkdownToSlateNode('').schema).toEqual(
      expect.any(Array),
    );
    expect(parserMarkdownToSlateNode('   \n\n  ').schema).toEqual(
      expect.any(Array),
    );
    const once = parserMarkdownToSlateNode('# Title\n\npara');
    const twice = parserMarkdownToSlateNode('# Title\n\npara');
    expect(once.schema).toEqual(twice.schema);
  });

  it('代码围栏 / HTML / 脚注 / 列表混合块分割', () => {
    const md = [
      '# H',
      '',
      '```js',
      'const a = 1',
      '```',
      '',
      '<div>html</div>',
      '',
      'para[^1]',
      '',
      '[^1]: note',
      '',
      '- a',
      '  - b',
      '',
      '1. ordered',
    ].join('\n');
    const { schema } = parserMarkdownToSlateNode(md);
    expect(schema.length).toBeGreaterThan(0);
  });

  it('think 标签与非标准 html；公式配置', () => {
    const { schema: thinkSchema } = parserMarkdownToSlateNode(
      '<think>reasoning</think>\n\nresult',
    );
    expect(thinkSchema.length).toBeGreaterThan(0);

    const { schema: mathSchema } = parserMarkdownToSlateNode(
      '$$a^2+b^2$$\n\nok',
      undefined,
      { formula: { singleDollarTextMath: false } },
    );
    expect(mathSchema.length).toBeGreaterThan(0);
  });

  it('MarkdownToSlateParser：默认 config；plugins 空数组', () => {
    const parser = new MarkdownToSlateParser();
    expect(parser.parse('hi').schema.length).toBeGreaterThan(0);
    expect(
      new MarkdownToSlateParser({}, []).parse('- item').schema.length,
    ).toBeGreaterThan(0);
  });

  it('istanbul residual：链接定义 / 主题分隔 / 表格 / 引用', () => {
    const md = [
      '[ref]: https://ex.com "title"',
      '',
      '***',
      '',
      '| a | b |',
      '| - | - |',
      '| 1 | 2 |',
      '',
      '> quote',
      '>',
      '> more',
    ].join('\n');
    const { schema } = parserMarkdownToSlateNode(md);
    expect(schema.length).toBeGreaterThan(0);
  });

  it('istanbul residual：yaml frontmatter code；inline code；image', () => {
    const md = [
      '```yaml',
      'title: t',
      '```',
      '',
      'use `code` and ![alt](https://ex.com/i.png)',
    ].join('\n');
    const { schema } = parserMarkdownToSlateNode(md);
    expect(schema.length).toBeGreaterThan(0);
  });
});
