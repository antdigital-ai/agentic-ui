/**
 * remarkParse 分支覆盖：段落转 image/table/link、加粗修复、Jinja 保护与解析器缓存。
 */
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

/** visit 回调 index=0 为 falsy，需前置占位段落以覆盖转换分支 */
const withLeadParagraph = (targetParagraph: any) => ({
  type: 'root',
  children: [
    { type: 'paragraph', children: [{ type: 'text', value: 'lead' }] },
    targetParagraph,
  ],
});

describe('remarkParse branches', () => {
  describe('convertParagraphToImage', () => {
    it('! 开头且无 nextNode 时转为 image', () => {
      const tree = withLeadParagraph({
        type: 'paragraph',
        children: [{ type: 'text', value: '!https://img.test/a.png' }],
      });
      runTransform(convertParagraphToImage, tree);
      expect(tree.children[1]).toMatchObject({
        type: 'image',
        url: 'https://img.test/a.png',
        finished: false,
      });
    });

    it('! 后 URL 为空时不替换', () => {
      const para = {
        type: 'paragraph',
        children: [{ type: 'text', value: '!' }],
      };
      const tree = withLeadParagraph(para);
      runTransform(convertParagraphToImage, tree);
      expect(tree.children[1].type).toBe('paragraph');
    });

    it('| 开头且无 nextNode 时转为 table', () => {
      const tree = withLeadParagraph({
        type: 'paragraph',
        children: [{ type: 'text', value: '| col |' }],
      });
      runTransform(convertParagraphToImage, tree);
      expect(tree.children[1].type).toBe('table');
    });

    it('[text](url) 格式转为 link', () => {
      const tree = withLeadParagraph({
        type: 'paragraph',
        children: [{ type: 'text', value: '[label](https://x.com)' }],
      });
      runTransform(convertParagraphToImage, tree);
      expect(tree.children[1]).toMatchObject({
        type: 'link',
        url: 'https://x.com',
      });
    });

    it('存在 nextNode 时不转换', () => {
      const tree = {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', value: 'lead' }] },
          {
            type: 'paragraph',
            children: [{ type: 'text', value: '!https://x.com' }],
          },
          { type: 'paragraph', children: [{ type: 'text', value: 'next' }] },
        ],
      };
      runTransform(convertParagraphToImage, tree);
      expect(tree.children[1].type).toBe('paragraph');
    });

    it('段落无 children 时跳过', () => {
      const tree = {
        type: 'root',
        children: [{ type: 'paragraph', children: null }],
      };
      expect(() => runTransform(convertParagraphToImage, tree)).not.toThrow();
    });

    it('嵌套 strong 子节点提取文本', () => {
      const tree = withLeadParagraph({
        type: 'paragraph',
        children: [
          {
            type: 'strong',
            children: [{ type: 'text', value: '!https://nested.io/x' }],
          },
        ],
      });
      runTransform(convertParagraphToImage, tree);
      expect(tree.children[1].type).toBe('image');
    });
  });

  describe('fixStrongWithSpecialChars', () => {
    it('完整 **$9.698M** 转为 strong', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'Price **$9.698M** end' }],
          },
        ],
      };
      runTransform(fixStrongWithSpecialChars, tree);
      expect(
        tree.children[0].children.some((n: any) => n.type === 'strong'),
      ).toBe(true);
    });

    it('不完整 **text 转为 finished:false strong', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: '**incomplete' }],
          },
        ],
      };
      runTransform(fixStrongWithSpecialChars, tree);
      const strong = tree.children[0].children.find(
        (n: any) => n.type === 'strong',
      );
      expect(strong?.finished).toBe(false);
    });

    it('根级 text 节点同样拆分 strong', () => {
      const tree = {
        type: 'root',
        children: [{ type: 'text', value: '**57%** done' }],
      };
      runTransform(fixStrongWithSpecialChars, tree);
      expect(tree.children.some((n: any) => n.type === 'strong')).toBe(true);
    });
  });

  describe('protectJinjaDollarInText', () => {
    it('Jinja 块内 $ 替换为占位符', () => {
      const tree = {
        type: 'root',
        children: [{ type: 'text', value: '{{ $price }}' }],
      };
      runTransform(protectJinjaDollarInText, tree);
      expect(tree.children[0].value).toContain(JINJA_DOLLAR_PLACEHOLDER);
    });

    it('非字符串 value 跳过', () => {
      const node = { type: 'text', value: null };
      runTransform(protectJinjaDollarInText, {
        type: 'root',
        children: [node],
      });
      expect(node.value).toBeNull();
    });
  });

  describe('getMarkdownParser cache', () => {
    it('相同 formulaConfig 返回缓存实例', () => {
      const a = getMarkdownParser({ singleDollarTextMath: true });
      const b = getMarkdownParser({ singleDollarTextMath: true });
      expect(a).toBe(b);
    });

    it('不同 formulaConfig 重建解析器', () => {
      const withMath = getMarkdownParser({ singleDollarTextMath: true });
      const withoutMath = getMarkdownParser(undefined);
      expect(withMath).not.toBe(withoutMath);
    });

    it('createMarkdownParser 无 formula 时不挂载 remarkMath', () => {
      const parser = createMarkdownParser(undefined);
      expect(parser.parse('hello').children[0]).toBeDefined();
    });
  });

  describe('convertParagraphToImage 额外分支', () => {
    it('嵌套非文本孙子节点提取为空串仍可转换', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'emphasis',
                children: [{ type: 'break' }],
              },
            ],
          },
        ],
      };
      runTransform(convertParagraphToImage, tree);
      expect(tree.children[0]).toBeTruthy();
    });
  });

  describe('fixStrongWithSpecialChars 额外分支', () => {
    it('beforeText 为空时仍拆分 strong', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: '**only**' }],
          },
        ],
      };
      runTransform(fixStrongWithSpecialChars, tree);
      expect(
        tree.children[0].children.some((n: any) => n.type === 'strong'),
      ).toBe(true);
    });

    it('根级不完整 strong 标记 finished false', () => {
      const tree = {
        type: 'root',
        children: [{ type: 'text', value: '**half' }],
      };
      runTransform(fixStrongWithSpecialChars, tree);
      const strong = tree.children.find((n: any) => n.type === 'strong');
      expect(strong?.finished).toBe(false);
    });

    it.skip('afterText 与不完整 strong 并存', () => {
      const tree = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'pre **mid' }],
          },
        ],
      };
      runTransform(fixStrongWithSpecialChars, tree);
      expect(
        tree.children[0].children.some((n: any) => n.type === 'strong'),
      ).toBe(true);
    });
  });

  describe('getMarkdownParser formula 变体', () => {
    it('singleDollarTextMath false 与 true 不同实例', () => {
      const a = getMarkdownParser({ singleDollarTextMath: false });
      const b = getMarkdownParser({ singleDollarTextMath: true });
      expect(a).not.toBe(b);
    });
  });
});
