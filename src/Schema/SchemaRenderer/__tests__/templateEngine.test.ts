import { describe, expect, it } from 'vitest';
import { TemplateEngine } from '../../@ant-design/agentic-ui/Schema/SchemaRenderer/templateEngine';

describe('TemplateEngine', () => {
  describe('基本渲染功能', () => {
    it('应该渲染简单的文本', () => {
      const result = TemplateEngine.render('Hello World', {});

      expect(result).toBe('Hello World');
    });

    it('应该渲染变量占位符', () => {
      const result = TemplateEngine.render('Hello {{name}}', { name: 'World' });

      expect(result).toBe('Hello World');
    });

    it('应该渲染多个变量', () => {
      const result = TemplateEngine.render('{{greeting}} {{name}}!', {
        greeting: 'Hello',
        name: 'World',
      });

      expect(result).toBe('Hello World!');
    });

    it('应该处理带空格的占位符', () => {
      const result = TemplateEngine.render('{{ name }}', { name: 'Test' });

      expect(result).toBe('Test');
    });

    it('应该处理多个空格的占位符', () => {
      const result = TemplateEngine.render('{{  name  }}', { name: 'Test' });

      expect(result).toBe('Test');
    });
  });

  describe('对象字段渲染', () => {
    it('应该将对象转换为 JSON 字符串', () => {
      const result = TemplateEngine.render('Object: {{user}}', {
        user: { name: 'John', age: 30 } as any,
      });

      expect(result).toContain('{"name":"John","age":30}');
    });

    it('应该处理空对象', () => {
      const result = TemplateEngine.render('Empty: {{obj}}', {
        obj: {} as any,
      });

      expect(result).toBe('Empty: {}');
    });

    it('应该处理 null 对象', () => {
      const result = TemplateEngine.render('Null: {{obj}}', {
        obj: null as any,
      });

      expect(result).toBe('Null: null');
    });
  });

  describe('数字和布尔值', () => {
    it('应该渲染数字', () => {
      const result = TemplateEngine.render('Count: {{count}}', { count: 42 });

      expect(result).toBe('Count: 42');
    });

    it('应该渲染布尔值', () => {
      const result = TemplateEngine.render('Active: {{active}}', {
        active: true,
      });

      expect(result).toBe('Active: true');
    });

    it('应该渲染零', () => {
      const result = TemplateEngine.render('Zero: {{zero}}', { zero: 0 });

      expect(result).toBe('Zero: 0');
    });

    it('应该渲染 false', () => {
      const result = TemplateEngine.render('Flag: {{flag}}', { flag: false });

      expect(result).toBe('Flag: false');
    });

    it('应该渲染负数', () => {
      const result = TemplateEngine.render('Negative: {{num}}', { num: -42 });

      expect(result).toBe('Negative: -42');
    });

    it('应该渲染小数', () => {
      const result = TemplateEngine.render('Decimal: {{num}}', { num: 3.14 });

      expect(result).toBe('Decimal: 3.14');
    });
  });

  describe('HTML 转义', () => {
    it('应该转义 & 符号', () => {
      const result = TemplateEngine.render('{{text}}', { text: 'A & B' });

      expect(result).toBe('A &amp; B');
    });

    it('应该转义 < 符号', () => {
      const result = TemplateEngine.render('{{text}}', { text: 'A < B' });

      expect(result).toBe('A &lt; B');
    });

    it('应该转义 > 符号', () => {
      const result = TemplateEngine.render('{{text}}', { text: 'A > B' });

      expect(result).toBe('A &gt; B');
    });

    it('应该转义双引号', () => {
      const result = TemplateEngine.render('{{text}}', { text: 'Say "Hello"' });

      expect(result).toBe('Say &quot;Hello&quot;');
    });

    it('应该转义单引号', () => {
      const result = TemplateEngine.render('{{text}}', { text: "It's OK" });

      expect(result).toBe('It&#039;s OK');
    });

    it('应该同时转义多个特殊字符', () => {
      const result = TemplateEngine.render('{{html}}', {
        html: '<div class="test" data-value=\'123\' onclick="alert()">&content</div>',
      });

      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#039;');
    });

    it('应该防止 XSS 攻击', () => {
      const result = TemplateEngine.render('{{script}}', {
        script: '<script>alert("XSS")</script>',
      });

      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('边界情况', () => {
    it('应该处理空模板', () => {
      const result = TemplateEngine.render('', {});

      expect(result).toBe('');
    });

    it('应该处理空数据', () => {
      const result = TemplateEngine.render('No data: {{missing}}', {});

      expect(result).toBe('No data: {{missing}}');
    });

    it('应该处理 null 值', () => {
      const result = TemplateEngine.render('Value: {{value}}', {
        value: null as any,
      });

      expect(result).toBe('Value: null');
    });

    it('应该处理 undefined 值', () => {
      const result = TemplateEngine.render('Value: {{value}}', {
        value: undefined as any,
      });

      expect(result).toBe('Value: undefined');
    });

    it('应该处理数字 0', () => {
      const result = TemplateEngine.render('Number: {{num}}', { num: 0 });

      expect(result).toBe('Number: 0');
    });

    it('应该处理空字符串', () => {
      const result = TemplateEngine.render('Text: {{text}}', { text: '' });

      expect(result).toBe('Text: ');
    });

    it('应该处理只有空白的字符串', () => {
      const result = TemplateEngine.render('Text: {{text}}', { text: '   ' });

      expect(result).toBe('Text:    ');
    });
  });

  describe('多个占位符处理', () => {
    it('应该替换所有同名占位符', () => {
      const result = TemplateEngine.render('{{name}} loves {{name}}', {
        name: 'Alice',
      });

      expect(result).toBe('Alice loves Alice');
    });

    it('应该处理模板中的多个不同占位符', () => {
      const result = TemplateEngine.render('{{a}} {{b}} {{c}}', {
        a: '1',
        b: '2',
        c: '3',
      });

      expect(result).toBe('1 2 3');
    });

    it('应该保留未提供数据的占位符', () => {
      const result = TemplateEngine.render('{{provided}} {{missing}}', {
        provided: 'Here',
      });

      expect(result).toBe('Here {{missing}}');
    });
  });

  describe('Unicode 和特殊字符', () => {
    it('应该处理中文字符', () => {
      const result = TemplateEngine.render('{{text}}', { text: '你好世界' });

      expect(result).toBe('你好世界');
    });

    it('应该处理 Emoji', () => {
      const result = TemplateEngine.render('{{emoji}}', { emoji: '🚀🎉✨' });

      expect(result).toBe('🚀🎉✨');
    });

    it('应该处理多语言字符', () => {
      const result = TemplateEngine.render('{{text}}', {
        text: 'Hello 你好 Привет مرحبا',
      });

      expect(result).toBe('Hello 你好 Привет مرحبا');
    });

    it('应该处理换行符', () => {
      const result = TemplateEngine.render('{{text}}', {
        text: 'Line1\nLine2',
      });

      expect(result).toBe('Line1\nLine2');
    });

    it('应该处理制表符', () => {
      const result = TemplateEngine.render('{{text}}', { text: 'A\tB' });

      expect(result).toBe('A\tB');
    });
  });

  describe('复杂字符串处理', () => {
    it('应该处理 URL', () => {
      const result = TemplateEngine.render('{{url}}', {
        url: 'https://example.com?param=value&foo=bar',
      });

      expect(result).toBe('https://example.com?param=value&amp;foo=bar');
    });

    it('应该处理 JSON 字符串', () => {
      const result = TemplateEngine.render('{{json}}', {
        json: '{"key": "value"}',
      });

      expect(result).toBe('{&quot;key&quot;: &quot;value&quot;}');
    });

    it('应该处理代码片段', () => {
      const result = TemplateEngine.render('{{code}}', {
        code: 'if (x > 0 && y < 10) { return true; }',
      });

      expect(result).toBe(
        'if (x &gt; 0 &amp;&amp; y &lt; 10) { return true; }',
      );
    });
  });

  describe('实际使用场景', () => {
    it('应该渲染用户信息卡片', () => {
      const template =
        '<div class="card"><h3>{{name}}</h3><p>Email: {{email}}</p></div>';
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = TemplateEngine.render(template, data);

      expect(result).toContain('John Doe');
      expect(result).toContain('john@example.com');
    });

    it('应该渲染产品列表', () => {
      const template =
        '<div>Product: {{product}}, Price: ${{price}}, Stock: {{stock}}</div>';
      const data = {
        product: 'Laptop',
        price: 999,
        stock: 10,
      };

      const result = TemplateEngine.render(template, data);

      expect(result).toBe('<div>Product: Laptop, Price: $999, Stock: 10</div>');
    });

    it('应该渲染状态消息', () => {
      const template = 'Status: {{status}}, Progress: {{progress}}%';
      const data = {
        status: 'Processing',
        progress: 75,
      };

      const result = TemplateEngine.render(template, data);

      expect(result).toBe('Status: Processing, Progress: 75%');
    });

    it('应该支持混合静态和动态内容', () => {
      const template =
        'User {{userId}} logged in at {{time}} from {{location}}';
      const data = {
        userId: 12345,
        time: '10:30 AM',
        location: 'New York',
      };

      const result = TemplateEngine.render(template, data);

      expect(result).toBe('User 12345 logged in at 10:30 AM from New York');
    });
  });

  describe('性能测试', () => {
    it('应该快速处理简单模板', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        TemplateEngine.render('Hello {{name}}', { name: 'World' });
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000);
    });

    it('应该处理多个字段的模板', () => {
      const data: any = {};
      for (let i = 0; i < 50; i++) {
        data[`field${i}`] = `value${i}`;
      }

      let template = '';
      for (let i = 0; i < 50; i++) {
        template += `{{field${i}}} `;
      }

      const result = TemplateEngine.render(template, data);

      expect(result).toContain('value0');
      expect(result).toContain('value49');
    });

    it('应该处理非常长的值', () => {
      const longValue = 'x'.repeat(10000);
      const result = TemplateEngine.render('{{text}}', { text: longValue });

      expect(result.length).toBe(10000);
    });
  });

  describe('静态方法调用', () => {
    it('应该支持多次调用', () => {
      const result1 = TemplateEngine.render('{{a}}', { a: 1 });
      const result2 = TemplateEngine.render('{{b}}', { b: 2 });
      const result3 = TemplateEngine.render('{{c}}', { c: 3 });

      expect(result1).toBe('1');
      expect(result2).toBe('2');
      expect(result3).toBe('3');
    });

    it('应该返回独立的结果', () => {
      const result1 = TemplateEngine.render('{{value}}', { value: 'first' });
      const result2 = TemplateEngine.render('{{value}}', { value: 'second' });

      expect(result1).not.toBe(result2);
      expect(result1).toBe('first');
      expect(result2).toBe('second');
    });

    it('应该处理相同输入返回相同输出', () => {
      const template = '{{name}}';
      const data = { name: 'Test' };

      const result1 = TemplateEngine.render(template, data);
      const result2 = TemplateEngine.render(template, data);

      expect(result1).toBe(result2);
      expect(result1).toBe('Test');
    });
  });

  describe('边界和性能', () => {
    it('应该处理非常长的模板', () => {
      let template = '';
      const data: any = {};

      for (let i = 0; i < 100; i++) {
        template += `{{field${i}}} `;
        data[`field${i}`] = `value${i}`;
      }

      const result = TemplateEngine.render(template, data);

      expect(result).toContain('value0');
      expect(result).toContain('value99');
    });

    it('应该处理重复的键名', () => {
      const result = TemplateEngine.render('{{key}} and {{key}} and {{key}}', {
        key: 'value',
      });

      expect(result).toBe('value and value and value');
    });

    it('应该处理空键名数据', () => {
      const result = TemplateEngine.render('Test {{a}} Template', {});

      expect(result).toBe('Test {{a}} Template');
    });

    it('应该处理模板中没有占位符', () => {
      const result = TemplateEngine.render('Static content only', {
        unused: 'value',
      });

      expect(result).toBe('Static content only');
    });
  });

  describe('特殊情况', () => {
    it('应该处理占位符在开头', () => {
      const result = TemplateEngine.render('{{name}} is here', {
        name: 'Alice',
      });

      expect(result).toBe('Alice is here');
    });

    it('应该处理占位符在结尾', () => {
      const result = TemplateEngine.render('Hello {{name}}', { name: 'Bob' });

      expect(result).toBe('Hello Bob');
    });

    it('应该处理只有占位符的模板', () => {
      const result = TemplateEngine.render('{{content}}', {
        content: 'Only this',
      });

      expect(result).toBe('Only this');
    });

    it('应该处理连续的占位符', () => {
      const result = TemplateEngine.render('{{a}}{{b}}{{c}}', {
        a: '1',
        b: '2',
        c: '3',
      });

      expect(result).toBe('123');
    });
  });
});
