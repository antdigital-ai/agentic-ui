import { describe, expect, it } from 'vitest';
import { Root } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import markdownParser, {
  convertParagraphToImage,
  fixStrongWithSpecialChars,
} from '../../../../src/MarkdownEditor/editor/parser/remarkParse';

/**
 * remarkParse.ts 测试文件
 * 测试 convertParagraphToImage 和 fixStrongWithSpecialChars 插件功能
 */

describe('remarkParse.ts', () => {
  describe('convertParagraphToImage 插件测试', () => {
    const processor = unified()
      .use(remarkParse)
      .use(convertParagraphToImage);

    it('应该将 ! 开头的段落转换为图片节点', () => {
      // 根据源码，转换需要 index 和 parent 且无 nextNode；首段 index=0 会跳过，故用两段使第二段 index=1
      const markdown = '第一段\n\n!https://example.com/image.png';
      const result = processor.runSync(processor.parse(markdown)) as Root;

      expect(result.children.length).toBeGreaterThanOrEqual(2);
      const second: any = result.children[1];
      expect(second.type).toBe('image');
      expect(second.url).toBe('https://example.com/image.png');
      expect(second.alt).toBe('');
    });

    it('应该处理空的 ! 开头段落', () => {
      const markdown = '!';
      const result = processor.runSync(processor.parse(markdown)) as Root;
      
      expect(result.children).toHaveLength(1);
      const node: any = result.children[0];
      expect(node.type).toBe('paragraph');
    });

    it('应该处理普通的段落（不以 ! 开头）', () => {
      const markdown = '这是一个普通段落';
      const result = processor.runSync(processor.parse(markdown)) as Root;
      
      expect(result.children).toHaveLength(1);
      const node: any = result.children[0];
      expect(node.type).toBe('paragraph');
    });

    it('应该将 | 开头的段落转换为表格节点', () => {
      const markdown = '前一段\n\n| 这是一个表格行';
      const result = processor.runSync(processor.parse(markdown)) as Root;

      expect(result.children.length).toBeGreaterThanOrEqual(2);
      const second: any = result.children[1];
      expect(second.type).toBe('table');
      expect(second.finished).toBe(false);
      expect(second.children).toHaveLength(1);
      expect(second.children[0].type).toBe('tableRow');
    });

    it('应该将 [链接](url) 格式的段落转换为链接节点', () => {
      // 标准解析会把 [text](url) 解析为 link 节点，无法得到原始 [](url) 文本；通过手动树覆盖 link 分支
      const tree: any = {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', value: '前一段' }] },
          {
            type: 'paragraph',
            children: [{ type: 'text', value: '[链接文本](https://example.com)' }],
          },
        ],
      };
      convertParagraphToImage()(tree);
      expect(tree.children[1].type).toBe('link');
      expect(tree.children[1].url).toBe('https://example.com');
      expect(tree.children[1].children).toBeDefined();
    });

    it('应该处理不完整的链接格式', () => {
      const markdown = '[链接文本]';
      const result = processor.runSync(processor.parse(markdown)) as Root;
      
      expect(result.children).toHaveLength(1);
      const node: any = result.children[0];
      expect(node.type).toBe('paragraph');
    });

    it('应该处理空段落', () => {
      const markdown = '';
      const result = processor.runSync(processor.parse(markdown)) as Root;

      // 空内容可能会产生一个空段落
      expect(result.children.length).toBeGreaterThanOrEqual(0);
    });

    it('extractParagraphText 无 children 时返回空串且不替换', () => {
      const tree: any = {
        type: 'root',
        children: [{ type: 'paragraph' }],
      };
      convertParagraphToImage()(tree);
      expect(tree.children[0].type).toBe('paragraph');
    });

    it('extractParagraphText children 非数组时返回空串且不替换', () => {
      const tree: any = {
        type: 'root',
        children: [{ type: 'paragraph', children: null }],
      };
      convertParagraphToImage()(tree);
      expect(tree.children[0].type).toBe('paragraph');
    });
  });

  describe('fixStrongWithSpecialChars 插件测试', () => {
    const processor = unified()
      .use(remarkParse)
      .use(fixStrongWithSpecialChars);

    it('应该修复包含特殊字符的加粗文本', () => {
      const markdown = '**$9.698M**';
      const result = processor.runSync(processor.parse(markdown)) as Root;
      
      expect(result.children).toHaveLength(1);
      const paragraph: any = result.children[0];
      expect(paragraph.type).toBe('paragraph');
      
      // 检查是否包含加粗节点
      const hasStrong = paragraph.children && paragraph.children.some((child: any) => child.type === 'strong');
      expect(hasStrong).toBe(true);
    });

    it('应该修复包含百分比的加粗文本', () => {
      const markdown = '**57%**';
      const result = processor.runSync(processor.parse(markdown)) as Root;
      
      expect(result.children).toHaveLength(1);
      const paragraph: any = result.children[0];
      expect(paragraph.type).toBe('paragraph');
      
      // 检查是否包含加粗节点
      const hasStrong = paragraph.children && paragraph.children.some((child: any) => child.type === 'strong');
      expect(hasStrong).toBe(true);
    });

    it('应该修复包含符号的加粗文本', () => {
      const markdown = '**#tag**';
      const result = processor.runSync(processor.parse(markdown)) as Root;
      
      expect(result.children).toHaveLength(1);
      const paragraph: any = result.children[0];
      expect(paragraph.type).toBe('paragraph');
      
      // 检查是否包含加粗节点
      const hasStrong = paragraph.children && paragraph.children.some((child: any) => child.type === 'strong');
      expect(hasStrong).toBe(true);
    });

    it('应该处理不完整的加粗文本', () => {
      const markdown = '**未闭合的加粗文本';
      const result = processor.runSync(processor.parse(markdown)) as Root;
      
      expect(result.children).toHaveLength(1);
      const paragraph: any = result.children[0];
      expect(paragraph.type).toBe('paragraph');
      
      // 检查是否包含加粗节点
      const hasStrong = paragraph.children && paragraph.children.some((child: any) => child.type === 'strong');
      expect(hasStrong).toBe(true);
    });

    it('应该处理混合文本', () => {
      const markdown = '普通文本 **加粗文本** 更多普通文本';
      const result = processor.runSync(processor.parse(markdown)) as Root;
      
      expect(result.children).toHaveLength(1);
      const paragraph: any = result.children[0];
      expect(paragraph.type).toBe('paragraph');
      
      // 检查是否包含多种类型的节点
      const hasText = paragraph.children && paragraph.children.some((child: any) => child.type === 'text');
      const hasStrong = paragraph.children && paragraph.children.some((child: any) => child.type === 'strong');
      expect(hasText).toBe(true);
      expect(hasStrong).toBe(true);
    });

    it('应该处理多个加粗文本', () => {
      const markdown = '**第一个** 和 **第二个**';
      const result = processor.runSync(processor.parse(markdown)) as Root;

      expect(result.children).toHaveLength(1);
      const paragraph: any = result.children[0];
      expect(paragraph.type).toBe('paragraph');

      const strongCount = paragraph.children
        ? paragraph.children.filter((child: any) => child.type === 'strong').length
        : 0;
      expect(strongCount).toBeGreaterThanOrEqual(1);
    });

    it('应在标题内的 text 节点上修复加粗（visit text 分支）', () => {
      const markdown = '## **标题内加粗**';
      const result = processor.runSync(processor.parse(markdown)) as Root;

      expect(result.children).toHaveLength(1);
      const heading: any = result.children[0];
      expect(heading.type).toBe('heading');
      const hasStrong = heading.children?.some((c: any) => c.type === 'strong');
      expect(hasStrong).toBe(true);
    });

    it('应在仅不完整加粗的 text 节点上添加 strong(finished:false)', () => {
      const markdown = '## **仅不完整加粗';
      const result = processor.runSync(processor.parse(markdown)) as Root;

      expect(result.children).toHaveLength(1);
      const heading: any = result.children[0];
      expect(heading.type).toBe('heading');
      const strong = heading.children?.find((c: any) => c.type === 'strong');
      expect(strong).toBeDefined();
      expect(strong?.finished).toBe(false);
    });

    it('应在 text 中完整加粗后带剩余文本时正确处理', () => {
      const markdown = '## **a** 剩余';
      const result = processor.runSync(processor.parse(markdown)) as Root;

      expect(result.children).toHaveLength(1);
      const heading: any = result.children[0];
      expect(heading.type).toBe('heading');
      const texts = heading.children?.filter((c: any) => c.type === 'text') ?? [];
      const strongs = heading.children?.filter((c: any) => c.type === 'strong') ?? [];
      expect(strongs.length).toBeGreaterThanOrEqual(1);
      expect(texts.some((t: any) => t.value?.includes('剩余'))).toBe(true);
    });

    it('visit(text) 分支：手动树中非 paragraph 下的 **text** 应被替换为 strong', () => {
      const tree: any = {
        type: 'root',
        children: [
          {
            type: 'heading',
            depth: 1,
            children: [{ type: 'text', value: '**raw bold**' }],
          },
        ],
      };
      fixStrongWithSpecialChars()(tree);
      expect(tree.children[0].children[0].type).toBe('strong');
      expect(tree.children[0].children[0].children[0].value).toBe('raw bold');
    });

    it('visit(text) 分支：仅不完整加粗的 text 应被替换为 strong(finished:false)', () => {
      const tree: any = {
        type: 'root',
        children: [
          {
            type: 'heading',
            depth: 1,
            children: [{ type: 'text', value: '**only incomplete' }],
          },
        ],
      };
      fixStrongWithSpecialChars()(tree);
      expect(tree.children[0].children[0].type).toBe('strong');
      expect(tree.children[0].children[0].finished).toBe(false);
    });

    it('visit(text) 分支：匹配前有 beforeText 时先插入 text 再 strong', () => {
      const tree: any = {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [{ type: 'text', value: '前缀 **bold**' }],
          },
        ],
      };
      fixStrongWithSpecialChars()(tree);
      const ch = tree.children[0].children;
      expect(ch[0].type).toBe('text');
      expect(ch[0].value).toBe('前缀 ');
      expect(ch[1].type).toBe('strong');
    });

    it('visit(text) 分支：完整加粗后剩余为普通文本时应 push text 节点', () => {
      const tree: any = {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [{ type: 'text', value: '**a** 后缀' }],
          },
        ],
      };
      fixStrongWithSpecialChars()(tree);
      const ch = tree.children[0].children;
      const suffix = ch?.find((c: any) => c.type === 'text' && c.value?.includes('后缀'));
      expect(suffix).toBeDefined();
      expect(suffix?.value).toBe(' 后缀');
    });

    it('visit(text) 分支：完整加粗+剩余不完整加粗应生成 strong+strong(finished:false)', () => {
      const tree: any = {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [{ type: 'text', value: '**a****b' }],
          },
        ],
      };
      fixStrongWithSpecialChars()(tree);
      const ch = tree.children[0].children;
      expect(ch.some((c: any) => c.type === 'strong' && c.finished === false)).toBe(true);
      expect(ch.some((c: any) => c.type === 'strong' && c.children?.[0]?.value === 'b')).toBe(true);
    });

    it('visit(paragraph) 分支：beforeText + 完整加粗 + afterText 应正确拆分', () => {
      const tree: any = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: '前缀 **$9.698M** 后缀' }],
          },
        ],
      };
      fixStrongWithSpecialChars()(tree);
      const p = tree.children[0];
      expect(p.children.length).toBe(3);
      expect(p.children[0].type).toBe('text');
      expect(p.children[0].value).toBe('前缀 ');
      expect(p.children[1].type).toBe('strong');
      expect(p.children[2].type).toBe('text');
      expect(p.children[2].value).toBe(' 后缀');
    });

    it('visit(paragraph) 分支：完整加粗后剩余为不完整加粗时应生成 strong+strong(finished:false)', () => {
      const tree: any = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: '**a****b' }],
          },
        ],
      };
      fixStrongWithSpecialChars()(tree);
      const p = tree.children[0];
      const incomplete = p.children?.find((c: any) => c.type === 'strong' && c.finished === false);
      expect(incomplete).toBeDefined();
    });
  });

  describe('extractParagraphText 函数测试', () => {
    it('应该正确提取段落文本', () => {
      const processor = unified()
        .use(remarkParse)
        .use(convertParagraphToImage);

      const markdown = '测试段落文本';
      const result = processor.runSync(processor.parse(markdown)) as Root;

      expect(result.children).toHaveLength(1);
      const paragraph: any = result.children[0];
      expect(paragraph.type).toBe('paragraph');
    });
  });

  describe('默认导出 markdownParser', () => {
    it('应能 parse 并 runSync 得到 Root', () => {
      const tree = markdownParser.parse('hello **world**');
      const result = markdownParser.runSync(tree) as Root;
      expect(result.type).toBe('root');
      expect(result.children?.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('集成测试', () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(fixStrongWithSpecialChars)
      .use(convertParagraphToImage);

    it('应该正确处理复杂的 Markdown 内容', () => {
      const markdown = `
# 标题

这是一个包含 **$9.698M** 和 **57%** 的段落。

| 表格列1 | 表格列2 |
|---------|---------|
| 数据1   | 数据2   |

$$数学公式$$
`;
      const result = processor.runSync(processor.parse(markdown)) as Root;
      
      expect(result.children.length).toBeGreaterThanOrEqual(3); // 至少包含标题、段落等
      
      // 检查是否包含不同类型的节点
      const nodeTypes = result.children.map(child => child.type);
      expect(nodeTypes).toContain('heading');
      expect(nodeTypes).toContain('paragraph');
    });

    it('应该处理边缘情况', () => {
      // 测试空内容
      const emptyResult = processor.runSync(processor.parse('')) as Root;
      // 空内容可能产生0个或1个子节点
      expect(emptyResult.children.length).toBeGreaterThanOrEqual(0);
      
      // 测试只有空白字符
      const whitespaceResult = processor.runSync(processor.parse('   ')) as Root;
      expect(whitespaceResult.children.length).toBeGreaterThanOrEqual(0);
    });
  });
});