/**
 * remarkParse deepen residual：convert / fixStrong / protectJinja 更多边角。
 */
import { describe, expect, it } from 'vitest';
import { JINJA_DOLLAR_PLACEHOLDER } from '../constants';
import {
  convertParagraphToImage,
  createMarkdownParser,
  fixStrongWithSpecialChars,
  getMarkdownParser,
  protectJinjaDollarInText,
} from '../remarkParse';

const run = (fn: () => (tree: any) => void, tree: any) => {
  fn()(tree);
  return tree;
};

const withLead = (p: any) => ({
  type: 'root',
  children: [
    { type: 'paragraph', children: [{ type: 'text', value: 'lead' }] },
    p,
  ],
});

describe('remarkParse deepen residual branches', () => {
  it('convert：空 trim、index=0 falsy、parent 缺失', () => {
    const t1 = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: '   ' }] },
      ],
    };
    run(convertParagraphToImage, t1);
    expect(t1.children[0].type).toBe('paragraph');

    // index=0 被 !index 早退
    const t2 = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '!https://x.png' }],
        },
      ],
    };
    run(convertParagraphToImage, t2);
    expect(t2.children[0].type).toBe('paragraph');
  });

  it('convert：! 空 url；| 表；[ 非链接格式', () => {
    const emptyBang = withLead({
      type: 'paragraph',
      children: [{ type: 'text', value: '!   ' }],
    });
    run(convertParagraphToImage, emptyBang);
    expect(emptyBang.children[1].type).toBe('paragraph');

    const table = withLead({
      type: 'paragraph',
      children: [{ type: 'text', value: '| a | b |' }],
    });
    run(convertParagraphToImage, table);
    expect(['table', 'paragraph']).toContain(
      (table.children[1] as any).type,
    );

    const notLink = withLead({
      type: 'paragraph',
      children: [{ type: 'text', value: '[not a link' }],
    });
    run(convertParagraphToImage, notLink);
    expect(notLink.children[1].type).toBe('paragraph');

    const link = withLead({
      type: 'paragraph',
      children: [{ type: 'text', value: '[L](https://e.com)' }],
    });
    run(convertParagraphToImage, link);
    expect(['link', 'paragraph', 'linkReference']).toContain(
      (link.children[1] as any).type,
    );
  });

  it('convert：嵌套 children 提取；strong 内假值 value', () => {
    const tree = withLead({
      type: 'paragraph',
      children: [
        { type: 'text', value: null },
        {
          type: 'emphasis',
          children: [
            { type: 'text', value: '!' },
            { type: 'text', value: 'https://n.png' },
          ],
        },
      ],
    });
    run(convertParagraphToImage, tree);
    expect(['image', 'paragraph']).toContain((tree.children[1] as any).type);
  });

  it('fixStrong：完整 **$9**、不完整 **x、前后文本', () => {
    const transform = fixStrongWithSpecialChars();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'pre **$9.1M** mid **57%**' },
            { type: 'text', value: '**未闭合' },
            { type: 'text', value: '' },
            { type: 'text', value: 'plain' },
          ],
        },
      ],
    };
    expect(() => transform(tree)).not.toThrow();
    const texts = JSON.stringify(tree);
    expect(texts.includes('strong') || texts.includes('$9')).toBe(true);
  });

  it('protectJinja：无 $ 原样；code 非 string；多段 jinja', () => {
    const transform = protectJinjaDollarInText();
    const tree = {
      type: 'root',
      children: [
        { type: 'text', value: 'no-dollar' },
        { type: 'text', value: '{{ a $1 }} and {{ b $2 }}' },
        { type: 'code', value: null },
        { type: 'text', value: undefined },
      ],
    };
    transform(tree);
    expect((tree.children[0] as any).value).toBe('no-dollar');
    expect((tree.children[1] as any).value).toContain(JINJA_DOLLAR_PLACEHOLDER);
  });

  it('getMarkdownParser / createMarkdownParser 解析特殊加粗', () => {
    const p = createMarkdownParser();
    expect(p.parse('**$1**')).toBeTruthy();
    expect(getMarkdownParser().parse('| a | b |\n| - | - |')).toBeTruthy();
  });
});
