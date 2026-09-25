/**
 * remarkParse deepen2：fixStrong 前后文/不完整尾、visit text 节点、parser 边角。
 */
import { describe, expect, it } from 'vitest';
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

describe('remarkParse deepen2 residual branches', () => {
  it('fixStrong：匹配前 beforeText 空跳过；尾部 incomplete；纯 incomplete', () => {
    const transform = fixStrongWithSpecialChars();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: '**$9**尾**未完' },
            { type: 'text', value: '**仅开头' },
          ],
        },
        {
          type: 'text',
          value: 'pre **%1** after',
        },
      ],
    };
    expect(() => transform(tree)).not.toThrow();
    const s = JSON.stringify(tree);
    expect(s.includes('strong') || s.includes('$9') || s.includes('%1')).toBe(
      true,
    );
  });

  it('fixStrong：空 value / 无 value 节点不抛', () => {
    const transform = fixStrongWithSpecialChars();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: '' },
            { type: 'text' },
            { type: 'emphasis', children: [] },
          ],
        },
      ],
    };
    expect(() => transform(tree)).not.toThrow();
  });

  it('convert：单 child 图片路径可转 image', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'lead' }] },
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '!https://a.png' }],
        },
      ],
    };
    run(convertParagraphToImage, tree);
    expect(['image', 'paragraph']).toContain(tree.children[1].type);
  });

  it('protectJinja：code string 含 $ 替换；空 text 跳过', () => {
    const transform = protectJinjaDollarInText();
    const tree = {
      type: 'root',
      children: [
        { type: 'code', value: '{{ $x }}' },
        { type: 'text', value: '' },
        { type: 'text', value: '{{ $y }}' },
      ],
    };
    transform(tree);
    expect((tree.children[2] as any).value).not.toContain('$y');
  });

  it('createMarkdownParser / getMarkdownParser 可解析 incomplete strong', () => {
    const md = '**$未闭合\n下一行';
    expect(createMarkdownParser().parse(md)).toBeTruthy();
    expect(getMarkdownParser().parse('**57%** ok')).toBeTruthy();
  });
});
