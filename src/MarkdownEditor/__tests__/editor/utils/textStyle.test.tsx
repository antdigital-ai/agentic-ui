import { parserSlateNodeToMarkdown } from '@ant-design/agentic-ui';
import { describe, expect, it } from 'vitest';

describe('textStyle function - tag and value handling', () => {
  it('should handle text node with tag and value properties', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '张三',
            tag: true,
            placeholder: '请输入姓名',
            value: '张三',
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:请输入姓名,value:张三}`');
  });

  it('should handle text node with tag but no value', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '默认文本',
            tag: true,
            placeholder: '请输入姓名',
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`默认文本`');
  });

  it('should handle text node with tag, no value, and no text', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请输入姓名',
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:请输入姓名}`');
  });

  it('should handle text node with tag, value, and text', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '显示文本',
            tag: true,
            placeholder: '请输入姓名',
            value: '李四',
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    // value 优先级高于 text，即使有 text 也使用 value
    expect(markdown).toBe('`${placeholder:请输入姓名,value:李四}`');
  });

  it('should handle text node with tag and null value', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请输入姓名',
            value: null,
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:请输入姓名}`');
  });

  it('should handle text node with tag and undefined value', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请输入姓名',
            value: undefined,
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:请输入姓名}`');
  });

  it('should handle text node with tag and complex value', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请选择选项',
            value: 'option1,option2,option3',
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe(
      '`${placeholder:请选择选项,value:option1,option2,option3}`',
    );
  });

  it('should handle text node with tag and special characters in value', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请输入内容',
            value: '包含特殊字符: @#$%^&*()',
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe(
      '`${placeholder:请输入内容,value:包含特殊字符: @#$%^&*()}`',
    );
  });

  it('should handle text node with tag and Chinese characters in placeholder', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请输入中文姓名',
            value: '王五',
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:请输入中文姓名,value:王五}`');
  });

  it('should handle text node with tag and empty placeholder', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '',
            value: '测试值',
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:-,value:测试值}`');
  });

  it('should handle text node with tag and undefined placeholder', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: undefined,
            value: '测试值',
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:-,value:测试值}`');
  });

  it('should handle text node with tag and null placeholder', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: null,
            value: '测试值',
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:-,value:测试值}`');
  });

  it('should handle text node with tag and numeric value', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请输入数字',
            value: 123,
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:请输入数字,value:123}`');
  });

  it('should handle text node with tag and boolean value', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请选择',
            value: true,
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:请选择,value:true}`');
  });

  it('should handle text node with tag and array value', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请选择数组',
            value: [1, 2, 3],
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:请选择数组,value:1,2,3}`');
  });

  it('should handle text node with tag and zero value', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请输入数字',
            value: 0,
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:请输入数字}`');
  });

  it('should handle text node with tag and false value', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            placeholder: '请选择',
            value: false,
          },
        ],
      },
    ];

    const markdown = parserSlateNodeToMarkdown(schema);
    expect(markdown).toBe('`${placeholder:请选择}`');
  });
});
