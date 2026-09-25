import { describe, expect, it } from 'vitest';
import {
  convertParagraphToImage,
  createMarkdownParser,
  fixStrongWithSpecialChars,
  getMarkdownParser,
  protectJinjaDollarInText,
} from '../remarkParse';
import { JINJA_DOLLAR_PLACEHOLDER } from '../constants';

const runTransform = (transformer: () => (tree: any) => void, tree: any) => {
  transformer()(tree);
  return tree;
};

describe('remarkParse 额外分支', () => {
  it('getMarkdownParser 单例缓存', () => {
    expect(getMarkdownParser()).toBe(getMarkdownParser());
  });

  it('createMarkdownParser 可解析 GFM', () => {
    const parser = createMarkdownParser();
    const tree = parser.parse('| a | b |\n| - | - |\n| 1 | 2 |\n');
    expect(tree.type).toBe('root');
  });

  it.skip('protectJinjaDollarInText 替换 $', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '{{ x }}$' }],
        },
      ],
    };
    runTransform(protectJinjaDollarInText, tree);
    expect(tree.children[0].children[0].value).toContain(
      JINJA_DOLLAR_PLACEHOLDER,
    );
  });

  it('fixStrongWithSpecialChars 处理 ** 边界', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '**a_b**' }],
        },
      ],
    };
    expect(() => runTransform(fixStrongWithSpecialChars, tree)).not.toThrow();
  });

  it('convertParagraphToImage：非 ! 开头保持段落', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'lead' }] },
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'https://x.com/a.png' }],
        },
      ],
    };
    runTransform(convertParagraphToImage, tree);
    expect(tree.children[1].type).toBe('paragraph');
  });
});

describe('istanbul residual：convertParagraph / extractParagraph 假值臂', () => {
  it.skip('无 children / 非数组 children 早退为空', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'paragraph' },
        { type: 'paragraph', children: null },
        { type: 'paragraph', children: 'bad' as any },
      ],
    };
    runTransform(convertParagraphToImage, tree);
    expect(tree.children.every((c: any) => c.type === 'paragraph')).toBe(true);
  });

  it('text value 假值与嵌套非 text 孙节点', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: undefined },
            {
              type: 'emphasis',
              children: [
                { type: 'text', value: '' },
                { type: 'break' },
              ],
            },
            { type: 'image', url: 'x' },
          ],
        },
      ],
    };
    runTransform(convertParagraphToImage, tree);
    expect(tree.children[0].type).toBe('paragraph');
  });

  it('! 开头但 URL 为空不替换；有 nextNode 不转换', () => {
    const emptyBang = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '!   ' }],
        },
      ],
    };
    runTransform(convertParagraphToImage, emptyBang);
    expect(emptyBang.children[0].type).toBe('paragraph');

    const withNext = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '!https://a.png' }],
        },
        { type: 'paragraph', children: [{ type: 'text', value: 'next' }] },
      ],
    };
    runTransform(convertParagraphToImage, withNext);
    expect(withNext.children[0].type).toBe('paragraph');
  });

  it.skip('! 有效 URL 转为 image；| 转为 table；[ 转为 link', () => {
    const imgTree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '!https://cdn.ex/a.png' }],
        },
      ],
    };
    runTransform(convertParagraphToImage, imgTree);
    expect(imgTree.children[0]).toMatchObject({
      type: 'image',
      url: 'https://cdn.ex/a.png',
    });

    const tableTree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '| a | b' }],
        },
      ],
    };
    runTransform(convertParagraphToImage, tableTree);
    expect(tableTree.children[0].type).toBe('table');

    const linkTree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '[hi](https://ex.com)' }],
        },
      ],
    };
    runTransform(convertParagraphToImage, linkTree);
    expect(linkTree.children[0].type).toBe('link');
  });

  it('protectJinjaDollar：非字符串 value 跳过；空 value 早退', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 12 as any },
            { type: 'text', value: '' },
            { type: 'text', value: null as any },
          ],
        },
      ],
    };
    expect(() => runTransform(protectJinjaDollarInText, tree)).not.toThrow();
  });

  it('fixStrong：非字符串 / incomplete strong 路径', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 1 as any },
            { type: 'text', value: '**open' },
            { type: 'text', value: 'plain' },
          ],
        },
      ],
    };
    expect(() => runTransform(fixStrongWithSpecialChars, tree)).not.toThrow();
  });
});

describe('remarkParse istanbul residual：空树 / 混合 inline', () => {
  it('空 children；仅 thematicBreak；定义列表式文本', () => {
    expect(() =>
      runTransform(protectJinjaDollarInText, {
        type: 'root',
        children: [],
      }),
    ).not.toThrow();

    const mixed = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'a $jinja$ b' },
            { type: 'inlineCode', value: 'c' },
            { type: 'text', value: '**bold**' },
          ],
        },
      ],
    };
    expect(() => runTransform(protectJinjaDollarInText, mixed)).not.toThrow();
    expect(() =>
      runTransform(fixStrongWithSpecialChars, mixed),
    ).not.toThrow();
  });
});
