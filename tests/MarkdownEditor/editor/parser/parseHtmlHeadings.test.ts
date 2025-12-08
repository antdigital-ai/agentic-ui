import { describe, expect, it } from 'vitest';
import { parserMarkdownToSlateNode } from '../../../../src/MarkdownEditor/editor/parser/parserMarkdownToSlateNode';
import { htmlToMarkdown } from '../../../../src/MarkdownEditor/editor/utils/htmlToMarkdown';

/**
 * 测试 HTML 标题元素的解析
 * 这些测试用例来自实际的 HTML 文档内容（mdValue.tsx）
 *
 * 测试流程：HTML -> Markdown -> Slate Nodes
 */
describe('HTML 标题元素解析测试', () => {
  describe('基本标题解析', () => {
    it('应该正确解析带 id 的 h1 标题', () => {
      const html = '<h1 id="g8vhJ">使用说明</h1>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();
      expect(result.schema.length).toBeGreaterThan(0);

      const h1Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 1,
      );
      expect(h1Node).toBeDefined();

      const text = h1Node?.children?.map((c: any) => c.text).join('');
      expect(text).toBe('使用说明');
    });

    it('应该正确解析带 id 的 h2 标题', () => {
      const html = '<h2 id="XlH72">刷脸公有云</h2>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();
      expect(result.schema.length).toBeGreaterThan(0);

      const h2Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 2,
      );
      expect(h2Node).toBeDefined();

      const text = h2Node?.children?.map((c: any) => c.text).join('');
      expect(text).toContain('刷脸公有云');
    });

    it('应该正确解析带 id 的 h3 标题', () => {
      const html = '<h3 id="SwhQA">证件OCR</h3>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();
      expect(result.schema.length).toBeGreaterThan(0);

      const h3Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 3,
      );
      expect(h3Node).toBeDefined();

      const text = h3Node?.children?.map((c: any) => c.text).join('');
      expect(text).toContain('证件OCR');
    });

    it('应该正确解析空的 h3 标题', () => {
      const html = '<h3 id="eZHmc"></h3>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();
      // 空标题可能被解析为空数组或空段落
      expect(Array.isArray(result.schema)).toBeTruthy();
    });
  });

  describe('带 font 样式的标题解析', () => {
    it('应该正确解析带 color 样式的 h2 标题', () => {
      const html =
        '<h2 id="XlH72"><font style="color:rgb(0, 0, 0);">刷脸公有云   (L4)</font></h2>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();

      const h2Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 2,
      );
      expect(h2Node).toBeDefined();

      const text = h2Node?.children?.map((c: any) => c.text).join('');
      expect(text).toContain('刷脸公有云');
      expect(text).toContain('(L4)');
    });

    it('应该正确解析带前导空格和颜色样式的标题', () => {
      const html =
        '<h2 id="nDVwQ"><font style="color:rgb(0, 0, 0);"> 通用证件OCR及防伪-公有云(L4)</font></h2>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();

      const h2Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 2,
      );
      expect(h2Node).toBeDefined();

      const text = h2Node?.children?.map((c: any) => c.text).join('');
      expect(text).toContain('通用证件OCR');
    });

    it('应该正确解析带背景色的 h3 标题', () => {
      const html =
        '<h3 id="sY6or"><font style="color:rgba(0, 0, 0, 0.88);background-color:rgb(204, 232, 255);">用户资质可信身份增强认证-用户召回（L5）</font></h3>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();

      const h3Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 3,
      );
      expect(h3Node).toBeDefined();

      const text = h3Node?.children?.map((c: any) => c.text).join('');
      expect(text).toContain('用户资质可信身份增强认证');
    });

    it('应该正确解析带 color:black 样式的标题', () => {
      const html =
        '<h2 id="WcycA"><font style="color:black;">[二轮车门店助贷购车分期业务]</font></h2>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();

      const h2Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 2,
      );
      expect(h2Node).toBeDefined();

      const text = h2Node?.children?.map((c: any) => c.text).join('');
      expect(text).toContain('二轮车门店助贷购车分期业务');
    });
  });

  describe('带链接的标题解析', () => {
    it('应该正确解析带 Markdown 风格链接的 h3 标题', () => {
      const html =
        '<h3 id="xBHVH">[（客户侧）终止协议_20250826.docx](https://yuque.antfin.com/attachments/lark/0/2025/docx/1788/1762784335918.docx)</h3>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();

      const h3Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 3,
      );
      expect(h3Node).toBeDefined();

      // 验证标题包含内容
      expect(h3Node?.children).toBeDefined();
      if (h3Node) {
        expect(h3Node.children.length).toBeGreaterThan(0);
      }
    });

    it('应该正确解析 h3 标题中带 font 的内容', () => {
      const html =
        '<h3 id="SwhQA"><font style="color:rgb(0, 0, 0);">证件OCR（L5）</font></h3>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();

      const h3Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 3,
      );
      expect(h3Node).toBeDefined();
    });
  });

  describe('特殊场景测试', () => {
    it('应该正确解析带方括号的标题', () => {
      const html = '<h2 id="ZQYlD">[ekyc组合版]</h2>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();

      const h2Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 2,
      );
      expect(h2Node).toBeDefined();

      const text = h2Node?.children?.map((c: any) => c.text).join('');
      expect(text).toContain('ekyc组合版');
    });

    it('应该正确解析带多个空格的标题', () => {
      const html =
        '<h2 id="XlH72"><font style="color:rgb(0, 0, 0);">刷脸公有云   (L4)</font></h2>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();

      const h2Node = result.schema.find(
        (node: any) => node.type === 'head' && node.level === 2,
      );
      expect(h2Node).toBeDefined();

      const text = h2Node?.children?.map((c: any) => c.text).join('');
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('多级标题组合测试', () => {
    it('应该正确解析多个连续的 HTML 标题', () => {
      const html = `<h1>eKYC（L3）</h1><h2>刷脸公有云 (L4)</h2><h3>证件OCR（L5）</h3>`;
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();

      // 验证 h1
      const hasH1 = result.schema.some((n: any) => {
        if (n.type === 'head' && n.level === 1) {
          const text = n.children?.map((c: any) => c.text).join('');
          return text && text.includes('eKYC');
        }
        return false;
      });
      expect(hasH1).toBeTruthy();

      // 验证 h2
      const hasH2 = result.schema.some(
        (n: any) => n.type === 'head' && n.level === 2,
      );
      expect(hasH2).toBeTruthy();

      // 验证 h3
      const hasH3 = result.schema.some(
        (n: any) => n.type === 'head' && n.level === 3,
      );
      expect(hasH3).toBeTruthy();
    });

    it('应该正确解析混合样式的 HTML 标题组合', () => {
      const html = `<h1>流量风控平台（L3）</h1><h2>信贷流量（L4）</h2><h3>正式合作协议</h3>`;
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();
      expect(result.schema.length).toBeGreaterThan(0);

      // 统计不同级别的标题数量
      const headingCounts = {
        h1: 0,
        h2: 0,
        h3: 0,
      };

      result.schema.forEach((node: any) => {
        if (node.type === 'head') {
          if (node.level === 1) headingCounts.h1++;
          if (node.level === 2) headingCounts.h2++;
          if (node.level === 3) headingCounts.h3++;
        }
      });

      expect(headingCounts.h1).toBeGreaterThan(0);
      expect(headingCounts.h2).toBeGreaterThan(0);
      expect(headingCounts.h3).toBeGreaterThan(0);
    });
  });

  describe('完整文档结构测试', () => {
    it('应该正确解析包含标题和段落的 HTML 文档', () => {
      const html = `<h1>使用说明</h1><p>本模板库为业务的协议模板合集</p><h2>刷脸公有云 (L4)</h2>`;
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();
      expect(result.schema.length).toBeGreaterThan(0);

      // 验证包含不同类型的节点
      const hasHeadings = result.schema.some((n: any) => n.type === 'head');
      const hasParagraphs = result.schema.some(
        (n: any) => n.type === 'paragraph',
      );

      expect(hasHeadings).toBeTruthy();
      expect(hasParagraphs).toBeTruthy();
    });

    it('应该正确解析带列表的 HTML 文档结构', () => {
      const html = `<h2>标题</h2><ul><li>多因子验证服务</li></ul>`;
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toBeDefined();
      expect(result.schema.length).toBeGreaterThan(0);

      // 验证包含多种元素类型
      const elementTypes = new Set(result.schema.map((n: any) => n.type));
      expect(elementTypes.has('head')).toBeTruthy();
      expect(elementTypes.has('list')).toBeTruthy();
    });
  });

  describe('特殊字符和格式处理', () => {
    it('应该正确处理带斜杠的 HTML 标题', () => {
      const html = '<h2>二要素、三要素、四要素(L4)/多因子认证技术</h2>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      const h2 = result.schema.find(
        (n: any) => n.type === 'head' && n.level === 2,
      );
      expect(h2).toBeDefined();

      const text = h2?.children?.map((c: any) => c.text).join('');
      expect(text).toContain('/');
    });

    it('应该正确处理带破折号的 HTML 标题', () => {
      const html = '<h2>通用证件OCR及防伪-公有云(L4)</h2>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      const h2 = result.schema.find(
        (n: any) => n.type === 'head' && n.level === 2,
      );
      expect(h2).toBeDefined();

      const text = h2?.children?.map((c: any) => c.text).join('');
      expect(text).toContain('-');
    });

    it('应该正确处理带中文括号的 HTML 标题', () => {
      const html = '<h1>流量风控平台（L3）</h1>';
      const markdown = htmlToMarkdown(html);
      const result = parserMarkdownToSlateNode(markdown);

      const h1 = result.schema.find(
        (n: any) => n.type === 'head' && n.level === 1,
      );
      expect(h1).toBeDefined();

      const text = h1?.children?.map((c: any) => c.text).join('');
      expect(text).toContain('（');
      expect(text).toContain('）');
    });
  });
});
