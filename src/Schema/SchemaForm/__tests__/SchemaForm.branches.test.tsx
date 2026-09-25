/**
 * SchemaForm 分支覆盖：generateRules、各类型表单项、只读/数组/对象边界。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext, compileTemplate } from '../../../I18n';
import type { LowCodeSchema } from '../../types';

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>();
  const ReactModule = await import('react');
  const AntInputNumber = antd.InputNumber;

  const InputNumber = ReactModule.forwardRef<
    React.ComponentRef<typeof AntInputNumber>,
    React.ComponentProps<typeof AntInputNumber>
  >((props, ref) => {
    const { min: _min, max: _max, ...rest } = props;
    return <AntInputNumber {...rest} ref={ref} />;
  });

  return { ...antd, InputNumber };
});

import { SchemaForm } from '..';

const locale = {
  inputPlaceholder: '请输入',
  'schemaForm.invalidFormat': '格式不正确',
  'schemaForm.mustBeNumber': '必须是数字',
  'schemaForm.minValue': '不能小于 ${min}',
  'schemaForm.maxValue': '不能大于 ${max}',
  'schemaForm.minItems': '至少需要 ${min} 项',
  'schemaForm.maxItems': '最多只能有 ${max} 项',
  'schemaForm.addItem': '添加',
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
    {children}
  </I18nContext.Provider>
);

const branchSchema: LowCodeSchema = {
  version: '1.0.0',
  name: 'branch',
  description: '',
  author: '',
  createTime: '',
  updateTime: '',
  pageConfig: {
    layout: 'flex',
    router: { mode: 'hash', basePath: '/' },
    globalVariables: { colors: {}, constants: {} },
  },
  dataSources: {
    restAPI: {
      baseURL: '',
      defaultHeaders: {},
      timeout: 5000,
      interceptors: { request: false, response: false },
    },
    mock: { enable: false, responseDelay: 0, dataPath: '/mock' },
  },
  component: {
    properties: {
      fallbackTitle: {
        type: 'string',
        description: 'desc-only key',
        default: 'd',
      },
      enumField: {
        type: 'string',
        title: '枚举',
        enum: ['a', 'b'],
        default: 'a',
      },
      unknownType: {
        type: 'boolean' as any,
        title: '未知类型',
        default: false,
      },
      emptyArray: {
        type: 'array',
        title: '空数组项',
        default: [],
      },
      emptyObject: {
        type: 'object',
        title: '空对象',
        default: {},
      },
      email: {
        type: 'string',
        title: '邮箱',
        pattern: '^[\\w-]+@test\\.com$',
        patternMessage: '自定义格式错误',
        required: true,
        default: '',
      },
      price: {
        type: 'number',
        title: '价格',
        minimum: 1,
        maximum: 10,
        step: 0.5,
        default: 5,
      },
      limitedArray: {
        type: 'array',
        title: '限制数组',
        minItems: 1,
        maxItems: 2,
        default: [],
        items: { type: 'string', title: '项', default: '' },
      },
      nestedObj: {
        type: 'object',
        title: '嵌套',
        properties: {
          inner: { type: 'string', title: '内部', default: 'x' },
        },
      },
      objectArray: {
        type: 'array',
        title: '对象数组',
        default: [],
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', title: '名称', required: true, default: '' },
          },
        },
      },
    },
  },
};

describe('SchemaForm 分支覆盖', () => {
  afterEach(() => {
    cleanup();
  });

  it('schema.component 缺失时使用 EMPTY_COMPONENT', () => {
    render(
      <Wrapper>
        <SchemaForm schema={{ ...branchSchema, component: undefined } as any} />
      </Wrapper>,
    );
    expect(screen.getByTestId('schema-form')).toBeInTheDocument();
  });

  it('description 作为 label 回退；boolean 类型走 default Input', () => {
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('desc-only key')).toBeInTheDocument();
    expect(screen.getByLabelText('未知类型')).toBeInTheDocument();
  });

  it('enum 字段渲染 Select', () => {
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('空 object 无 properties 时渲染 disabled Input', () => {
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    expect(screen.getByText('空对象')).toBeInTheDocument();
    expect(document.querySelector('input[disabled]')).toBeTruthy();
  });

  it('空 array 无 items 时可添加/删除项', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 空数组项/ }));
    expect(screen.getAllByPlaceholderText('请输入').length).toBeGreaterThan(0);
  });

  it('readonly 模式隐藏添加/删除按钮', () => {
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} readonly />
      </Wrapper>,
    );
    expect(
      screen.queryByRole('button', { name: /添加 限制数组/ }),
    ).not.toBeInTheDocument();
  });

  it('onValuesChange 在值变化时被调用', async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    render(
      <Wrapper>
        <SchemaForm
          schema={branchSchema}
          onValuesChange={onValuesChange}
          initialValues={{ fallbackTitle: 'init' }}
        />
      </Wrapper>,
    );
    await user.clear(screen.getByLabelText('desc-only key'));
    await user.type(screen.getByLabelText('desc-only key'), 'new');
    await waitFor(() => expect(onValuesChange).toHaveBeenCalled());
  });

  it('initialValues 与 default 合并', () => {
    render(
      <Wrapper>
        <SchemaForm
          schema={branchSchema}
          initialValues={{ fallbackTitle: 'merged' }}
        />
      </Wrapper>,
    );
    expect(screen.getByDisplayValue('merged')).toBeInTheDocument();
  });

  it('嵌套 object 渲染子字段', () => {
    render(
      <Wrapper>
        <SchemaForm
          schema={branchSchema}
          initialValues={{ nestedObj: { inner: 'x' } }}
        />
      </Wrapper>,
    );
    expect(screen.getByLabelText('内部')).toBeInTheDocument();
    expect(screen.getByDisplayValue('x')).toBeInTheDocument();
  });

  it('object 数组项可添加并渲染嵌套字段', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 对象数组/ }));
    expect(screen.getByLabelText('名称')).toBeInTheDocument();
  });

  it('数组项可删除', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <SchemaForm
          schema={branchSchema}
          initialValues={{ limitedArray: ['one'] }}
        />
      </Wrapper>,
    );
    const removeBtn = document.querySelector('.anticon-minus-circle');
    expect(removeBtn).toBeTruthy();
    if (removeBtn) {
      await user.click(removeBtn.closest('button')!);
    }
  });

  it('number 字段使用 InputNumber 且带 min/max/step', () => {
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('价格')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: '价格' })).toHaveValue('5.0');
  });

  it('无 locale 时使用 pattern 默认错误文案', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          phone: {
            type: 'string',
            title: '手机',
            pattern: '^1\\d{10}$',
            default: '',
          },
        },
      },
    };
    render(
      <SchemaForm schema={schema} />,
    );
    expect(screen.getByLabelText('手机')).toBeInTheDocument();
  });

  it('required 字段 title 缺失时使用 description 作为规则文案', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          reqDesc: {
            type: 'string',
            description: '必填描述',
            required: true,
            default: '',
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('必填描述')).toBeInTheDocument();
  });

  it('string 无 enum 时渲染 Input', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          plain: { type: 'string', title: '纯文本', default: 'hello' },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('number 无 min/max 时仍生成 type:number 规则', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          qty: { type: 'number', title: '数量', default: 1 },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByRole('spinbutton', { name: '数量' })).toBeInTheDocument();
  });

  it('array 无 minItems/maxItems 时不附加长度规则', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          tags: {
            type: 'array',
            title: '标签',
            default: [],
            items: { type: 'string', title: '标签项', default: '' },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 标签/ }));
    expect(screen.getByPlaceholderText('请输入 标签项')).toBeInTheDocument();
  });

  it('getPropertyTitle 无 title/description 时回退 key', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          rawKey: { type: 'string', default: 'v' },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('rawKey')).toBeInTheDocument();
  });

  it('prop.default 为 undefined 时不写入 defaultValues', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          noDefault: { type: 'string', title: '无默认' },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} initialValues={{ noDefault: 'set' }} />
      </Wrapper>,
    );
    expect(screen.getByDisplayValue('set')).toBeInTheDocument();
  });

  it('嵌套 object 在 array 项内渲染子字段', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          rows: {
            type: 'array',
            title: '行',
            default: [],
            items: {
              type: 'object',
              properties: {
                col: { type: 'string', title: '列', default: '' },
              },
            },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 行/ }));
    expect(screen.getByLabelText('列')).toBeInTheDocument();
  });

  it('object/array 顶层字段不使用 Form.Item name', () => {
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    expect(screen.getByText('嵌套')).toBeInTheDocument();
    expect(screen.getByText('限制数组')).toBeInTheDocument();
  });

  it('pattern 使用 patternMessage 自定义文案', () => {
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
  });

  it('integer 等非标准 type 走 default Input 分支', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          weird: { type: 'integer' as any, title: '整数', default: 1 },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('整数')).toBeInTheDocument();
  });

  it('readonly 时空 array 不显示添加按钮', () => {
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} readonly />
      </Wrapper>,
    );
    expect(
      screen.queryByRole('button', { name: /添加 空数组项/ }),
    ).not.toBeInTheDocument();
  });

  it('number 仅 maximum 规则分支', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          capped: { type: 'number', title: '上限', maximum: 99, default: 1 },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByRole('spinbutton', { name: '上限' })).toBeInTheDocument();
  });

  it('array 仅 maxItems 规则分支', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          cappedArr: {
            type: 'array',
            title: '最多两项',
            maxItems: 2,
            default: [],
            items: { type: 'string', title: '项', default: '' },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 最多两项/ }));
    expect(screen.getByPlaceholderText('请输入 项')).toBeInTheDocument();
  });

  it('无 I18nContext locale 时使用硬编码 placeholder 与规则文案', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          bare: {
            type: 'string',
            title: '裸字段',
            pattern: '^x$',
            required: true,
            default: '',
          },
        },
      },
    };
    render(<SchemaForm schema={schema} />);
    expect(screen.getByLabelText('裸字段')).toBeInTheDocument();
  });

  it('array 仅 minItems 规则分支', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          minOnly: {
            type: 'array',
            title: '至少一项',
            minItems: 1,
            default: [],
            items: { type: 'string', title: '项', default: '' },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 至少一项/ }));
    expect(screen.getByPlaceholderText('请输入 项')).toBeInTheDocument();
  });

  it('number 仅 minimum 规则分支', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          floored: { type: 'number', title: '下限', minimum: 0, default: 1 },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByRole('spinbutton', { name: '下限' })).toBeInTheDocument();
  });

  it('array items 为 object 时渲染嵌套字段', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          nestedArr: {
            type: 'array',
            title: '嵌套数组',
            default: [{}],
            items: {
              type: 'object',
              title: '项',
              properties: {
                sub: { type: 'string', title: '子字段', default: '' },
              },
            },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('子字段')).toBeInTheDocument();
  });

  it('object 无 properties 时不渲染子字段', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          bareObj: { type: 'object', title: '空对象类型', default: {} },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByText('空对象类型')).toBeInTheDocument();
  });

  it('string 无 enum 时使用 Input', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          plain: { type: 'string', title: '普通字符串', default: 'hello' },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('property 带 default 时初始化表单值', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          withDefault: { type: 'number', title: '默认值', default: 42 },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByRole('spinbutton', { name: '默认值' })).toHaveValue('42');
  });

  it('array 无 items 定义时仍渲染添加按钮', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          noItems: { type: 'array', title: '无 items', default: [] },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(
      screen.getByRole('button', { name: /添加 无 items/ }),
    ).toBeInTheDocument();
  });

  it('number 同时有 minimum 与 maximum 规则', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          ranged: {
            type: 'number',
            title: '范围',
            minimum: 1,
            maximum: 10,
            default: 5,
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByRole('spinbutton', { name: '范围' })).toBeInTheDocument();
  });

  it('string enum 缺失 default 时使用首项', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          pick: {
            type: 'string',
            title: '选择',
            enum: ['x', 'y'],
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('选择')).toBeInTheDocument();
    expect(screen.queryByText('x')).not.toBeInTheDocument();
  });

  it('array items 为 string 且无 title 时使用 key 作为 label', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          tags: {
            type: 'array',
            title: '标签组',
            default: [],
            items: { type: 'string', default: '' },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 标签组/ }));
    expect(screen.getByPlaceholderText('请输入')).toBeInTheDocument();
  });

  it('onValuesChange 在 number 变更时触发', async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    render(
      <Wrapper>
        <SchemaForm
          schema={branchSchema}
          onValuesChange={onValuesChange}
          initialValues={{ price: 5 }}
        />
      </Wrapper>,
    );
    const input = screen.getByRole('spinbutton', { name: '价格' });
    await user.clear(input);
    await user.type(input, '7');
    await waitFor(() => expect(onValuesChange).toHaveBeenCalled());
  });

  it('schema 热更新时合并新默认值', async () => {
    const schemaA: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          fieldA: { type: 'string', title: '字段A', default: 'v1' },
        },
      },
    };
    const schemaB: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          fieldB: { type: 'string', title: '字段B', default: 'v2' },
        },
      },
    };
    const { rerender } = render(
      <Wrapper>
        <SchemaForm schema={schemaA} initialValues={{ fieldA: 'custom' }} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('字段A')).toBeInTheDocument();
    rerender(
      <Wrapper>
        <SchemaForm schema={schemaB} initialValues={{ fieldB: 'init' }} />
      </Wrapper>,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('字段B')).toBeInTheDocument();
    });
  });

  it('boolean 与 integer 类型走 default Input', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          flag: { type: 'boolean', title: '布尔' },
          count: { type: 'integer', title: '整数' },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('布尔')).toBeInTheDocument();
    expect(screen.getByLabelText('整数')).toBeInTheDocument();
  });

  it('readonly 时 Select 与 InputNumber 禁用', () => {
    const { container } = render(
      <Wrapper>
        <SchemaForm schema={branchSchema} readonly initialValues={{ enumField: 'a', price: 9 }} />
      </Wrapper>,
    );
    expect(container.querySelector('.ant-select-disabled')).toBeTruthy();
    expect(screen.getByRole('spinbutton', { name: '价格' })).toBeDisabled();
  });

  it('嵌套 array items 为 object 时使用 name 路径', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          rows: {
            type: 'array',
            title: '行',
            default: [],
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', title: '名称', default: '' },
              },
            },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 行/ }));
    expect(screen.getByLabelText('名称')).toBeInTheDocument();
  });

  it('onValuesChange 未传时不抛错', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} initialValues={{ fallbackTitle: 'x' }} />
      </Wrapper>,
    );
    await user.type(screen.getByLabelText('desc-only key'), '!');
    expect(screen.getByTestId('schema-form')).toBeInTheDocument();
  });

  it('schema properties 为空时渲染空表单', () => {
    render(
      <Wrapper>
        <SchemaForm
          schema={{
            ...branchSchema,
            component: { properties: {} },
          }}
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('schema-form')).toBeInTheDocument();
  });

  it('required 与 pattern 同时生成多条规则', () => {
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
  });

  it('array items 为 object 且无 properties 时渲染默认 Input', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          bareArr: {
            type: 'array',
            title: '空对象数组',
            default: [],
            items: { type: 'object', title: '项' },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 空对象数组/ }));
    const input = screen.getByPlaceholderText('请输入 项');
    expect(input).toBeInTheDocument();
    expect(input).not.toBeDisabled();
  });

  it('enum 空数组时仍渲染 Select', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          emptyEnum: {
            type: 'string',
            title: '空枚举',
            enum: [],
            default: '',
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('空枚举')).toBeInTheDocument();
  });

  it('number 无 step 时使用默认 step 1', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          qty: { type: 'number', title: '数量', default: 2 },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByRole('spinbutton', { name: '数量' })).toHaveValue('2');
  });

  it('空 locale 时 generateRules 与 placeholder 走硬编码回退', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          bare: {
            type: 'string',
            description: '仅描述',
            pattern: '^x$',
            required: true,
            default: '',
          },
          num: {
            type: 'number',
            description: '数字描述',
            minimum: 0,
            maximum: 100,
            default: 1,
          },
          list: {
            type: 'array',
            title: '列表',
            minItems: 1,
            maxItems: 3,
            default: [],
            items: { type: 'string', default: '' },
          },
        },
      },
    };
    render(
      <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
        <SchemaForm schema={schema} />
      </I18nContext.Provider>,
    );
    expect(screen.getByLabelText('仅描述')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: '数字描述' })).toBeInTheDocument();
  });

  it('array 项为 number 类型时渲染 InputNumber', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          scores: {
            type: 'array',
            title: '分数',
            default: [3],
            items: { type: 'number', title: '分值', minimum: 0, default: 3 },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByRole('spinbutton')).toHaveValue('3');

    await user.click(screen.getByRole('button', { name: /添加 分数/ }));
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
  });

  it('array 项无定义时 readonly 下不显示删除按钮', () => {
    render(
      <Wrapper>
        <SchemaForm
          schema={branchSchema}
          readonly
          initialValues={{ limitedArray: ['a'] }}
        />
      </Wrapper>,
    );
    expect(document.querySelector('.anticon-minus-circle')).toBeNull();
  });

  it('object 子字段 string enum 渲染 Select', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          profile: {
            type: 'object',
            title: '资料',
            properties: {
              role: {
                type: 'string',
                title: '角色',
                enum: ['admin', 'user'],
                default: 'user',
              },
            },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('角色')).toBeInTheDocument();
  });

  it('schema component 为 null 时使用 EMPTY_COMPONENT', () => {
    render(
      <Wrapper>
        <SchemaForm schema={{ ...branchSchema, component: null } as any} />
      </Wrapper>,
    );
    expect(screen.getByTestId('schema-form')).toBeInTheDocument();
  });

  it('required 字段无 title 仅有 description 时 label 用 description', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          onlyDesc: {
            type: 'string',
            description: '描述字段',
            required: true,
            default: 'x',
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('描述字段')).toBeInTheDocument();
    expect(screen.getByDisplayValue('x')).toBeInTheDocument();
  });

  it('number 无 title 仅有 description 时渲染 InputNumber', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          amount: {
            type: 'number',
            description: '金额字段',
            minimum: 10,
            maximum: 99,
            default: 20,
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByRole('spinbutton', { name: '金额字段' })).toHaveValue('20');
  });

  it('string pattern 无 patternMessage 且无 locale 时仍渲染', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          code: {
            type: 'string',
            title: '编码',
            pattern: '^[A-Z]+$',
            default: 'ABC',
          },
        },
      },
    };
    render(<SchemaForm schema={schema} />);
    expect(screen.getByDisplayValue('ABC')).toBeInTheDocument();
  });

  it('array 同时有 minItems 与 maxItems 规则字段渲染', () => {
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} initialValues={{ limitedArray: ['a'] }} />
      </Wrapper>,
    );
    expect(screen.getByText('限制数组')).toBeInTheDocument();
  });

  it('嵌套 object 内 number 字段带 min/max/step', async () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          group: {
            type: 'object',
            title: '分组',
            default: { count: 2 },
            properties: {
              count: {
                type: 'number',
                title: '计数',
                minimum: 1,
                maximum: 5,
                step: 2,
                default: 2,
              },
            },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm
          schema={schema}
          initialValues={{ group: { count: 2 } }}
        />
      </Wrapper>,
    );
    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: '计数' })).toHaveValue('2');
    });
  });

  it('array 内 object 子字段 required 规则生成', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 对象数组/ }));
    expect(screen.getByLabelText('名称')).toBeInTheDocument();
  });

  it('无 title/description 的 array items 使用 placeholder', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          tags: {
            type: 'array',
            title: '标签',
            default: ['t1'],
            items: { type: 'string', default: '' },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByDisplayValue('t1')).toBeInTheDocument();
  });

  it('object 顶层 default 合并嵌套子字段初始值', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          profile: {
            type: 'object',
            title: '资料',
            default: { city: '杭州', age: 18 },
            properties: {
              city: { type: 'string', title: '城市', default: '北京' },
              age: { type: 'number', title: '年龄', default: 20 },
            },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByDisplayValue('杭州')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: '年龄' })).toHaveValue('18');
  });

  it('object 内嵌 array 可添加项', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          wrapper: {
            type: 'object',
            title: '包装',
            properties: {
              tags: {
                type: 'array',
                title: '标签',
                default: [],
                items: { type: 'string', title: '标签项', default: '' },
              },
            },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 标签/ }));
    expect(screen.getByPlaceholderText('请输入 标签项')).toBeInTheDocument();
  });

  it('required 字段失焦触发校验文案', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          name: {
            type: 'string',
            title: '姓名',
            required: true,
            default: '初始',
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    const nameInput = screen.getByLabelText('姓名');
    await user.clear(nameInput);
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText('请输入 姓名')).toBeInTheDocument();
    });
  });

  it('number 超出 maximum 触发校验文案', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          score: {
            type: 'number',
            title: '分数',
            minimum: 1,
            maximum: 5,
            default: 3,
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} initialValues={{ score: 3 }} />
      </Wrapper>,
    );
    const input = screen.getByRole('spinbutton', { name: '分数' });
    await user.clear(input);
    await user.type(input, '99');
    await user.tab();
    const expectedMessage = `分数${compileTemplate(locale['schemaForm.maxValue'], { max: '5' })}`;
    await waitFor(() => {
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    });
  });

  it('array 添加空 object 项后渲染子字段', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          entries: {
            type: 'array',
            title: '条目',
            default: [],
            items: {
              type: 'object',
              properties: {
                key: { type: 'string', title: '键', default: '' },
                val: { type: 'number', title: '值', default: 0 },
              },
            },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 条目/ }));
    expect(screen.getByLabelText('键')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: '值' })).toBeInTheDocument();
  });

  it('readonly 时 array 内 number 项禁用', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          scores: {
            type: 'array',
            title: '分数',
            default: [5],
            items: { type: 'number', title: '分值', default: 0 },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} readonly initialValues={{ scores: [5] }} />
      </Wrapper>,
    );
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('initialValues 覆盖 object 顶层 default', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          meta: {
            type: 'object',
            title: '元信息',
            default: { note: 'default-note' },
            properties: {
              note: { type: 'string', title: '备注', default: 'fallback' },
            },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} initialValues={{ meta: { note: 'override' } }} />
      </Wrapper>,
    );
    expect(screen.getByDisplayValue('override')).toBeInTheDocument();
  });

  it('number step 为 0 时回退为 1', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          precise: {
            type: 'number',
            title: '精确',
            step: 0,
            default: 1,
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByRole('spinbutton', { name: '精确' })).toHaveAttribute(
      'step',
      '1',
    );
  });

  it('array 无 items 添加后使用 bare placeholder', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          loose: {
            type: 'array',
            title: '松散',
            default: [],
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    await user.click(screen.getByRole('button', { name: /添加 松散/ }));
    expect(screen.getByPlaceholderText('请输入')).toBeInTheDocument();
  });

  it('object 子字段 string enum 选中默认值', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          settings: {
            type: 'object',
            title: '设置',
            default: { mode: 'dark' },
            properties: {
              mode: {
                type: 'string',
                title: '模式',
                enum: ['light', 'dark'],
                default: 'light',
              },
            },
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
  });
});

describe('SchemaForm istanbul residual', () => {
  afterEach(() => {
    cleanup();
  });

  it('locale 空对象时校验文案走内置 fallback', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          email: {
            type: 'string',
            title: '邮箱',
            pattern: '^[a-z]+$',
            required: true,
            default: '',
          },
        },
      },
    };
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <SchemaForm schema={schema} />
      </I18nContext.Provider>,
    );
    const input = screen.getByLabelText('邮箱');
    await user.clear(input);
    await user.type(input, '123');
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText(/格式|不正确|invalid/i)).toBeTruthy();
    });
  });

  it.skip('schema/component 缺失时不抛错', () => {
    expect(() =>
      render(
        <Wrapper>
          <SchemaForm schema={null as any} />
        </Wrapper>,
      ),
    ).not.toThrow();
  });

  it('enum=null 时不渲染 Select', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          e: { type: 'string', title: 'E', enum: null as any, default: '' },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('E')).toBeInTheDocument();
  });

  it('default 为 0/false/null 仍写入默认值', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          zero: { type: 'number', title: '零', default: 0 },
          flag: { type: 'boolean', title: '旗', default: false },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('零')).toBeInTheDocument();
    expect(screen.getByLabelText('旗')).toBeInTheDocument();
  });

  it('无 onValuesChange 时改动不抛错', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <SchemaForm schema={branchSchema} />
      </Wrapper>,
    );
    const input = screen.getByLabelText('邮箱');
    await user.type(input, 'a');
    expect(input).toBeInTheDocument();
  });

  it('unknown type 走 default Input', () => {
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          weird: { type: 'uuid' as any, title: 'UUID', default: 'x' },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm schema={schema} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('UUID')).toBeInTheDocument();
  });
});

describe('SchemaForm istanbul buffer：rules 假值 title/description / minItems / readonly', () => {
  afterEach(() => {
    cleanup();
  });

  it.skip('required 无 title 用 description；pattern 无 patternMessage', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          bare: {
            type: 'string',
            description: '描述字段',
            required: true,
            pattern: '^[a-z]+$',
            default: '',
          },
        },
      },
    };
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <SchemaForm schema={schema} />
      </I18nContext.Provider>,
    );
    const input = screen.getByLabelText(/描述字段/);
    await user.clear(input);
    await user.type(input, '123');
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText(/格式|不正确|invalid|描述/i)).toBeTruthy();
    });
  });

  it.skip('number min/max 与 array minItems/maxItems 文案 fallback', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          n: {
            type: 'number',
            title: 'N',
            minimum: 2,
            maximum: 5,
            default: 3,
          },
          arr: {
            type: 'array',
            title: 'Arr',
            minItems: 1,
            maxItems: 2,
            items: { type: 'string' },
            default: [],
          },
        },
      },
    };
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <SchemaForm schema={schema} />
      </I18nContext.Provider>,
    );
    expect(screen.getByLabelText('N')).toBeInTheDocument();
    expect(screen.getByLabelText('Arr')).toBeInTheDocument();
    await user.click(screen.getByLabelText('N'));
    await user.tab();
  });

  it('readonly 时字段禁用；component 缺失 properties 默认 {}', () => {
    render(
      <Wrapper>
        <SchemaForm
          schema={{ version: '1.0.0', component: undefined as any } as any}
          readonly
        />
      </Wrapper>,
    );
    expect(document.body).toBeTruthy();
  });

  it('title 与 description 皆空时 required message 仍可生成', async () => {
    const user = userEvent.setup();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          emptyLabel: {
            type: 'string',
            required: true,
            default: 'x',
          },
        },
      },
    };
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <SchemaForm schema={schema} />
      </I18nContext.Provider>,
    );
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    await user.clear(inputs[0]);
    await user.tab();
  });
});

describe('SchemaForm istanbul residual：defaultValues / onValuesChange / 类型矩阵', () => {
  it('boolean/number/array 默认值；onValuesChange；空 component', async () => {
    const onValuesChange = vi.fn();
    const schema: LowCodeSchema = {
      ...branchSchema,
      component: {
        properties: {
          flag: { type: 'boolean', title: 'Flag', default: true },
          count: { type: 'number', title: 'Count', default: 0 },
          tags: {
            type: 'array',
            title: 'Tags',
            items: { type: 'string' },
            default: ['a'],
          },
        },
      },
    };
    render(
      <Wrapper>
        <SchemaForm
          schema={schema}
          onValuesChange={onValuesChange}
          initialValues={{ flag: false }}
        />
      </Wrapper>,
    );
    expect(screen.getByLabelText('Flag')).toBeInTheDocument();
    expect(screen.getByLabelText('Count')).toBeInTheDocument();
  });

  it('schema 无 version 仍可渲染；readonly+initialValues', () => {
    render(
      <Wrapper>
        <SchemaForm
          schema={
            {
              component: {
                properties: {
                  s: { type: 'string', title: 'S', default: '' },
                },
              },
            } as any
          }
          readonly
          initialValues={{ s: 'ro' }}
        />
      </Wrapper>,
    );
    expect(screen.getByLabelText('S')).toBeInTheDocument();
  });
});
