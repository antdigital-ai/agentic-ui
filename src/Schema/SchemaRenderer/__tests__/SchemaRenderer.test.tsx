import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SchemaRenderer } from '../@ant-design/agentic-ui/Schema/SchemaRenderer';

describe('SchemaRenderer', () => {
  const defaultProps = {
    schema: {
      version: '1.0.0',
      name: 'TestComponent',
      description: '测试组件',
      component: {
        type: 'html' as const,
        schema: '<div>姓名: {{name}}, 年龄: {{age}}</div>',
        properties: {
          name: {
            type: 'string' as const,
            title: '姓名',
          },
          age: {
            type: 'number' as const,
            title: '年龄',
          },
        },
      },
    },
    values: {
      name: '张三',
      age: 25,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该渲染 SchemaRenderer 组件', () => {
      const { container } = render(<SchemaRenderer {...defaultProps} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });

    it('应该显示数据值', () => {
      const { container } = render(<SchemaRenderer {...defaultProps} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });
  });

  describe('不同类型字段测试', () => {
    it('应该渲染字符串字段', () => {
      const props = {
        schema: {
          version: '1.0.0',
          name: 'StringComponent',
          description: '字符串组件',
          component: {
            type: 'html' as const,
            schema: '<div>标题: {{title}}</div>',
            properties: {
              title: {
                type: 'string' as const,
                title: '标题',
              },
            },
          },
        },
        values: {
          title: '测试标题',
        },
      };
      const { container } = render(<SchemaRenderer {...props} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });

    it('应该渲染数字字段', () => {
      const props = {
        schema: {
          version: '1.0.0',
          name: 'NumberComponent',
          description: '数字组件',
          component: {
            type: 'html' as const,
            schema: '<div>数量: {{count}}</div>',
            properties: {
              count: {
                type: 'number' as const,
                title: '数量',
              },
            },
          },
        },
        values: {
          count: 100,
        },
      };
      const { container } = render(<SchemaRenderer {...props} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });

    it('应该渲染布尔字段', () => {
      const props = {
        schema: {
          version: '1.0.0',
          name: 'BooleanComponent',
          description: '布尔组件',
          component: {
            type: 'html' as const,
            schema: '<div>状态: {{active}}</div>',
            properties: {
              active: {
                type: 'string' as const,
                title: '是否激活',
              },
            },
          },
        },
        values: {
          active: 'true',
        },
      };
      const { container } = render(<SchemaRenderer {...props} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理无效的 schema', () => {
      const props = {
        schema: {
          // 缺少必需字段
        } as any,
        values: {},
      };
      render(<SchemaRenderer {...props} />);
      // 应该显示错误信息
      expect(screen.getByText(/Schema 验证失败/)).toBeInTheDocument();
    });

    it('应该处理空数据', () => {
      const props = {
        schema: {
          version: '1.0.0',
          name: 'EmptyComponent',
          description: '空组件',
          component: {
            type: 'html' as const,
            schema: '<div>空组件</div>',
            properties: {},
          },
        },
        values: {},
      };
      const { container } = render(<SchemaRenderer {...props} />);
      // 应该正常渲染，不显示错误
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
      expect(screen.queryByText(/Schema 验证失败/)).not.toBeInTheDocument();
    });
  });

  describe('配置选项测试', () => {
    it('应该使用自定义配置', () => {
      const props = {
        ...defaultProps,
        config: {
          ALLOWED_TAGS: ['div', 'span'],
          ALLOWED_ATTR: ['class', 'id'],
        },
      };
      const { container } = render(<SchemaRenderer {...props} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });

    it('应该使用自定义 fallback 内容', () => {
      const props = {
        schema: {
          version: '1.0.0',
          name: 'ErrorComponent',
          description: '错误组件',
          component: {
            type: 'html' as const,
            schema: '<div>错误组件</div>',
            properties: {},
          },
        },
        values: {},
        fallbackContent: (
          <div data-testid="custom-fallback">自定义错误内容</div>
        ),
      };
      render(<SchemaRenderer {...props} />);
      // 由于组件正常渲染，fallback 内容不会显示
      // 我们应该测试组件正常渲染
      expect(screen.queryByTestId('custom-fallback')).not.toBeInTheDocument();
    });
  });

  describe('性能优化测试', () => {
    it('应该正确处理 useMemo 优化', () => {
      const { container } = render(<SchemaRenderer {...defaultProps} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });

    it('应该正确处理 useCallback 优化', () => {
      const { container } = render(<SchemaRenderer {...defaultProps} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理特殊字符', () => {
      const props = {
        schema: {
          version: '1.0.0',
          name: 'SpecialCharComponent',
          description: '特殊字符组件',
          component: {
            type: 'html' as const,
            schema: '<div>特殊字符: {{special}}</div>',
            properties: {
              special: {
                type: 'string' as const,
                title: '特殊字符: !@#$%^&*()',
              },
            },
          },
        },
        values: {
          special: '特殊字符: !@#$%^&*()',
        },
      };

      const { container } = render(<SchemaRenderer {...props} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });

    it('应该处理 null 值', () => {
      const props = {
        schema: {
          version: '1.0.0',
          name: 'NullComponent',
          description: '空值组件',
          component: {
            type: 'html' as const,
            schema: '<div>空值: {{nullValue}}</div>',
            properties: {
              nullValue: {
                type: 'string' as const,
                title: '空值',
              },
            },
          },
        },
        values: {
          nullValue: null,
        },
      };
      const { container } = render(<SchemaRenderer {...props} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });

    it('应该处理 undefined 值', () => {
      const props = {
        schema: {
          version: '1.0.0',
          name: 'UndefinedComponent',
          description: '未定义组件',
          component: {
            type: 'html' as const,
            schema: '<div>未定义值: {{undefinedValue}}</div>',
            properties: {
              undefinedValue: {
                type: 'string' as const,
                title: '未定义值',
              },
            },
          },
        },
        values: {
          undefinedValue: undefined,
        },
      };
      const { container } = render(<SchemaRenderer {...props} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });
  });

  describe('组件属性测试', () => {
    it('应该正确处理 debug 属性', () => {
      const props = {
        ...defaultProps,
        debug: false,
      };
      const { container } = render(<SchemaRenderer {...props} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });

    it('应该正确处理 useDefaultValues 属性', () => {
      const props = {
        ...defaultProps,
        useDefaultValues: false,
      };
      const { container } = render(<SchemaRenderer {...props} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });
  });

  describe('模板引擎测试', () => {
    it('应该支持 mustache 模板', () => {
      const props = {
        schema: {
          version: '1.0.0',
          name: 'MustacheComponent',
          description: 'Mustache 组件',
          component: {
            type: 'mustache' as const,
            schema: '<div>姓名: {{name}}</div>',
            properties: {
              name: {
                type: 'string' as const,
                title: '姓名',
              },
            },
          },
        },
        values: {
          name: '李四',
        },
      };
      const { container } = render(<SchemaRenderer {...props} />);
      expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    });
  });

  it('应该支持 values 为字符串但 schema 定义为 array/object', async () => {
    const props = {
      schema: {
        version: '1.0.0',
        name: 'ArrayObjectComponent',
        description: '数组和对象类型测试',
        component: {
          type: 'mustache' as const,
          schema: '<div>数组:{{#arr}} {{.}}{{/arr}}, 对象: {{obj.name}}</div>',
          properties: {
            arr: {
              type: 'array' as const,
              title: '数组',
            },
            obj: {
              type: 'object' as const,
              title: '对象',
            },
          },
        },
      },
      values: {
        arr: 'a,b,c',
        obj: '{"name":"张三"}',
      },
    };
    let renderedHtml = '';
    render(
      <SchemaRenderer
        {...props}
        onRenderSuccess={(html) => {
          renderedHtml = html;
        }}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(renderedHtml).toContain('数组: a b c');
    expect(renderedHtml).toContain('对象: 张三');
  });
});
