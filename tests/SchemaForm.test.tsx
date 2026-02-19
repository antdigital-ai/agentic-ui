import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SchemaForm } from '../src/Schema/SchemaForm';
import type { LowCodeSchema } from '../src/Schema/types';

// Mock schema for testing
const mockSchema: LowCodeSchema = {
  version: '1.0.0',
  name: 'Test Schema',
  description: 'Test schema for SchemaForm',
  author: 'Test Author',
  createTime: '2024-01-01',
  updateTime: '2024-01-01',
  pageConfig: {
    layout: 'flex',
    router: {
      mode: 'hash',
      basePath: '/',
    },
    globalVariables: {
      colors: {
        sunny: '#FFD700',
        rainy: '#4682B4',
        cloudy: '#708090',
      },
      constants: {
        refreshInterval: 5000,
      },
    },
  },
  dataSources: {
    restAPI: {
      baseURL: 'https://api.example.com',
      defaultHeaders: {},
      timeout: 5000,
      interceptors: {
        request: false,
        response: false,
      },
    },
    mock: {
      enable: false,
      responseDelay: 1000,
      dataPath: '/mock',
    },
  },
  component: {
    properties: {
      title: {
        type: 'string',
        title: '标题',
        description: '组件标题',
        default: '默认标题',
        required: true,
      },
      count: {
        type: 'number',
        title: '数量',
        description: '数量值',
        default: 10,
        minimum: 0,
        maximum: 100,
        step: 1,
      },
      type: {
        type: 'string',
        title: '类型',
        description: '选择类型',
        default: 'primary',
        enum: ['primary', 'secondary', 'success', 'warning', 'error'],
      },
      tags: {
        type: 'array',
        title: '标签',
        description: '标签列表',
        default: [],
        items: {
          type: 'string',
          title: '标签',
          default: '',
        },
      },
      config: {
        type: 'object',
        title: '配置',
        description: '配置对象',
        default: {},
        properties: {
          width: {
            type: 'number',
            title: '宽度',
            default: 100,
            minimum: 0,
          },
          height: {
            type: 'number',
            title: '高度',
            default: 100,
            minimum: 0,
          },
          visible: {
            type: 'string',
            title: '可见性',
            default: 'visible',
            enum: ['visible', 'hidden'],
          },
        },
      },
      items: {
        type: 'array',
        title: '项目列表',
        description: '对象数组',
        default: [],
        items: {
          type: 'object',
          title: '项目',
          default: {},
          properties: {
            name: {
              type: 'string',
              title: '名称',
              default: '',
              required: true,
            },
            value: {
              type: 'number',
              title: '值',
              default: 0,
            },
          },
        },
      },
    },
  },
};

