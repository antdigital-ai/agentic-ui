import { describe, expect, it } from 'vitest';
import { MdElements, BlockMathNodes, TextMatchNodes } from '../../../../src/MarkdownEditor/editor/plugins/elements';

describe('elements.ts', () => {
  describe('MdElements', () => {
    it('应该定义所有必要的元素类型', () => {
      expect(MdElements).toBeDefined();
      expect(MdElements.table).toBeDefined();
      expect(MdElements.code).toBeDefined();
      expect(MdElements.head).toBeDefined();
      expect(MdElements.link).toBeDefined();
      expect(MdElements.img).toBeDefined();
      expect(MdElements.task).toBeDefined();
      expect(MdElements.list).toBeDefined();
      expect(MdElements.hr).toBeDefined();
      expect(MdElements.frontmatter).toBeDefined();
      expect(MdElements.blockquote).toBeDefined();
      expect(MdElements.bold).toBeDefined();
      expect(MdElements.italic).toBeDefined();
      expect(MdElements.inlineCode).toBeDefined();
      expect(MdElements.boldAndItalic).toBeDefined();
      expect(MdElements.strikethrough).toBeDefined();
    });

    it('应该为每个元素定义正则表达式', () => {
      // 检查表格元素
      expect(MdElements.table.reg).toBeDefined();
      expect(MdElements.table.reg instanceof RegExp).toBe(true);
      
      // 检查代码块元素
      expect(MdElements.code.reg).toBeDefined();
      expect(MdElements.code.reg instanceof RegExp).toBe(true);
      
      // 检查标题元素
      expect(MdElements.head.reg).toBeDefined();
      expect(MdElements.head.reg instanceof RegExp).toBe(true);
      
      // 检查链接元素
      expect(MdElements.link.reg).toBeDefined();
      expect(MdElements.link.reg instanceof RegExp).toBe(true);
      
      // 检查图片元素
      expect(MdElements.img.reg).toBeDefined();
      expect(MdElements.img.reg instanceof RegExp).toBe(true);
      
      // 检查任务列表元素
      expect(MdElements.task.reg).toBeDefined();
      expect(MdElements.task.reg instanceof RegExp).toBe(true);
      
      // 检查列表元素
      expect(MdElements.list.reg).toBeDefined();
      expect(MdElements.list.reg instanceof RegExp).toBe(true);
      
      // 检查分割线元素
      expect(MdElements.hr.reg).toBeDefined();
      expect(MdElements.hr.reg instanceof RegExp).toBe(true);
      
      // 检查frontmatter元素
      expect(MdElements.frontmatter.reg).toBeDefined();
      expect(MdElements.frontmatter.reg instanceof RegExp).toBe(true);
      
      // 检查引用元素
      expect(MdElements.blockquote.reg).toBeDefined();
      expect(MdElements.blockquote.reg instanceof RegExp).toBe(true);
      
      // 检查加粗元素
      expect(MdElements.bold.reg).toBeDefined();
      expect(MdElements.bold.reg instanceof RegExp).toBe(true);
      
      // 检查斜体元素
      expect(MdElements.italic.reg).toBeDefined();
      expect(MdElements.italic.reg instanceof RegExp).toBe(true);
      
      // 检查行内代码元素
      expect(MdElements.inlineCode.reg).toBeDefined();
      expect(MdElements.inlineCode.reg instanceof RegExp).toBe(true);
      
      // 检查加粗斜体元素
      expect(MdElements.boldAndItalic.reg).toBeDefined();
      expect(MdElements.boldAndItalic.reg instanceof RegExp).toBe(true);
      
      // 检查删除线元素
      expect(MdElements.strikethrough.reg).toBeDefined();
      expect(MdElements.strikethrough.reg instanceof RegExp).toBe(true);
    });

    it('应该为适当元素定义 matchKey', () => {
      // 检查有 matchKey 的元素
      expect(MdElements.head.matchKey).toBe(' ');
      expect(MdElements.link.matchKey).toBe(')');
      expect(MdElements.img.matchKey).toBe(')');
      expect(MdElements.task.matchKey).toBe(' ');
      expect(MdElements.list.matchKey).toBe(' ');
      expect(MdElements.blockquote.matchKey).toBe(' ');
      expect(MdElements.bold.matchKey).toBe('*');
      expect(MdElements.italic.matchKey).toBe('*');
      expect(MdElements.inlineCode.matchKey).toBe('`');
      expect(MdElements.boldAndItalic.matchKey).toBe('*');
      expect(MdElements.strikethrough.matchKey).toBe('~');
      expect(MdElements.code.matchKey).toBe(' ');
      expect(MdElements.hr.matchKey).toBe(' ');
      
      // 检查没有 matchKey 的元素
      expect(MdElements.table.matchKey).toBeUndefined();
      expect(MdElements.frontmatter.matchKey).toBeUndefined();
    });

    it('应该为所有元素定义 run 函数', () => {
      // 检查所有元素都有 run 函数
      Object.values(MdElements).forEach(element => {
        expect(element.run).toBeDefined();
        expect(typeof element.run).toBe('function');
      });
    });
  });

  describe('导出的节点数组', () => {
    it('应该正确导出 BlockMathNodes', () => {
      expect(Array.isArray(BlockMathNodes)).toBe(true);
      expect(BlockMathNodes.length).toBeGreaterThan(0);
      
      // 检查是否包含没有 matchKey 的元素
      const tableNode = BlockMathNodes.find(node => node.type === 'table');
      const codeNode = BlockMathNodes.find(node => node.type === 'code');
      const hrNode = BlockMathNodes.find(node => node.type === 'hr');
      const frontmatterNode = BlockMathNodes.find(node => node.type === 'frontmatter');
      
      expect(tableNode).toBeDefined();
      expect(codeNode).toBeDefined();
      expect(hrNode).toBeDefined();
      expect(frontmatterNode).toBeDefined();
    });

    it('应该正确导出 TextMatchNodes', () => {
      expect(Array.isArray(TextMatchNodes)).toBe(true);
      expect(TextMatchNodes.length).toBeGreaterThan(0);
      
      // 检查是否包含有 matchKey 的元素
      const headNode = TextMatchNodes.find(node => node.type === 'head');
      const linkNode = TextMatchNodes.find(node => node.type === 'link');
      const imgNode = TextMatchNodes.find(node => node.type === 'img');
      const taskNode = TextMatchNodes.find(node => node.type === 'task');
      const listNode = TextMatchNodes.find(node => node.type === 'list');
      const blockquoteNode = TextMatchNodes.find(node => node.type === 'blockquote');
      const boldNode = TextMatchNodes.find(node => node.type === 'bold');
      
      expect(headNode).toBeDefined();
      expect(linkNode).toBeDefined();
      expect(imgNode).toBeDefined();
      expect(taskNode).toBeDefined();
      expect(listNode).toBeDefined();
      expect(blockquoteNode).toBeDefined();
      expect(boldNode).toBeDefined();
    });
  });
});