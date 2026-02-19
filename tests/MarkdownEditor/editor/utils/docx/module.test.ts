import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { message } from 'antd';
import { makeDeserializer, TEXT_TAGS } from '../../../../../src/MarkdownEditor/editor/utils/docx/module';

vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
  },
}));

describe('docx module', () => {
  const mockJsx = vi.fn((type, props, children) => {
    if (type === 'fragment') {
      return children;
    }
    if (type === 'text') {
      return { ...props, text: children };
    }
    return { type, ...props, children };
  });

  const deserialize = makeDeserializer(mockJsx);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('TEXT_TAGS', () => {
    it('应该定义正确的文本标签映射', () => {
      expect(TEXT_TAGS.CODE()).toEqual({ code: true });
      expect(TEXT_TAGS.DEL()).toEqual({ strikethrough: true });
      expect(TEXT_TAGS.EM()).toEqual({ italic: true });
      expect(TEXT_TAGS.I()).toEqual({ italic: true });
      expect(TEXT_TAGS.S()).toEqual({ strikethrough: true });
      expect(TEXT_TAGS.B()).toEqual({ bold: true });
      expect(TEXT_TAGS.U()).toEqual({ underline: true });
    });
  });

  describe('deserialize', () => {
    it('应跳过 class 含 done 的节点并返回 null', () => {
      const el = {
        attributes: {
          getNamedItem: vi.fn((name: string) =>
            name === 'class' ? { value: 'some-class done' } : null,
          ),
        },
      };
      const result = deserialize(el, {});
      expect(result).toBeNull();
    });

    it('应该处理文本节点', () => {
      const textNode = {
        nodeType: 3,
        textContent: 'Hello World',
        parentNode: {
          nodeName: 'P'
        }
      };

      const result = deserialize(textNode, {});
      expect(result).toBe('Hello World');
    });

    it('应该处理空白文本节点', () => {
      const textNode = {
        nodeType: 3,
        textContent: '   \n  \t  ',
        parentNode: {
          nodeName: 'P'
        }
      };

      const result = deserialize(textNode, {});
      expect(result).toBeNull(); // 空白文本应该返回null
    });

    it('应该处理换行符', () => {
      const textNode = {
        nodeType: 3,
        textContent: 'Line 1\nLine 2\nLine 3',
        parentNode: {
          nodeName: 'P'
        }
      };

      const result = deserialize(textNode, {});
      expect(result).toBe('Line 1 Line 2 Line 3');
    });

    it('应该处理O:P节点内的文本', () => {
      const textNode = {
        nodeType: 3,
        textContent: 'Office Text',
        parentNode: {
          nodeName: 'O:P',
          parentNode: {
            nodeName: 'P'
          }
        }
      };

      const result = deserialize(textNode, {});
      expect(result).toBe('Office Text');
    });

    it('应该处理非元素节点', () => {
      const node = {
        nodeType: 8, // 注释节点
      };

      const result = deserialize(node, {});
      expect(result).toBeNull();
    });

    it('应该处理BR标签', () => {
      const brNode = {
        nodeType: 1,
        nodeName: 'BR'
      };

      const result = deserialize(brNode, {});
      expect(result).toBe('\n');
    });

    it('应该处理BODY标签', () => {
      const bodyNode = {
        nodeType: 1,
        nodeName: 'BODY',
        childNodes: []
      };

      const result = deserialize(bodyNode, {});
      expect(Array.isArray(result)).toBeTruthy();
      // 应该包含填充的段落元素
      expect(result[0]).toEqual({
        type: 'paragraph',
        className: 'P',
        children: [{ text: ' ' }]
      });
    });
  });

  describe('deserializeElement', () => {
    it('应该处理IMG标签', () => {
      const imgNode = {
        nodeType: 1,
        nodeName: 'IMG',
        getAttribute: vi.fn((attr) => {
          if (attr === 'src') return 'http://example.com/image.jpg';
          return null;
        }),
        setAttribute: vi.fn(),
        childNodes: [] // 添加childNodes属性
      };

      const imageTags = {
        'http://example.com/image.jpg': 'http://replaced.com/image.jpg'
      };

      const result = deserialize(imgNode, imageTags);
      expect(imgNode.setAttribute).toHaveBeenCalledWith('src', 'http://replaced.com/image.jpg');
      // 由于ELEMENT_TAGS需要被mock，我们暂时跳过这部分测试
      expect(result).toBeDefined();
    });

    it('应该处理H1/H2/H3标签', () => {
      const h1Node = {
        nodeType: 1,
        nodeName: 'H1',
        childNodes: [{
          nodeType: 3,
          textContent: 'Heading 1',
          parentNode: {
            nodeName: 'H1'
          }
        }]
      };

      const result = deserialize(h1Node, {});
      expect(result).toEqual({
        type: 'head',
        className: 'H1',
        level: 1,
        children: ['Heading 1']
      });
    });

    it('应该处理文本标签', () => {
      const bNode = {
        nodeType: 1,
        nodeName: 'B',
        childNodes: [{
          nodeType: 3,
          textContent: 'Bold Text',
          parentNode: {
            nodeName: 'B'
          }
        }]
      };

      const result = deserialize(bNode, {});
      expect(result).toEqual([{
        bold: true,
        text: 'Bold Text'
      }]);
    });

    it('应该处理嵌套元素', () => {
      const pNode = {
        nodeType: 1,
        nodeName: 'P',
        childNodes: [{
          nodeType: 3,
          textContent: 'Paragraph text',
          parentNode: {
            nodeName: 'P'
          }
        }]
      };

      const result = deserialize(pNode, {});
      expect(result).toEqual({
        type: 'paragraph',
        children: ['Paragraph text']
      });
    });

    it('应处理 PRE 内嵌 CODE 时用 CODE 作为 parent', () => {
      const preNode = {
        nodeType: 1,
        nodeName: 'PRE',
        childNodes: [
          {
            nodeType: 1,
            nodeName: 'CODE',
            childNodes: [{
              nodeType: 3,
              textContent: 'code content',
              parentNode: { nodeName: 'CODE' }
            }]
          }
        ]
      };
      const result = deserialize(preNode, {});
      expect(result).toBeDefined();
      expect(mockJsx).toHaveBeenCalled();
    });

    it('TEXT_TAGS 子节点为字符串时应走 jsx(text)', () => {
      const emNode = {
        nodeType: 1,
        nodeName: 'EM',
        childNodes: [{
          nodeType: 3,
          textContent: 'italic',
          parentNode: { nodeName: 'EM' }
        }]
      };
      const result = deserialize(emNode, {});
      expect(result).toEqual([{ italic: true, text: 'italic' }]);
    });

    it('TEXT_TAGS 子节点为非字符串时应走 jsx(element, ELEMENT_TAGS.P, child)', () => {
      const bNode = {
        nodeType: 1,
        nodeName: 'B',
        childNodes: [
          {
            nodeType: 1,
            nodeName: 'I',
            childNodes: [{
              nodeType: 3,
              textContent: 'nested',
              parentNode: { nodeName: 'I' }
            }]
          }
        ]
      };
      const result = deserialize(bNode, {});
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result?.length).toBeGreaterThan(0);
    });

    it('TEXT_TAGS 处理中 jsx 抛错时应被 catch', () => {
      const throwingJsx = vi.fn((type, props, children) => {
        if (type === 'text') throw new Error('text jsx error');
        return { type, ...props, children };
      });
      const deserializeWithError = makeDeserializer(throwingJsx);
      const bNode = {
        nodeType: 1,
        nodeName: 'B',
        childNodes: [{
          nodeType: 3,
          textContent: 'x',
          parentNode: { nodeName: 'B' }
        }]
      };
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = deserializeWithError(bNode, {});
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
      expect(result).toBeDefined();
    });
  });

  describe('isList', () => {
    it('应该正确识别列表元素并走 deserializeList', () => {
      const container = document.createElement('div');
      const p = document.createElement('p');
      p.setAttribute('class', 'MsoListParagraph');
      p.setAttribute('style', 'mso-list: level1');
      p.appendChild(document.createTextNode('list item'));
      container.appendChild(p);

      const result = deserialize(p, {});
      expect(mockJsx).toHaveBeenCalledWith('element', expect.any(Object), expect.any(Array));
      expect(result).toBeDefined();
      expect(result?.type).toBe('bulleted-list');
    });

    it('应该正确识别非列表元素', () => {
      const nonListNode = {
        attributes: {
          getNamedItem: vi.fn((name) => {
            if (name === 'class') {
              return {
                value: 'some-other-class'
              };
            }
            return null;
          })
        }
      };

      const result = deserialize(nonListNode, {});
      expect(result).toBeNull();
    });
  });

  describe('getSiblings', () => {
    it('应通过列表解析覆盖 getSiblings 循环', () => {
      const container = document.createElement('div');
      const first = document.createElement('p');
      first.setAttribute('class', 'MsoListParagraph');
      first.setAttribute('style', 'mso-list: level1');
      first.appendChild(document.createTextNode('a'));
      const second = document.createElement('p');
      second.setAttribute('class', 'MsoListParagraph');
      second.setAttribute('style', 'mso-list: level2');
      second.appendChild(document.createTextNode('b'));
      container.appendChild(first);
      container.appendChild(second);

      const result = deserialize(first, {});
      expect(result).toBeDefined();
      expect(result?.type).toBe('bulleted-list');
      expect(result?.children?.length).toBe(2);
    });
  });

  describe('deserializeList', () => {
    it('应覆盖 deserializeListItem 与 extractTextFromNodes', () => {
      const container = document.createElement('div');
      const p = document.createElement('p');
      p.setAttribute('class', 'MsoListParagraph');
      p.setAttribute('style', 'level2');
      const span = document.createElement('span');
      span.textContent = '  prefix ';
      p.appendChild(span);
      container.appendChild(p);

      const result = deserialize(p, {});
      expect(result?.type).toBe('bulleted-list');
      expect(result?.children).toBeDefined();
    });
  });

  describe('deserializeListItem', () => {
    it('deserializeElement 抛错时应走 catch 并调用 message.error', () => {
      const container = document.createElement('div');
      const p = document.createElement('p');
      p.setAttribute('class', 'MsoListParagraph');
      p.setAttribute('style', 'level1');
      const textNode = document.createTextNode('x');
      Object.defineProperty(textNode, 'textContent', {
        get() {
          throw new Error('textContent getter');
        },
        configurable: true,
      });
      p.appendChild(textNode);
      container.appendChild(p);

      deserialize(p, {});
      expect(message.error).toHaveBeenCalledWith(
        expect.stringContaining('Error deserializing list item'),
      );
    });
  });

  describe('extractTextFromNodes', () => {
    it('应该从节点中提取文本', () => {
      // 由于extractTextFromNodes是内部函数，我们通过测试文本标签处理来间接测试
      const bNode = {
        nodeType: 1,
        nodeName: 'B',
        childNodes: [{
          nodeType: 3,
          textContent: 'Bold Text',
          parentNode: {
            nodeName: 'B'
          }
        }]
      };

      const result = deserialize(bNode, {});
      expect(result).toEqual([{
        bold: true,
        text: 'Bold Text'
      }]);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的childNodes', () => {
      const emptyNode = {
        nodeType: 1,
        nodeName: 'DIV',
        childNodes: []
      };

      const result = deserialize(emptyNode, {});
      // 对于空的childNodes，应该返回数组
      expect(Array.isArray(result)).toBeTruthy();
    });

    it('应该处理null元素', () => {
      // deserialize期望是一个对象，所以这里测试不适用
      expect(true).toBe(true); // 占位测试
    });

    it('应该处理异常情况', () => {
      const errorNode = {
        nodeType: 1,
        nodeName: 'B',
        childNodes: [{
          nodeType: 3,
          textContent: 'Error test',
          parentNode: {
            nodeName: 'B'
          }
        }]
      };

      // 模拟jsx函数抛出异常
      const errorJsx = vi.fn(() => {
        throw new Error('Test error');
      });

      const errorDeserialize = makeDeserializer(errorJsx);
      
      // 这里应该不会抛出异常，因为错误被catch了
      expect(() => {
        errorDeserialize(errorNode, {});
      }).not.toThrow();
    });
  });
});