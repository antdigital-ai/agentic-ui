import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { fixStrongWithSpecialChars } from '../remarkParse';

describe('fixStrongWithSpecialChars', () => {
  const createParser = () => {
    return unified().use(remarkParse).use(fixStrongWithSpecialChars);
  };

  it('should convert **$9.698M** to strong node', () => {
    const parser = createParser();
    const markdown = '**$9.698M**';

    const ast = parser.parse(markdown);
    const result = parser.runSync(ast) as any;

    // 验证结构
    expect(result.type).toBe('root');
    expect(result.children).toHaveLength(1);

    const paragraph = result.children[0] as any;
    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.children).toHaveLength(1);

    const strong = paragraph.children[0];
    expect(strong.type).toBe('strong');
    expect(strong.children).toHaveLength(1);
    expect(strong.children[0].type).toBe('text');
    expect(strong.children[0].value).toBe('$9.698M');
  });

  it('should handle mixed text with **$9.698M**', () => {
    const parser = createParser();
    const markdown = 'The revenue is **$9.698M** this quarter.';

    const ast = parser.parse(markdown);
    const result = parser.runSync(ast) as any;

    const paragraph = result.children[0] as any;
    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.children).toHaveLength(3);

    // 第一个文本节点: "The revenue is "
    expect(paragraph.children[0].type).toBe('text');
    expect(paragraph.children[0].value).toBe('The revenue is ');

    // 第二个节点: 加粗的 "$9.698M"
    expect(paragraph.children[1].type).toBe('strong');
    expect(paragraph.children[1].children[0].value).toBe('$9.698M');

    // 第三个文本节点: " this quarter."
    expect(paragraph.children[2].type).toBe('text');
    expect(paragraph.children[2].value).toBe(' this quarter.');
  });

  it('should handle multiple bold text with dollar amounts in one line', () => {
    const parser = createParser();
    const markdown = 'Revenue **$9.698M** and profit **$2.5M**.';

    const ast = parser.parse(markdown);
    const result = parser.runSync(ast) as any;

    const paragraph = result.children[0] as any;
    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.children).toHaveLength(5);

    // "Revenue "
    expect(paragraph.children[0].type).toBe('text');
    expect(paragraph.children[0].value).toBe('Revenue ');

    // "**$9.698M**"
    expect(paragraph.children[1].type).toBe('strong');
    expect(paragraph.children[1].children[0].value).toBe('$9.698M');

    // " and profit "
    expect(paragraph.children[2].type).toBe('text');
    expect(paragraph.children[2].value).toBe(' and profit ');

    // "**$2.5M**"
    expect(paragraph.children[3].type).toBe('strong');
    expect(paragraph.children[3].children[0].value).toBe('$2.5M');

    // "."
    expect(paragraph.children[4].type).toBe('text');
    expect(paragraph.children[4].value).toBe('.');
  });

  it('should handle different currency formats', () => {
    const testCases = [
      { input: '**$1,000**', expected: '$1,000' },
      { input: '**$9.698M**', expected: '$9.698M' },
      { input: '**$123.45K**', expected: '$123.45K' },
      { input: '**$1.2B**', expected: '$1.2B' },
      { input: '**$999.99**', expected: '$999.99' },
    ];

    testCases.forEach(({ input, expected }) => {
      const parser = createParser();
      const ast = parser.parse(input);
      const result = parser.runSync(ast) as any;

      const paragraph = result.children[0] as any;
      const strong = paragraph.children[0];

      expect(strong.type).toBe('strong');
      expect(strong.children[0].value).toBe(expected);
    });
  });

  it('should not affect normal bold text without special characters', () => {
    const parser = createParser();
    const markdown = '**normal bold text**';

    const ast = parser.parse(markdown);
    const result = parser.runSync(ast) as any;

    const paragraph = result.children[0] as any;
    const strong = paragraph.children[0];

    expect(strong.type).toBe('strong');
    expect(strong.children[0].value).toBe('normal bold text');
  });

  it('should handle edge cases', () => {
    const testCases = [
      { input: '**$**', desc: '只有美元符号' },
      { input: '**$ **', desc: '美元符号加空格' },
      { input: '**$0**', desc: '零金额' },
      { input: '**$-100**', desc: '负数金额' },
    ];

    testCases.forEach(({ input }) => {
      const parser = createParser();
      const ast = parser.parse(input);
      const result = parser.runSync(ast) as any;

      const paragraph = result.children[0] as any;
      const strong = paragraph.children[0];

      expect(strong.type).toBe('strong');
      // 验证内容被正确提取
      expect(strong.children[0].type).toBe('text');
    });
  });

  // 新增测试用例：测试中文标点符号
  it('should handle Chinese punctuation marks', () => {
    const testCases = [
      { input: '**重要提醒！**', expected: '重要提醒！' },
      { input: '**请注意：**', expected: '请注意：' },
      { input: '**问题？**', expected: '问题？' },
      { input: '**说明，**', expected: '说明，' },
      { input: '**列表；**', expected: '列表；' },
      { input: '**内容。**', expected: '内容。' },
      { input: '**项目、**', expected: '项目、' },
    ];

    testCases.forEach(({ input, expected }) => {
      const parser = createParser();
      const ast = parser.parse(input);
      const result = parser.runSync(ast) as any;

      const paragraph = result.children[0] as any;
      const strong = paragraph.children[0];

      expect(strong.type).toBe('strong');
      expect(strong.children[0].value).toBe(expected);
    });
  });

  // 新增测试用例：测试引号
  it('should handle quotation marks', () => {
    const testCases = [
      { input: '**"重要信息"**', expected: '"重要信息"' },
      { input: "**'关键数据'**", expected: "'关键数据'" },
      { input: '**"Hello World"**', expected: '"Hello World"' },
      { input: "**'Test Data'**", expected: "'Test Data'" },
      { input: '**"中文"英文"**', expected: '"中文"英文"' },
      { input: "**'Mixed'Content'**", expected: "'Mixed'Content'" },
    ];

    testCases.forEach(({ input, expected }) => {
      const parser = createParser();
      const ast = parser.parse(input);
      const result = parser.runSync(ast) as any;

      const paragraph = result.children[0] as any;
      const strong = paragraph.children[0];

      expect(strong.type).toBe('strong');
      expect(strong.children[0].value).toBe(expected);
    });
  });

  // 新增测试用例：测试书名号
  it('should handle Chinese book title marks', () => {
    const testCases = [
      { input: '**《重要文档》**', expected: '《重要文档》' },
      { input: '**【注意事项】**', expected: '【注意事项】' },
      { input: '**《技术规范》**', expected: '《技术规范》' },
      { input: '**【操作指南】**', expected: '【操作指南】' },
      { input: '**《中文》English**', expected: '《中文》English' },
      { input: '**【Mixed】Content**', expected: '【Mixed】Content' },
    ];

    testCases.forEach(({ input, expected }) => {
      const parser = createParser();
      const ast = parser.parse(input);
      const result = parser.runSync(ast) as any;

      const paragraph = result.children[0] as any;
      const strong = paragraph.children[0];

      expect(strong.type).toBe('strong');
      expect(strong.children[0].value).toBe(expected);
    });
  });

  // 新增测试用例：测试括号
  it('should handle Chinese parentheses', () => {
    const testCases = [
      { input: '**（重要说明）**', expected: '（重要说明）' },
      { input: '**（Technical Note）**', expected: '（Technical Note）' },
      { input: '**（Mixed内容）**', expected: '（Mixed内容）' },
    ];

    testCases.forEach(({ input, expected }) => {
      const parser = createParser();
      const ast = parser.parse(input);
      const result = parser.runSync(ast) as any;

      const paragraph = result.children[0] as any;
      const strong = paragraph.children[0];

      expect(strong.type).toBe('strong');
      expect(strong.children[0].value).toBe(expected);
    });
  });

  // 新增测试用例：测试混合内容
  it('should handle mixed content with various symbols', () => {
    const testCases = [
      {
        input: '**$9.698M（重要）**',
        expected: '$9.698M（重要）',
      },
      {
        input: '**"关键数据"57%**',
        expected: '"关键数据"57%',
      },
      {
        input: '**《文档》！**',
        expected: '《文档》！',
      },
      {
        input: '**【注意】$100**',
        expected: '【注意】$100',
      },
      {
        input: '**"Hello"（World）**',
        expected: '"Hello"（World）',
      },
      {
        input: '**《技术》"规范"**',
        expected: '《技术》"规范"',
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const parser = createParser();
      const ast = parser.parse(input);
      const result = parser.runSync(ast) as any;

      const paragraph = result.children[0] as any;
      const strong = paragraph.children[0];

      expect(strong.type).toBe('strong');
      expect(strong.children[0].value).toBe(expected);
    });
  });

  // 新增测试用例：测试复杂段落中的混合内容
  it('should handle complex paragraphs with mixed bold content', () => {
    const parser = createParser();
    const markdown =
      '收入为 **$9.698M（重要）**，请注意 **"关键数据"** 和 **《技术文档》**！';

    const ast = parser.parse(markdown);
    const result = parser.runSync(ast) as any;

    const paragraph = result.children[0] as any;
    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.children).toHaveLength(7);

    // "收入为 "
    expect(paragraph.children[0].type).toBe('text');
    expect(paragraph.children[0].value).toBe('收入为 ');

    // "**$9.698M（重要）**"
    expect(paragraph.children[1].type).toBe('strong');
    expect(paragraph.children[1].children[0].value).toBe('$9.698M（重要）');

    // "，请注意 "
    expect(paragraph.children[2].type).toBe('text');
    expect(paragraph.children[2].value).toBe('，请注意 ');

    // "**"关键数据"**"
    expect(paragraph.children[3].type).toBe('strong');
    expect(paragraph.children[3].children[0].value).toBe('"关键数据"');

    // " 和 "
    expect(paragraph.children[4].type).toBe('text');
    expect(paragraph.children[4].value).toBe(' 和 ');

    // "**《技术文档》**"
    expect(paragraph.children[5].type).toBe('strong');
    expect(paragraph.children[5].children[0].value).toBe('《技术文档》');

    // "！"
    expect(paragraph.children[6].type).toBe('text');
    expect(paragraph.children[6].value).toBe('！');
  });

  // 新增测试用例：测试边界情况
  it('should handle edge cases with new symbols', () => {
    const testCases = [
      { input: '**！**', desc: '只有感叹号' },
      { input: '**"**', desc: '只有引号开始' },
      { input: '**"**', desc: '只有引号结束' },
      { input: '**《**', desc: '只有书名号开始' },
      { input: '**》**', desc: '只有书名号结束' },
      { input: '**（**', desc: '只有括号开始' },
      { input: '**）**', desc: '只有括号结束' },
      { input: '**，**', desc: '只有逗号' },
      { input: '**。**', desc: '只有句号' },
    ];

    testCases.forEach(({ input, desc }) => {
      const parser = createParser();
      const ast = parser.parse(input);
      const result = parser.runSync(ast) as any;

      const paragraph = result.children[0] as any;
      const strong = paragraph.children[0];

      expect(strong.type, `Failed for: ${desc}`).toBe('strong');
      expect(strong.children[0].type, `Failed for: ${desc}`).toBe('text');
    });
  });
});
