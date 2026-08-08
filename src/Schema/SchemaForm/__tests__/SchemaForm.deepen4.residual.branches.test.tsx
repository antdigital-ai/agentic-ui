/**
 * SchemaForm deepen4：schema 无 component、仅 description 的 min/max、
 * 嵌套 array/object 的 baseName 路径、object 无 title 的 placeholder。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import type { LowCodeSchema } from '../../types';
import { SchemaForm } from '..';

const baseSchema = (properties: any): LowCodeSchema =>
  ({
    version: '1.0.0',
    name: 'deepen4',
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

describe('SchemaForm deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('schema 无 component 走 EMPTY_COMPONENT', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <SchemaForm schema={{} as any} />
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('schema-form')).toBeInTheDocument();
  });

  it('array 仅 description：min/max 文案走 description||\'\'', () => {
    render(
      <I18nContext.Provider
        value={
          {
            locale: {
              'schemaForm.addItem': '添加',
              'schemaForm.minItems': '至少 ${min}',
              'schemaForm.maxItems': '最多 ${max}',
            },
            language: 'zh-CN',
          } as any
        }
      >
        <SchemaForm
          schema={baseSchema({
            descList: {
              type: 'array',
              description: '列表说明',
              minItems: 1,
              maxItems: 2,
              items: { type: 'string' },
              default: ['a'],
            },
          })}
          initialValues={{ descList: ['a'] }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('列表说明')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /添加/i })).toBeInTheDocument();
  });

  it('object 仅 description 无 properties；嵌套 object 含 array（baseName）', () => {
    render(
      <I18nContext.Provider
        value={{ locale: { inputPlaceholder: '请输入' }, language: 'zh-CN' } as any}
      >
        <SchemaForm
          schema={baseSchema({
            described: {
              type: 'object',
              description: '裸对象说明',
            },
            nest: {
              type: 'object',
              title: 'Nest',
              properties: {
                kids: {
                  type: 'array',
                  title: 'Kids',
                  items: { type: 'string' },
                  default: ['k'],
                },
                child: {
                  type: 'object',
                  title: 'Child',
                  properties: {
                    name: { type: 'string', description: '姓名' },
                  },
                },
              },
            },
          })}
          initialValues={{
            nest: { kids: ['k'], child: { name: 'n' } },
          }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('裸对象说明')).toBeInTheDocument();
    expect(screen.getByText('Nest')).toBeInTheDocument();
    expect(screen.getAllByText(/Kids/).length).toBeGreaterThan(0);
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入 姓名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入 裸对象说明')).toBeDisabled();
  });
});
