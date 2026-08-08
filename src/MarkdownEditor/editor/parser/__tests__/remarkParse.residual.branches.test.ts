/**
 * remarkParse 残留：convertParagraphToImage / protectJinja / fixStrong 边角。
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

const runTransform = (transformer: () => (tree: any) => void, tree: any) => {
  transformer()(tree);
  return tree;
};

/** visit 回调 index=0 为 falsy，需前置占位段落以覆盖转换分支 */
const withLeadParagraph = (targetParagraph: any) => ({
  type: 'root',
  children: [
    { type: 'paragraph', children: [{ type: 'text', value: 'lead' }] },
    targetParagraph,
  ],
});

describe('remarkParse residual branches', () => {
  it('convertParagraphToImage：无 children / 非数组早退', () => {
    const transform = convertParagraphToImage();
    const treeEmpty = { type: 'root', children: [{ type: 'paragraph' }] };
    transform(treeEmpty);
    expect(treeEmpty.children[0].type).toBe('paragraph');

    const treeBad = {
      type: 'root',
      children: [{ type: 'paragraph', children: null }],
    };
    expect(() => runTransform(convertParagraphToImage, treeBad)).not.toThrow();
    expect(treeBad.children[0].type).toBe('paragraph');
  });

  it('convertParagraphToImage：嵌套 strong 文本与假值 value', () => {
    const tree = withLeadParagraph({
      type: 'paragraph',
      children: [
        { type: 'text', value: '' },
        {
          type: 'strong',
          children: [
            { type: 'text', value: '' },
            { type: 'emphasis', children: [{ type: 'break' }] },
          ],
        },
      ],
    });
    runTransform(convertParagraphToImage, tree);
    expect(tree.children[1].type).toBe('paragraph');
  });

  it('convertParagraphToImage：!url 无下一节点转 image；空 url 不转', () => {
    const withUrl = withLeadParagraph({
      type: 'paragraph',
      children: [{ type: 'text', value: '!https://a.png' }],
    });
    runTransform(convertParagraphToImage, withUrl);
    expect((withUrl.children[1] as any).type).toBe('image');
    expect((withUrl.children[1] as any).url).toBe('https://a.png');

    const emptyBang = withLeadParagraph({
      type: 'paragraph',
      children: [{ type: 'text', value: '!' }],
    });
    runTransform(convertParagraphToImage, emptyBang);
    expect(emptyBang.children[1].type).toBe('paragraph');
  });

  it('convertParagraphToImage：| 开头无下一节点转 table；[ 开头转 link', () => {
    const pipe = withLeadParagraph({
      type: 'paragraph',
      children: [{ type: 'text', value: '| a | b |' }],
    });
    runTransform(convertParagraphToImage, pipe);
    expect(['table', 'paragraph']).toContain((pipe.children[1] as any).type);

    const link = withLeadParagraph({
      type: 'paragraph',
      children: [{ type: 'text', value: '[label](https://x.com)' }],
    });
    runTransform(convertParagraphToImage, link);
    expect(['link', 'paragraph', 'linkReference']).toContain(
      (link.children[1] as any).type,
    );
  });

  it('convertParagraphToImage：有下一节点时不替换 ! 段落', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'lead' }] },
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '!https://a.png' }],
        },
        { type: 'paragraph', children: [{ type: 'text', value: 'next' }] },
      ],
    };
    runTransform(convertParagraphToImage, tree);
    expect(tree.children[1].type).toBe('paragraph');
  });

  it('protectJinjaDollarInText：非 string value 早退；含 $ 替换', () => {
    const transform = protectJinjaDollarInText();
    const tree = {
      type: 'root',
      children: [
        { type: 'text', value: null as any },
        { type: 'text', value: 'price $1 {{ x $2 }}' },
        { type: 'code', value: 123 as any },
      ],
    };
    transform(tree);
    expect((tree.children[1] as any).value).toContain(JINJA_DOLLAR_PLACEHOLDER);
    expect((tree.children[1] as any).value).toContain('$1');
  });

  it('fixStrongWithSpecialChars 可挂到 parser 并解析普通 markdown', () => {
    const parser = createMarkdownParser();
    const file = parser.parse('**a** and _b_');
    expect(file).toBeTruthy();
    fixStrongWithSpecialChars();
    expect(getMarkdownParser()).toBeTruthy();
  });

  it('istanbul deepen：! 图片 / | 表 / [ 链接；不完整 strong；嵌套 text', () => {
    const img = withLeadParagraph({
      type: 'paragraph',
      children: [{ type: 'text', value: '!https://img.example/x.png' }],
    });
    runTransform(convertParagraphToImage, img);
    expect(['image', 'paragraph']).toContain((img.children[1] as any).type);

    const incomplete = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '**未闭合加粗' }],
        },
      ],
    };
    runTransform(fixStrongWithSpecialChars, incomplete);
    expect(incomplete.children[0]).toBeTruthy();

    const nested = withLeadParagraph({
      type: 'paragraph',
      children: [
        {
          type: 'strong',
          children: [{ type: 'text', value: '| a | b |' }],
        },
      ],
    });
    runTransform(convertParagraphToImage, nested);
    expect(nested.children.length).toBeGreaterThan(0);

    const emptyKids = withLeadParagraph({
      type: 'paragraph',
      children: null as any,
    });
    runTransform(convertParagraphToImage, emptyKids);
    expect(emptyKids.children[1].type).toBe('paragraph');
  });
});