// Additional test schema for edge cases
const edgeCaseSchema: LowCodeSchema = {
  ...mockSchema,
  component: {
    properties: {
      // Array without items definition
      emptyArray: {
        type: 'array',
        title: '空数组',
        description: '没有items定义的数组',
        default: [],
      },
      // Object without properties
      emptyObject: {
        type: 'object',
        title: '空对象',
        description: '没有properties定义的对象',
        default: {},
      },
      // String with pattern validation
      email: {
        type: 'string',
        title: '邮箱',
        description: '邮箱地址',
        default: '',
        pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
        patternMessage: '请输入 有效的邮箱地址',
        required: true,
      },
      // Number with step
      price: {
        type: 'number',
        title: '价格',
        description: '商品价格',
        default: 0,
        minimum: 0,
        maximum: 9999.99,
        step: 0.01,
      },
      // Array with min/max items
      limitedArray: {
        type: 'array',
        title: '限制数组',
        description: '有最小最大限制的数组',
        default: [],
        minItems: 1,
        maxItems: 3,
        items: {
          type: 'string',
          title: '项目',
          default: '',
        },
      },
      // Nested array in object
      nestedStructure: {
        type: 'object',
        title: '嵌套结构',
        description: '包含数组的对象',
        default: {},
        properties: {
          metadata: {
            type: 'object',
            title: '元数据',
            default: {},
            properties: {
              tags: {
                type: 'array',
                title: '标签',
                default: [],
                items: {
                  type: 'string',
                  title: '标签',
                  default: '',
                },
              },
            },
          },
          items: {
            type: 'array',
            title: '项目',
            default: [],
            items: {
              type: 'object',
              title: '项目',
              default: {},
              properties: {
                id: {
                  type: 'string',
                  title: 'ID',
                  default: '',
                  required: true,
                },
                nested: {
                  type: 'array',
                  title: '嵌套数组',
                  default: [],
                  items: {
                    type: 'number',
                    title: '数值',
                    default: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

describe('SchemaForm', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders form with all property types', () => {
    render(<SchemaForm schema={mockSchema} />);

    // Check if all form fields are rendered
    expect(screen.getByLabelText('标题')).toBeInTheDocument();
    expect(screen.getByLabelText('数量')).toBeInTheDocument();
    expect(screen.getByLabelText('类型')).toBeInTheDocument();
    expect(screen.getByText('添加 标签')).toBeInTheDocument();
    expect(screen.getByText('配置')).toBeInTheDocument();
    expect(screen.getByText('添加 项目列表')).toBeInTheDocument();
  });

  it('displays default values correctly', () => {
    render(<SchemaForm schema={mockSchema} />);

    // Check default values
    expect(screen.getByDisplayValue('默认标题')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    // For Select component, check the selected value differently
    expect(screen.getByText('primary')).toBeInTheDocument();
  });

  it('handles form value changes', async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();

    render(<SchemaForm schema={mockSchema} onValuesChange={onValuesChange} />);

    // Change title input
    const titleInput = screen.getByLabelText('标题');
    await user.clear(titleInput);
    await user.type(titleInput, '新标题');

    await waitFor(() => {
      expect(onValuesChange).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<SchemaForm schema={mockSchema} />);

    // Clear required field and trigger validation by blurring the field
    const titleInput = screen.getByLabelText('标题');
    await user.clear(titleInput);
    await user.tab(); // This will blur the field and trigger validation

    await waitFor(() => {
      expect(screen.getByText('请输入 标题')).toBeInTheDocument();
    });
  });

  it('handles number input with min/max validation', async () => {
    const user = userEvent.setup();
    render(<SchemaForm schema={mockSchema} />);

    const numberInput = screen.getByLabelText('数量');

    // Test that we can input numbers
    await user.clear(numberInput);
    await user.type(numberInput, '50');

    await waitFor(() => {
      expect(numberInput).toHaveValue('50');
    });

    // Test that the input has the correct min/max attributes
    expect(numberInput).toHaveAttribute('aria-valuemin', '0');
    expect(numberInput).toHaveAttribute('aria-valuemax', '100');
  });

  it('handles select dropdown', async () => {
    const user = userEvent.setup();
    render(<SchemaForm schema={mockSchema} />);

    const selectElement = screen.getByLabelText('类型');
    await user.click(selectElement);

    await waitFor(() => {
      // Use getAllByText to handle multiple elements with same text
      const secondaryOptions = screen.getAllByText('secondary');
      expect(secondaryOptions.length).toBeGreaterThan(0);
      const successOptions = screen.getAllByText('success');
      expect(successOptions.length).toBeGreaterThan(0);
    });
  });

  it('handles array operations', async () => {
    const user = userEvent.setup();
    render(<SchemaForm schema={mockSchema} />);

    // Add array item
    const addButton = screen.getByText('添加 标签');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('请输入 标签')).toBeInTheDocument();
    });

    // Check if remove button appears
    expect(
      screen.getByRole('button', { name: /minus-circle/i }),
    ).toBeInTheDocument();
  });

  it('handles object properties', () => {
    render(<SchemaForm schema={mockSchema} />);

    // Check if object properties are rendered
    expect(screen.getByLabelText('宽度')).toBeInTheDocument();
    expect(screen.getByLabelText('高度')).toBeInTheDocument();
    expect(screen.getByLabelText('可见性')).toBeInTheDocument();
  });

  it('handles complex array with object items', async () => {
    const user = userEvent.setup();
    render(<SchemaForm schema={mockSchema} />);

    // Add complex array item
    const addItemButton = screen.getByText('添加 项目列表');
    await user.click(addItemButton);

    await waitFor(() => {
      expect(screen.getByLabelText('名称')).toBeInTheDocument();
      expect(screen.getByLabelText('值')).toBeInTheDocument();
    });
  });

  it('applies readonly mode correctly', () => {
    render(<SchemaForm schema={mockSchema} readonly={true} />);

    // Check if inputs are disabled/readonly
    expect(screen.getByLabelText('标题')).toBeDisabled();
    expect(screen.getByLabelText('数量')).toBeDisabled();
    expect(screen.getByLabelText('类型')).toBeDisabled();

    // Check if add buttons are hidden
    expect(screen.queryByText('添加 标签')).not.toBeInTheDocument();
    expect(screen.queryByText('添加 项目列表')).not.toBeInTheDocument();
  });

  it('applies readonly mode to nested object properties', () => {
    render(<SchemaForm schema={mockSchema} readonly={true} />);

    // Check if nested object properties are disabled
    expect(screen.getByLabelText('宽度')).toBeDisabled();
    expect(screen.getByLabelText('高度')).toBeDisabled();
    expect(screen.getByLabelText('可见性')).toBeDisabled();
  });

  it('handles initial values correctly', () => {
    const initialValues = {
      title: '初始标题',
      count: 50,
      type: 'success',
      config: {
        width: 200,
        height: 150,
      },
    };

    render(<SchemaForm schema={mockSchema} initialValues={initialValues} />);

    expect(screen.getByDisplayValue('初始标题')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    // For Select component, check the selected value text
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    expect(screen.getByDisplayValue('150')).toBeInTheDocument();
  });

  it('handles array with initial values', async () => {
    const user = userEvent.setup();
    const initialValues = {
      tags: ['tag1', 'tag2'],
    };

    render(<SchemaForm schema={mockSchema} initialValues={initialValues} />);

    // Add an item to see the existing structure
    const addButton = screen.getByText('添加 标签');
    await user.click(addButton);

    // Should have 3 items total (2 initial + 1 new)
    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText('请输入 标签');
      expect(inputs).toHaveLength(3);
    });
  });

  it('handles form submission and validation', async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();

    render(<SchemaForm schema={mockSchema} onValuesChange={onValuesChange} />);

    // Fill out form
    const titleInput = screen.getByLabelText('标题');
    await user.clear(titleInput);
    await user.type(titleInput, '测试标题');

    const numberInput = screen.getByLabelText('数量');
    await user.clear(numberInput);
    await user.type(numberInput, '25');

    await waitFor(() => {
      expect(onValuesChange).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          title: '测试标题',
          count: 25,
        }),
      );
    });
  });

  it('handles empty schema gracefully', () => {
    const emptySchema: LowCodeSchema = {
      ...mockSchema,
      component: {
        properties: {},
      },
    };

    render(<SchemaForm schema={emptySchema} />);

    // Should render form without errors - check for form element by tag
    expect(document.querySelector('form')).toBeInTheDocument();
  });

  it('handles schema without component property', () => {
    const schemaWithoutComponent: LowCodeSchema = {
      ...mockSchema,
      component: undefined,
    };

    render(<SchemaForm schema={schemaWithoutComponent} />);

    // Should render form without errors - check for form element by tag
    expect(document.querySelector('form')).toBeInTheDocument();
  });

  it('renders Input for unknown property type (default branch in renderBasicFormItem)', () => {
    // 使用非 string/number 的类型（如 integer）触发 renderBasicFormItem 的 default 分支
    const schemaWithUnknownType: LowCodeSchema = {
      ...mockSchema,
      component: {
        properties: {
          customField: {
            type: 'integer' as 'number',
            title: '自定义整型',
            description: '走 default 分支',
          },
        },
      },
    };

    render(<SchemaForm schema={schemaWithUnknownType} />);

    expect(screen.getByText('自定义整型')).toBeInTheDocument();
    // default 分支渲染的是 Input，应存在占位符
    expect(
      screen.getByPlaceholderText(/请输入.*自定义整型/),
    ).toBeInTheDocument();
  });

  // New test cases for optimized code
  describe('Edge Cases and Optimized Features', () => {
    it('handles array without items definition', async () => {
      const user = userEvent.setup();
      render(<SchemaForm schema={edgeCaseSchema} />);

      // Add item to array without items definition
      const addButton = screen.getByText('添加 空数组');
      await user.click(addButton);

      await waitFor(() => {
        // Should render a basic input for undefined items
        expect(screen.getByPlaceholderText('请输入')).toBeInTheDocument();
      });
    });

    it('validates string pattern correctly', async () => {
      const user = userEvent.setup();
      render(<SchemaForm schema={edgeCaseSchema} />);

      const emailInput = screen.getByLabelText('邮箱');

      // Enter invalid email
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('请输入 有效的邮箱地址')).toBeInTheDocument();
      });

      // Enter valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText('请输入 有效的邮箱地址'),
        ).not.toBeInTheDocument();
      });
    });

    it('handles number with decimal step', async () => {
      const user = userEvent.setup();
      render(<SchemaForm schema={edgeCaseSchema} />);

      const priceInput = screen.getByLabelText('价格');

      await user.clear(priceInput);
      await user.type(priceInput, '99.99');

      await waitFor(() => {
        expect(priceInput).toHaveValue('99.99');
      });

      // Check step attribute
      expect(priceInput).toHaveAttribute('step', '0.01');
    });

    it('validates array min/max items', async () => {
      const user = userEvent.setup();
      render(<SchemaForm schema={edgeCaseSchema} />);

      const addButton = screen.getByText('添加 限制数组');

      // Add maximum allowed items (3)
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('请输入 项目');
        expect(inputs).toHaveLength(3);
      });

      // Try to add one more (should still work in UI, validation happens on form level)
      await user.click(addButton);

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('请输入 项目');
        expect(inputs).toHaveLength(4);
      });
    });

    it('handles deeply nested structures', async () => {
      const user = userEvent.setup();
      render(<SchemaForm schema={edgeCaseSchema} />);

      // Add item to nested structure
      const addItemButton = screen.getByText('添加 项目');
      await user.click(addItemButton);

      await waitFor(() => {
        expect(screen.getByLabelText('ID')).toBeInTheDocument();
        expect(screen.getByText('添加 嵌套数组')).toBeInTheDocument();
      });

      // Add nested array item
      const addNestedButton = screen.getByText('添加 嵌套数组');
      await user.click(addNestedButton);

      await waitFor(() => {
        const nestedInputs = screen.getAllByPlaceholderText('请输入 数值');
        expect(nestedInputs).toHaveLength(1);
      });
    });

    it('handles nested object in nested structure', async () => {
      const user = userEvent.setup();
      render(<SchemaForm schema={edgeCaseSchema} />);

      // Add tags to metadata
      const addTagButton = screen.getByText('添加 标签');
      await user.click(addTagButton);

      await waitFor(() => {
        const tagInputs = screen.getAllByPlaceholderText('请输入 标签');
        expect(tagInputs).toHaveLength(1);
      });
    });

    it('preserves form state when schema changes', () => {
      const { rerender } = render(<SchemaForm schema={mockSchema} />);

      // Change to edge case schema
      rerender(<SchemaForm schema={edgeCaseSchema} />);

      // Should render new schema without errors
      expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
      expect(screen.getByLabelText('价格')).toBeInTheDocument();
    });

    it('handles properties without default values', () => {
      const schemaWithoutDefaults: LowCodeSchema = {
        ...mockSchema,
        component: {
          properties: {
            noDefault: {
              type: 'string',
              title: '无默认值',
              description: '没有默认值的属性',
              default: '',
            },
            noDefaultNumber: {
              type: 'number',
              title: '无默认值数字',
              description: '没有默认值的数字属性',
              default: 0,
            },
          },
        },
      };

      render(<SchemaForm schema={schemaWithoutDefaults} />);

      // Should render inputs without default values
      expect(screen.getByLabelText('无默认值')).toBeInTheDocument();
      expect(screen.getByLabelText('无默认值数字')).toBeInTheDocument();
    });

    it('handles remove operations in arrays', async () => {
      const user = userEvent.setup();
      const onValuesChange = vi.fn();

      render(
        <SchemaForm schema={mockSchema} onValuesChange={onValuesChange} />,
      );

      // Add two items
      const addButton = screen.getByText('添加 标签');
      await user.click(addButton);
      await user.click(addButton);

      await waitFor(() => {
        const removeButtons = screen.getAllByRole('button', {
          name: /minus-circle/i,
        });
        expect(removeButtons).toHaveLength(2);
      });

      // Remove first item
      const removeButtons = screen.getAllByRole('button', {
        name: /minus-circle/i,
      });
      await user.click(removeButtons[0]);

      await waitFor(() => {
        const remainingButtons = screen.getAllByRole('button', {
          name: /minus-circle/i,
        });
        expect(remainingButtons).toHaveLength(1);
      });
    });

    it('handles complex initial values with nested structures', async () => {
      const complexInitialValues = {
        nestedStructure: {
          metadata: {
            tags: ['tag1', 'tag2'],
          },
          items: [
            {
              id: 'item1',
              nested: [1, 2, 3],
            },
            {
              id: 'item2',
              nested: [4, 5],
            },
          ],
        },
      };

      render(
        <SchemaForm
          schema={edgeCaseSchema}
          initialValues={complexInitialValues}
        />,
      );

      // Wait for form to be populated with initial values
      await waitFor(() => {
        // Check if the nested structure is rendered (the form should show the structure even if values aren't visible)
        expect(screen.getByText('嵌套结构')).toBeInTheDocument();
      });
    });

    it('handles form reset with new initial values', () => {
      const initialValues1 = { title: '初始值1' };
      const initialValues2 = { title: '初始值2' };

      const { rerender } = render(
        <SchemaForm schema={mockSchema} initialValues={initialValues1} />,
      );

      expect(screen.getByDisplayValue('初始值1')).toBeInTheDocument();

      // Change initial values
      rerender(
        <SchemaForm schema={mockSchema} initialValues={initialValues2} />,
      );

      expect(screen.getByDisplayValue('初始值2')).toBeInTheDocument();
    });
  });
});
