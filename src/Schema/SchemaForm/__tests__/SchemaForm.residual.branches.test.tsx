/**
 * SchemaForm 残留：空 properties、readonly、无 title 回退 description、嵌套 object。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import type { LowCodeSchema } from '../../types';
import { SchemaForm } from '..';

const locale = {
  inputPlaceholder: '请输入',
  'schemaForm.addItem': '添加',
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
    {children}
  </I18nContext.Provider>
);

const baseSchema = (properties: any): LowCodeSchema =>
  ({
    version: '1.0.0',
    name: 'f',
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

describe('SchemaForm residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.skip('空 / 缺 properties 不抛', () => {
    expect(() =>
      render(
        <Wrapper>
          <SchemaForm schema={null as any} />
        </Wrapper>,
      ),
    ).not.toThrow();
    expect(() =>
      render(
        <Wrapper>
          <SchemaForm
            schema={baseSchema(undefined)}
            initialValues={{}}
          />
        </Wrapper>,
      ),
    ).not.toThrow();
  });

  it('无 title 时用 description；readonly', () => {
    render(
      <Wrapper>
        <SchemaForm
          schema={baseSchema({
            onlyDesc: {
              type: 'string',
              description: '仅描述',
              default: 'd',
            },
            num: { type: 'number', title: '数字', minimum: 0, maximum: 10 },
          })}
          readonly
          initialValues={{ onlyDesc: 'x', num: 3 }}
        />
      </Wrapper>,
    );
    expect(screen.getByText('仅描述')).toBeInTheDocument();
  });

  it('enum / boolean / onValuesChange', async () => {
    const onValuesChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Wrapper>
        <SchemaForm
          schema={baseSchema({
            enumField: {
              type: 'string',
              title: '枚举',
              enum: ['a', 'b'],
              default: 'a',
            },
            flag: { type: 'boolean', title: '开关', default: false },
          })}
          onValuesChange={onValuesChange}
        />
      </Wrapper>,
    );
    expect(screen.getByText('枚举')).toBeInTheDocument();
    const flag = screen.queryByRole('switch') || screen.queryByRole('checkbox');
    if (flag) {
      await user.click(flag);
      expect(onValuesChange).toHaveBeenCalled();
    }
  });

  it('嵌套 object / array 属性与缺省 locale', async () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <SchemaForm
          schema={baseSchema({
            nested: {
              type: 'object',
              title: '嵌套',
              properties: {
                inner: { type: 'string', title: '内层', default: 'i' },
              },
            },
            list: {
              type: 'array',
              title: '列表',
              items: { type: 'string' },
              default: ['a'],
            },
          })}
          initialValues={{ nested: { inner: 'x' }, list: ['a'] }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('嵌套')).toBeInTheDocument();
  });
});
