/**
 * SchemaForm deepen residual（启用）：rules 假值、array 增删、object 无 properties。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import type { LowCodeSchema } from '../../types';
import { SchemaForm } from '..';

const baseSchema = (properties: any): LowCodeSchema =>
  ({
    version: '1.0.0',
    name: 'deepen',
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
    component: { properties },
  }) as any;

describe('SchemaForm deepen residual branches (enabled)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('required 仅 description；pattern 无 patternMessage；空 locale', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <SchemaForm
          schema={baseSchema({
            bare: {
              type: 'string',
              description: '描述字段',
              required: true,
              pattern: '^[a-z]+$',
              default: 'abc',
            },
            noLabel: {
              type: 'string',
              required: true,
              default: 'x',
            },
          })}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('描述字段')).toBeInTheDocument();
    expect(screen.getByText('noLabel')).toBeInTheDocument();
  });

  it('number min/max 无 title 用 description；step 默认 1', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <SchemaForm
          schema={baseSchema({
            n: {
              type: 'number',
              description: '数值描述',
              minimum: 1,
              maximum: 9,
              default: 3,
            },
          })}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('数值描述')).toBeInTheDocument();
  });

  it('array minItems/maxItems；items 缺省与 object items；添加项', async () => {
    const user = userEvent.setup();
    render(
      <I18nContext.Provider
        value={
          {
            locale: {
              inputPlaceholder: '请输入',
              'schemaForm.addItem': '添加',
            },
            language: 'zh-CN',
          } as any
        }
      >
        <SchemaForm
          schema={baseSchema({
            arr: {
              type: 'array',
              title: 'Arr',
              minItems: 1,
              maxItems: 3,
              items: { type: 'string' },
              default: ['a'],
            },
            bareArr: {
              type: 'array',
              description: '裸数组',
              default: [''],
            },
            objArr: {
              type: 'array',
              title: 'ObjArr',
              items: {
                type: 'object',
                properties: {
                  k: { type: 'string', title: 'K', default: '' },
                },
              },
              default: [{ k: 'v' }],
            },
          })}
          initialValues={{
            arr: ['a'],
            bareArr: [''],
            objArr: [{ k: 'v' }],
          }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('Arr')).toBeInTheDocument();
    expect(screen.getByText('裸数组')).toBeInTheDocument();
    expect(screen.getByText('ObjArr')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();

    const addButtons = screen.getAllByRole('button', { name: /添加/i });
    await user.click(addButtons[0]);
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
  });

  it('readonly 隐藏 array 添加/删除；string 无 enum 走 Input', () => {
    render(
      <I18nContext.Provider
        value={
          {
            locale: { inputPlaceholder: '请输入' },
            language: 'zh-CN',
          } as any
        }
      >
        <SchemaForm
          schema={baseSchema({
            s: { type: 'string', title: 'S', default: '' },
            flag: { type: 'boolean', title: 'F', default: true },
            weird: { type: 'unknown' as any, title: 'W', default: '' },
            list: {
              type: 'array',
              title: 'List',
              items: { type: 'string' },
              default: ['x'],
            },
          })}
          readonly
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /添加/i })).not.toBeInTheDocument();
  });

  it('嵌套 object 无 properties 渲染 disabled Input；patternMessage 自定义', () => {
    render(
      <I18nContext.Provider
        value={
          {
            locale: {
              inputPlaceholder: '请输入',
              'schemaForm.invalidFormat': '格式不正确',
            },
            language: 'zh-CN',
          } as any
        }
      >
        <SchemaForm
          schema={baseSchema({
            emptyObj: { type: 'object', title: 'EmptyObj' },
            nest: {
              type: 'object',
              title: 'Nest',
              properties: {
                onlyKey: {
                  type: 'string',
                  required: true,
                  pattern: '^x$',
                  patternMessage: '必须是 x',
                  default: 'x',
                },
              },
            },
          })}
          initialValues={{ nest: { onlyKey: 'x' } }}
          onValuesChange={vi.fn()}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('EmptyObj')).toBeInTheDocument();
    expect(screen.getByText('Nest')).toBeInTheDocument();
  });

  it('schema.component 缺省时使用 EMPTY_COMPONENT', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <SchemaForm schema={{ component: undefined } as any} />
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('schema-form')).toBeInTheDocument();
  });

  it('onValuesChange 回调触发', async () => {
    const onValuesChange = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nContext.Provider
        value={{ locale: { inputPlaceholder: '请输入' }, language: 'zh-CN' } as any}
      >
        <SchemaForm
          schema={baseSchema({
            name: { type: 'string', title: 'Name', default: 'a' },
          })}
          onValuesChange={onValuesChange}
        />
      </I18nContext.Provider>,
    );
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'b');
    expect(onValuesChange).toHaveBeenCalled();
  });
});
