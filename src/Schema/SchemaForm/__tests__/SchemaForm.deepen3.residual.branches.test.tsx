/**
 * SchemaForm deepen3：无 properties 默认、array 无 title 的 min/max、裸 object、嵌套 array。
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
    name: 'deepen3',
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

describe('SchemaForm deepen3 residual branches', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('component 无 properties 走默认 {}', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <SchemaForm schema={{ component: {} } as any} />
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('schema-form')).toBeInTheDocument();
  });

  it('array 无 title/description 仍生成 min/max rules；可添加', async () => {
    const user = userEvent.setup();
    render(
      <I18nContext.Provider
        value={
          {
            locale: {
              inputPlaceholder: '请输入',
              'schemaForm.addItem': '添加',
              'schemaForm.minItems': '至少需要 ${min} 项',
              'schemaForm.maxItems': '最多只能有 ${max} 项',
            },
            language: 'zh-CN',
          } as any
        }
      >
        <SchemaForm
          schema={baseSchema({
            bareList: {
              type: 'array',
              minItems: 1,
              maxItems: 2,
              items: { type: 'string' },
              default: ['a'],
            },
          })}
          initialValues={{ bareList: ['a'] }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('bareList')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /添加/i }));
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
  });

  it('object 无 title/description/properties；嵌套 object 含 array', () => {
    render(
      <I18nContext.Provider
        value={{ locale: { inputPlaceholder: '请输入' }, language: 'zh-CN' } as any}
      >
        <SchemaForm
          schema={baseSchema({
            naked: { type: 'object' },
            wrap: {
              type: 'object',
              title: 'Wrap',
              properties: {
                innerList: {
                  type: 'array',
                  items: { type: 'string' },
                  default: ['x'],
                },
                innerObj: {
                  type: 'object',
                  properties: {
                    k: { type: 'string', default: 'v' },
                  },
                },
              },
            },
          })}
          initialValues={{
            wrap: { innerList: ['x'], innerObj: { k: 'v' } },
          }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('naked')).toBeInTheDocument();
    expect(screen.getByText('Wrap')).toBeInTheDocument();
  });
});
